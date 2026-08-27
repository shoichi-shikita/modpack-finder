import InfoPage, { Section } from "./InfoPage";
import { SITE_CONFIG } from "../data/siteConfig";

export default function About({ navigate }) {
  return (
    <InfoPage title="このツールについて" navigate={navigate}>
      <Section title="MOD PACK FINDER とは">
        <p>
          {SITE_CONFIG.siteName} は、Minecraft の MOD 探しと MODパックづくりを楽にするための、
          無料のWebツールです。ひとつずつMODを探して互換性や依存関係を調べる作業を、
          条件を選ぶだけである程度まとめてくれます。
        </p>
      </Section>

      <Section title="できること">
        <p>
          Minecraftのバージョン、Mod Loader（Fabric / Forge / NeoForge / Quilt）、
          そして「冒険」「魔法」「軽量化」などの遊びたいテーマを選ぶと、条件に合うMODを役割ごとに
          選んで、1つのMODパック構成として提案します。
        </p>
        <p>具体的には次のことを行います。</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>選んだバージョン・ローダーに対応するMODかどうかの確認</li>
          <li>各MODが必要とする依存MODの自動追加</li>
          <li>不要なMODの削除や、別候補への入れ替え</li>
          <li>競合しやすい組み合わせの警告表示</li>
          <li>完成した構成の <b>.mrpack</b> 形式での出力（ランチャーにそのまま読み込めます）</li>
        </ul>
      </Section>

      <Section title="データについて">
        <p>
          MODの情報（名前・説明・ダウンロード数・対応バージョン・依存関係など）は、
          MODの配布プラットフォームである <b>Modrinth</b> の公開データ／APIを利用して取得しています。
          各MODの著作権およびその他の権利は、それぞれのMOD作者・権利者に帰属します。
        </p>
      </Section>

      <Section title="非公式ツールであることについて">
        <p>
          本サイトは個人が開発・運営している非公式のファンツールです。
          Mojang Studios、Microsoft、Modrinth をはじめとする公式サービスではなく、
          これらの企業・団体との提携や、承認・公認を受けたものでもありません。
        </p>
        <p>
          「Minecraft」は Mojang Studios の商標です。本サイトはあくまで有志による支援ツールであり、
          利用によって生じたいかなる結果についても、各MODおよびランチャー等の利用はユーザーご自身の
          判断と責任で行ってください。
        </p>
      </Section>
    </InfoPage>
  );
}
