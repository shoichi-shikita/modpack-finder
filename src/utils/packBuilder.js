import { THEMES, getRole, roleLabel, CATEGORY_ORDER } from "../data/categories";
import { buildWarnings } from "../data/warnings";
import {
  MIN_DOWNLOADS,
  MIN_DOWNLOADS_RELAXED,
  curatedRank,
  isAcceptableHit,
} from "../data/curated";
import { noteFor } from "../data/modNotes";
import { fmtShort, addUnique } from "./format";
import * as api from "../services/modrinth";

// Safety cap so dependency resolution can never run away.
const MAX_TOTAL = 45;

// A stable fingerprint of the inputs a pack was built from, so the UI can tell
// when the on-screen result no longer matches the form.
export function packSignature({ version, loader, themeIds, query, includePerformance }) {
  return [
    version,
    loader,
    [...themeIds].sort().join(","),
    (query || "").trim(),
    includePerformance ? "perf" : "noperf",
  ].join("|");
}

function reasonFor(role, hit) {
  const dl = fmtShort(hit.downloads);
  const curated = curatedRank(role.id, (hit.slug || "").toLowerCase()) !== Number.MAX_SAFE_INTEGER;
  if (curated) {
    return `${role.label}の定番MODとして選定（DL ${dl}）。${role.reasonTail || ""}`.trim();
  }
  return `${role.label}カテゴリでダウンロード数が多いため採用（DL ${dl}）。${role.reasonTail || ""}`.trim();
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
    description: noteFor(hit.slug, hit.description || ""),
    descriptionEn: hit.description || "",
    localized: !!noteFor(hit.slug, ""),
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
    description: noteFor(proj.slug, proj.description || ""),
    descriptionEn: proj.description || "",
    localized: !!noteFor(proj.slug, ""),
    author: "",
    downloads: proj.downloads || 0,
    icon_url: proj.icon_url || "",
    categories: proj.categories || [],
    client_side: proj.client_side || "required",
    server_side: proj.server_side || "required",
    roleId: "core",
    reason: "他のMODの動作に必要な前提MODのため自動追加。単体では何も起きません。",
    requiredDeps: [],
    requiredBy: requiredBy ? [requiredBy] : [],
    autoAdded: true,
    file: null,
  };
}

// Order hits so hand-picked mods come first, then by downloads.
function rankHits(hits, roleId) {
  return hits
    .map((h, i) => ({ h, i, r: curatedRank(roleId, (h.slug || "").toLowerCase()) }))
    .sort((a, b) => (a.r !== b.r ? a.r - b.r : a.i - b.i))
    .map((x) => x.h);
}

// Apply the quality gate, relaxing the download floor only if the strict pass
// cannot fill the role's quota.
function acceptableHits(hits, roleId, wanted) {
  const strict = hits.filter((h) => isAcceptableHit(h, roleId, MIN_DOWNLOADS));
  if (strict.length >= wanted) return rankHits(strict, roleId);
  const relaxed = hits.filter((h) => isAcceptableHit(h, roleId, MIN_DOWNLOADS_RELAXED));
  return rankHits(relaxed.length >= strict.length ? relaxed : strict, roleId);
}

// Resolve every entry's newest compatible version: confirms a real file exists
// and reads required dependencies. Entries with no compatible file are dropped.
async function attachVersions(map, loader, version) {
  await Promise.all(
    [...map.keys()].map(async (id) => {
      try {
        const v = await api.getCompatibleVersion(id, loader, version);
        if (!v) {
          map.delete(id);
          return;
        }
        const entry = map.get(id);
        entry.file = pickFile(v);
        entry.requiredDeps = (v.dependencies || [])
          .filter((d) => d.dependency_type === "required" && d.project_id)
          .map((d) => ({ project_id: d.project_id }));
      } catch {
        map.delete(id);
      }
    })
  );
}

// Breadth-first dependency resolution shared by both build paths.
async function resolveDependencies(adopted, loader, version, errors) {
  const visited = new Set(adopted.keys());
  const depEntries = new Map();
  const incompatibleDeps = new Set();

  const queue = [];
  for (const entry of adopted.values()) {
    for (const d of entry.requiredDeps) queue.push({ id: d.project_id, requiredBy: entry.title });
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
        incompatibleDeps.add(id);
        continue;
      }
      const [proj] = await api.getProjects([id]);
      if (!proj) continue;

      const entry = makeDepEntry(proj, requiredBy);
      entry.file = pickFile(v);
      entry.requiredDeps = (v.dependencies || [])
        .filter((d) => d.dependency_type === "required" && d.project_id)
        .map((d) => ({ project_id: d.project_id }));
      depEntries.set(id, entry);

      for (const d of entry.requiredDeps) queue.push({ id: d.project_id, requiredBy: proj.title });
    } catch {
      errors.push("一部の依存MOD情報を取得できませんでした。");
    }
  }

  return { depEntries, incompatibleDeps };
}

// Group entries into ordered, non-empty categories + derived counts/bars.
function assemble({ version, loader, allEntries, incompatibleDeps, titleOf, errors, pool, signature }) {
  const byRole = new Map();
  for (const e of allEntries) {
    if (!byRole.has(e.roleId)) byRole.set(e.roleId, []);
    byRole.get(e.roleId).push(e);
  }
  const categories = CATEGORY_ORDER.filter((id) => byRole.has(id)).map((id) => ({
    id,
    label: roleLabel(id),
    mods: byRole.get(id).slice().sort((a, b) => b.downloads - a.downloads),
  }));

  const body = allEntries.filter((e) => !e.autoAdded).length;
  const deps = allEntries.filter((e) => e.autoAdded).length;
  const counts = { body, deps, total: body + deps };
  const bars = categories.map((c) => ({ id: c.id, label: c.label, count: c.mods.length }));
  const totalSize = allEntries.reduce((n, e) => n + ((e.file && e.file.size) || 0), 0);

  const warnings = buildWarnings(allEntries);
  if (incompatibleDeps.size) {
    warnings.push({
      id: "incompat-deps",
      type: "compat",
      title: "未対応の可能性がある依存MOD",
      message:
        "以下の必須依存MODは、選択したバージョン/ローダー向けのファイルが見つかりませんでした。導入前に確認してください。",
      mods: [...incompatibleDeps].map((id) => titleOf.get(id) || id),
    });
  }

  return {
    version, loader, categories, counts, bars, totalSize,
    warnings, errors, pool: pool || {}, signature: signature || "",
  };
}

