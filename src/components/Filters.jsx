import { Search, Loader2, Trash2 } from "lucide-react";
import { LOADERS, THEMES } from "../data/categories";
import { bevelOut, bevelIn } from "../utils/styles";

export default function Filters({
  versions,
  version,
  onVersionChange,
  loader,
  onLoaderChange,
  themeIds,
  onToggleTheme,
  query,
  onQueryChange,
  onGenerate,
  onClear,
  loading,
  canClear,
  error,
}) {
  return (
    <div
      className="p-4 sm:p-5 mb-5"
      style={{ ...bevelOut, background: "#3a3a41" }}
    >
      {/* version + loader */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <label className="block">
          <span className="text-[11px] uppercase tracking-wider text-stone-400">
            バージョン
          </span>
          <select
            value={version}
            onChange={(e) => onVersionChange(e.target.value)}
            className="mt-1 w-full bg-stone-900 text-stone-100 px-3 py-2 outline-none appearance-none"
            style={bevelIn}
          >
            {versions.map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </select>
        </label>

        <div className="block">
          <span className="text-[11px] uppercase tracking-wider text-stone-400">
            ローダー
          </span>
          <div className="mt-1 flex gap-2 flex-wrap">
            {LOADERS.map((l) => {
              const on = loader === l.id;
              return (
                <button
                  key={l.id}
                  type="button"
                  onClick={() => onLoaderChange(l.id)}
                  className={`px-3 py-2 text-xs transition-colors ${
                    on ? "bg-lime-700 text-white" : "bg-stone-800 text-stone-300"
                  }`}
                  style={on ? bevelIn : bevelOut}
                >
                  {l.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* themes */}
      <div className="mb-4">
        <span className="text-[11px] uppercase tracking-wider text-stone-400">
          このワールドでやりたいこと（複数OK）
        </span>
        <div className="mt-2 flex flex-wrap gap-2">
          {THEMES.map((t) => {
            const on = themeIds.includes(t.id);
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => onToggleTheme(t.id)}
                className={`px-3 py-2 text-xs transition-colors ${
                  on ? "bg-lime-700 text-white" : "bg-stone-800 text-stone-300"
                }`}
                style={on ? bevelIn : bevelOut}
              >
                <span className="mr-1">{t.emoji}</span>
                {t.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* optional keyword */}
      <label className="block mb-4">
        <span className="text-[11px] uppercase tracking-wider text-stone-400">
          こだわりキーワード（任意）
        </span>
        <input
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder="例: dungeon, storage, farm ..."
          className="mt-1 w-full bg-stone-900 text-stone-100 px-3 py-2 outline-none placeholder:text-stone-600"
          style={bevelIn}
        />
      </label>

      {error && <p className="text-[11px] text-red-400 mb-3">{error}</p>}

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={onGenerate}
          disabled={loading}
          className="px-6 py-3 bg-lime-600 text-white font-bold uppercase tracking-widest text-sm flex items-center justify-center gap-2 disabled:opacity-60"
          style={bevelOut}
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Search className="w-4 h-4" />
          )}
          {loading ? "構成中…" : "MODパックを生成"}
        </button>

        <button
          type="button"
          onClick={onClear}
          disabled={loading || !canClear}
          className="px-4 py-3 bg-stone-800 text-stone-300 text-sm flex items-center gap-2 disabled:opacity-40"
          style={bevelOut}
        >
          <Trash2 className="w-4 h-4" />
          構成をクリア
        </button>
      </div>
    </div>
  );
}