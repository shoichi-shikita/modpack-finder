import { SITE_CONFIG } from "../data/siteConfig.js";
import { landingPageForPath } from "../data/seoLandingPages.js";

const BASE = SITE_CONFIG.siteUrl.replace(/\/+$/, "");

// Per-route metadata. A single-page app that ships one index.html hands every
// route the same <title>/<meta>/<link rel=canonical>, which tells Google the
// sub-pages are duplicates of the home page. These are applied on navigation.
export const ROUTE_META = {
  "/": {
    title: "マイクラMOD構成を自動作成｜.mrpack出力 - MOD PACK FINDER",
    description:
      "Minecraftのバージョン・Mod Loader・遊びたいテーマを選ぶだけで、依存MODまで解決したMOD構成を自動作成。.mrpackで書き出してModrinth App / Prism Launcherにドラッグするだけ。登録不要・無料。",
    path: "/",
  },
  "/guide": {
    title: "mrpackの使い方｜ランチャーへの導入手順 - MOD PACK FINDER",
    description:
      ".mrpackファイルの中身と、Modrinth App / Prism Launcher への読み込み手順を画像なしで手短に解説。よくあるつまずき（起動しない・MODが入らない）への対処も掲載しています。",
    path: "/guide",
  },
  "/mods": {
    title: "Minecraft MOD構成一覧｜バージョン・ローダー・テーマ別 - MOD PACK FINDER",
    description:
      "Minecraftの人気バージョン、Fabric・Forge・NeoForge、冒険・魔法・工業などのテーマ別にMOD構成を選べます。依存MODを解決して.mrpackで無料出力。",
    path: "/mods",
  },
  "/about": {
    title: "このツールについて - MOD PACK FINDER",
    description:
      "MOD PACK FINDER が何をするツールなのか、MOD情報の取得元（Modrinth 公開API）、非公式ファンツールとしての立場について説明します。",
    path: "/about",
  },
  "/privacy": {
    title: "プライバシーポリシー - MOD PACK FINDER",
    description:
      "MOD PACK FINDER におけるアクセス解析、広告配信、外部サービス利用、.mrpack 生成時のデータの取り扱いについて説明します。",
    path: "/privacy",
  },
  "/contact": {
    title: "お問い合わせ - MOD PACK FINDER",
    description:
      "不具合の報告、MOD情報の誤りの指摘、機能の要望などの連絡先。MOD PACK FINDER は利用者からの報告で精度を上げています。",
    path: "/contact",
  },
};

export const FAQ = [
  {
    q: ".mrpack ファイルって何ですか？",
    a: "MOD一式（依存MOD込み）の設計図ファイルです。MOD本体は入っておらず、「どのMODをどこから入れるか」だけが書かれています。Modrinth App や Prism Launcher に読み込ませると、必要なMODとローダーが自動でそろいます。",
  },
  {
    q: "ダブルクリックしても何も起きません",
    a: "それが正常です。.mrpack は単体では起動しません。Modrinth App か Prism Launcher のウィンドウにドラッグ＆ドロップしてください。",
  },
  {
    q: "統合版（スマホ・Switch・Windows版）でも使えますか？",
    a: "使えません。MODはJava Edition専用です。Java版を持っているか確認してください。",
  },
  {
    q: "今遊んでいるワールドにそのまま入れて大丈夫ですか？",
    a: "ワールド生成を変えるMOD（バイオーム・構造物の追加系）が含まれる場合、既存ワールドへの途中導入は非推奨です。結果画面に「ワールド生成を変更します」の警告が出ていたら、新しいワールドで始めてください。",
  },
  {
    q: "メモリ（RAM）はどれくらい必要ですか？",
    a: "MOD 20個程度なら4GB、50個を超えるなら6〜8GBが目安です。ランチャーのインスタンス設定から割り当てを変更できます。",
  },
  {
    q: "料金はかかりますか？",
    a: "無料です。会員登録もアカウント作成も不要で、入力内容がサーバーに送信されることもありません。",
  },
];

