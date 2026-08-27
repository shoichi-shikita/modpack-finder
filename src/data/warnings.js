// Warning templates keyed by a Modrinth category that tends to cause issues.
// Extensible: add more keys here, or add rows to CONFLICTS for mod-vs-mod rules.
export const WARNING_TEMPLATES = {
  worldgen: {
    type: "worldgen",
    title: "ワールド生成を変更します",
    message:
      "このパックにはワールド生成を大きく変えるMODが含まれます。既存ワールドへの途中導入は非推奨です。新規ワールドでの使用をおすすめします。",
  },
  optimization: {
    type: "performance",
    title: "軽量化MODの競合に注意",
    message:
      "軽量化・描画系MODは、他のシェーダーや描画変更MODと競合する場合があります。同系統は1つに絞ると安定します。",
  },
  library: {
    type: "library",
    title: "前提ライブラリを含みます",
    message:
      "ライブラリMODは単体では機能しません。依存元のMODと必ずセットで導入してください（このパックでは自動で追加済みです）。",
  },
};

// Mod-vs-mod conflict database. Each row: two Modrinth slugs that must not be
// installed together, plus a reason. Matching is case-insensitive on slug, so a
// wrong/renamed slug simply never fires (safe). Add more rows over time.
export const CONFLICTS = [
  {
    a: "sodium",
    b: "vulkanmod",
    reason:
      "SodiumもVulkanModも描画エンジンを置き換えるMODです。同時に導入するとクラッシュします。どちらか一方だけにしてください（Vulkan描画にしたいならVulkanMod、それ以外はSodium推奨）。",
  },
  {
    a: "iris",
    b: "vulkanmod",
    reason:
      "IrisはOpenGL描画（Sodium系）向けのシェーダーMODで、描画方式を丸ごと置き換えるVulkanModとは併用できません。どちらか一方にしてください。",
  },
  {
    a: "sodium",
    b: "canvas",
    reason:
      "SodiumとCanvasはどちらも描画エンジンを置き換えるため競合します。どちらか一方にしてください。",
  },
  {
    a: "canvas",
    b: "vulkanmod",
    reason:
      "CanvasとVulkanModはどちらも描画エンジンを置き換えるため競合します。どちらか一方にしてください。",
  },
];

// Detect co-installed conflicting mods.
function detectConflicts(entries) {
  const bySlug = new Map();
  entries.forEach((e) => bySlug.set((e.slug || "").toLowerCase(), e));

  const out = [];
  for (const rule of CONFLICTS) {
    const a = bySlug.get(rule.a.toLowerCase());
    const b = bySlug.get(rule.b.toLowerCase());
    if (a && b) {
      out.push({
        id: `conflict-${rule.a}-${rule.b}`,
        type: "conflict",
        title: "MOD同士が競合します",
        message: rule.reason,
        mods: [a.title, b.title],
      });
    }
  }
  return out;
}

// Build all pack-level warnings from the adopted mods.
export function buildWarnings(entries) {
  const out = [];

  // Category-based cautions.
  for (const key of ["worldgen", "optimization", "library"]) {
    const affected = entries.filter((e) => (e.categories || []).includes(key));
    if (affected.length) {
      out.push({
        id: `cat-${key}`,
        ...WARNING_TEMPLATES[key],
        mods: affected.map((e) => e.title),
      });
    }
  }

  // Mod-vs-mod conflicts (shown first — most actionable).
  return [...detectConflicts(entries), ...out];
}
