import { Package, Download, Loader2 } from "lucide-react";
import { bevelOut, bevelIn } from "../utils/styles";

export default function PackSummary({ pack, onDownload, downloading }) {
  const { version, loader, counts, bars } = pack;
  const max = Math.max(1, ...bars.map((b) => b.count));

  return (
    <div className="p-4 sm:p-5 mb-5" style={{ ...bevelOut, background: "#33333a" }}>
      <div className="flex items-center gap-2 mb-1">
        <Package className="w-5 h-5 text-lime-400" />
        <h2 className="text-lg font-bold tracking-wide">あなたのMODパック</h2>
      </div>
      <p className="text-[11px] text-stone-400 mb-4">
        Minecraft {version} ・ {loader}
      </p>

      {/* counts */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <Stat label="MOD本体" value={counts.body} />
        <Stat label="依存MOD" value={counts.deps} />
        <Stat label="合計" value={counts.total} accent />
      </div>

      {/* bars */}
      <div className="space-y-1.5 mb-4">
        {bars.map((b) => (
          <div key={b.id} className="flex items-center gap-2 text-xs">
            <span className="w-28 shrink-0 text-stone-300 truncate">{b.label}</span>
            <div className="flex-1 h-3 bg-stone-900" style={bevelIn}>
              <div
                className="h-full bg-lime-500"
                style={{ width: `${(b.count / max) * 100}%` }}
              />
            </div>
            <span className="w-6 text-right text-stone-400">{b.count}</span>
          </div>
        ))}
      </div>

      {/* download */}
      <button
        type="button"
        onClick={onDownload}
        disabled={downloading}
        className="w-full sm:w-auto px-5 py-3 bg-lime-600 text-white font-bold uppercase tracking-widest text-sm flex items-center justify-center gap-2 disabled:opacity-60"
        style={bevelOut}
      >
        {downloading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Download className="w-4 h-4" />
        )}
        {downloading ? "書き出し中…" : "MODパックをDL (.mrpack)"}
      </button>
      <p className="text-[10px] text-stone-500 mt-2">
        Modrinth App や Prism Launcher にドラッグ＆ドロップで、依存MODも含めて自動インストールされます。
      </p>
    </div>
  );
}

function Stat({ label, value, accent }) {
  return (
    <div
      className="px-3 py-2 bg-stone-900 text-center"
      style={bevelIn}
    >
      <div
        className={`text-xl font-bold ${accent ? "text-lime-400" : "text-stone-100"}`}
      >
        {value}
      </div>
      <div className="text-[10px] uppercase tracking-wider text-stone-500">
        {label}
      </div>
    </div>
  );
}
