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
    <div className="pack-summary">
      <div className="flex items-center gap-2 mb-1">

        <h2 className="text-lg font-bold ">MOD構成</h2>
      </div>
      <p className="text-[13px] text-stone-300 mb-4">
        Minecraft {version} ・ {loader}
      </p>

      <dl className="pack-facts">
        <div><dt>MOD本体</dt><dd>{counts.body}</dd></div>
        <div><dt>依存MOD</dt><dd>{counts.deps}</dd></div>
        <div><dt>合計</dt><dd>{counts.total}</dd></div>
        <div><dt>容量</dt><dd>{fmtBytes(totalSize)}</dd></div>
      </dl>

      <details className="summary-details mb-4"><summary>カテゴリ別の内訳</summary><div className="space-y-1.5 mt-3">
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

      </details>
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={onDownload}
          disabled={downloading || disabled}
          className="px-5 min-h-12 bg-lime-600 text-white font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-50"
          style={bevelOut}
        >

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

          {copied ? "コピーしました" : "この構成のリンクをコピー"}
        </button>
      </div>

      {/* The single most important instruction on the page: what to do with the
          file that was just downloaded. It used to be 10px at 2.6:1 contrast. */}
      <details className="mt-4 p-3 bg-stone-900" style={bevelIn}><summary>導入手順・メモリの目安</summary>
        <h3 className="text-[13px] font-bold text-lime-300   mb-3">
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
          詳しい手順とつまずき対処を見る
        </button>
      </details>
    </div>
  );
}

function Step({ n, children }) {
  return (
    <li className="flex gap-3 items-start">
      <span
        className="step-number"
      >
        {n}.
      </span>
      <span className="text-[14px] text-stone-100 leading-relaxed pt-0.5">{children}</span>
    </li>
  );
}
