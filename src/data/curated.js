// Quality gates for automatic mod selection.
//
// Background: Modrinth's category tags are coarse. A plain
// "search this category, sort by downloads, take the top N" pipeline happily
// picks a Complementary-Shaders add-on for "技術・自動化" and a 1.2K-download
// joke mod for "魔法". These lists narrow that down.
//
// Safety property: every entry here is matched by *slug*. A slug that is wrong
// or has been renamed simply never matches, so a stale entry can never break a
// build — it just stops having an effect.

// A mod must clear this download count to be adopted automatically.
export const MIN_DOWNLOADS = 100_000;

// If a role cannot fill its quota at the strict floor, it retries at this one
// before giving up. Keeps niche versions/loaders usable.
export const MIN_DOWNLOADS_RELAXED = 20_000;

// Never auto-adopt these, whatever their download count.
export const DENY_SLUGS = new Set([
  // Shader packs / shader add-ons: they need a shader pack to do anything and
  // are not "performance" or "technology" mods.
  "euphoria-patches",
  "complementary-shaders",
  "complementary-reimagined",
  "iris", // shader loader — pointless without a shader pack, and costs FPS
  "oculus",
  // Debugging / platform-specific helpers that Modrinth files under
  // "optimization" but which do not make the game run faster.
  "crash-assistant",
  "wayland-fix",
  "mipmaplevel-and-language-fix",
  // Joke / test projects that occasionally surface on niche versions.
  "crashma",
  "pvp-hittracking",
]);

// Hand-picked mods per role, in preference order. Anything listed here is
// promoted above the raw download ranking when it shows up in search results.
// This is the one part of the tool that is not reproducible by "call the API
// and sort" — keep growing it.
export const CURATED = {
  adventure: [
    "waystones", "xaeros-minimap", "xaeros-world-map", "journeymap",
    "explorers-compass", "natures-compass", "travelers-backpack", "comforts",
  ],
  worldgen: [
    "terralith", "tectonic", "biomes-o-plenty", "when-dungeons-arise",
    "repurposed-structures", "structory", "dungeons-and-taverns",
    "yungs-better-strongholds",
  ],
  dungeon: [
    "when-dungeons-arise", "dungeons-and-taverns", "yungs-better-dungeons",
    "yungs-better-strongholds", "yungs-better-mineshafts",
    "integrated-dungeons-and-structures", "repurposed-structures",
  ],
  mobs: [
    "alexs-mobs", "friends-and-foes", "naturalist", "born-in-chaos",
    "mutant-monsters", "cataclysm", "guard-villagers",
  ],
  combat: [
    "bettercombat", "better-combat", "simply-swords", "mythicmetals",
    "artifacts", "apotheosis", "spartan-weaponry",
  ],
  magic: [
    "ars-nouveau", "irons-spells-n-spellbooks", "botania", "occultism",
    "malum", "spell-engine",
  ],
  tech: [
    "create", "mekanism", "applied-energistics-2", "immersive-engineering",
    "industrial-foregoing", "modern-industrialization", "refined-storage",
  ],
  storage: [
    "sophisticated-backpacks", "sophisticated-storage", "storage-drawers",
    "functional-storage", "toms-storage", "iron-chests", "expanded-storage",
  ],
  qol: [
    "jei", "emi", "roughly-enough-items", "jade", "appleskin",
    "mouse-tweaks", "inventory-profiles-next", "carry-on", "clumps", "controlling",
  ],
  food: [
    "farmers-delight", "croptopia", "brewin-and-chewin", "nethers-delight",
    "aquaculture",
  ],
  decoration: [
    "supplementaries", "chipped", "handcrafted", "macaws-doors",
    "macaws-roofs", "macaws-bridges", "decorative-blocks", "framed-blocks",
  ],
  performance: [
    "sodium", "lithium", "ferritecore", "entityculling", "modernfix",
    "immediatelyfast", "memoryleakfix", "embeddium",
  ],
};

const RANK = {};
for (const [roleId, slugs] of Object.entries(CURATED)) {
  RANK[roleId] = new Map(slugs.map((s, i) => [s, i]));
}

// Lower is better. Curated mods rank 0..n-1, everything else sorts after them
// (and keeps its download ordering within that group).
export function curatedRank(roleId, slug) {
  const m = RANK[roleId];
  if (!m) return Number.MAX_SAFE_INTEGER;
  const i = m.get((slug || "").toLowerCase());
  return i === undefined ? Number.MAX_SAFE_INTEGER : i;
}

// Is this search hit acceptable as an automatic pick for `roleId`?
export function isAcceptableHit(hit, roleId, minDownloads) {
  const slug = (hit.slug || "").toLowerCase();
  const cats = hit.categories || [];

  if (DENY_SLUGS.has(slug)) return false;

  // Curated mods bypass the download floor — a hand-picked mod is wanted even
  // on a version where it has few downloads.
  const curated = curatedRank(roleId, slug) !== Number.MAX_SAFE_INTEGER;
  if (!curated && (hit.downloads || 0) < minDownloads) return false;

  // Libraries only enter a pack through dependency resolution. Adopting one as
  // a content pick wastes a slot (it does nothing on its own).
  if (cats.includes("library")) return false;

  // A client-side pack cannot use a server-only mod.
  if (hit.client_side === "unsupported") return false;

  // Keep performance/shader tooling out of the themed roles.
  if (roleId !== "performance" && cats.includes("optimization")) return false;

  return true;
}
