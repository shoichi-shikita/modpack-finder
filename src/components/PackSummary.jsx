import { Package, Download, Loader2, Link2, Check } from "lucide-react";
import { fmtBytes, ramHint } from "../utils/format";
import { bevelOut, bevelIn } from "../utils/styles";

export default function PackSummary({
  pack,
  onDownload,
  downloading,
  disabled,
  onCopyLink,
  copied,
  onOpenGuide,
}) {
  const { version, loader, counts, bars, totalSize } = pack;
  const max = Math.max(1, ...bars.map((b) => b.count));

  return (
    <div className="p-4 sm:p-5 mb-5" style={{ ...bevelOut, background: "#33333a" }}>
      <div className="flex items-center gap-2 mb-1">
        <Package className="w-5 h-5 text-lime-400" />
        <h2 className="text-lg font-bold tracking-wide">あなたのMODパック</h2>
      </div>
      <p className="text-[13px] text-stone-300 mb-4">
        Minecraft {version} ・ {loader}
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
        <Stat label="MOD本体" value={counts.body} />
        <Stat label="依存MOD" value={counts.deps} />
        <Stat label="合計" value={counts.total} accent />
        <Stat label="ダウンロード量" value={fmtBytes(totalSize)} small />
      </div>

      <div className="space-y-1.5 mb-4">
        {bars.map((b) => (
          <div key={b.id} className="flex items-center gap-2 text-[13px]">
            <span className="w-28 shrink-0 text-stone-200 truncate">{b.label}</span>
            <div className="flex-1 h-3 bg-stone-900" style={bevelIn}>
              <div className="h-full bg-lime-500" style={{ width: `${(b.count / max) * 100}%` }} />
            </div>
            <span className="w-6 text-right text-stone-300 tabular-nums">{b.count}</span>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={onDownload}
          disabled={downloading || disabled}
          className="px-5 min-h-12 bg-lime-600 text-white font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-50"
          style={bevelOut}
        >
          {downloading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Download className="w-4 h-4" />
          )}
          {downloading
            ? "書き出し中…"
            : `.mrpack をダウンロード（${counts.total}個・約${fmtBytes(totalSize)}）`}
        </button>

        <button
          type="button"
          onClick={onCopyLink}
          className="px-4 min-h-12 bg-stone-800 text-stone-100 text-sm flex items-center gap-2"
          style={bevelOut}
        >
          {copied ? (
            <Check className="w-4 h-4 text-lime-400" />
          ) : (
            <Link2 className="w-4 h-4 text-lime-400" />
          )}
          {copied ? "コピーしました" : "この構成のリンクをコピー"}
        </button>
      </div>

      {/* The single most important instruction on the page: what to do with the
          file that was just downloaded. It used to be 10px at 2.6:1 contrast. */}
      <div className="mt-4 p-4 bg-stone-900" style={bevelIn}>
        <h3 className="text-[13px] font-bold text-lime-300 uppercase tracking-wider mb-3">
          このあとの3ステップ
        </h3>
        <ol className="space-y-2.5">
          <Step n={1}>
            <a
              href="https://modrinth.com/app"
              target="_blank"
              rel="noreferrer"
              className="text-lime-300 underline"
            >
              Modrinth App
            </a>{" "}
            または{" "}
            <a
              href="https://prismlauncher.org"
              target="_blank"
              rel="noreferrer"
              className="text-lime-300 underline"
            >
              Prism Launcher
            </a>{" "}
            を開く
          </Step>
          <Step n={2}>
            いまダウンロードした <b className="text-stone-100">.mrpack</b> をウィンドウにドラッグ＆ドロップ
          </Step>
          <Step n={3}>
            「インストール」を押す。依存MODとローダーも自動でそろいます
          </Step>
        </ol>
        <p className="text-[13px] text-stone-300 mt-3">
          メモリ割り当ての目安は <b className="text-stone-100">{ramHint(counts.total)}</b> です。
        </p>
        <button
          type="button"
          onClick={onOpenGuide}
          className="mt-2 px-3 min-h-11 bg-stone-800 text-lime-300 text-[13px] inline-flex items-center"
          style={bevelOut}
        >
          詳しい手順とつまずき対処を見る →
        </button>
      </div>
    </div>
  );
}

function Step({ n, children }) {
  return (
    <li className="flex gap-3 items-start">
      <span
        className="shrink-0 w-6 h-6 grid place-items-center bg-lime-700 text-white text-[12px] font-bold"
        style={bevelIn}
      >
        {n}
      </span>
      <span className="text-[14px] text-stone-100 leading-relaxed pt-0.5">{children}</span>
    </li>
  );
}

function Stat({ label, value, accent, small }) {
  return (
    <div className="px-3 py-2 bg-stone-900 text-center" style={bevelIn}>
      <div
        className={`${small ? "text-base" : "text-xl"} font-bold tabular-nums ${
          accent ? "text-lime-400" : "text-stone-100"
        }`}
      >
        {value}
      </div>
      <div className="text-[12px] uppercase tracking-wider text-stone-400">{label}</div>
    </div>
  );
}
