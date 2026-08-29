import InfoPage, { Section } from "./InfoPage";
import { SITE_CONFIG } from "../data/siteConfig";

function Ext({ href, children }) {
  return (
    <a href={href} target="_blank" rel="noreferrer" className="text-lime-400 underline">
      {children}
    </a>
  );
}

export default function Privacy({ navigate }) {
  return (
    <InfoPage title="プライバシーポリシー" navigate={navigate}>
      <Section>
        <p>
          {SITE_CONFIG.siteName}（以下「当サイト」）における、利用者の情報の取り扱いについて説明します。
          当サイトはMODパック構成の作成を支援するツールであり、会員登録やアカウント作成の機能はありません。
        </p>
      </Section>

      <Section title="アクセス解析">
        <p>
          当サイトは、利用状況の把握とサイト改善のために <b>Cloudflare Web Analytics</b> を利用しています。
          Cloudflare Web Analytics は、個人を特定するためのCookieを使用しない設計のアクセス解析サービスで、
          ページの表示回数や参照元、大まかな利用環境などの統計情報を収集します。
          これらの情報はサイトの改善のためにのみ利用します。
        </p>
      </Section>

      <Section title="広告について">
        {SITE_CONFIG.adsStatus === "off" ? (
          <p>当サイトは現在、広告を掲載しておらず、広告配信事業者のスクリプトも読み込んでいません。</p>
        ) : (
          <>
            <p>
              当サイトは第三者配信の広告サービスである <b>Google AdSense</b> を利用しています。
              {SITE_CONFIG.adsStatus === "pending" ? (
                <>
                  {" "}
                  現在は審査・準備の段階で、<b>広告コードおよび広告枠は表示していません</b>。
                  サイトの所有権確認には、AdSenseのアカウントメタタグとads.txtを使用しています。
                </>
              ) : (
                <> 当サイトのページには広告枠を掲載しています。</>
              )}
            </p>
            <p>広告配信にあたっては次の点にご留意ください。</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                Googleを含む第三者配信事業者は、Cookie等を使用して、利用者の当サイトや他サイトへの過去の
                アクセス情報に基づいて広告を配信することがあります。
              </li>
              <li>
                利用者は、<Ext href="https://www.google.com/settings/ads">Googleの広告設定</Ext>{" "}
                からパーソナライズ広告を無効にできます。また{" "}
                <Ext href="https://www.aboutads.info/choices/">www.aboutads.info</Ext>{" "}
                から、第三者配信事業者のCookieを無効にすることもできます。
              </li>
              <li>
                広告配信におけるGoogleのデータ利用については、
                <Ext href="https://policies.google.com/technologies/partner-sites">
                  Googleのポリシーと規約
                </Ext>
                をご確認ください。
              </li>
              <li>
                欧州経済領域（EEA）、英国、スイスの利用者に対しては、Googleが認定した同意管理プラットフォーム
                （CMP）を通じて同意を取得したうえで広告を配信します。同意管理が有効になるまでの間、
                これらの地域では広告枠を表示しません。
              </li>
            </ul>
          </>
        )}
      </Section>

      <Section title="外部サービスの利用">
        <p>
          当サイトはMOD情報の取得に、MOD配布プラットフォーム <b>Modrinth</b> の公開APIを利用しています。
          MODの検索や詳細取得の際、利用者のブラウザから Modrinth のサーバーへリクエストが送信されます。
          Modrinth 側での情報の取り扱いについては、Modrinth のプライバシーポリシーをご確認ください。
        </p>
      </Section>

      <Section title="ダウンロード（.mrpack）について">
        <p>
          当サイトの <b>.mrpack</b> 生成機能は、可能な限り利用者のブラウザ上で処理されます。
          出力される .mrpack は、各MODのダウンロード先やハッシュ等の情報をまとめたファイルであり、
          当サイトが利用者のMinecraftアカウント情報やログイン情報を収集・保存することはありません。
        </p>
      </Section>

      <Section title="免責事項">
        <p>
          当サイトが提案・表示するMODは外部の第三者が作成・配布しているものであり、
          その安全性・動作・互換性・継続的な提供について、当サイトは完全な保証を行うことはできません。
          MODおよびランチャー等の導入・利用は、利用者ご自身の判断と責任において行ってください。
          当サイトの利用によって生じた損害について、当サイトは責任を負いかねます。
        </p>
      </Section>

      <Section title="本ポリシーの変更">
        <p>
          本ポリシーの内容は、必要に応じて予告なく変更されることがあります。
          変更後の内容は、当サイトに掲載した時点から効力を生じるものとします。
        </p>
      </Section>
    </InfoPage>
  );
}
