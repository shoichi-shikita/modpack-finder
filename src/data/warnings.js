// Pack-level warnings.
//
// Design rule: a warning must be true. Deriving warnings from Modrinth's
// category tags produced false ones ("Sodium と Iris と FerriteCore は競合します"
// — they are not) and false library claims, which is worse than showing
// nothing. So: category templates are limited to the one claim that IS
// category-shaped (worldgen changes the world), and everything else comes from
// explicit, hand-written slug rules below.
//
// Safety property: rules match on slug. A wrong or renamed slug never fires.

export const WARNING_TEMPLATES = {
  worldgen: {
    type: "worldgen",
    title: "ワールド生成を変更します",
    message:
      "このパックにはワールド生成を大きく変えるMODが含まれます。既存ワールドへの途中導入は非推奨です。新規ワールドでの使用をおすすめします。",
  },
  library: {
    type: "library",
    title: "前提MODを自動で追加しました",
    message:
      "採用したMODが必要とする前提ライブラリを自動で追加済みです。これらは単体では何もしませんが、外すと依存元のMODが動かなくなります。",
  },
};

// Hard conflicts: installing both crashes or breaks the game.
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
  {
    a: "sodium",
    b: "embeddium",
    reason:
      "EmbeddiumはSodiumのForge/NeoForge移植版です。両方を同時に導入することはできません。",
  },
  {
    a: "sodium",
    b: "rubidium",
    reason:
      "RubidiumはSodiumのForge移植版です。両方を同時に導入することはできません。",
  },
  {
    a: "iris",
    b: "oculus",
    reason:
      "OculusはIrisのForge移植版です。両方を同時に導入することはできません。",
  },
];

// Soft redundancy: both work, but one of them is wasted (and costs memory).
export const REDUNDANT_GROUPS = [
  {
    id: "recipe-viewer",
    label: "レシピ表示MOD",
    slugs: ["jei", "emi", "roughly-enough-items"],
    reason:
      "レシピ表示MODが複数入っています。役割が同じなので、どれか1つに絞るとメニューが重複せず動作も軽くなります（迷ったら EMI か JEI）。",
  },
  {
    id: "map",
    label: "マップMOD",
    slugs: ["journeymap", "xaeros-minimap", "xaeros-world-map", "ftb-chunks"],
    reason:
      "マップMODが複数入っています。JourneyMap と Xaero系は役割が重なるため、どちらかに絞るのがおすすめです（Xaero's Minimap と World Map はセットで使う想定なので、この2つの併用は問題ありません）。",
  },
  {
    id: "storage-network",
    label: "ストレージ管理MOD",
    slugs: ["applied-energistics-2", "refined-storage", "toms-storage"],
    reason:
      "大規模ストレージMODが複数入っています。どれも同じ役割なので、1つに絞ったほうが導入が簡単で軽くなります。",
  },
];

function bySlug(entries) {
  const m = new Map();
  entries.forEach((e) => m.set((e.slug || "").toLowerCase(), e));
  return m;
}

function detectConflicts(entries) {
  const map = bySlug(entries);
  const out = [];
  for (const rule of CONFLICTS) {
    const a = map.get(rule.a.toLowerCase());
    const b = map.get(rule.b.toLowerCase());
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

function detectRedundant(entries) {
  const map = bySlug(entries);
  const out = [];
  for (const group of REDUNDANT_GROUPS) {
    const hits = group.slugs.map((s) => map.get(s)).filter(Boolean);
    // The two Xaero mods are designed to be used together — don't nag about them.
    const distinct =
      group.id === "map"
        ? hits.filter(
            (h) => !["xaeros-world-map"].includes((h.slug || "").toLowerCase())
          )
        : hits;
    if (distinct.length >= 2) {
      out.push({
        id: `redundant-${group.id}`,
        type: "redundant",
        title: `${group.label}が重複しています`,
        message: group.reason,
        mods: hits.map((h) => h.title),
      });
    }
  }
  return out;
}

export function buildWarnings(entries) {
  const out = [];

  // Worldgen: real, category-shaped, and actionable. Libraries are excluded so
  // the list names mods the player would recognise.
  const worldgen = entries.filter(
    (e) =>
      (e.categories || []).includes("worldgen") &&
      !(e.categories || []).includes("library")
  );
  if (worldgen.length) {
    out.push({
      id: "cat-worldgen",
      ...WARNING_TEMPLATES.worldgen,
      mods: worldgen.map((e) => e.title),
    });
  }

  // Libraries: only the ones we actually auto-added as dependencies.
  const libs = entries.filter((e) => e.autoAdded);
  if (libs.length) {
    out.push({
      id: "cat-library",
      ...WARNING_TEMPLATES.library,
      mods: libs.map((e) => e.title),
    });
  }

  // Most actionable first.
  return [...detectConflicts(entries), ...detectRedundant(entries), ...out];
}
