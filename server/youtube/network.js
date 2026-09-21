// Exact trusted service hosts only; no user-controlled fetch proxy, cookies or redirects.
export const PAGE_HOSTS = new Set(['note.com', 'modrinth.com', 'www.curseforge.com', 'curseforge.com', 'github.com', 'raw.githubusercontent.com', 'gist.githubusercontent.com', 'pastebin.com']);
const API_HOSTS = new Set(['www.youtube.com', 'www.googleapis.com', 'api.modrinth.com', 'api.curseforge.com', 'api.search.brave.com']);
export function safeUrl(value, hosts = PAGE_HOSTS) {
  try {
    const u = new URL(value);
    if (u.protocol !== 'https:' || u.username || u.password || (u.port && u.port !== '443') || !hosts.has(u.hostname)) return null;
    u.hash = '';
    return u.href;
  } catch { return null; }
}

export class AnalysisError extends Error {
  constructor(code, message, status = 422) { super(message); this.code = code; this.status = status; }
}

export function createClient(fetcher = fetch, signal) {
  let requests = 0;
  return async function get(url, { headers = {}, maxBytes = 2_500_000 } = {}) {
    if (!safeUrl(url, new Set([...PAGE_HOSTS, ...API_HOSTS]))) throw new Error('Unsupported host');
    if (++requests > 180) throw new Error('Request budget exceeded');
    const response = await fetcher(url, {
      redirect: 'manual', signal: signal ? AbortSignal.any([signal, AbortSignal.timeout(8000)]) : AbortSignal.timeout(8000),
      headers: { 'User-Agent': 'ModpackFinder/1.0 (https://github.com/shoichi-shikita/modpack-finder)', ...headers },
    });
    if (!response.ok) throw new Error(`Upstream HTTP ${response.status}`);
    if (Number(response.headers.get('content-length')) > maxBytes) { await response.body?.cancel(); throw new Error('Response too large'); }
    const reader = response.body?.getReader();
    if (!reader) return '';
    const decoder = new TextDecoder(); let text = ''; let size = 0;
    try {
      while (true) {
        const { value, done } = await reader.read(); if (done) break;
        size += value.byteLength;
        if (size > maxBytes) throw new Error('Response too large');
        text += decoder.decode(value, { stream: true });
      }
      return text + decoder.decode();
    } finally { await reader.cancel().catch(() => {}); }
  };
}

export async function mapLimit(items, limit, fn) {
  const output = new Array(items.length); let next = 0;
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (next < items.length) { const i = next++; output[i] = await fn(items[i], i); }
  }));
  return output;
}
