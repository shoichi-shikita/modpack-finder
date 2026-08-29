import InfoPage from "./InfoPage";
import { bevelOut } from "../utils/styles";

const ARTICLES = [
  {
    href: "/guide/",
    title: ".mrpackとは？導入手順",
    description: "ファイルの中身と、Modrinth App・Prism Launcherへ読み込む手順を解説します。",
  },
  {
    href: "/articles/loader-guide/",
    title: "Forge・Fabric・NeoForge・Quiltの違い",
    description: "4つのMod Loaderの特徴と、目的に合うローダーの選び方を整理します。",
  },
  {
    href: "/articles/modpack-not-starting/",
    title: "MODパックが起動しないときの確認順",
    description: "バージョン違い、前提MOD、メモリ、競合を安全な順番で切り分けます。",
  },
];

export default function ArticlesIndex({ navigate }) {
  return (
    <InfoPage title="MOD導入ガイド" navigate={navigate}>
      <p className="text-[14px] text-stone-200 leading-relaxed mb-5">
        Minecraft Java EditionへMODを導入するときに迷いやすい用語、ローダー選び、起動トラブルをまとめています。
        初めての場合は、.mrpackの導入手順から読むのがおすすめです。
      </p>

      <div className="grid gap-3">
        {ARTICLES.map((article) => (
          <a
            key={article.href}
            href={article.href}
            className="block p-4 bg-stone-800 hover:bg-stone-700 no-underline"
            style={bevelOut}
          >
            <h2 className="text-[15px] font-bold text-lime-200">{article.title}</h2>
            <p className="text-[13px] text-stone-300 leading-relaxed mt-1">{article.description}</p>
          </a>
        ))}
      </div>
    </InfoPage>
  );
}
