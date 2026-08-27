// Application-specific config data (NOT mod data). Mod data always comes from the Modrinth API.

// Mod Loaders supported by Modrinth.
export const LOADERS = [
  { id: "fabric", label: "Fabric" },
  { id: "forge", label: "Forge" },
  { id: "neoforge", label: "NeoForge" },
  { id: "quilt", label: "Quilt" },
];

// Fallback version list used before the live Modrinth tag list loads.
export const FALLBACK_VERSIONS = [
  "1.21.1", "1.21", "1.20.6", "1.20.4", "1.20.1",
  "1.19.4", "1.19.2", "1.18.2", "1.16.5", "1.12.2",
];

// ROLES = the output categories of a pack.
// facets: Modrinth `categories` values OR-joined for the role's search.
// query:  extra full-text search keyword for the role (optional).
// count:  how many mods to adopt for this role.
// "core" has no search — it is filled by dependency resolution.
export const ROLES = [
  { id: "core",        label: "コア・前提",        facets: [],                       query: "",        count: 0, reasonTail: "他のMODの動作に必要な前提ライブラリ。" },
  { id: "adventure",   label: "冒険・探索",        facets: ["adventure"],            query: "",        count: 5, reasonTail: "冒険・探索テーマとの相性が高いため採用。" },
  { id: "worldgen",    label: "ワールド生成",      facets: ["worldgen"],             query: "",        count: 4, reasonTail: "ワールドに変化と探索価値を加えるため採用。" },
  { id: "dungeon",     label: "ダンジョン・構造物", facets: ["adventure", "worldgen"], query: "dungeon", count: 5, reasonTail: "探索できる構造物を増やすため採用。" },
  { id: "mobs",        label: "ボス・Mob",         facets: ["mobs"],                 query: "",        count: 5, reasonTail: "戦う相手を増やし手応えを出すため採用。" },
  { id: "combat",      label: "装備・戦闘",        facets: ["equipment"],            query: "",        count: 4, reasonTail: "戦闘まわりを強化するため採用。" },
  { id: "magic",       label: "魔法",              facets: ["magic"],                query: "",        count: 4, reasonTail: "魔法テーマとの相性が高いため採用。" },
  { id: "tech",        label: "技術・自動化",      facets: ["technology"],           query: "",        count: 4, reasonTail: "自動化・工業要素を加えるため採用。" },
  { id: "storage",     label: "ストレージ・整理",  facets: ["storage"],              query: "",        count: 3, reasonTail: "アイテム管理を快適にするため採用。" },
  { id: "qol",         label: "QoL・快適",         facets: ["utility"],              query: "",        count: 5, reasonTail: "普段のプレイを快適にするため採用。" },
  { id: "food",        label: "食料・農業",        facets: ["food"],                 query: "",        count: 3, reasonTail: "食料・農業の幅を広げるため採用。" },
  { id: "decoration",  label: "装飾・建築",        facets: ["decoration"],           query: "",        count: 4, reasonTail: "建築の表現を増やすため採用。" },
  { id: "performance", label: "軽量化",            facets: ["optimization"],         query: "",        count: 4, reasonTail: "動作を軽くし安定させるため採用（自動追加）。" },
];

// Display order of categories in the built pack.
export const CATEGORY_ORDER = [
  "core", "adventure", "worldgen", "dungeon", "mobs", "combat",
  "magic", "tech", "storage", "qol", "food", "decoration", "performance",
];

// THEMES = what the user actually selects. Each maps to one or more roles.
export const THEMES = [
  { id: "adventure", label: "冒険・探検",  emoji: "🗺️", roles: ["adventure", "worldgen"] },
  { id: "dungeon",   label: "ダンジョン",  emoji: "⚔️", roles: ["dungeon"] },
  { id: "magic",     label: "魔法",        emoji: "✨", roles: ["magic"] },
  { id: "mobs",      label: "Mob・ボス",   emoji: "🐺", roles: ["mobs"] },
  { id: "combat",    label: "戦闘・装備",  emoji: "🛡️", roles: ["combat"] },
  { id: "tech",      label: "技術・自動化", emoji: "⚙️", roles: ["tech"] },
  { id: "build",     label: "建築・装飾",  emoji: "🧱", roles: ["decoration"] },
  { id: "qol",       label: "便利・QoL",   emoji: "🎒", roles: ["qol", "storage"] },
  { id: "food",      label: "食料・農業",  emoji: "🍞", roles: ["food"] },
  { id: "light",     label: "軽量化",      emoji: "⚡", roles: ["performance"] },
];

const ROLE_BY_ID = Object.fromEntries(ROLES.map((r) => [r.id, r]));

export function getRole(id) {
  return ROLE_BY_ID[id] || null;
}

export function roleLabel(id) {
  return ROLE_BY_ID[id]?.label || id;
}