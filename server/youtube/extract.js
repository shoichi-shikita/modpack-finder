import { load } from 'cheerio/slim';
import { AnalysisError, safeUrl } from './network.js';

export function videoId(input) {
  try {
    const text = String(input).trim();
    const u = new URL(/^https?:\/\//i.test(text) ? text : `https://${text}`);
    if (!['https:', 'http:'].includes(u.protocol) || u.username || u.password || u.port) throw new Error();
    let id;
    if (u.hostname === 'youtu.be') id = u.pathname.slice(1).split('/')[0];
    else if (['youtube.com', 'www.youtube.com', 'm.youtube.com', 'music.youtube.com', 'www.youtube-nocookie.com', 'youtube-nocookie.com'].includes(u.hostname)) {
      if (u.pathname === '/watch') id = u.searchParams.get('v');
      else id = u.pathname.match(/^\/(?:shorts|embed|live)\/([^/]+)\/?$/)?.[1];
    }
    if (!/^[\w-]{11}$/.test(id || '')) throw new Error();
    return id;
  } catch { throw new AnalysisError('INVALID_URL', 'YouTubeの動画URLを入力してください。watch / youtu.be / shorts / live に対応しています。', 400); }
}

// Balanced JSON scan: descriptions may contain braces, semicolons and escaped quotes.
export function playerJson(html) {
  const match = /(?:var\s+)?ytInitialPlayerResponse\s*=\s*/.exec(html);
  if (!match) return null;
  const start = match.index + match[0].length; let depth = 0; let quoted = false; let escaped = false;
  for (let i = start; i < html.length; i++) {
    const c = html[i];
    if (quoted) { if (escaped) escaped = false; else if (c === '\\') escaped = true; else if (c === '"') quoted = false; }
    else if (c === '"') quoted = true;
    else if (c === '{') depth++;
    else if (c === '}' && --depth === 0) { try { return JSON.parse(html.slice(start, i + 1)); } catch { return null; } }
  }
  return null;
}

export function urlsIn(text) {
  return [...new Set((text.match(/https?:\/\/[^\s<>"）]+/g) || []).map(s => s.replace(/[.,。、)]+$/, '')))];
}

export function pageDocument(html, url) {
  const $ = load(html);
  const title = $('h1').first().text().trim() || $('title').text().trim();
  const links = $('a[href],iframe[src]').toArray().map(el => {
    try { return new URL($(el).attr('href') || $(el).attr('src'), url).href; } catch { return ''; }
  }).filter(Boolean);
  $('script,style,nav,header,footer,aside,noscript,form,button').remove();
  $('br').replaceWith('\n');
  $('p,li,h1,h2,h3,div,section,tr').append('\n');
  const body = $('.note-common-styles__textnote-body').first().length ? $('.note-common-styles__textnote-body').first() : $('article').first();
  const text = (body.length ? body.text() : $('body').length ? $('body').text() : $.text()).replace(/[\t ]+/g, ' ').replace(/\n\s*\n/g, '\n').trim().slice(0, 100000);
  return { title, text, links };
}

export const normalizedName = value => value.toLowerCase().normalize('NFKC').replace(/\([^)]*\)/g, '').replace(/[^\p{L}\p{N}]/gu, '');
const listHeading = /(?:mod\s*(?:list|構成|一覧|リスト)|使用\s*(?:mod|MOD)|導入\s*mod|mods?\s*(?:used|included)|使用しているmod)/i;
const negative = /(?:not\s+(?:using|installed|included)|without|removed|don't use|未導入|使っていない|導入していない|不使用|削除した)/i;
export function candidatesFrom(source) {
  const rows = source.text.split('\n'); const output = [];
  let inList = listHeading.test(source.title || '');
  for (const raw of rows) {
    const line = raw.trim();
    if (listHeading.test(line)) inList = true;
    if (/^(?:credits|music|social|スポンサー|使用素材|音楽|おすすめ|関連動画)\b/i.test(line)) inList = false;
    if (negative.test(line)) continue;
    const bullet = /^[・•*-]\s*/.test(line);
    let name = line.replace(/^[・•*-]\s*/, '').replace(/^\d+[.)]\s*/, '').replace(/\s+https?:\/\/.*$/, '').replace(/\s+[—–|]\s+.*$/, '').trim();
    if ((inList || bullet) && !listHeading.test(line) && !/^(?:mods?)\s*[:：]/i.test(line) && /^[A-Za-z][A-Za-z0-9 :&+'!(),._-]{1,85}$/.test(name) && !/^(?:https?|minecraft|forge|neoforge|fabric|quilt|download|subscribe|version|ver\b|copy$)/i.test(name)) {
      output.push({ name, evidence: evidence(source, line), explicit: inList });
    }
    const labelled = line.match(/(?:使用MOD|導入MOD|mods? used|mods?)\s*[:：]\s*(.+)/i);
    if (labelled) for (const part of labelled[1].split(/[,、]/)) {
      name = part.trim();
      if (/^[A-Za-z][A-Za-z0-9 :&+'!()._-]{1,85}$/.test(name)) output.push({ name, evidence: evidence(source, line), explicit: true });
    }
  }
  for (const url of source.links || urlsIn(source.text)) {
    if (!safeUrl(url)) continue;
    const u = new URL(url);
    const m = u.hostname === 'modrinth.com' ? u.pathname.match(/^\/mod\/([\w-]+)/) : /curseforge.com$/.test(u.hostname) ? u.pathname.match(/^\/minecraft\/mc-mods\/([\w-]+)/) : null;
    if (m) output.push({ name: m[1].replace(/-/g, ' '), projectUrl: url, evidence: evidence(source, url), explicit: listHeading.test(source.text) });
  }
  return output;
}

export function evidence(source, quote) {
  return { sourceId: source.id, url: source.url, title: source.title, kind: source.kind, relationship: source.relationship, quote: quote.slice(0, 240) };
}

export function environmentFrom(sources) {
  const versions = []; const loaders = [];
  for (const s of sources) {
    for (const line of s.text.split('\n')) {
      if (negative.test(line)) continue;
      // A bare mod release number is not a Minecraft version.
      const vm = line.match(/(?:minecraft(?:\s*(?:version|ver))?|マイクラ(?:フト)?|マインクラフト|mc|ゲームバージョン|ver(?:sion)?\.?)\s*[:：v=]?\s*((?:1\.\d{1,2}(?:\.\d{1,2})?|2\d\.\d{1,2}(?:\.\d{1,2})?))\b/i);
      if (vm) versions.push({ value: vm[1], confidence: s.relationship === 'direct' ? 'high' : 'medium', evidence: evidence(s, line) });
      const lm = line.match(/\b(neoforge|forge|fabric|quilt)\b(?:\s*(?:version|ver)?\s*[:：v]?\s*(\d+(?:\.\d+){1,3}))?/i);
      if (lm && !/(?:Kotlin for Forge|Fabric API|Forge Config API)/i.test(line)) loaders.push({ value: lm[1].toLowerCase(), version: lm[2] || null, confidence: s.relationship === 'direct' ? 'high' : 'medium', evidence: evidence(s, line) });
    }
  }
  const unique = xs => xs.filter((x, i) => xs.findIndex(y => y.value === x.value && y.evidence.sourceId === x.evidence.sourceId) === i);
  return { minecraftVersions: unique(versions), loaders: unique(loaders) };
}
