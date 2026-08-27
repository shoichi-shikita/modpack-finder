// Compact number formatting: 12345 -> 12.3K, 1200000 -> 1.2M
export function fmtShort(n) {
  const v = n || 0;
  if (v >= 1_000_000) return (v / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
  if (v >= 1_000) return (v / 1_000).toFixed(1).replace(/\.0$/, "") + "K";
  return String(v);
}

// Add a value to an array only if not already present.
export function addUnique(arr, value) {
  const list = arr || [];
  return list.includes(value) ? list : [...list, value];
}