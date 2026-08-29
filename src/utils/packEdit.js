import { CATEGORY_ORDER, roleLabel, getRole } from "../data/categories";
import { buildWarnings } from "../data/warnings";
import { makeEntry, makeDepEntry, pickFile } from "./packBuilder";
import * as api from "../services/modrinth";

const MAX_TOTAL = 60;

function flatten(pack) {
  return pack.categories.flatMap((c) => c.mods);
}

// Recompute categories, counts, bars, warnings, dependency requiredBy links, and
// drop dependency mods that nothing needs anymore. Pure — no API calls.
export function recomputeDerived(pack) {
  const entries = flatten(pack);
  const byId = new Map(entries.map((e) => [e.project_id, e]));
  const mains = entries.filter((e) => !e.autoAdded);
  const deps = entries.filter((e) => e.autoAdded);

  // Which dependency ids are still reachable from the kept main mods?
  const needed = new Set();
  const queue = [];
  for (const m of mains) {
    for (const d of m.requiredDeps || []) {
      if (byId.has(d.project_id)) queue.push(d.project_id);
    }
  }
  while (queue.length) {
    const id = queue.shift();
    if (needed.has(id)) continue;
    needed.add(id);
    const e = byId.get(id);
    for (const d of (e && e.requiredDeps) || []) {
      if (byId.has(d.project_id)) queue.push(d.project_id);
    }
  }

  const keptDeps = deps.filter((e) => needed.has(e.project_id));
  const keptIds = new Set([
    ...mains.map((e) => e.project_id),
    ...keptDeps.map((e) => e.project_id),
  ]);

  // Recompute which mods require each kept dependency.
  const requiredByMap = new Map(); // depId -> Set(title)
  for (const e of [...mains, ...keptDeps]) {
    for (const d of e.requiredDeps || []) {
      if (!keptIds.has(d.project_id)) continue;
      if (!requiredByMap.has(d.project_id)) requiredByMap.set(d.project_id, new Set());
      requiredByMap.get(d.project_id).add(e.title);
    }
  }

  const rebuild = (e) => {
    if (e.autoAdded) {
      const rb = requiredByMap.get(e.project_id);
      return { ...e, requiredBy: rb ? [...rb] : [] };
    }
    return { ...e };
  };
  const allKept = [...mains.map(rebuild), ...keptDeps.map(rebuild)];

  // Group into ordered, non-empty categories.
  const byRole = new Map();
  for (const e of allKept) {
    if (!byRole.has(e.roleId)) byRole.set(e.roleId, []);
    byRole.get(e.roleId).push(e);
  }
  const categories = CATEGORY_ORDER.filter((id) => byRole.has(id)).map((id) => ({
    id,
    label: roleLabel(id),
    mods: byRole.get(id).slice().sort((a, b) => b.downloads - a.downloads),
  }));

  const body = allKept.filter((e) => !e.autoAdded).length;
  const depsCount = allKept.filter((e) => e.autoAdded).length;
  const counts = { body, deps: depsCount, total: body + depsCount };
  const bars = categories.map((c) => ({ id: c.id, label: c.label, count: c.mods.length }));
  const totalSize = allKept.reduce((n, e) => n + ((e.file && e.file.size) || 0), 0);
  const warnings = buildWarnings(allKept);

  return { ...pack, categories, counts, bars, totalSize, warnings };
}

// Remove a mod (and cascade-clean any dependencies it orphaned).
export function removeMod(pack, projectId) {
  const categories = pack.categories.map((c) => ({
    ...c,
    mods: c.mods.filter((m) => m.project_id !== projectId),
  }));
  return recomputeDerived({ ...pack, categories });
}

// Candidate hits for the same role that aren't currently in the pack.
export function alternativesFor(pack, projectId) {
  const target = flatten(pack).find((m) => m.project_id === projectId);
  if (!target) return [];
  const poolHits = (pack.pool && pack.pool[target.roleId]) || [];
  const present = new Set(flatten(pack).map((m) => m.project_id));
  return poolHits.filter((h) => !present.has(h.project_id));
}

// Resolve required dependencies of a seed entry, fetching any not already known.
async function resolveDeps(seed, pack, known) {
  const out = new Map();
  const queue = (seed.requiredDeps || []).map((d) => ({ id: d.project_id, by: seed.title }));
  while (queue.length) {
    if (known.size > MAX_TOTAL) break;
    const { id, by } = queue.shift();
    if (known.has(id)) continue;
    known.add(id);
    const v = await api.getCompatibleVersion(id, pack.loader, pack.version);
    if (!v) continue;
    const projs = await api.getProjects([id]);
    const proj = projs[0];
    if (!proj) continue;
    const entry = makeDepEntry(proj, by);
    entry.file = pickFile(v);
    entry.requiredDeps = (v.dependencies || [])
      .filter((d) => d.dependency_type === "required" && d.project_id)
      .map((d) => ({ project_id: d.project_id }));
    out.set(id, entry);
    for (const d of entry.requiredDeps) queue.push({ id: d.project_id, by: proj.title });
  }
  return out;
}

