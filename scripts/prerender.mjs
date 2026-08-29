// Emit a real HTML file per route after `vite build`.
//
// Why: this is a client-rendered SPA that ships one index.html. Every route
// therefore served the same <title>, <meta name="description"> and
// <link rel="canonical" href="/">, which tells search engines that /about,
// /privacy and /contact are duplicates of the home page. Rewriting those tags
// in JavaScript fixes what a user sees but not what a crawler indexes first.
//
// This script copies dist/index.html per route and swaps the head tags plus a
// <noscript> summary, so each URL is a genuine, self-describing document.

import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

import { ROUTE_META, FAQ, absoluteRouteUrl, jsonLdForRoute } from "../src/utils/seo.js";
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

// Short, human summary rendered inside <noscript> so the document says
// something real even before JavaScript runs.
const NOSCRIPT_BODY = {
  "/": `<h1>マイクラのMOD構成を、3クリックで組み立てる</h1>
    <p>Minecraft のバージョン・Mod Loader・遊びたいテーマを選ぶだけで、依存MODまで解決したMODパック構成を自動で組み立てる無料ツールです。できあがった構成は .mrpack として書き出せ、Modrinth App や Prism Launcher にドラッグ＆ドロップするだけで導入できます。</p>
    <p>登録不要・完全無料。MOD情報は Modrinth の公開APIから取得し、選んだバージョンとローダーに対応するファイルが実在するMODだけを採用します。</p>`,
  "/guide": `<h1>.mrpack の使い方</h1>
    <p>.mrpack は MOD 一式（依存MOD込み）の設計図ファイルです。MOD本体は入っておらず、どのMODをどこから入れるかだけが書かれています。Modrinth App または Prism Launcher に読み込ませると、必要なMODとローダーが自動でそろいます。</p>
    <h2>よくある質問</h2>
    ${FAQ.map((f) => `<h3>${esc(f.q)}</h3><p>${esc(f.a)}</p>`).join("\n    ")}`,
  "/mods": `<h1>Minecraft MOD構成一覧</h1>
    <p>人気のMinecraftバージョン、対応ローダー、遊びたいテーマから、条件設定済みのMOD構成ページを選べます。</p>
    <ul>${SEO_LANDING_PAGES.map((page) => `<li><a href="${esc(page.href)}">Minecraft ${esc(page.version)} ${esc(page.loaderLabel)}・${esc(page.themeLabel)}</a></li>`).join("")}</ul>`,
  "/articles": `<h1>Minecraft MOD導入ガイド</h1>
    <p>Minecraft Java EditionへMODを導入するときに迷いやすい用語、ローダー選び、起動トラブルをまとめています。</p>
    <ul>
      <li><a href="/guide/">.mrpackとは？導入手順</a></li>
      <li><a href="/articles/loader-guide/">Forge・Fabric・NeoForge・Quiltの違い</a></li>
      <li><a href="/articles/modpack-not-starting/">MODパックが起動しないときの確認順</a></li>
    </ul>`,
  "/articles/loader-guide": `<h1>Forge・Fabric・NeoForge・Quiltの違いと選び方</h1>
    <p>Mod Loaderは、Minecraft本体とMODの間に入ってMODを読み込む仕組みです。同じMinecraftバージョン用でも、異なるローダー向けのMODは読み込めません。</p>
    <h2>4つのローダーの特徴</h2>
    <h3>Fabric</h3><p>軽量で更新が速く、軽量化・便利系MODが豊富です。</p>
    <h3>Forge</h3><p>長い実績があり、特に1.20.1以前の大型MODが充実しています。</p>
    <h3>NeoForge</h3><p>Forgeから分かれた新しいローダーで、1.20.1以降を中心に対応が広がっています。</p>
    <h3>Quilt</h3><p>Fabricとの互換性を意識したローダーですが、使いたいMODが明示的に対応しているか確認が必要です。</p>
    <p>まず使いたいMODを決め、すべてに共通するMinecraftバージョンとローダーを選んでください。</p>`,
  "/articles/modpack-not-starting": `<h1>MODパックが起動しないときの確認順</h1>
    <p>最初に既存ワールドをバックアップし、テスト用インスタンスで確認します。</p>
    <ol>
      <li>MinecraftバージョンとMod Loaderが一致しているか確認する</li>
      <li>Fabric APIやArchitecturyなどの前提MODを確認する</li>
      <li>推奨Javaとメモリ割り当てを確認する</li>
      <li>描画・軽量化MODの重複を外す</li>
      <li>直前に追加したMODから外し、半分ずつ切り分ける</li>
    </ol>
    <p>logs/latest.logとcrash-reportsの「requires」「missing」「incompatible」付近にあるMOD名が手がかりになります。</p>`,
  "/about": `<h1>このツールについて</h1>
    <p>MOD PACK FINDER は、Minecraft の MOD 探しと MODパックづくりを楽にするための無料のWebツールです。MOD情報は Modrinth の公開データ／APIを利用して取得しています。個人が開発・運営している非公式のファンツールであり、Mojang Studios、Microsoft、Modrinth とは提携していません。</p>`,
  "/privacy": `<h1>プライバシーポリシー</h1>
    <p>MOD PACK FINDER におけるアクセス解析、広告配信、外部サービスの利用、.mrpack 生成時のデータの取り扱いについて説明しています。当サイトに会員登録やアカウント作成の機能はありません。</p>`,
  "/contact": `<h1>お問い合わせ</h1>
    <p>不具合の報告、MOD情報の誤りの指摘、選定への指摘、機能の要望などを受け付けています。このツールはMODの分類を機械的に組み立てているため、利用者からの指摘が精度改善の一番の材料になります。</p>`,
};

function noscriptBody(route, meta) {
  if (!meta.landing) return NOSCRIPT_BODY[route] || NOSCRIPT_BODY["/"];
  const page = meta.landing;
  return `<h1>${esc(page.heading)}</h1>
    <p>${esc(page.intro)}</p>
    <p>${esc(page.versionNote)} ${esc(page.loaderNote)}</p>
    <h2>この構成の特徴</h2>
    <ul>${page.points.map((point) => `<li>${esc(point)}</li>`).join("")}</ul>
    <h2>このテーマで候補になる代表MOD</h2>
    <p>実際の構成では、Minecraftバージョンと${esc(page.loaderLabel)}に対応するファイルがあるかを生成時に確認します。</p>
    ${page.representativeMods.map((mod) => `<h3>${esc(mod.name)}</h3><p>${esc(mod.note)}</p>`).join("")}
    <p>JavaScriptを有効にすると、条件を変更しながらMODを自動選定し、.mrpackとして書き出せます。</p>`;
}

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

  // Replace the <noscript> body with the route's own summary.
  const body = noscriptBody(route, meta);
  out = out.replace(
    /<noscript>[\s\S]*?<\/noscript>/,
    `<noscript>
      <div style="max-width:720px;margin:48px auto;padding:24px;font-family:system-ui,sans-serif;line-height:1.9;color:#f5f5f4;background:#33333a">
    ${body}
        <p><a href="/" style="color:#a3e635">MOD PACK FINDER トップページ</a></p>
      </div>
    </noscript>`
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

for (const [route, meta] of routes) {
  const html = applyMeta(shell, route, meta);
  const outDir = route === "/" ? dist : join(dist, route.replace(/^\//, ""));
  await mkdir(outDir, { recursive: true });
  const file = join(outDir, "index.html");
  await writeFile(file, html, "utf8");
  written.push(relative(root, file));
}

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
