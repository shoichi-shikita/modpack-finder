import { THEMES, ROLES, getRole, roleLabel, CATEGORY_ORDER } from "../data/categories";
import { buildWarnings } from "../data/warnings";
import { fmtShort, addUnique } from "./format";
import * as api from "../services/modrinth";

// Safety cap so dependency resolution can never run away.
const MAX_TOTAL = 45;

function reasonFor(role, hit) {
  return `人気の${role.label}系MOD（DL ${fmtShort(hit.downloads)}）。${role.reasonTail || "テーマとの相性が高いため採用。"}`;
}

// Extract the downloadable file (for .mrpack export) from a version object.
export function pickFile(v) {
  const files = (v && v.files) || [];
  const f = files.find((x) => x.primary) || files[0];
  if (!f) return null;
  return {
    url: f.url,
    filename: f.filename,
    size: f.size || 0,
    sha1: f.hashes ? f.hashes.sha1 : "",
    sha512: f.hashes ? f.hashes.sha512 : "",
  };
}

export function makeEntry(hit, role) {
  return {
    project_id: hit.project_id,
    slug: hit.slug,
    title: hit.title,
    description: hit.description || "",
    author: hit.author || "",
    downloads: hit.downloads || 0,
    icon_url: hit.icon_url || "",
    categories: hit.categories || [],
    client_side: hit.client_side || "required",
    server_side: hit.server_side || "required",
    roleId: role.id,
    reason: reasonFor(role, hit),
    requiredDeps: [], // [{ project_id, title }]
    requiredBy: [],   // [title]
    autoAdded: false,
    file: null,       // { url, filename, size, sha1, sha512 }
  };
}

export function makeDepEntry(proj, requiredBy) {
  return {
    project_id: proj.id,
    slug: proj.slug,
    title: proj.title,
    description: proj.description || "",
    author: "",
    downloads: proj.downloads || 0,
    icon_url: proj.icon_url || "",
    categories: proj.categories || [],
    client_side: proj.client_side || "required",
    server_side: proj.server_side || "required",
    roleId: "core",
    reason: "他のMODの動作に必要な前提ライブラリのため自動追加。",
    requiredDeps: [],
    requiredBy: requiredBy ? [requiredBy] : [],
    autoAdded: true,
    file: null,
  };
}

