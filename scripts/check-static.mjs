import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';
import { ROUTE_META, absoluteRouteUrl } from '../src/utils/seo.js';
import { SEO_LANDING_PAGES } from '../src/data/seoLandingPages.js';
const routes=[...Object.keys(ROUTE_META),...SEO_LANDING_PAGES.map(p=>p.path)];
const sitemap=await readFile('dist/sitemap.xml','utf8');
for(const route of routes){
 const html=await readFile(`dist${route==='/'?'':route}/index.html`,'utf8');
 assert(!html.includes('<div id="root"></div>'), `${route}: empty root`);
 assert.equal((html.match(/<h1\b/g)||[]).length,1,`${route}: h1`);
 assert(html.includes('id="main-content"'),`${route}: main`);
 assert(html.includes(`rel="canonical" href="${absoluteRouteUrl(route)}"`),`${route}: canonical`);
 assert(sitemap.includes(`<loc>${absoluteRouteUrl(route)}</loc>`),`${route}: sitemap`);
 assert(!html.includes('pagead2.googlesyndication.com/pagead/js/adsbygoogle.js'),`${route}: pending ads`);
 for(const [,href] of html.matchAll(/href="(\/[^"?#]*)[^"]*"/g)){
  await access(`dist${href.endsWith('/')?href+'index.html':href.includes('.')?href:href+'/index.html'}`);
 }
}
const privacy=await readFile('dist/privacy/index.html','utf8');
assert(privacy.includes('localStorage') && privacy.includes('検索語・Minecraft'));
const contact=await readFile('dist/contact/index.html','utf8');assert(contact.includes('mailto:'));
const method=await readFile('dist/articles/how-we-build-packs/index.html','utf8');assert(method.includes('自動確認が届かない範囲'));
const magic=await readFile('dist/mods/1.21.1/fabric/magic/index.html','utf8');assert(magic.includes('この条件のファイルなし')&&magic.includes('対応ファイルあり'));
console.log(`PASS: ${routes.length} static routes, headings, canonicals, sitemap, internal links, policy/contact text and pending ads.`);
