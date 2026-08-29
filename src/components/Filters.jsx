import { Search, Loader2, Trash2, Check } from "lucide-react";
import { LOADERS, THEMES, POPULAR_VERSIONS } from "../data/categories";
import { isLoaderSupported, loaderUnsupportedNote } from "../data/loaderSupport";
import { bevelOut, bevelIn } from "../utils/styles";

const CHIP = "px-3 min-h-11 text-[13px] transition-colors inline-flex items-center gap-1.5";

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
  includePerformance,
  onTogglePerformance,
  onGenerate,
  onClear,
  loading,
  canClear,
  error,
}) {
  const popular = POPULAR_VERSIONS.filter((v) => versions.includes(v));
  const rest = versions.filter((v) => !popular.includes(v));

  // A real <form> so Enter submits from the keyword field, which is what every
  // search box on the web does.
  function submit(e) {
    e.preventDefault();
    if (!loading) onGenerate();
  }

  return (
    <form onSubmit={submit} className="p-4 sm:p-5 mb-5" style={{ ...bevelOut, background: "#3a3a41" }}>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <div>
          <label
            htmlFor="mpf-version"
            className="block text-[12px] uppercase tracking-wider text-stone-300"
          >
            バージョン
          </label>
          <select
            id="mpf-version"
            value={version}
            onChange={(e) => onVersionChange(e.target.value)}
            className="mt-1 w-full bg-stone-900 text-stone-100 px-3 min-h-11 outline-none appearance-none text-[13px]"
            style={bevelIn}
          >
            {popular.length > 0 && (
              <optgroup label="よく使われるバージョン">
                {popular.map((v) => (
                  <option key={v} value={v}>{v}</option>
                ))}
              </optgroup>
            )}
            <optgroup label="すべてのバージョン">
              {rest.map((v) => (
                <option key={v} value={v}>{v}</option>
              ))}
            </optgroup>
          </select>
        </div>

        <div>
          <span id="mpf-loader-label" className="block text-[12px] uppercase tracking-wider text-stone-300">
            ローダー
          </span>
          <div
            role="radiogroup"
            aria-labelledby="mpf-loader-label"
            className="mt-1 flex gap-2 flex-wrap"
          >
            {LOADERS.map((l) => {
              const supported = isLoaderSupported(l.id, version);
              const on = loader === l.id;
              return (
                <button
                  key={l.id}
                  type="button"
                  role="radio"
                  aria-checked={on}
                  disabled={!supported}
                  title={supported ? undefined : loaderUnsupportedNote(l.id)}
                  onClick={() => onLoaderChange(l.id)}
                  className={`${CHIP} ${
                    on ? "bg-lime-700 text-white" : "bg-stone-800 text-stone-200"
                  } disabled:opacity-35 disabled:cursor-not-allowed`}
                  style={on ? bevelIn : bevelOut}
                >
                  {on && <Check className="w-3.5 h-3.5" aria-hidden="true" />}
                  {l.label}
                </button>
              );
            })}
          </div>
          {LOADERS.some((l) => !isLoaderSupported(l.id, version)) && (
            <p className="mt-1 text-[12px] text-stone-400">
              グレーのローダーは Minecraft {version} に存在しないため選べません。
            </p>
          )}
        </div>
      </div>

      <fieldset className="mb-4 border-0 p-0 m-0">
        <legend className="text-[12px] uppercase tracking-wider text-stone-300 p-0">
          このワールドでやりたいこと（複数OK）
        </legend>
        <div className="mt-2 flex flex-wrap gap-2">
          {THEMES.map((t) => {
            const on = themeIds.includes(t.id);
            return (
              <button
                key={t.id}
                type="button"
                aria-pressed={on}
                onClick={() => onToggleTheme(t.id)}
                className={`${CHIP} ${
                  on ? "bg-lime-700 text-white" : "bg-stone-800 text-stone-200"
                }`}
                style={on ? bevelIn : bevelOut}
              >
                {on ? (
                  <Check className="w-3.5 h-3.5" aria-hidden="true" />
                ) : (
                  <span aria-hidden="true">{t.emoji}</span>
                )}
                {t.label}
              </button>
            );
          })}
        </div>
      </fieldset>

      <div className="mb-4">
        <label
          htmlFor="mpf-keyword"
          className="block text-[12px] uppercase tracking-wider text-stone-300"
        >
          こだわりキーワード（任意）
        </label>
        <input
          id="mpf-keyword"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder="例: dungeon, storage, farm ..."
          className="mt-1 w-full bg-stone-900 text-stone-100 px-3 min-h-11 outline-none placeholder:text-stone-500 text-[13px]"
          style={bevelIn}
        />
        <p className="mt-1 text-[12px] text-stone-400">
          選んだテーマの検索だけを絞り込みます（軽量化MODの選定には影響しません）。
        </p>
      </div>

      {/* The performance mods used to be forced in silently, and then warned
          about. Make it a visible, defaulted-on choice instead. */}
      <label className="flex items-start gap-2 mb-4 cursor-pointer select-none">
        <input
          type="checkbox"
          checked={includePerformance}
          onChange={onTogglePerformance}
          className="mt-0.5 w-4 h-4 accent-lime-500 shrink-0"
        />
        <span className="text-[13px] text-stone-200">
          おすすめの軽量化MODも一緒に入れる
          <span className="text-stone-400">（推奨・FPSが安定します）</span>
        </span>
      </label>

      {error && (
        <p className="text-[13px] text-red-300 mb-3" role="alert">
          {error}
        </p>
      )}

      <div className="flex flex-wrap gap-3">
        <button
          type="submit"
          disabled={loading}
          className="px-6 min-h-12 bg-lime-600 text-white font-bold uppercase tracking-widest text-sm flex items-center justify-center gap-2 disabled:opacity-60"
          style={bevelOut}
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
          {loading ? "構成を組み立てています…" : "この条件で構成を作る"}
        </button>

        <button
          type="button"
          onClick={onClear}
          disabled={loading || !canClear}
          className="px-4 min-h-12 bg-stone-800 text-stone-200 text-sm flex items-center gap-2 disabled:opacity-40"
          style={bevelOut}
        >
          <Trash2 className="w-4 h-4" />
          構成をクリア
        </button>
      </div>
    </form>
  );
}
