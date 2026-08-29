// Which Mod Loader exists for which Minecraft version.
//
// Why this file exists: Modrinth's search facets AND together at the *project*
// level, not the *file* level. `versions:1.7.10` + `categories:fabric` will
// happily return a project that has some 1.7.10 file and some (unrelated)
// Fabric file. Without this guard the UI would offer impossible combinations
// like "1.7.10 x Fabric" and produce a pack that cannot start.

// Minimum Minecraft version each loader ever supported.
const MIN_VERSION = {
  fabric: [1, 14],
  quilt: [1, 18, 2],
  neoforge: [1, 20, 1],
  forge: [1, 1],
};

const NOTE = {
  fabric: "Fabric は Minecraft 1.14 以降のみ対応です。",
  quilt: "Quilt は Minecraft 1.18.2 以降のみ対応です。",
  neoforge: "NeoForge は Minecraft 1.20.1 以降のみ対応です。",
  forge: "Forge はこのバージョンには対応していません。",
};

// "1.21.1" -> [1,21,1] / "26.2" -> [26,2]. Returns null for anything that is
// not a plain dotted-number version (snapshots, pre-releases, ...).
export function parseVersion(v) {
  if (typeof v !== "string") return null;
  const parts = v.split(".");
  if (!parts.length || parts.some((p) => !/^\d+$/.test(p))) return null;
  return parts.map(Number);
}

// Numeric, element-wise compare. Shorter versions are treated as ...0.
export function compareVersions(a, b) {
  const len = Math.max(a.length, b.length);
  for (let i = 0; i < len; i += 1) {
    const d = (a[i] || 0) - (b[i] || 0);
    if (d !== 0) return d < 0 ? -1 : 1;
  }
  return 0;
}

// True when `loader` can run on `version`. Unknown/unparseable versions (e.g.
// snapshots) are allowed — we only block combinations we are certain about.
export function isLoaderSupported(loader, version) {
  const min = MIN_VERSION[loader];
  const parsed = parseVersion(version);
  if (!min || !parsed) return true;
  return compareVersions(parsed, min) >= 0;
}

export function loaderUnsupportedNote(loader) {
  return NOTE[loader] || "このバージョンには対応していません。";
}

// First supported loader for a version, so the UI can auto-correct instead of
// leaving the user on an impossible selection.
export function firstSupportedLoader(version, order) {
  const list = order && order.length ? order : ["fabric", "neoforge", "forge", "quilt"];
  return list.find((l) => isLoaderSupported(l, version)) || "forge";
}
