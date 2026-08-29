// All Modrinth API access lives here. Includes in-memory caches so the same
// project/version is never fetched twice within a session.

const BASE = "https://api.modrinth.com/v2";

const versionCache = new Map(); // key `${id}|${loader}|${gameVersion}` -> version object | null
const projectCache = new Map(); // project id AND slug -> project object

const GV_CACHE_KEY = "mpf.gameVersions.v1";
const GV_CACHE_TTL = 24 * 60 * 60 * 1000; // 24h — this list barely changes

async function jget(url) {
  const res = await fetch(url);
  if (res.status === 429) {
    throw new Error("Modrinth のリクエスト上限に達しました。少し待ってから再試行してください。");
  }
  if (!res.ok) throw new Error(`Modrinth HTTP ${res.status}`);
  return res.json();
}

function readGvCache() {
  try {
    const raw = localStorage.getItem(GV_CACHE_KEY);
    if (!raw) return null;
    const { at, versions } = JSON.parse(raw);
    if (!Array.isArray(versions) || !versions.length) return null;
    if (Date.now() - at > GV_CACHE_TTL) return null;
    return versions;
  } catch {
    return null;
  }
}

function writeGvCache(versions) {
  try {
    localStorage.setItem(GV_CACHE_KEY, JSON.stringify({ at: Date.now(), versions }));
  } catch {
    // Storage disabled/full — the network path still works.
  }
}

// Live list of Minecraft release versions. Cached in localStorage for a day so
// this isn't refetched on every route change.
export async function getGameVersions() {
  const cached = readGvCache();
  if (cached) return cached;

  const data = await jget(`${BASE}/tag/game_version`);
  const versions = data
    .filter((v) => v.version_type === "release")
    .map((v) => v.version);
  if (versions.length) writeGvCache(versions);
  return versions;
}

// Free-text project search, used by the "add a mod" field.
export async function searchProjects({ version, loader, query, limit = 8 }) {
  if (!query || !query.trim()) return [];
  const facets = [
    ["project_type:mod"],
    [`versions:${version}`],
    [`categories:${loader}`],
  ];
  const url =
    `${BASE}/search?index=relevance&limit=${limit}` +
    `&facets=${encodeURIComponent(JSON.stringify(facets))}` +
    `&query=${encodeURIComponent(query.trim())}`;
  const data = await jget(url);
  return data.hits || [];
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

// Batch project lookup. Accepts Modrinth ids *or* slugs (the API resolves both),
// and caches each result under both keys so either spelling hits the cache.
export async function getProjects(idsOrSlugs) {
  const unique = [...new Set((idsOrSlugs || []).filter(Boolean))];
  const missing = unique.filter((k) => !projectCache.has(k));
  if (missing.length) {
    const url = `${BASE}/projects?ids=${encodeURIComponent(
      JSON.stringify(missing)
    )}`;
    const data = await jget(url);
    for (const p of data) {
      projectCache.set(p.id, p);
      if (p.slug) projectCache.set(p.slug, p);
    }
  }
  return unique.map((k) => projectCache.get(k)).filter(Boolean);
}