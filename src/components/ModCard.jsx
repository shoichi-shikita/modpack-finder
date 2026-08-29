import {
  Download, ExternalLink, Boxes, Link2, Sparkles, X, RefreshCw, Loader2,
} from "lucide-react";
import { fmtShort } from "../utils/format";
import { bevelIn, bevelOut } from "../utils/styles";

export default function ModCard({ mod, onRemove, onSwap, busy }) {
  const deps = mod.requiredDeps || [];
  const url = "https://modrinth.com/mod/" + mod.slug;
  const editable = !mod.autoAdded && (onRemove || onSwap);

  return (
    <div className="relative p-3 bg-stone-900 flex flex-col gap-2" style={bevelIn}>
      {busy && (
        <div className="absolute inset-0 z-10 bg-stone-950/70 grid place-items-center">
          <Loader2 className="w-5 h-5 animate-spin text-lime-400" />
        </div>
      )}

      <a href={url} target="_blank" rel="noreferrer" className="flex gap-3 group">
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
            <Boxes className="w-5 h-5 text-stone-400" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1">
            <span className="font-bold text-[15px] truncate">{mod.title}</span>
            <ExternalLink
              className="w-3 h-3 text-stone-400 opacity-60 group-hover:opacity-100 shrink-0"
              aria-hidden="true"
            />
          </div>
          <p
            lang={mod.localized ? "ja" : "en"}
            className="text-[13px] text-stone-300 line-clamp-3 leading-snug mt-1"
          >
            {mod.description}
          </p>
          <div className="flex items-center gap-3 mt-1.5 text-[12px] text-stone-400">
            <span className="flex items-center gap-1 tabular-nums">
              <Download className="w-3 h-3" aria-hidden="true" />
              {fmtShort(mod.downloads)}
            </span>
            {mod.author && <span className="truncate">by {mod.author}</span>}
          </div>
        </div>
      </a>

      {editable && (
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => onSwap(mod.project_id)}
            disabled={busy}
            aria-label={`${mod.title} を別の候補に入れ替える`}
            className="flex-1 px-2 min-h-11 text-[13px] bg-stone-800 text-stone-100 flex items-center justify-center gap-1 disabled:opacity-50"
            style={bevelOut}
          >
            <RefreshCw className="w-3.5 h-3.5" aria-hidden="true" />
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
            <X className="w-3.5 h-3.5" aria-hidden="true" />
            外す
          </button>
        </div>
      )}

      {mod.autoAdded && (
        <div className="text-[12px] text-amber-200 bg-amber-950/50 px-2 py-1.5" style={bevelIn}>
          依存関係により自動追加
          {mod.requiredBy && mod.requiredBy.length > 0 && (
            <span className="text-amber-300/90">（{mod.requiredBy.join(", ")} が必要）</span>
          )}
        </div>
      )}

      <div className="text-[13px] text-stone-200 bg-stone-800/70 px-2 py-1.5" style={bevelIn}>
        <div className="flex items-center gap-1 text-lime-300 text-[12px] uppercase tracking-wider mb-0.5">
          <Sparkles className="w-3 h-3" aria-hidden="true" />
          採用理由
        </div>
        {mod.reason}
      </div>

      {deps.length > 0 && (
        <div className="text-[12px] text-stone-300 flex items-start gap-1">
          <Link2 className="w-3 h-3 mt-0.5 shrink-0" aria-hidden="true" />
          <span>依存: {deps.map((d) => d.title).join(", ")}</span>
        </div>
      )}
    </div>
  );
}
