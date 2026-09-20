import { LOADERS, THEMES, POPULAR_VERSIONS } from "../data/categories";
import { isLoaderSupported, loaderUnsupportedNote } from "../data/loaderSupport";
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
    <form id="pack-builder" onSubmit={submit} className="filter-panel scroll-mt-4" >
      <h2 className="filter-title">構成の条件</h2>
      <div className="filter-fields grid gap-4 mb-4">
        <div>
          <label
            htmlFor="mpf-version"
            className="block text-[12px]   text-stone-300"
          >
            バージョン
          </label>
          <select
            id="mpf-version"
            value={version}
            onChange={(e) => onVersionChange(e.target.value)}
            className="mt-1 w-full bg-stone-900 text-stone-100 px-3 min-h-11 outline-none text-[13px]"
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
          <span id="mpf-loader-label" className="block text-[12px]   text-stone-300">
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
                <label key={l.id} className="filter-choice" title={supported ? undefined : loaderUnsupportedNote(l.id)}>
                  <input type="radio" name="loader" value={l.id} checked={on} disabled={!supported}
                    onChange={() => onLoaderChange(l.id)} />
                  <span>{l.label}</span>
                </label>
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
        <legend className="text-[12px]   text-stone-300 p-0">
          テーマ（複数選択）
        </legend>
        <div className="mt-2 flex flex-wrap gap-2">
          {THEMES.map((t) => {
            const on = themeIds.includes(t.id);
            return (
              <label key={t.id} className="filter-choice">
                <input type="checkbox" checked={on} onChange={() => onToggleTheme(t.id)} />
                <span>{t.label}</span>
              </label>
            );
          })}
        </div>
      </fieldset>

      <div className="mb-4">
        <label
          htmlFor="mpf-keyword"
          className="block text-[12px]   text-stone-300"
        >
          キーワード（任意）
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
          軽量化MODを含める

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
          className="px-6 min-h-12 bg-lime-600 text-white font-bold   text-sm flex items-center justify-center gap-2 disabled:opacity-60"
          style={bevelOut}
        >

          {loading ? "構成を組み立てています…" : "この条件で構成を作る"}
        </button>

        <button
          type="button"
          onClick={onClear}
          disabled={loading || !canClear}
          className="px-4 min-h-12 bg-stone-800 text-stone-200 text-sm flex items-center gap-2 disabled:opacity-40"
          style={bevelOut}
        >

          構成をクリア
        </button>
      </div>
    </form>
  );
}
