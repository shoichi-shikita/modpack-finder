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
// Human-readable byte size: 351000000 -> "351 MB"
export function fmtBytes(n) {
  const v = n || 0;
  if (v >= 1024 ** 3) return `${(v / 1024 ** 3).toFixed(1).replace(/\.0$/, "")} GB`;
  if (v >= 1024 ** 2) return `${Math.round(v / 1024 ** 2)} MB`;
  if (v >= 1024) return `${Math.round(v / 1024)} KB`;
  return `${v} B`;
}

// Rough RAM guidance based on mod count — the single most common question from
// beginners after "how do I install this".
export function ramHint(modCount) {
  if (modCount >= 100) return "8〜10GB";
  if (modCount >= 50) return "6〜8GB";
  if (modCount >= 20) return "4〜6GB";
  return "4GB";
}
