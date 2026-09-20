import { fmtShort } from "../utils/format";
import { bevelIn, bevelOut } from "../utils/styles";

export default function ModCard({ mod, onRemove, onSwap, busy }) {
  const deps = mod.requiredDeps || [];
  const url = "https://modrinth.com/mod/" + mod.slug;
  const editable = !mod.autoAdded && (onRemove || onSwap);

  return (
    <article className="mod-card relative" aria-busy={busy}>
      {busy && (
        <div className="absolute inset-0 z-10 bg-stone-950/70 grid place-items-center" role="status">入れ替え中…

        </div>
      )}

      <a href={url} target="_blank" rel="noreferrer" className="mod-card-main flex gap-3 group">
        <div
          className="shrink-0 w-12 h-12 bg-stone-800 grid place-items-center overflow-hidden"
          style={bevelIn}
        >
          {mod.icon_url ? (
            <img
              src={mod.icon_url}
              alt=""
              width="48"
              height="48"
              loading="lazy"
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-[11px] text-stone-400">MOD</span>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1">
            <span className="font-bold text-[15px] break-words">{mod.title}</span>

          </div>
          <p
            lang={mod.localized ? "ja" : "en"}
            className="text-[13px] text-stone-300 line-clamp-3 leading-snug mt-1"
          >
            {mod.description}
          </p>
          <div className="flex items-center gap-3 mt-1.5 text-[12px] text-stone-400">
            <span className="flex items-center gap-1 tabular-nums">

              {fmtShort(mod.downloads)} DL
            </span>
            {mod.author && <span className="truncate">by {mod.author}</span>}
          </div>
        </div>
      </a>

      {editable && (
        <div className="mod-actions flex gap-2">
          <button
            type="button"
            onClick={() => onSwap(mod.project_id)}
            disabled={busy}
            aria-label={`${mod.title} を別の候補に入れ替える`}
            className="flex-1 px-2 min-h-11 text-[13px] bg-stone-800 text-stone-100 flex items-center justify-center gap-1 disabled:opacity-50"
            style={bevelOut}
          >

            入れ替え
          </button>
          <button
            type="button"
            onClick={() => onRemove(mod.project_id)}
            disabled={busy}
            aria-label={`${mod.title} を構成から外す`}
            className="flex-1 px-2 min-h-11 text-[13px] bg-stone-800 text-red-200 flex items-center justify-center gap-1 disabled:opacity-50"
            style={bevelOut}
          >

            外す
          </button>
        </div>
      )}

      {mod.autoAdded && (
        <div className="mod-dependency text-[12px] text-stone-400">
          依存関係により自動追加
          {mod.requiredBy && mod.requiredBy.length > 0 && (
            <span className="text-stone-400">（{mod.requiredBy.join(", ")} が必要）</span>
          )}
        </div>
      )}

      <details className="mod-reason text-[13px] text-stone-300">
        <summary>選定理由</summary>
        <p>{mod.reason}</p>
      </details>

      {deps.length > 0 && (
        <div className="text-[12px] text-stone-300 flex items-start gap-1">

          <span>依存: {deps.map((d) => d.title).join(", ")}</span>
        </div>
      )}
    </article>
  );
}
