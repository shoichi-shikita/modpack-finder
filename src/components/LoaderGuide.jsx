import InfoPage, { Section } from "./InfoPage";
import { bevelOut } from "../utils/styles";

const LOADERS = [
  {
    name: "Fabric",
    summary: "軽量で更新が速く、軽量化・便利系MODが豊富です。",
    fit: "新しいMinecraftバージョンを早く試したい人、Sodiumなどの軽量化を重視する人向け。",
  },
  {
    name: "Forge",
    summary: "長い実績があり、特に1.20.1以前の大型MODが充実しています。",
    fit: "工業・魔法・冒険の大型MODを組み合わせたい人、既存の定番構成を使いたい人向け。",
  },
  {
    name: "NeoForge",
    summary: "Forgeから分かれた新しいローダーで、1.20.1以降を中心に対応が広がっています。",
    fit: "新しい環境でForge系の大型MODを使いたい人向け。配布ファイルがNeoForge対応か確認が必要です。",
  },
  {
    name: "Quilt",
    summary: "Fabricとの互換性を意識したローダーですが、専用MODと利用者数は比較的少なめです。",
    fit: "使いたいMODがQuiltを明示的にサポートしている場合に選ぶのが安全です。",
  },
];

export default function LoaderGuide({ navigate }) {
  return (
    <InfoPage title="Forge・Fabric・NeoForge・Quiltの違い" navigate={navigate}>
      <Section title="Mod Loaderとは">
        <p>
          Mod Loaderは、Minecraft本体とMODの間に入ってMODを読み込む仕組みです。同じMinecraft
          1.21.1用でも、Fabric版のMODをForgeへ入れることはできません。バージョンとローダーの両方が一致した
          配布ファイルを選ぶ必要があります。
        </p>
      </Section>

      <section className="mb-5">
        <h2 className="text-[15px] font-bold text-lime-300 mb-2">4つのローダーの特徴</h2>
        <div className="grid sm:grid-cols-2 gap-3">
          {LOADERS.map((loader) => (
            <article key={loader.name} className="p-4 bg-stone-800" style={bevelOut}>
              <h3 className="text-[15px] font-bold text-stone-100">{loader.name}</h3>
              <p className="text-[13px] text-stone-200 leading-relaxed mt-1">{loader.summary}</p>
              <p className="text-[12px] text-stone-400 leading-relaxed mt-2">{loader.fit}</p>
            </article>
          ))}
        </div>
      </section>

      <Section title="迷ったときの選び方">
        <ol className="list-decimal pl-5 space-y-2">
          <li>絶対に使いたいMODがあるなら、そのMODが対応するローダーを選ぶ。</li>
          <li>大型の工業・魔法MOD中心なら、対象バージョンのForgeまたはNeoForge対応を確認する。</li>
          <li>軽量化や便利系中心なら、Fabricを最初の候補にする。</li>
          <li>使いたいMODが複数ある場合は、全MODに共通するローダーとMinecraftバージョンを探す。</li>
        </ol>
      </Section>

      <Section title="ForgeとNeoForgeは同じではありません">
        <p>
          名前や仕組みが近くても、配布ファイルは別です。「Forge / NeoForge」と両方書かれたMODもあれば、
          片方だけ対応するMODもあります。ファイル名だけで判断せず、配布ページの対応ローダーを確認してください。
        </p>
      </Section>

      <div className="text-center mb-5">
        <a href="/mods/" className="px-5 min-h-12 bg-lime-600 text-white font-bold text-[14px] inline-flex items-center no-underline" style={bevelOut}>
          バージョン・ローダー別のMOD構成を見る
        </a>
      </div>
    </InfoPage>
  );
}
