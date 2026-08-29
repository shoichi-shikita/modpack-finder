// The tool's state lives in the URL so a configuration can be bookmarked,
// shared and reopened. Without this, pressing reload throws the user's work
// away and there is no way to show someone else what you built.
//
//   /?v=1.21.1&l=fabric&t=adventure,tech&q=dragon&perf=1&mods=create,jei,sodium
//
// `mods` (slugs) is authoritative when present: a shared link then reproduces
// the exact set the sender saw, including their removals and swaps, instead of
// re-running a search whose ranking may have moved since.

const KEYS = ["v", "l", "t", "q", "perf", "mods"];

export function readUrlState(search) {
  const p = new URLSearchParams(search || window.location.search);
  const split = (k) =>
    (p.get(k) || "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

  const state = {
    version: p.get("v") || "",
    loader: p.get("l") || "",
    themeIds: split("t"),
    query: p.get("q") || "",
    includePerformance: p.get("perf") === null ? null : p.get("perf") !== "0",
    slugs: split("mods"),
  };
  state.hasAny = KEYS.some((k) => p.get(k) !== null);
  return state;
}

export function buildQuery({ version, loader, themeIds, query, includePerformance, slugs }) {
  const p = new URLSearchParams();
  if (version) p.set("v", version);
  if (loader) p.set("l", loader);
  if (themeIds && themeIds.length) p.set("t", themeIds.join(","));
  if (query && query.trim()) p.set("q", query.trim());
  p.set("perf", includePerformance ? "1" : "0");
  if (slugs && slugs.length) p.set("mods", slugs.join(","));
  return p.toString();
}

// Reflect the current state in the address bar without adding history entries.
export function syncUrl(state) {
  const qs = buildQuery(state);
  const next = `${window.location.pathname}${qs ? `?${qs}` : ""}`;
  if (next !== `${window.location.pathname}${window.location.search}`) {
    window.history.replaceState({}, "", next);
  }
}

export function shareUrl(state) {
  const qs = buildQuery(state);
  return `${window.location.origin}/${qs ? `?${qs}` : ""}`;
}

export function packSlugs(pack) {
  if (!pack) return [];
  return pack.categories
    .flatMap((c) => c.mods)
    .filter((m) => !m.autoAdded && m.slug)
    .map((m) => m.slug);
}

// --- last-used settings, so a returning visitor doesn't start from scratch ---
const LS_KEY = "mpf.lastSettings.v1";

export function saveSettings(state) {
  try {
    localStorage.setItem(
      LS_KEY,
      JSON.stringify({
        version: state.version,
        loader: state.loader,
        themeIds: state.themeIds,
        query: state.query,
        includePerformance: state.includePerformance,
      })
    );
  } catch {
    // Private mode / storage disabled — not worth surfacing.
  }
}

export function loadSettings() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return null;
    const s = JSON.parse(raw);
    if (!s || typeof s !== "object") return null;
    if (!Array.isArray(s.themeIds)) return null;
    return s;
  } catch {
    return null;
  }
}
