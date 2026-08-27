import {
  Download,
  ExternalLink,
  Boxes,
  Link2,
  Sparkles,
  X,
  RefreshCw,
  Loader2,
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
            <img src={mod.icon_url} alt="" className="w-full h-full object-cover" />
          ) : (
            <Boxes className="w-5 h-5 text-stone-500" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1">
            <span className="font-bold text-sm truncate">{mod.title}</span>
            <ExternalLink className="w-3 h-3 text-stone-500 opacity-0 group-hover:opacity-100 shrink-0" />
          </div>
          <p className="text-[11px] text-stone-400 line-clamp-2 leading-snug mt-0.5">
            {mod.description}
          </p>
          <div className="flex items-center gap-3 mt-1 text-[10px] text-stone-500">
            <span className="flex items-center gap-1">
              <Download className="w-3 h-3" />
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
            className="flex-1 px-2 py-1.5 text-[11px] bg-stone-800 text-stone-200 flex items-center justify-center gap-1 disabled:opacity-50"
            style={bevelOut}
          >
            <RefreshCw className="w-3 h-3" />
            別の候補に入れ替え
          </button>
          <button
            type="button"
            onClick={() => onRemove(mod.project_id)}
            disabled={busy}
            className="px-2 py-1.5 text-[11px] bg-stone-800 text-red-300 flex items-center justify-center gap-1 disabled:opacity-50"
            style={bevelOut}
          >
            <X className="w-3 h-3" />
            外す
          </button>
        </div>
      )}

      {mod.autoAdded && (
        <div className="text-[10px] text-amber-300 bg-amber-950/40 px-2 py-1" style={bevelIn}>
          依存関係により自動追加
          {mod.requiredBy && mod.requiredBy.length > 0 && (
            <span className="text-amber-500/80">（{mod.requiredBy.join(", ")} が必要）</span>
          )}
        </div>
      )}

      <div className="text-[11px] text-stone-300 bg-stone-800/60 px-2 py-1.5" style={bevelIn}>
        <div className="flex items-center gap-1 text-lime-400 text-[10px] uppercase tracking-wider mb-0.5">
          <Sparkles className="w-3 h-3" />
          採用理由
        </div>
        {mod.reason}
      </div>

      {deps.length > 0 && (
        <div className="text-[10px] text-stone-400 flex items-start gap-1">
          <Link2 className="w-3 h-3 mt-0.5 shrink-0" />
          <span>依存: {deps.map((d) => d.title).join(", ")}</span>
        </div>
      )}
    </div>
  );
}