// Main entry point. Never throws — collects problems into `errors`.
export async function buildPack({ version, loader, themeIds, query }) {
  const errors = [];

  // 1. Resolve the set of roles to search from the selected themes.
  const roleIds = new Set();
  themeIds.forEach((tid) => {
    const t = THEMES.find((x) => x.id === tid);
    if (t) t.roles.forEach((r) => roleIds.add(r));
  });
  roleIds.add("performance"); // always auto-add a performance base

  const roleList = [...roleIds]
    .map((id) => getRole(id))
    .filter((r) => r && r.facets.length > 0);

  // 2. Search each role in parallel.
  const searchResults = await Promise.all(
    roleList.map(async (role) => {
      try {
        const hits = await api.searchMods({
          version,
          loader,
          categories: role.facets,
          query: [role.query, query].filter(Boolean).join(" "),
          limit: (role.count || 4) + 4,
        });
        return { role, hits };
      } catch {
        errors.push(`「${role.label}」の検索に失敗しました。`);
        return { role, hits: [] };
      }
    })
  );

  // 3. Adopt mods, deduping across roles by project_id.
  const adopted = new Map(); // project_id -> entry
  const pool = {}; // roleId -> raw hits (for later swap/alternatives)
  for (const { role, hits } of searchResults) {
    pool[role.id] = hits;
    let taken = 0;
    for (const h of hits) {
      if (taken >= (role.count || 4)) break;
      if (adopted.has(h.project_id)) continue;
      adopted.set(h.project_id, makeEntry(h, role));
      taken += 1;
    }
  }

  // 4 + 5. For each adopted mod, fetch its newest compatible version to (a)
  // confirm a real file exists and (b) read required dependencies.
  await Promise.all(
    [...adopted.keys()].map(async (id) => {
      try {
        const v = await api.getCompatibleVersion(id, loader, version);
        if (!v) {
          adopted.delete(id); // no compatible file -> drop
          return;
        }
        const entry = adopted.get(id);
        entry.file = pickFile(v);
        const reqs = (v.dependencies || []).filter(
          (d) => d.dependency_type === "required" && d.project_id
        );
        entry.requiredDeps = reqs.map((d) => ({ project_id: d.project_id }));
      } catch {
        // Search already guaranteed compatibility; keep the mod, skip deps.
      }
    })
  );

  // 5b. Resolve dependencies breadth-first, tracking visited to avoid loops.
  const visited = new Set(adopted.keys());
  const depEntries = new Map(); // project_id -> entry
  const incompatibleDeps = new Map(); // project_id -> { title }

  const queue = [];
  for (const entry of adopted.values()) {
    for (const d of entry.requiredDeps) {
      queue.push({ id: d.project_id, requiredBy: entry.title });
    }
  }

  while (queue.length) {
    if (visited.size >= MAX_TOTAL) break;
    const { id, requiredBy } = queue.shift();

    if (visited.has(id)) {
      const target = adopted.get(id) || depEntries.get(id);
      if (target && requiredBy) target.requiredBy = addUnique(target.requiredBy, requiredBy);
      continue;
    }
    visited.add(id);

    try {
      const v = await api.getCompatibleVersion(id, loader, version);
      if (!v) {
        incompatibleDeps.set(id, { project_id: id });
        continue;
      }
      const projects = await api.getProjects([id]);
      const proj = projects[0];
      if (!proj) continue;

      const entry = makeDepEntry(proj, requiredBy);
      entry.file = pickFile(v);
      const reqs = (v.dependencies || []).filter(
        (d) => d.dependency_type === "required" && d.project_id
      );
      entry.requiredDeps = reqs.map((d) => ({ project_id: d.project_id }));
      depEntries.set(id, entry);

      for (const d of reqs) queue.push({ id: d.project_id, requiredBy: proj.title });
    } catch {
      errors.push("一部の依存MOD情報を取得できませんでした。");
    }
  }

  // 6. Resolve titles for every referenced dependency id (for nice labels).
  const allEntries = [...adopted.values(), ...depEntries.values()];
  const titleOf = new Map();
  allEntries.forEach((e) => titleOf.set(e.project_id, e.title));

  const unknownIds = [
    ...new Set(
      allEntries
        .flatMap((e) => e.requiredDeps.map((d) => d.project_id))
        .concat([...incompatibleDeps.keys()])
        .filter((id) => !titleOf.has(id))
    ),
  ];
  if (unknownIds.length) {
    try {
      const projs = await api.getProjects(unknownIds);
      projs.forEach((p) => titleOf.set(p.id, p.title));
    } catch {
      // Non-fatal: fall back to ids as labels.
    }
  }

  allEntries.forEach((e) => {
    e.requiredDeps = e.requiredDeps.map((d) => ({
      project_id: d.project_id,
      title: titleOf.get(d.project_id) || d.project_id,
    }));
  });

  // 7. Group into ordered, non-empty categories.
  const byRole = new Map();
  for (const e of allEntries) {
    if (!byRole.has(e.roleId)) byRole.set(e.roleId, []);
    byRole.get(e.roleId).push(e);
  }
  const categories = CATEGORY_ORDER
    .filter((id) => byRole.has(id))
    .map((id) => ({
      id,
      label: roleLabel(id),
      mods: byRole
        .get(id)
        .slice()
        .sort((a, b) => b.downloads - a.downloads),
    }));

  // 8. Counts.
  const counts = {
    body: adopted.size,
    deps: depEntries.size,
    total: adopted.size + depEntries.size,
  };

  // 9. Summary bars (one per non-empty category).
  const bars = categories.map((c) => ({ id: c.id, label: c.label, count: c.mods.length }));

  // 10. Warnings.
  const warnings = buildWarnings(allEntries);
  if (incompatibleDeps.size) {
    warnings.push({
      id: "incompat-deps",
      type: "compat",
      title: "未対応の可能性がある依存MOD",
      message:
        "以下の必須依存MODは、選択したバージョン/ローダー向けのファイルが見つかりませんでした。導入前に確認してください。",
      mods: [...incompatibleDeps.keys()].map((id) => titleOf.get(id) || id),
    });
  }

  return { version, loader, categories, counts, bars, warnings, errors, pool };
}