// Swap a main mod for the best available alternative in the same role.
// Async (fetches the replacement's version + dependencies). Returns
// { pack, error }.
export async function swapMod(pack, projectId) {
  const entries = flatten(pack);
  const target = entries.find((m) => m.project_id === projectId);
  if (!target) return { pack, error: "対象のMODが見つかりません。" };
  if (target.autoAdded) return { pack, error: "依存MODは入れ替えできません。" };

  const alts = alternativesFor(pack, projectId);
  if (!alts.length) return { pack, error: "同じジャンルの他の候補が見つかりませんでした。" };

  const role = getRole(target.roleId);
  let newEntry = null;
  for (const hit of alts) {
    const v = await api.getCompatibleVersion(hit.project_id, pack.loader, pack.version);
    if (!v) continue;
    const e = makeEntry(hit, role);
    e.file = pickFile(v);
    e.requiredDeps = (v.dependencies || [])
      .filter((d) => d.dependency_type === "required" && d.project_id)
      .map((d) => ({ project_id: d.project_id }));
    newEntry = e;
    break;
  }
  if (!newEntry) return { pack, error: "入れ替えできるMODが見つかりませんでした。" };

  // Resolve the replacement's dependencies (skip ids already present, minus the
  // one leaving).
  const known = new Set(entries.map((e) => e.project_id));
  known.delete(projectId);
  known.add(newEntry.project_id);
  const newDeps = await resolveDeps(newEntry, pack, known);

  // Replace target with newEntry in the same category; append new deps to core.
  const categories = pack.categories.map((c) => ({
    ...c,
    mods: c.mods.map((m) => (m.project_id === projectId ? newEntry : m)),
  }));
  let next = { ...pack, categories };

  // Merge new dependency entries into the flat list, then recompute.
  const flat = flatten(next);
  const present = new Set(flat.map((m) => m.project_id));
  const toAdd = [...newDeps.values()].filter((d) => !present.has(d.project_id));
  if (toAdd.length) {
    // Put them in a temporary "core" bucket by adding to a categories copy;
    // recomputeDerived will regroup everything correctly.
    const merged = [...flat, ...toAdd];
    next = recomputeFromEntries(next, merged);
  }

  // Fill in dependency display titles across all entries.
  next = await fillDepTitles(next);

  return { pack: recomputeDerived(next), error: "" };
}

// Rebuild a pack's categories from a flat entry list, then recompute derived.
function recomputeFromEntries(pack, entries) {
  const byRole = new Map();
  for (const e of entries) {
    if (!byRole.has(e.roleId)) byRole.set(e.roleId, []);
    byRole.get(e.roleId).push(e);
  }
  const categories = CATEGORY_ORDER.filter((id) => byRole.has(id)).map((id) => ({
    id,
    label: roleLabel(id),
    mods: byRole.get(id),
  }));
  return { ...pack, categories };
}

// Ensure every requiredDeps entry has a human title (fetch unknowns in one batch).
async function fillDepTitles(pack) {
  const entries = flatten(pack);
  const titleOf = new Map(entries.map((e) => [e.project_id, e.title]));
  const unknown = [
    ...new Set(
      entries
        .flatMap((e) => (e.requiredDeps || []).map((d) => d.project_id))
        .filter((id) => !titleOf.has(id))
    ),
  ];
  if (unknown.length) {
    try {
      const projs = await api.getProjects(unknown);
      projs.forEach((p) => titleOf.set(p.id, p.title));
    } catch {
      // fall back to ids
    }
  }
  const categories = pack.categories.map((c) => ({
    ...c,
    mods: c.mods.map((m) => ({
      ...m,
      requiredDeps: (m.requiredDeps || []).map((d) => ({
        project_id: d.project_id,
        title: titleOf.get(d.project_id) || d.project_id,
      })),
    })),
  }));
  return { ...pack, categories };
}

// Add a specific mod (by Modrinth id or slug) to the pack, resolving its
// dependencies. Returns { pack, error }.
export async function addMod(pack, idOrSlug) {
  const entries = flatten(pack);
  const projs = await api.getProjects([idOrSlug]);
  const proj = projs[0];
  if (!proj) return { pack, error: "そのMODが見つかりませんでした。" };

  if (entries.some((e) => e.project_id === proj.id)) {
    return { pack, error: `${proj.title} はすでに構成に入っています。` };
  }

  const v = await api.getCompatibleVersion(proj.id, pack.loader, pack.version);
  if (!v) {
    return {
      pack,
      error: `${proj.title} は ${pack.version} / ${pack.loader} に対応するファイルがありません。`,
    };
  }

  const role = getRole(inferRoleId(proj.categories)) || getRole("qol");
  const entry = makeEntry(
    {
      project_id: proj.id,
      slug: proj.slug,
      title: proj.title,
      description: proj.description,
      downloads: proj.downloads,
      icon_url: proj.icon_url,
      categories: proj.categories,
      client_side: proj.client_side,
      server_side: proj.server_side,
      author: "",
    },
    role
  );
  entry.reason = "手動で追加したMOD。";
  entry.file = pickFile(v);
  entry.requiredDeps = (v.dependencies || [])
    .filter((d) => d.dependency_type === "required" && d.project_id)
    .map((d) => ({ project_id: d.project_id }));

  const known = new Set(entries.map((e) => e.project_id));
  known.add(entry.project_id);
  const newDeps = await resolveDeps(entry, pack, known);

  const merged = [...entries, entry, ...newDeps.values()];
  let next = recomputeFromEntries(pack, merged);
  next = await fillDepTitles(next);
  return { pack: recomputeDerived(next), error: "" };
}

function inferRoleId(categories) {
  const cats = categories || [];
  for (const roleId of CATEGORY_ORDER) {
    const role = getRole(roleId);
    if (role && role.facets && role.facets.length && role.facets.some((f) => cats.includes(f))) {
      return roleId;
    }
  }
  return "qol";
}
