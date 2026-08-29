// One place to manage site identity, contact channels and ad status.
// Leave a field as "" to hide it from the UI.
export const SITE_CONFIG = {
  siteName: "MOD PACK FINDER",
  siteUrl: "https://modpack-finder.pages.dev",

  // --- 運営者情報（E-E-A-T / AdSense の観点で 1 つは埋めることを強く推奨） ---
  author: "shoichi-shikita", // 表示する運営者名。好きな表記に変えてOK（空なら非表示）

  // --- 連絡手段。1つでも埋めれば /contact が機能します ---
  contactFormUrl: "", // 例: "https://forms.gle/xxxxxxxx"（Googleフォーム）
  contactEmail: "shouichi.shikita.4170@gmail.com", // 例: "contact@example.com"
  xUrl: "https://x.com/shiki_mctools",
  githubUrl: "https://github.com/shoichi-shikita/modpack-finder",

  // --- 広告 ---
  // "pending" : AdSense 審査中。所有権確認メタタグと ads.txt のみ。広告コード・広告枠は出さない。
  // "live"    : 承認後、十分な独自コンテンツがある記事だけに手動広告を配置する。
  // "off"     : AdSense を利用しない。
  adsStatus: "pending",
  adsenseClient: "ca-pub-8989190444093252",

  lastUpdated: "2026-08-29",
};

export const hasContactChannel = () =>
  !!(
    SITE_CONFIG.contactFormUrl ||
    SITE_CONFIG.contactEmail ||
    SITE_CONFIG.xUrl ||
    SITE_CONFIG.githubUrl
  );
