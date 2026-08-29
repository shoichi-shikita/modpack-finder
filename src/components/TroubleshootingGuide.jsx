import InfoPage, { Section } from "./InfoPage";
import { bevelOut } from "../utils/styles";

const CHECKS = [
  ["1. Minecraftバージョンとローダー", "MOD、Minecraft、Fabric / Forge / NeoForge / Quiltの組み合わせが一致しているか確認します。1.20.1用MODは1.21.1では動きません。"],
  ["2. 前提MOD", "エラーに Fabric API、Architectury、GeckoLib などの名前が出た場合は、必要な前提MODが不足している可能性があります。"],
  ["3. Javaとメモリ", "ランチャーが推奨するJavaを使い、MODが20個程度なら4GB、50個を超えるなら6〜8GBを目安に割り当てます。割り当て過ぎも不安定化の原因になります。"],
  ["4. 描画・軽量化MODの重複", "SodiumとEmbeddiumなど、同じ役割の描画エンジンを同時に入れないでください。シェーダー関連も対応ローダーをそろえます。"],
  ["5. 直前に追加したMOD", "最後に追加したMODから外して起動します。原因が不明なら半分ずつ外す二分探索が、1個ずつ試すより速く特定できます。"],
];

export default function TroubleshootingGuide({ navigate }) {
  return (
    <InfoPage title="MODパックが起動しない原因と確認順" navigate={navigate}>
      <Section title="最初にワールドをバックアップ">
        <p>
          起動テストの前に、既存ワールドのフォルダをコピーしてください。特にバイオーム、構造物、ディメンションを
          追加するMODは、外した状態で同じワールドを開くとブロックや地形が失われることがあります。
        </p>
      </Section>

      <section className="mb-5">
        <h2 className="text-[15px] font-bold text-lime-300 mb-2">上から順番に確認する</h2>
        <div className="space-y-3">
          {CHECKS.map(([title, body]) => (
            <article key={title} className="p-4 bg-stone-800" style={bevelOut}>
              <h3 className="text-[14px] font-bold text-stone-100">{title}</h3>
              <p className="text-[13px] text-stone-300 leading-relaxed mt-1">{body}</p>
            </article>
          ))}
        </div>
      </section>

      <Section title="ログで見る場所">
        <p>
          ランチャーのインスタンスフォルダにある <b>logs/latest.log</b> と <b>crash-reports</b> を確認します。
          「requires」「missing」「incompatible」の近くに表示されるMOD名は手がかりになります。ただし最後の行に出た
          MODが必ず原因とは限らないため、その少し前から読みます。
        </p>
      </Section>

      <Section title="安全な切り分け手順">
        <ol className="list-decimal pl-5 space-y-2">
          <li>元の構成をコピーし、テスト用インスタンスを作る。</li>
          <li>直前に追加・更新したMODを戻して起動する。</li>
          <li>直らなければ、内容MODを半分ずつ外して原因の範囲を狭める。</li>
          <li>原因MODが分かったら、対応版へ変更するか、そのMODだけを外す。</li>
          <li>正常起動後に新規ワールドで動作を確認してから、本番ワールドを開く。</li>
        </ol>
      </Section>

      <div className="flex flex-wrap justify-center gap-3 mb-5">
        <a href="/guide/" className="px-4 min-h-11 bg-stone-800 text-lime-200 text-[13px] inline-flex items-center underline" style={bevelOut}>
          .mrpackの導入手順
        </a>
        <a href="/" className="px-4 min-h-11 bg-lime-600 text-white font-bold text-[13px] inline-flex items-center no-underline" style={bevelOut}>
          構成を作り直す
        </a>
      </div>
    </InfoPage>
  );
}
