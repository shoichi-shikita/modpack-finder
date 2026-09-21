import { AnalysisError, createClient, mapLimit, safeUrl } from './network.js';
import { videoId, playerJson, pageDocument, urlsIn, candidatesFrom, environmentFrom, evidence, normalizedName } from './extract.js';

export async function analyzeVideo(input, env = {}, fetcher = fetch, signal) {
  const id = videoId(input.url);
  if (input.sourceUrl && !safeUrl(input.sourceUrl)) throw new AnalysisError('UNSUPPORTED_SOURCE', '追加の出典は note、Modrinth、CurseForge、GitHub、Pastebin のHTTPS URLを指定してください。', 400);
  const get = createClient(fetcher, signal);
  const url = `https://www.youtube.com/watch?v=${id}`;
  const warnings = []; let player; let metadata;
  if (env.YOUTUBE_API_KEY) {
    try {
      const data = JSON.parse(await get(`https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${id}&key=${encodeURIComponent(env.YOUTUBE_API_KEY)}`));
      const s = data.items?.[0]?.snippet;
      if (!s) throw new AnalysisError('VIDEO_UNAVAILABLE', '動画が見つかりません。非公開・削除済み・視聴制限の可能性があります。');
      metadata = { title: s.title, description: s.description, author: s.channelTitle, channelId: s.channelId };
    } catch (error) {
      if (error instanceof AnalysisError) throw error;
      warnings.push('YouTube APIを利用できなかったため、公開ページから取得を試みました。');
    }
  }
  try {
    player = playerJson(await get(url));
    if (player?.videoDetails && !metadata) {
      const d = player.videoDetails;
      metadata = { title: d.title, description: d.shortDescription || '', author: d.author, channelId: d.channelId };
    }
  } catch { warnings.push('YouTubeの公開ページを取得できませんでした。'); }
  if (!metadata) {
    if (player?.playabilityStatus?.status === 'ERROR') throw new AnalysisError('VIDEO_UNAVAILABLE', '動画が見つかりません。非公開・削除済みの可能性があります。');
    throw new AnalysisError('METADATA_UNAVAILABLE', '動画情報を取得できませんでした。視聴制限またはYouTube側のアクセス制限が考えられます。時間をおいて再試行してください。', 502);
  }
  const sources = [{ id: 'description', kind: 'description', relationship: 'direct', url, title: metadata.title, text: metadata.description, links: urlsIn(metadata.description) },
    { id: 'title', kind: 'title', relationship: 'direct', url, title: metadata.title, text: metadata.title, links: [] }];
  let transcriptStatus = 'unavailable';
  const tracks = player?.captions?.playerCaptionsTracklistRenderer?.captionTracks || [];
  const track = tracks.find(t => t.languageCode === 'ja') || tracks.find(t => t.languageCode === 'en') || tracks[0];
  if (track) {
    try {
      const u = new URL(track.baseUrl);
      if (u.hostname !== 'www.youtube.com' || u.pathname !== '/api/timedtext') throw new Error();
      u.searchParams.set('fmt', 'json3');
      const data = JSON.parse(await get(u.href));
      const text = (data.events || []).map(e => (e.segs || []).map(s => s.utf8 || '').join('')).join('\n').slice(0, 100000);
      if (text.trim()) {
        sources.push({ id: 'transcript', kind: 'transcript', relationship: 'mention', url, title: `${metadata.title}（字幕）`, text, links: [] });
        transcriptStatus = 'available';
      }
    } catch { /* Empty/protected captions are not evidence. */ }
  }
  if (transcriptStatus !== 'available') warnings.push('字幕の本文は取得できませんでした。概要欄と公開資料だけを確認しています。');
  const isMinecraft = /minecraft|マインクラフト|マイクラ/i.test(`${metadata.title}\n${metadata.description}\n${sources.find(s => s.kind === 'transcript')?.text || ''}`);
  if (!isMinecraft) return { video: { id, url, ...metadata, description: undefined }, status: 'not_minecraft', mods: [], minecraftVersions: [], loaders: [], links: [], sources: [], warnings: ['Minecraftの動画と確認できませんでした。'], transcriptStatus };

  const links = [];
  let pages = sources[0].links.filter(safe => safeUrl(safe)).map(url => ({ url, relationship: 'direct' }));
  if (input.sourceUrl) pages.unshift({ url: safeUrl(input.sourceUrl), relationship: 'supplemental' });
  if (env.BRAVE_SEARCH_API_KEY && pages.length < 3) {
    try {
      const query = `${metadata.title.slice(0, 120)} ${metadata.author} MOD リスト`;
      const found = JSON.parse(await get(`https://api.search.brave.com/res/v1/web/search?q=${encodeURIComponent(query)}&count=5`, { headers: { 'X-Subscription-Token': env.BRAVE_SEARCH_API_KEY } }));
      pages.push(...(found.web?.results || []).filter(r => safeUrl(r.url)).map(r => ({ url: r.url, relationship: 'search' })));
    } catch { warnings.push('関連資料の検索に失敗しました。取得できた出典だけを表示します。'); }
  } else if (!env.BRAVE_SEARCH_API_KEY && !pages.length) warnings.push('概要欄に対応するMOD一覧リンクがありません。作者のMOD一覧があれば「追加の出典」に入力してください。');
  pages = pages.filter((p, i, a) => a.findIndex(x => x.url === p.url) === i).slice(0, 4);
  await mapLimit(pages, 2, async (p, i) => {
    try {
      const doc = pageDocument(await get(p.url, { maxBytes: 1_500_000 }), p.url);
      // Search/manual pages stay inferred even if they contain the video ID:
      // anyone can embed a video. A description link is the only direct link.
      sources.push({ id: `page-${i}`, kind: 'linked_page', relationship: p.relationship, url: p.url, ...doc });
      links.push({ url: p.url, title: doc.title || p.url, kind: 'source', relationship: p.relationship });
      for (const link of doc.links) {
        if (safeUrl(link) && /(?:\/modpack\/|\/modpacks\/|\/releases(?:\/|$)|\/files(?:\/|$)|\.mrpack(?:\?|$)|\.zip(?:\?|$))/i.test(link)) links.push({ url: link, title: '配布ページ', kind: 'download', relationship: p.relationship });
      }
    } catch { warnings.push(`出典を取得できませんでした: ${new URL(p.url).hostname}`); }
  });
  const candidates = sources.flatMap(candidatesFrom);
  // Catalog-based mention detection supplements list extraction; never claims installation.
  try {
    const catalog = JSON.parse(await get('https://api.modrinth.com/v2/search?facets=%5B%5B%22project_type%3Amod%22%5D%5D&index=downloads&limit=100'));
    for (const hit of catalog.hits || []) {
      const name = hit.title;
      const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const re = new RegExp(`(?:^|[^A-Za-z0-9])${escaped}(?=$|[^A-Za-z0-9])`, name.length > 8 ? 'i' : '');
      for (const source of sources.filter(s => ['title', 'description', 'transcript'].includes(s.kind))) {
        const line = source.text.split('\n').find(l => re.test(l) && !/not using|without|removed|使っていない|未導入/i.test(l));
        if (line) candidates.push({ name, evidence: evidence(source, line), explicit: false });
      }
    }
  } catch { warnings.push('MOD名辞書を取得できませんでした。箇条書きと配布リンクからの抽出のみ行いました。'); }
  const modsByName = new Map();
  for (const c of candidates) {
    const key = normalizedName(c.name); if (!key) continue;
    const confirmed = c.explicit && c.evidence.relationship === 'direct' && c.evidence.kind !== 'transcript';
    const old = modsByName.get(key);
    if (old) {
      if (!old.evidence.some(e => e.sourceId === c.evidence.sourceId && e.quote === c.evidence.quote)) old.evidence.push(c.evidence);
      if (confirmed) { old.classification = 'confirmed'; old.confidence = 'high'; }
      if (c.projectUrl) old.projectUrl = c.projectUrl;
    } else modsByName.set(key, { id: key, name: c.name, classification: confirmed ? 'confirmed' : 'inferred', confidence: confirmed ? 'high' : c.explicit ? 'medium' : 'low', evidence: [c.evidence], projectUrl: c.projectUrl || null });
  }
  const mods = [...modsByName.values()].slice(0, 80);
  if (modsByName.size > 80) warnings.push('候補が多いため、先頭80件を表示しています。');
  if (sources.some(s => ['search', 'supplemental'].includes(s.relationship))) warnings.push('追加資料・検索で見つかった資料と、この動画の構成が一致するかは未確認です。候補として表示しています。');
  return { video: { id, url, title: metadata.title, author: metadata.author }, status: mods.length ? 'ok' : 'no_mods', mods,
    ...environmentFrom(sources), transcriptStatus, warnings,
    links: [...links, ...sources[0].links.filter(u => safeUrl(u) && /\/modpacks?\//.test(u)).map(url => ({ url, title: '配布ページ', kind: 'download', relationship: 'direct' }))].filter((p, i, a) => a.findIndex(x => x.url === p.url) === i),
    sources: sources.map(({ text, links: _links, ...s }) => ({ ...s, characters: text.length })) };
}
