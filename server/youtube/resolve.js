import { createClient, mapLimit, AnalysisError } from './network.js';
import { normalizedName } from './extract.js';

export async function resolveMods(input, env = {}, fetcher = fetch, signal) {
  if (!Array.isArray(input.mods) || input.mods.length > 8 || input.mods.some(m => !m || typeof m.name !== 'string' || !m.name.trim() || m.name.length > 90 || typeof m.id !== 'string' || m.id.length > 100)) throw new AnalysisError('INVALID_MODS', 'MOD候補は8件ずつ指定してください。', 400);
  const version = typeof input.version === 'string' && /^(?:1\.\d{1,2}|2\d\.\d{1,2})(?:\.\d{1,2})?$/.test(input.version) ? input.version : null;
  const loader = ['forge', 'neoforge', 'fabric', 'quilt'].includes(input.loader) ? input.loader : null;
  const get = createClient(fetcher, signal);
  const json = async (url, options) => JSON.parse(await get(url, options));
  const results = await mapLimit(input.mods, 2, async m => {
    try {
      const data = await json(`https://api.modrinth.com/v2/search?facets=%5B%5B%22project_type%3Amod%22%5D%5D&limit=5&query=${encodeURIComponent(m.name)}`);
      const exact = (data.hits || []).filter(h => normalizedName(h.title) === normalizedName(m.name) || normalizedName(h.slug) === normalizedName(m.name));
      if (exact.length === 1) {
        const p = exact[0];
        const params = new URLSearchParams();
        if (version) params.set('game_versions', JSON.stringify([version]));
        if (loader) params.set('loaders', JSON.stringify([loader]));
        // Only fetch file releases when both constraints are known.
        let compatible = null;
        let compatibility = 'unknown';
        if (version && loader) {
          try { const files = await json(`https://api.modrinth.com/v2/project/${p.project_id}/version?${params}`); compatible = files.find(v => v.files?.length && v.game_versions?.includes(version) && v.loaders?.includes(loader)) || null; compatibility = compatible ? 'compatible' : 'incompatible'; }
          catch { compatibility = 'error'; }
        }
        return { id: m.id, resolution: { provider: 'modrinth', projectId: p.project_id, slug: p.slug, title: p.title, url: `https://modrinth.com/mod/${p.slug}`, gameVersions: p.versions || [], loaders: (p.categories || []).filter(c => ['forge', 'neoforge', 'fabric', 'quilt'].includes(c)), compatibility, checkedVersion: version, checkedLoader: loader, release: compatible ? { id: compatible.id, name: compatible.version_number, gameVersions: compatible.game_versions, loaders: compatible.loaders } : null } };
      }
      if (env.CURSEFORGE_API_KEY) {
        const options = { headers: { 'x-api-key': env.CURSEFORGE_API_KEY } };
        const cf = await json(`https://api.curseforge.com/v1/mods/search?gameId=432&classId=6&searchFilter=${encodeURIComponent(m.name)}&pageSize=5`, options);
        const matches = (cf.data || []).filter(p => normalizedName(p.name) === normalizedName(m.name) || normalizedName(p.slug) === normalizedName(m.name));
        if (matches.length === 1) {
          const p = matches[0]; const types = { forge: 1, fabric: 4, quilt: 5, neoforge: 6 };
          let compatibility = 'unknown'; let release = null;
          if (version && loader) {
            try { const files = await json(`https://api.curseforge.com/v1/mods/${p.id}/files?gameVersion=${encodeURIComponent(version)}&modLoaderType=${types[loader]}&pageSize=1`, options); release = files.data?.[0] || null; compatibility = release ? 'compatible' : 'incompatible'; }
            catch { compatibility = 'error'; }
          }
          return { id: m.id, resolution: { provider: 'curseforge', projectId: p.id, title: p.name, url: `https://www.curseforge.com/minecraft/mc-mods/${p.slug}`, gameVersions: [...new Set((p.latestFilesIndexes || []).map(f => f.gameVersion))], loaders: [], compatibility, checkedVersion: version, checkedLoader: loader, release: release ? { name: release.displayName } : null } };
        }
      }
      return { id: m.id, resolution: null, resolutionStatus: 'unmatched' };
    } catch { return { id: m.id, resolution: null, resolutionStatus: 'error' }; }
  });
  return { mods: results, curseforgeEnabled: !!env.CURSEFORGE_API_KEY };
}
