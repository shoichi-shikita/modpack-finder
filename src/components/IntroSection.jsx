import { Info, ListChecks, HelpCircle, Layers3 } from "lucide-react";
import { FAQ } from "../utils/seo";
import { bevelOut, bevelIn } from "../utils/styles";
import { SEO_LANDING_PAGES } from "../data/seoLandingPages";

const STEPS = [
  "Minecraftのバージョンを選ぶ",
  "Mod Loader（Fabric / Forge / NeoForge / Quilt）を選ぶ",
  "遊びたいテーマを選ぶ（複数OK）",
  "「この条件で構成を作る」を押す",
  "内容を確認し、不要なMODは外す・入れ替える・足りないMODを追加する",
  ".mrpack として書き出してランチャーに読み込む",
];

export default function IntroSection() {
  return (
    <div className="mt-8">
      <section className="p-4 sm:p-5 mb-5" style={{ ...bevelOut, background: "#33333a" }}>
        <div className="flex items-center gap-2 mb-2">
          <Info className="w-5 h-5 text-lime-400" aria-hidden="true" />
          <h2 className="text-[15px] font-bold tracking-wide">MOD PACK FINDER とは？</h2>
        </div>
        <p className="text-[14px] text-stone-200 leading-relaxed">
          Minecraftのバージョン・Mod Loader・遊びたいテーマを選ぶだけで、条件に合うMODを役割ごとに選び、
          依存MODまで含めたMODパック構成を自動で組み立てる無料ツールです。
          「MODは入れたいけど、対応バージョンや依存関係を1つずつ調べるのが大変」という人に向いています。
          できあがった構成は <b className="text-stone-100">.mrpack</b> として書き出せ、Modrinth App や
          Prism Launcher に読み込めば依存MODごとまとめて導入できます。
        </p>
        <p className="text-[13px] text-stone-300 leading-relaxed mt-2">
          MODの情報は Modrinth の公開APIから取得し、対応バージョンのファイルが実在するMODだけを採用しています。
          日本語の説明は当サイトが独自に付けているもので、未対応のMODは Modrinth の英語原文を表示します。
        </p>
      </section>

      <section className="p-4 sm:p-5 mb-5" style={{ ...bevelOut, background: "#33333a" }}>
        <div className="flex items-center gap-2 mb-3">
          <ListChecks className="w-5 h-5 text-lime-400" aria-hidden="true" />
          <h2 className="text-[15px] font-bold tracking-wide">使い方</h2>
        </div>
        <ol className="space-y-2">
          {STEPS.map((s, i) => (
            <li key={s} className="flex gap-3 items-start">
              <span
                className="shrink-0 w-6 h-6 grid place-items-center bg-lime-700 text-white text-[12px] font-bold"
                style={bevelIn}
              >
                {i + 1}
              </span>
              <span className="text-[14px] text-stone-200 leading-relaxed pt-0.5">{s}</span>
            </li>
          ))}
        </ol>
      </section>

      <section className="p-4 sm:p-5 mb-5" style={{ ...bevelOut, background: "#33333a" }}>
        <div className="flex items-center gap-2 mb-3">
          <Layers3 className="w-5 h-5 text-lime-400" aria-hidden="true" />
          <h2 className="text-[15px] font-bold tracking-wide">人気のMOD構成から始める</h2>
        </div>
        <p className="text-[13px] text-stone-300 leading-relaxed mb-3">
          バージョン・ローダー・テーマを設定済みのページから、すぐに構成づくりを始められます。
        </p>
        <div className="grid sm:grid-cols-2 gap-2">
          {SEO_LANDING_PAGES.slice(0, 6).map((page) => (
            <a
              key={page.path}
              href={page.path}
              className="px-3 min-h-11 flex items-center bg-stone-800 text-[13px] text-lime-200 hover:text-lime-100 underline"
              style={bevelOut}
            >
              Minecraft {page.version} {page.loaderLabel}・{page.themeLabel}
            </a>
          ))}
        </div>
        <a href="/mods" className="inline-block mt-3 text-[13px] text-lime-300 hover:text-lime-200 underline">
          すべてのMOD構成を見る →
        </a>
      </section>

      <section className="p-4 sm:p-5" style={{ ...bevelOut, background: "#33333a" }}>
        <div className="flex items-center gap-2 mb-3">
          <HelpCircle className="w-5 h-5 text-lime-400" aria-hidden="true" />
          <h2 className="text-[15px] font-bold tracking-wide">よくある質問</h2>
        </div>
        <dl className="space-y-3">
          {FAQ.map((f) => (
            <div key={f.q}>
              <dt className="text-[14px] font-bold text-lime-200">Q. {f.q}</dt>
              <dd className="text-[14px] text-stone-200 leading-relaxed mt-0.5">{f.a}</dd>
            </div>
          ))}
        </dl>
      </section>
    </div>
  );
}
