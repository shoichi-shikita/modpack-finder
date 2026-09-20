// Pre-render the same React content visible to visitors, including policy and contact pages.
import { createServer } from "vite";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

import { ROUTE_META, absoluteRouteUrl, jsonLdForRoute } from "../src/utils/seo.js";
import { SITE_CONFIG } from "../src/data/siteConfig.js";
import { SEO_LANDING_PAGES } from "../src/data/seoLandingPages.js";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const dist = join(root, "dist");

const esc = (s) =>
  String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

function applyMeta(html, route, meta) {
  const url = absoluteRouteUrl(route);
  let out = html;

  const swap = (re, next) => {
    if (re.test(out)) out = out.replace(re, next);
    else out = out.replace("</head>", `    ${next}\n  </head>`);
  };

  out = out.replace(/<title>[\s\S]*?<\/title>/, `<title>${esc(meta.title)}</title>`);
  swap(
    /<meta\s+name="description"[\s\S]*?\/>/,
    `<meta name="description" content="${esc(meta.description)}" />`
  );
  swap(
    /<link\s+rel="canonical"[^>]*\/>/,
    `<link rel="canonical" href="${esc(url)}" />`
  );
  swap(
    /<meta\s+property="og:title"[\s\S]*?\/>/,
    `<meta property="og:title" content="${esc(meta.title)}" />`
  );
  swap(
    /<meta\s+property="og:description"[\s\S]*?\/>/,
    `<meta property="og:description" content="${esc(meta.description)}" />`
  );
  swap(
    /<meta\s+property="og:url"[^>]*\/>/,
    `<meta property="og:url" content="${esc(url)}" />`
  );
  swap(
    /<meta\s+name="twitter:title"[\s\S]*?\/>/,
    `<meta name="twitter:title" content="${esc(meta.title)}" />`
  );
  swap(
    /<meta\s+name="twitter:description"[\s\S]*?\/>/,
    `<meta name="twitter:description" content="${esc(meta.description)}" />`
  );

  const jsonLd = JSON.stringify(jsonLdForRoute(route, meta)).replace(/</g, "\\u003c");
  swap(
    /<script\s+type="application\/ld\+json"\s+id="mpf-jsonld">[\s\S]*?<\/script>/,
    `<script type="application/ld+json" id="mpf-jsonld">${jsonLd}</script>`
  );

  return out;
}

const shell = await readFile(join(dist, "index.html"), "utf8");
const written = [];
const routes = [
  ...Object.entries(ROUTE_META),
  ...SEO_LANDING_PAGES.map((landing) => [landing.path, {
    title: landing.title,
    description: landing.description,
    path: landing.path,
    landing,
  }]),
];

const server = await createServer({ server: { middlewareMode: true }, appType: "custom" });
try {
  const { render } = await server.ssrLoadModule("/src/entry-server.jsx");
  for (const [route, meta] of routes) {
    const html = applyMeta(shell, route, meta)
      .replace('<div id="root"></div>', () => `<div id="root">${render(route)}</div>`)
      .replace(/<noscript>[\s\S]*?<\/noscript>/, "<noscript><p>検索・構成作成にはJavaScriptが必要です。使い方や各ページの本文はそのまま読めます。</p></noscript>");
    const outDir = route === "/" ? dist : join(dist, route.replace(/^\//, ""));
    await mkdir(outDir, { recursive: true });
    const file = join(outDir, "index.html");
    await writeFile(file, html, "utf8");
    written.push(relative(root, file));
  }

} finally { await server.close(); }

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${routes.map(([route]) => {
  const url = absoluteRouteUrl(route);
  const isLanding = route.startsWith("/mods/");
  const isArticle = route === "/guide" || route.startsWith("/articles");
  const priority = route === "/" ? "1.0" : route === "/mods" ? "0.9" : isLanding ? "0.8" : isArticle ? "0.7" : "0.4";
  const changefreq = route === "/" || route === "/mods" || isLanding || isArticle ? "weekly" : "yearly";
  return `  <url>\n    <loc>${esc(url)}</loc>\n    <lastmod>${esc(SITE_CONFIG.lastUpdated)}</lastmod>\n    <changefreq>${changefreq}</changefreq>\n    <priority>${priority}</priority>\n  </url>`;
}).join("\n")}
</urlset>
`;
await writeFile(join(dist, "sitemap.xml"), sitemap, "utf8");

console.log(`prerender: ${written.length} routes + sitemap.xml ->\n  ${written.join("\n  ")}`);
