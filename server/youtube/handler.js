import { analyzeVideo } from './analyze.js';
import { resolveMods } from './resolve.js';
import { AnalysisError } from './network.js';

const rate = new Map();
const reply = (data, status = 200) => Response.json(data, { status, headers: { 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' } });
export async function handleYouTube(request, env = {}, fetcher = fetch) {
  if (request.method !== 'POST') return reply({ error: 'POSTのみ利用できます。', code: 'METHOD_NOT_ALLOWED' }, 405);
  const origin = request.headers.get('origin');
  if (origin && origin !== new URL(request.url).origin) return reply({ error: '同じサイトからアクセスしてください。' }, 403);
  if (!request.headers.get('content-type')?.startsWith('application/json')) return reply({ error: 'JSON形式で送信してください。' }, 415);
  // Best-effort per-isolate throttle. Use Cloudflare's WAF rate rules for global limits.
  const now = Date.now(); const ip = request.headers.get('cf-connecting-ip') || 'local';
  for (const [key, state] of rate) if (state.until < now) rate.delete(key);
  const state = rate.get(ip) || { count: 0, until: now + 60_000 };
  state.count++; rate.set(ip, state);
  if (rate.size > 1000) rate.delete(rate.keys().next().value);
  if (state.count > 30) return reply({ error: 'リクエストが多いため、1分ほど待って再試行してください。', code: 'RATE_LIMIT' }, 429);
  try {
    if (Number(request.headers.get('content-length')) > 16000) throw new AnalysisError('TOO_LARGE', '入力が長すぎます。', 413);
    const reader = request.body?.getReader(); let bytes = 0; let body = ''; const decoder = new TextDecoder();
    if (!reader) throw new AnalysisError('INVALID_BODY', '入力を確認してください。', 400);
    try {
      while (true) { const part = await reader.read(); if (part.done) break; bytes += part.value.byteLength; if (bytes > 16000) throw new AnalysisError('TOO_LARGE', '入力が長すぎます。', 413); body += decoder.decode(part.value, { stream: true }); }
    } finally { await reader.cancel().catch(() => {}); }
    let input; try { input = JSON.parse(body + decoder.decode()); } catch { throw new AnalysisError('INVALID_BODY', '入力を確認してください。', 400); }
    if (!input || typeof input !== 'object') throw new AnalysisError('INVALID_BODY', '入力を確認してください。', 400);
    const signal = AbortSignal.any([request.signal, AbortSignal.timeout(45_000)]);
    return reply(await (input.action === 'resolve' ? resolveMods(input, env, fetcher, signal) : analyzeVideo(input, env, fetcher, signal)));
  } catch (error) {
    if (error instanceof AnalysisError) return reply({ error: error.message, code: error.code }, error.status);
    return reply({ error: '解析に失敗しました。時間をおいて再試行してください。', code: 'UPSTREAM_ERROR' }, 502);
  }
}