export function routeMeta(route) {
  const landing = landingPageForPath(route);
  if (landing) {
    return {
      title: landing.title,
      description: landing.description,
      path: landing.path,
      landing,
    };
  }
  return ROUTE_META[route] || ROUTE_META["/"];
}

// Replace or create a <meta>/<link> in <head>.
function setTag(selector, create, attr, value) {
  let el = document.head.querySelector(selector);
  if (!el) {
    el = create();
    document.head.appendChild(el);
  }
  el.setAttribute(attr, value);
}

function setMetaName(name, content) {
  setTag(`meta[name="${name}"]`, () => {
    const m = document.createElement("meta");
    m.setAttribute("name", name);
    return m;
  }, "content", content);
}

function setMetaProp(prop, content) {
  setTag(`meta[property="${prop}"]`, () => {
    const m = document.createElement("meta");
    m.setAttribute("property", prop);
    return m;
  }, "content", content);
}

const LD_ID = "mpf-jsonld";

function setJsonLd(objects) {
  let el = document.getElementById(LD_ID);
  if (!el) {
    el = document.createElement("script");
    el.type = "application/ld+json";
    el.id = LD_ID;
    document.head.appendChild(el);
  }
  el.textContent = JSON.stringify(objects.length === 1 ? objects[0] : objects);
}

export function jsonLdForRoute(route, meta = routeMeta(route)) {
  const app = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: SITE_CONFIG.siteName,
    url: `${BASE}/`,
    applicationCategory: "GameApplication",
    operatingSystem: "Web",
    inLanguage: "ja",
    description: ROUTE_META["/"].description,
    offers: { "@type": "Offer", price: "0", priceCurrency: "JPY" },
  };

  const out = [app];

  if (route !== "/") {
    const landing = meta.landing;
    const crumbs = landing
      ? [
          { name: "ホーム", item: `${BASE}/` },
          { name: "MOD構成一覧", item: `${BASE}/mods` },
          { name: `Minecraft ${landing.version}`, item: `${BASE}/mods` },
          { name: `${landing.loaderLabel} ${landing.themeLabel}`, item: `${BASE}${landing.path}` },
        ]
      : [
          { name: "ホーム", item: `${BASE}/` },
          { name: meta.title.split(/[｜|]/)[0].trim(), item: `${BASE}${meta.path}` },
        ];
    out.push({
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: crumbs.map((crumb, index) => ({
        "@type": "ListItem",
        position: index + 1,
        ...crumb,
      })),
    });
  }

  if (meta.landing) {
    out.push({
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: meta.landing.heading,
      url: `${BASE}${meta.path}`,
      inLanguage: "ja",
      description: meta.description,
      isPartOf: { "@type": "WebSite", name: SITE_CONFIG.siteName, url: `${BASE}/` },
      about: [
        { "@type": "VideoGame", name: `Minecraft ${meta.landing.version}` },
        { "@type": "Thing", name: meta.landing.loaderLabel },
        { "@type": "Thing", name: meta.landing.themeLabel },
      ],
    });
  }

  if (route === "/guide") {
    out.push({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: FAQ.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    });
  }

  return out;
}

// Apply title / description / canonical / OGP / JSON-LD for a route.
export function applyRouteMeta(route) {
  const meta = routeMeta(route);
  const url = `${BASE}${meta.path === "/" ? "/" : meta.path}`;

  document.title = meta.title;
  setMetaName("description", meta.description);
  setTag('link[rel="canonical"]', () => {
    const l = document.createElement("link");
    l.setAttribute("rel", "canonical");
    return l;
  }, "href", url);

  setMetaProp("og:title", meta.title);
  setMetaProp("og:description", meta.description);
  setMetaProp("og:url", url);
  setMetaName("twitter:title", meta.title);
  setMetaName("twitter:description", meta.description);

  setJsonLd(jsonLdForRoute(route, meta));
}
