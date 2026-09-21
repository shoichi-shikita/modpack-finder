import { test } from 'node:test';
import assert from 'node:assert/strict';
import { videoId, playerJson, pageDocument, candidatesFrom, environmentFrom } from '../server/youtube/extract.js';
import { safeUrl, createClient } from '../server/youtube/network.js';
import { analyzeVideo } from '../server/youtube/analyze.js';
import { resolveMods } from '../server/youtube/resolve.js';
import { handleYouTube } from '../server/youtube/handler.js';

const id = 'abcdefghijk';
const source = (text, extra = {}) => ({ id: 's', text, title: '', kind: 'description', relationship: 'direct', url: `https://www.youtube.com/watch?v=${id}`, ...extra });
const html = (description, title = 'Minecraft test', extra = {}) => `var ytInitialPlayerResponse = ${JSON.stringify({ videoDetails: { title, shortDescription: description, author: 'Tester' }, ...extra })};`;
const mock = (description, options = {}) => async url => {
  if (url.includes('/watch?')) return new Response(html(description, options.title, options.player));
  if (url.includes('note.com')) return new Response('<article><h1>MOD list</h1><p>ver 1.20.1</p><p>Forge 47.3.0</p><p>・Quartz Machines</p></article>');
  if (url.includes('/api/timedtext')) return new Response(options.caption || '');
  if (url.includes('/search?')) return Response.json({ hits: options.hits || [] });
  throw new Error('Unexpected URL');
};

test('normalizes common YouTube formats and rejects lookalikes/credentials', () => {
  for (const url of [`https://www.youtube.com/watch?v=${id}&t=4`, `https://youtu.be/${id}?si=abc`, `youtube.com/shorts/${id}`, `https://m.youtube.com/live/${id}`, `https://www.youtube-nocookie.com/embed/${id}`]) assert.equal(videoId(url), id);
  for (const url of ['https://youtube.com.evil.test/watch?v=abcdefghijk', 'https://youtube.com@evil.test/watch?v=abcdefghijk', 'https://youtube.com/playlist?list=abc', 'https://youtube.com/watch?v=x', 'file:///youtube.com/watch?v=abcdefghijk', 'https://youtu.be:444/abcdefghijk']) assert.throws(() => videoId(url));
});
test('balanced player JSON handles delimiters inside text without eval', () => {
  assert.equal(playerJson(html('brace }; and "quotes"')).videoDetails.shortDescription, 'brace }; and "quotes"');
  assert.equal(playerJson('var ytInitialPlayerResponse = invalid;'), null);
});
test('HTML parsing removes scripts/navigation, preserves list boundaries and decodes entities', () => {
  const doc = pageDocument('<script>danger()</script><nav>Ignore</nav><article><h1>MOD list</h1><p>・Gears &amp; Cogs<br>・Quartz Machines</p></article>', 'https://note.com/a');
  assert.ok(!doc.text.includes('danger')); assert.ok(!doc.text.includes('Ignore'));
  assert.deepEqual(candidatesFrom(source(doc.text, { title: doc.title })).map(m => m.name), ['Gears & Cogs', 'Quartz Machines']);
});
test('extracts labelled lists; negated mods and mod release numbers are not facts', () => {
  assert.deepEqual(candidatesFrom(source('Mods used: Quartz Machines, Gears & Cogs')).map(m => m.name), ['Quartz Machines', 'Gears & Cogs']);
  assert.equal(candidatesFrom(source('MOD list\n- Not using Quartz Machines')).length, 0);
  assert.equal(environmentFrom([source('Quartz Machines 1.2.3\nKotlin for Forge')]).minecraftVersions.length, 0);
  assert.equal(environmentFrom([source('NeoForge 21.1.2')]).loaders[0].value, 'neoforge');
});
test('SSRF controls reject private hosts, lookalikes, ports and redirects', async () => {
  for (const url of ['https://127.0.0.1/x', 'https://[::1]/', 'https://169.254.169.254/', 'http://note.com/a', 'https://note.com.evil.test/a', 'https://note.com:444/a', 'https://user:pass@note.com/a']) assert.equal(safeUrl(url), null);
  let calls = 0;
  const get = createClient(async (_url, opts) => { calls++; assert.equal(opts.redirect, 'manual'); return new Response('', { status: 302, headers: { location: 'http://localhost/' } }); });
  await assert.rejects(get('https://note.com/a')); assert.equal(calls, 1);
});
test('upstream response size is bounded', async () => {
  const get = createClient(async () => new Response('x'.repeat(100)));
  await assert.rejects(get('https://note.com/a', { maxBytes: 5 }));
});
test('description list confirmed, supplemental list inferred, duplicate names merged', async () => {
  const direct = await analyzeVideo({ url: `https://youtu.be/${id}` }, {}, mock('MOD list\n- Quartz Machines\n- Quartz Machines\nMinecraft 1.20.1\nForge 47.3.0'));
  assert.equal(direct.mods.length, 1); assert.equal(direct.mods[0].classification, 'confirmed'); assert.equal(direct.minecraftVersions[0].value, '1.20.1');
  const supplemental = await analyzeVideo({ url: `https://youtu.be/${id}`, sourceUrl: 'https://note.com/a' }, {}, mock('A Minecraft video'));
  assert.equal(supplemental.mods[0].classification, 'inferred'); assert.equal(supplemental.mods[0].confidence, 'medium');
});
test('description-linked lists carry a direct relationship', async () => {
  const r = await analyzeVideo({ url: `https://youtu.be/${id}` }, {}, mock('Minecraft\nhttps://note.com/a'));
  assert.equal(r.mods[0].classification, 'confirmed');
});
test('captions alone are inferred and absent captions do not prevent results', async () => {
  const r = await analyzeVideo({ url: `https://youtu.be/${id}` }, {}, mock('', { caption: JSON.stringify({ events: [{ segs: [{ utf8: 'MOD list\n- Quartz Machines' }] }] }), player: { captions: { playerCaptionsTracklistRenderer: { captionTracks: [{ baseUrl: `https://www.youtube.com/api/timedtext?v=${id}`, languageCode: 'en' }] } } } }));
  assert.equal(r.transcriptStatus, 'available'); assert.equal(r.mods[0].classification, 'inferred');
  const empty = await analyzeVideo({ url: `https://youtu.be/${id}` }, {}, mock('Minecraft'));
  assert.equal(empty.status, 'no_mods'); assert.equal(empty.transcriptStatus, 'unavailable');
});
test('non-Minecraft, unavailable videos and network failures are distinct', async () => {
  const r = await analyzeVideo({ url: `https://youtu.be/${id}` }, {}, mock('Cooking recipe', { title: 'Dinner' })); assert.equal(r.status, 'not_minecraft');
  await assert.rejects(analyzeVideo({ url: `https://youtu.be/${id}` }, {}, async () => new Response('var ytInitialPlayerResponse = {"playabilityStatus":{"status":"ERROR"}};')), e => e.code === 'VIDEO_UNAVAILABLE');
  await assert.rejects(analyzeVideo({ url: `https://youtu.be/${id}` }, {}, async () => { throw new Error('offline'); }), e => e.code === 'METADATA_UNAVAILABLE');
});
test('resolution requires exact unique project, and checks the version/loader pair', async () => {
  const fetcher = async url => {
    if (url.includes('/search?')) return Response.json({ hits: [{ title: 'Quartz Machines', slug: 'quartz-machines', project_id: 'abc', versions: ['1.20.1'], categories: ['forge'] }] });
    assert.ok(url.includes('game_versions=%5B%221.20.1%22%5D')); assert.ok(url.includes('loaders=%5B%22forge%22%5D'));
    return Response.json([{ id: 'v1', version_number: '2.0', loaders: ['forge'], game_versions: ['1.20.1'], files: [{ url: 'https://cdn.modrinth.com/data/file.jar' }] }]);
  };
  const r = await resolveMods({ mods: [{ id: 'q', name: 'Quartz Machines' }], version: '1.20.1', loader: 'forge' }, {}, fetcher);
  assert.equal(r.mods[0].resolution.compatibility, 'compatible');
  const unrelated = await resolveMods({ mods: [{ id: 'q', name: 'Quartz Machines' }] }, {}, async () => Response.json({ hits: [{ title: 'Quartz Machines Addon', slug: 'quartz-addon' }] })); assert.equal(unrelated.mods[0].resolution, null);
});
test('API validates origins, methods, bodies and never leaks provider errors/secrets', async () => {
  const req = (body, headers = {}) => new Request('https://site.test/api/youtube', { method: 'POST', headers: { 'Content-Type': 'application/json', ...headers }, body });
  assert.equal((await handleYouTube(new Request('https://site.test/api/youtube'))).status, 405);
  assert.equal((await handleYouTube(req('{}', { Origin: 'https://evil.test' }))).status, 403);
  assert.equal((await handleYouTube(req('invalid'))).status, 400);
  assert.equal((await handleYouTube(req('x'.repeat(16001)))).status, 413);
  const r = await handleYouTube(req(JSON.stringify({ url: `https://youtu.be/${id}` })), { YOUTUBE_API_KEY: 'SECRET' }, async () => { throw new Error('SECRET'); });
  assert.equal(r.status, 502); assert.ok(!(await r.text()).includes('SECRET'));
});

