import InfoPage, { Section } from "./InfoPage";
import { SITE_CONFIG } from "../data/siteConfig";
import verified from "../data/verifiedExamples.json";

export default function SelectionGuide({ navigate }) {
  const example = verified.checks["/mods/1.21.1/fabric/magic"];
  return <InfoPage title="MODの選定方法と確認できる範囲" navigate={navigate}>
    <p className="text-[13px] text-stone-400 mb-4">運営・開発：{SITE_CONFIG.author} ／ ファイル照合：{verified.checkedAt}</p>
    <Section title="構成のたたき台を作るツールです">
      <p>MOD PACK FINDERは、遊びたいテーマを「地形」「移動」「収納」「描画」などの役割に分け、候補を組み合わせます。配布サイトの検索結果を一括導入するのではなく、役割ごとに選び、不要なものを外してから書き出す使い方を想定しています。</p>
      <p>ここでいう「対応」は、指定したMinecraftバージョンとローダー向けの公開ファイルがあることです。生成した組み合わせでゲームが起動することや、ワールドが壊れないことを保証するものではありません。</p>
    </Section>
    <Section title="候補を選ぶ順番">
      <ol className="list-decimal pl-5 space-y-2">
        <li>選択テーマの役割ごとにModrinthを検索します。ゲームのバージョンとローダーを検索条件に含めます。</li>
        <li>役割ごとの優先候補リストと除外ルールを適用します。ダウンロード数は通常10万以上、候補が不足する場合は2万以上まで基準を緩めます。優先候補などの例外があり、この数値は安全性や品質の認定ではありません。</li>
        <li>条件に合う公開バージョンのうち新しいものを確認し、ファイル情報を取得します。検索で見つかっても該当バージョンが取得できないMODは構成から外します。</li>
        <li>必須の依存MODを追加し、既知の重複・競合ルールに当たる組み合わせを警告します。結果の「選定理由」から、なぜ入ったかを確認できます。</li>
      </ol>
    </Section>
    <Section title="照合例：1.21.1 / Fabricで魔法を選んだ場合">
      <p>同じ「魔法MOD」でも、Forge用の配布があるだけではFabricでは使えません。テーマの代表例としていた5件を、Modrinth APIのゲームバージョン・ローダー条件で照合した結果です。</p>
      <ul className="list-disc pl-5 space-y-2">{example.map(mod => <li key={mod.slug}><b>{mod.name}</b>：{mod.versionId ? <a className="underline" href={`https://modrinth.com/mod/${mod.slug}/version/${mod.versionId}`}>条件に合う公開ファイルあり（{mod.versionNumber}）</a> : "該当ファイルなし"}</li>)}</ul>
      <p>この5件だけで構成全体が決まるわけではありません。Spell Engineのような基盤MODに対応ファイルがあっても、遊びたい呪文や装備がすべて揃う意味ではありません。目的のMODの配布ページを先に確認し、必要なら <a href="/mods/1.20.1/forge/magic/" className="underline">1.20.1 / Forgeの魔法構成</a>と比較してください。</p>
    </Section>
    <Section title="自動確認が届かない範囲">
      <ul className="list-disc pl-5 space-y-2">
        <li>ゲーム内での起動試験、フレームレート計測、長時間プレイは行っていません。ダウンロード数は動作実績の保証にはなりません。</li>
        <li>依存関係は公開データの必須指定とプロジェクトIDを元にたどります。特定のファイルだけを指定する依存関係や細かなバージョン制約、任意の追加MODを完全には処理できません。</li>
        <li>依存先の探索には45プロジェクトの上限があります。情報取得の失敗や上限により、必要なMODが揃わない場合があります。</li>
        <li>競合警告は登録済みの組み合わせが対象です。警告がないことは互換性の保証ではありません。設定ファイルの調整やMOD独自の導入手順は各作者の説明に従ってください。</li>
      </ul>
    </Section>
    <Section title="書き出す前に確認すること">
      <ol className="list-decimal pl-5 space-y-2">
        <li>目的のMODが入っているか確認し、役割の重なる地図・レシピ・描画MODを整理します。</li>
        <li>警告と各MODの配布ページを読みます。既存ワールドを使う場合はバックアップを取り、まず別のテスト用インスタンスで起動します。</li>
        <li>.mrpackをランチャーへ読み込みます。このファイルにはMOD本体ではなく、配布URL・ハッシュ・環境情報が入ります。</li>
        <li>起動できなければ <a className="underline" href="/articles/modpack-not-starting/">ログを使った切り分け手順</a>で確認してください。</li>
      </ol>
    </Section>
    <Section title="情報の更新と誤りの報告">
      <p>構成作成ではModrinthの情報を取得します。条件別ページに掲載した照合例は確認日付きの記録で、将来の配布状況を保証しません。役割の分類・日本語説明・除外ルールは当サイトの実装で管理しています。</p>
      <p>誤分類や不足を見つけた場合は、Minecraftバージョン、ローダー、MOD名、再現手順を <a href="/contact/" className="underline">お問い合わせ</a>へお知らせください。公開された修正内容は <a href={SITE_CONFIG.githubUrl} className="underline">ソースコード</a>で確認できます。</p>
    </Section>
  </InfoPage>;
}
