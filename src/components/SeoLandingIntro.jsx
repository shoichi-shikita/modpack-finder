import { CheckCircle2, ChevronRight, Search } from "lucide-react";
import { relatedLandingPages } from "../data/seoLandingPages";
import { bevelOut } from "../utils/styles";

export default function SeoLandingIntro({ page }) {
  const related = relatedLandingPages(page);

  return (
    <section className="p-4 sm:p-5 mb-5" style={{ ...bevelOut, background: "#33333a" }}>
      <nav aria-label="パンくず" className="flex flex-wrap items-center gap-1 text-[12px] text-stone-400 mb-3">
        <a href="/" className="hover:text-lime-300 underline">ホーム</a>
        <ChevronRight className="w-3 h-3" aria-hidden="true" />
        <a href="/mods/" className="hover:text-lime-300 underline">MOD構成一覧</a>
        <ChevronRight className="w-3 h-3" aria-hidden="true" />
        <span aria-current="page">{page.version} {page.loaderLabel} {page.themeLabel}</span>
      </nav>

      <h1 className="text-xl sm:text-2xl font-bold leading-tight mb-3">{page.heading}</h1>
      <p className="text-[14px] text-stone-200 leading-relaxed">{page.intro}</p>
      <p className="text-[13px] text-stone-300 leading-relaxed mt-2">
        {page.versionNote} {page.loaderNote} 下の条件は設定済みなので、そのまま構成を作るか、好みに合わせて変更できます。
      </p>

      <ul className="grid sm:grid-cols-3 gap-2 mt-4">
        {page.points.map((point) => (
          <li key={point} className="flex items-start gap-2 text-[13px] text-stone-200">
            <CheckCircle2 className="w-4 h-4 text-lime-400 shrink-0 mt-0.5" aria-hidden="true" />
            <span>{point}</span>
          </li>
        ))}
      </ul>

      <a
        href="#pack-builder"
        className="mt-5 w-full sm:w-auto px-5 min-h-12 bg-lime-600 text-white font-bold text-[14px] inline-flex items-center justify-center gap-2 no-underline"
        style={bevelOut}
      >
        <Search className="w-4 h-4" aria-hidden="true" />
        設定済みの条件で構成を作る ↓
      </a>

      <div className="mt-5 pt-4 border-t border-stone-600">
        <h2 className="text-[15px] font-bold text-stone-100 mb-1">このテーマで候補になる代表MOD</h2>
        <p className="text-[12px] text-stone-400 leading-relaxed mb-3">
          実際の構成では、Minecraftバージョンと{page.loaderLabel}に対応するファイルがあるかを生成時に確認します。
        </p>
        <div className="grid sm:grid-cols-2 gap-3">
          {page.representativeMods.map((mod) => (
            <article key={mod.slug} className="p-3 bg-stone-800">
              <h3 className="text-[14px] font-bold text-lime-200">{mod.name}</h3>
              <p className="text-[12px] text-stone-300 leading-relaxed mt-1">{mod.note}</p>
            </article>
          ))}
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-stone-600">
        <h2 className="text-[13px] font-bold text-stone-200 mb-2">関連するMOD構成</h2>
        <div className="flex flex-wrap gap-x-4 gap-y-2 text-[13px]">
          {related.map((item) => (
            <a key={item.path} href={item.href} className="text-lime-300 hover:text-lime-200 underline">
              {item.version} {item.loaderLabel}・{item.themeLabel}
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
