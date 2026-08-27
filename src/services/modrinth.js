// All Modrinth API access lives here. Includes in-memory caches so the same
// project/version is never fetched twice within a session.

const BASE = "https://api.modrinth.com/v2";

const versionCache = new Map(); // key `${id}|${loader}|${gameVersion}` -> version object | null
const projectCache = new Map(); // project id -> project object

async function jget(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Modrinth HTTP ${res.status}`);
  return res.json();
}

// Live list of Minecraft release versions.
export async function getGameVersions() {
  const data = await jget(`${BASE}/tag/game_version`);
  return data
    .filter((v) => v.version_type === "release")
    .map((v) => v.version);
}

// Search mods by version + loader + a set of OR-joined categories.
export async function searchMods({ version, loader, categories, query, limit }) {
  const facets = [
    ["project_type:mod"],
    [`versions:${version}`],
    [`categories:${loader}`],
    categories.map((c) => `categories:${c}`),
  ].filter((group) => group.length > 0);

  let url =
    `${BASE}/search?index=downloads&limit=${limit}` +
    `&facets=${encodeURIComponent(JSON.stringify(facets))}`;
  if (query && query.trim()) url += `&query=${encodeURIComponent(query.trim())}`;

  const data = await jget(url);
  return data.hits || [];
}

// Return the newest version of a project compatible with the loader + game
// version, or null if none exists. Cached (including negative results).
export async function getCompatibleVersion(id, loader, gameVersion) {
  const key = `${id}|${loader}|${gameVersion}`;
  if (versionCache.has(key)) return versionCache.get(key);

  const url =
    `${BASE}/project/${id}/version` +
    `?loaders=${encodeURIComponent(JSON.stringify([loader]))}` +
    `&game_versions=${encodeURIComponent(JSON.stringify([gameVersion]))}`;

  let result = null;
  const versions = await jget(url);
  if (Array.isArray(versions) && versions.length) {
    versions.sort(
      (a, b) => new Date(b.date_published) - new Date(a.date_published)
    );
    result = versions[0];
  }
  versionCache.set(key, result);
  return result;
}

// Batch project lookup. Uses the cache and only fetches ids it doesn't have.
export async function getProjects(ids) {
  const unique = [...new Set(ids)];
  const missing = unique.filter((id) => !projectCache.has(id));
  if (missing.length) {
    const url = `${BASE}/projects?ids=${encodeURIComponent(
      JSON.stringify(missing)
    )}`;
    const data = await jget(url);
    for (const p of data) projectCache.set(p.id, p);
  }
  return unique.map((id) => projectCache.get(id)).filter(Boolean);
}