test('search-discovered pages stay inferred and search key goes only to Brave', async () => {
  const base = mock('Minecraft video');
  const r = await analyzeVideo({ url: `https://youtu.be/${id}` }, { BRAVE_SEARCH_API_KEY: 'test-key' }, async (url, opts) => {
    if (url.includes('api.search.brave.com')) {
      assert.equal(opts.headers['X-Subscription-Token'], 'test-key');
      return Response.json({ web: { results: [{ url: 'https://note.com/a' }, { url: 'https://127.0.0.1/' }] } });
    }
    assert.equal(opts.headers['X-Subscription-Token'], undefined);
    return base(url);
  });
  assert.equal(r.mods[0].classification, 'inferred'); assert.equal(r.mods[0].evidence[0].relationship, 'search');
});

test('CurseForge fallback checks loader/file pairing with a server-only key', async () => {
  const r = await resolveMods({ mods: [{ id: 'q', name: 'Quartz Machines' }], version: '1.20.1', loader: 'forge' }, { CURSEFORGE_API_KEY: 'cf-secret' }, async (url, opts) => {
    if (url.includes('api.modrinth.com')) { assert.equal(opts.headers['x-api-key'], undefined); return Response.json({ hits: [] }); }
    assert.equal(opts.headers['x-api-key'], 'cf-secret');
    if (url.includes('/files?')) { assert.ok(url.includes('modLoaderType=1')); return Response.json({ data: [{ displayName: '1.20.1 Forge' }] }); }
    return Response.json({ data: [{ id: 123, name: 'Quartz Machines', slug: 'quartz-machines', latestFilesIndexes: [{ gameVersion: '1.20.1' }] }] });
  });
  assert.equal(r.mods[0].resolution.provider, 'curseforge'); assert.equal(r.mods[0].resolution.compatibility, 'compatible'); assert.ok(!JSON.stringify(r).includes('cf-secret'));
});