// Fill in a human title for every referenced dependency id.
async function fillTitles(allEntries, extraIds) {
  const titleOf = new Map(allEntries.map((e) => [e.project_id, e.title]));
  const unknown = [
    ...new Set(
      allEntries
        .flatMap((e) => e.requiredDeps.map((d) => d.project_id))
        .concat(extraIds || [])
        .filter((id) => !titleOf.has(id))
    ),
  ];
  if (unknown.length) {
    try {
      const projs = await api.getProjects(unknown);
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
  return titleOf;
}

// --- Main entry point. Never throws — collects problems into `errors`. -------
export async function buildPack({ version, loader, themeIds, query, includePerformance = true }) {
  const errors = [];

  // 1. Resolve the roles to search from the selected themes.
  const roleIds = new Set();
  themeIds.forEach((tid) => {
    const t = THEMES.find((x) => x.id === tid);
    if (t) t.roles.forEach((r) => roleIds.add(r));
  });
  if (includePerformance) roleIds.add("performance");

  const roleList = [...roleIds].map((id) => getRole(id)).filter((r) => r && r.facets.length > 0);

  // 2. Search each role in parallel. The user's keyword narrows the themed
  //    roles only — applying it to "performance" would search for, say,
  //    "dragon optimization mods", which is meaningless.
  const searchResults = await Promise.all(
    roleList.map(async (role) => {
      const themed = role.id !== "performance";
      try {
        const hits = await api.searchMods({
          version,
          loader,
          categories: role.facets,
          query: themed ? [role.query, query].filter(Boolean).join(" ") : role.query,
          // Over-fetch: the quality gate below discards a lot.
          limit: Math.min(50, (role.count || 4) * 4 + 10),
        });
        return { role, hits };
      } catch {
        errors.push(`「${role.label}」の検索に失敗しました。`);
        return { role, hits: [] };
      }
    })
  );

  // 3. Filter, rank and adopt, deduping across roles by project_id.
  const adopted = new Map();
  const pool = {};
  for (const { role, hits } of searchResults) {
    const wanted = role.count || 4;
    const usable = acceptableHits(hits, role.id, wanted);
    pool[role.id] = usable;
    let taken = 0;
    for (const h of usable) {
      if (taken >= wanted) break;
      if (adopted.has(h.project_id)) continue;
      adopted.set(h.project_id, makeEntry(h, role));
      taken += 1;
    }
  }

  // 4. Confirm real files exist, and read dependencies.
  await attachVersions(adopted, loader, version);

  // 5. Resolve dependencies.
  const { depEntries, incompatibleDeps } = await resolveDependencies(
    adopted, loader, version, errors
  );

  // 6. Titles + assembly.
  const allEntries = [...adopted.values(), ...depEntries.values()];
  const titleOf = await fillTitles(allEntries, [...incompatibleDeps]);

  return assemble({
    version, loader, allEntries, incompatibleDeps, titleOf, errors, pool,
    signature: packSignature({ version, loader, themeIds, query, includePerformance }),
  });
}

// --- Rebuild an exact pack from a shared link -------------------------------
// Used when a URL carries `mods=slug,slug,...`, so a shared configuration
// reproduces the mods the sender actually saw rather than re-running a search
// whose ranking may have moved.
function inferRole(categories) {
  const cats = categories || [];
  for (const roleId of CATEGORY_ORDER) {
    const role = getRole(roleId);
    if (role && role.facets.length && role.facets.some((f) => cats.includes(f))) return role;
  }
  return getRole("qol");
}

export async function buildPackFromSlugs({ version, loader, slugs, signature }) {
  const errors = [];
  const adopted = new Map();

  let projects = [];
  try {
    projects = await api.getProjects(slugs);
  } catch {
    errors.push("共有された構成の読み込みに失敗しました。");
  }
  if (!projects.length) {
    return assemble({
      version, loader, allEntries: [], incompatibleDeps: new Set(),
      titleOf: new Map(), errors, pool: {}, signature,
    });
  }

  for (const p of projects) {
    const role = inferRole(p.categories);
    adopted.set(
      p.id,
      makeEntry(
        {
          project_id: p.id,
          slug: p.slug,
          title: p.title,
          description: p.description,
          downloads: p.downloads,
          icon_url: p.icon_url,
          categories: p.categories,
          client_side: p.client_side,
          server_side: p.server_side,
          author: "",
        },
        role
      )
    );
  }

  const before = adopted.size;
  await attachVersions(adopted, loader, version);
  if (adopted.size < before) {
    errors.push(
      `${before - adopted.size} 個のMODは ${version} / ${loader} 向けのファイルが見つからず除外しました。`
    );
  }

  const { depEntries, incompatibleDeps } = await resolveDependencies(
    adopted, loader, version, errors
  );
  const allEntries = [...adopted.values(), ...depEntries.values()];
  const titleOf = await fillTitles(allEntries, [...incompatibleDeps]);

  return assemble({
    version, loader, allEntries, incompatibleDeps, titleOf, errors, pool: {}, signature,
  });
}
