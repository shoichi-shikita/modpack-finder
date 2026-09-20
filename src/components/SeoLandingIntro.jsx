import { relatedLandingPages } from "../data/seoLandingPages";
import { bevelOut } from "../utils/styles";

export default function SeoLandingIntro({ page }) {
  const related = relatedLandingPages(page);

  return (
    <section className="p-4 sm:p-5 mb-5" style={{ ...bevelOut, background: "#202224" }}>
      <nav aria-label="パンくず" className="flex flex-wrap items-center gap-1 text-[12px] text-stone-400 mb-3">
        <a href="/" className="hover:text-lime-300 underline">ホーム</a>

        <a href="/mods/" className="hover:text-lime-300 underline">MOD構成一覧</a>

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

            <span>{point}</span>
          </li>
        ))}
      </ul>

      <a
        href="#pack-builder"
        className="mt-5 w-full sm:w-auto px-5 min-h-12 bg-lime-600 text-white font-bold text-[14px] inline-flex items-center justify-center gap-2 no-underline"
        style={bevelOut}
      >

        設定済みの条件で構成を作る
      </a>

      <div className="mt-5 pt-4 border-t border-stone-600">
        <h2 className="text-[15px] font-bold text-stone-100 mb-1">この条件での公開ファイル確認</h2>
        <p className="text-[12px] text-stone-400 leading-relaxed mb-3">
          {page.checkedAt}にModrinthで {page.version} / {page.loaderLabel} のファイルを照合しました。起動確認ではありません。構成作成時には最新情報を再取得します。
        </p>
        {!page.checkedMods.some(mod => mod.versionId) && <p className="text-[13px] mb-3">下記の代表5件には、この条件の配布ファイルがありません。他の候補を探すか、<a href="/mods/1.20.1/forge/tech/" className="underline">1.20.1 / Forgeの工業構成</a>と比較してください。</p>}
        <div className="grid sm:grid-cols-2 gap-3">
          {page.checkedMods.map((mod) => (
            <article key={mod.slug} className="p-3 bg-stone-800">
              <h3 className="text-[14px] font-bold text-lime-200"><a href={`https://modrinth.com/mod/${mod.slug}`} target="_blank" rel="noreferrer">{mod.name}</a></h3>
              <p className="text-[12px] mt-1">{mod.versionId ? <a className="underline" href={`https://modrinth.com/mod/${mod.slug}/version/${mod.versionId}`} target="_blank" rel="noreferrer">対応ファイルあり：{mod.versionNumber}</a> : mod.unavailable ? "配布ページを取得できず、対応未確認" : "この条件のファイルなし：候補から除外"}</p>
              <p className="text-[12px] text-stone-300 leading-relaxed mt-1">{mod.note}</p>
            </article>
          ))}
        </div>
      </div>

      <p className="mt-3 text-[12px] text-stone-400">候補が少ない場合は別のバージョンやローダーと比較してください。<a href="/articles/how-we-build-packs/" className="underline">選定方法と確認範囲</a></p>
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
