import { LOADERS, THEMES } from "./categories.js";
import { noteFor } from "./modNotes.js";

// Deliberately curated: do not turn this into a blind version x loader x theme
// cartesian product. Each entry must represent a useful, supported search
// intent and have enough distinct copy to stand on its own.
const PAGE_SPECS = [
  ["1.21.1", "fabric", "adventure"],
  ["1.21.1", "fabric", "magic"],
  ["1.21.1", "fabric", "tech"],
  ["1.21.1", "fabric", "light"],
  ["1.21.1", "neoforge", "adventure"],
  ["1.21.1", "neoforge", "mobs"],
  ["1.20.1", "forge", "adventure"],
  ["1.20.1", "forge", "magic"],
  ["1.20.1", "forge", "tech"],
  ["1.20.1", "forge", "mobs"],
  ["1.20.1", "fabric", "qol"],
  ["1.19.2", "forge", "adventure"],
];

const THEME_COPY = {
  adventure: {
    searchLabel: "冒険・探索MOD",
    intro: "新しい地形や構造物、移動を助けるMODを組み合わせ、次の目的地が自然に見つかる構成を作ります。",
    points: ["地形・構造物・探索支援を役割別に選定", "ワールド生成MODの注意点を構成上で表示", "依存ライブラリもまとめて解決"],
    mods: [
      ["waystones", "Waystones"],
      ["xaeros-minimap", "Xaero's Minimap"],
      ["terralith", "Terralith"],
      ["dungeons-and-taverns", "Dungeons and Taverns"],
      ["natures-compass", "Nature's Compass"],
    ],
  },
  magic: {
    searchLabel: "魔法MOD",
    intro: "呪文、儀式、魔法装備などを軸に、遊び方の異なる魔法MODから対応ファイルがあるものを選びます。",
    points: ["対応バージョンが実在する魔法MODだけを採用", "前提ライブラリを自動で追加", "軽量化MODを任意で同梱可能"],
    mods: [
      ["ars-nouveau", "Ars Nouveau"],
      ["irons-spells-n-spellbooks", "Iron's Spells 'n Spellbooks"],
      ["botania", "Botania"],
      ["occultism", "Occultism"],
      ["spell-engine", "Spell Engine"],
    ],
  },
  tech: {
    searchLabel: "工業・自動化MOD",
    intro: "発電、加工、物流、ストレージを広げる工業MODを中心に、自動化を始めやすい構成を作ります。",
    points: ["定番の工業・自動化MODを優先", "収納やレシピ確認を含む依存関係を整理", "不要なMODは出力前に入れ替え可能"],
    mods: [
      ["create", "Create"],
      ["mekanism", "Mekanism"],
      ["applied-energistics-2", "Applied Energistics 2"],
      ["immersive-engineering", "Immersive Engineering"],
      ["modern-industrialization", "Modern Industrialization"],
    ],
  },
  light: {
    searchLabel: "軽量化MOD",
    intro: "描画、メモリ、チャンク処理など役割の違う最適化MODを、競合を避けながら組み合わせます。",
    points: ["ローダーに合う軽量化MODを選定", "既知の競合や重複を警告", "少数構成から編集して書き出し可能"],
    mods: [
      ["sodium", "Sodium"],
      ["lithium", "Lithium"],
      ["ferritecore", "FerriteCore"],
      ["entityculling", "Entity Culling"],
      ["modernfix", "ModernFix"],
    ],
  },
  mobs: {
    searchLabel: "Mob・ボスMOD",
    intro: "野生動物から高難度ボスまで、戦う相手と探索の目的を増やすMODをまとめた構成を作ります。",
    points: ["Mob・ボス追加MODをダウンロード実績も含めて選定", "アニメーション等の前提MODを自動追加", "難易度に合わせて個別に削除・入れ替え可能"],
    mods: [
      ["alexs-mobs", "Alex's Mobs"],
      ["friends-and-foes", "Friends & Foes"],
      ["naturalist", "Naturalist"],
      ["cataclysm", "L_Ender's Cataclysm"],
      ["guard-villagers", "Guard Villagers"],
    ],
  },
  qol: {
    searchLabel: "便利・QoL MOD",
    intro: "レシピ確認、持ち物整理、情報表示など、バニラの遊び心地を保ったまま不便を減らす構成を作ります。",
    points: ["役割が重なるレシピ・地図MODを警告", "クライアント側で使えるMODを優先", "必要なものだけ残して書き出し可能"],
    mods: [
      ["jei", "Just Enough Items (JEI)"],
      ["emi", "EMI"],
      ["jade", "Jade"],
      ["appleskin", "AppleSkin"],
      ["mouse-tweaks", "Mouse Tweaks"],
    ],
  },
};

const VERSION_COPY = {
  "1.21.1": "比較的新しい環境で、現在も更新されているMODを探したい人向けです。",
  "1.20.1": "対応MODが多く、大型MODを組み合わせやすい定番バージョンです。",
  "1.19.2": "実績のあるMOD構成を使いながら、比較的新しい要素も楽しみたい人向けです。",
};

const LOADER_COPY = {
  fabric: "Fabricの軽量なエコシステムに対応するファイルだけを確認します。",
  forge: "Forge向けに公開されたファイルを確認し、大型MODも含めて構成します。",
  neoforge: "NeoForge向けファイルが実在するMODだけを候補にします。",
};

const loaderLabels = Object.fromEntries(LOADERS.map((loader) => [loader.id, loader.label]));
const themeLabels = Object.fromEntries(THEMES.map((theme) => [theme.id, theme.label]));

export const SEO_LANDING_PAGES = PAGE_SPECS.map(([version, loader, theme]) => {
  const copy = THEME_COPY[theme];
  const loaderLabel = loaderLabels[loader] || loader;
  const themeLabel = themeLabels[theme] || theme;
  const path = `/mods/${version}/${loader}/${theme}`;
  return {
    version,
    loader,
    loaderLabel,
    theme,
    themeLabel,
    path,
    href: `${path}/`,
    title: `Minecraft ${version} ${loaderLabel} ${copy.searchLabel}構成｜MOD PACK FINDER`,
    description: `Minecraft ${version}・${loaderLabel}対応の${copy.searchLabel}を自動選定。依存MODまで解決し、編集後に.mrpackで無料出力できます。${copy.intro}`,
    heading: `Minecraft ${version} ${loaderLabel} の${copy.searchLabel}構成`,
    intro: copy.intro,
    versionNote: VERSION_COPY[version] || "選んだMinecraftバージョンに対応するファイルを確認します。",
    loaderNote: LOADER_COPY[loader] || `${loaderLabel}向けファイルがあるMODだけを候補にします。`,
    points: copy.points,
    representativeMods: copy.mods.map(([slug, name]) => ({
      slug,
      name,
      note: noteFor(slug),
    })),
  };
});

const PAGE_BY_PATH = new Map(SEO_LANDING_PAGES.map((page) => [page.path, page]));

export function landingPageForPath(path) {
  return PAGE_BY_PATH.get(path) || null;
}

export function relatedLandingPages(page, limit = 4) {
  if (!page) return [];
  return SEO_LANDING_PAGES
    .filter((candidate) => candidate.path !== page.path)
    .map((candidate) => ({
      candidate,
      score:
        (candidate.version === page.version ? 4 : 0) +
        (candidate.loader === page.loader ? 2 : 0) +
        (candidate.theme === page.theme ? 1 : 0),
    }))
    .sort((a, b) => b.score - a.score || a.candidate.path.localeCompare(b.candidate.path))
    .slice(0, limit)
    .map(({ candidate }) => candidate);
}
