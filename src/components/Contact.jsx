import { Mail, ExternalLink, FileText, Bug } from "lucide-react";
import InfoPage, { Section } from "./InfoPage";
import { SITE_CONFIG, hasContactChannel } from "../data/siteConfig";
import { bevelOut } from "../utils/styles";

function Channel({ icon: Icon, href, children, external }) {
  return (
    <a
      href={href}
      {...(external ? { target: "_blank", rel: "noreferrer" } : {})}
      className="px-3 min-h-12 bg-stone-800 text-stone-100 text-[14px] inline-flex items-center gap-2 w-fit no-underline"
      style={bevelOut}
    >
      <Icon className="w-4 h-4 text-lime-400" aria-hidden="true" />
      {children}
    </a>
  );
}

export default function Contact({ navigate }) {
  const { contactFormUrl, contactEmail, xUrl, githubUrl } = SITE_CONFIG;

  return (
    <InfoPage title="お問い合わせ" navigate={navigate}>
      <Section title="受け付けている内容">
        <p>次のようなご連絡を歓迎しています。</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>不具合・バグの報告</li>
          <li>MOD情報の誤り（対応バージョンや依存関係の間違い、日本語説明の誤りなど）</li>
          <li>「このMODは定番なのに出てこない」といった選定への指摘</li>
          <li>機能の要望・改善のアイデア</li>
        </ul>
        <p className="text-stone-300">
          このツールはMODの分類をModrinthの公開データから機械的に組み立てているため、
          利用者からの指摘が精度改善の一番の材料になります。
        </p>
      </Section>

      <Section title="連絡方法">
        {hasContactChannel() ? (
          <div className="flex flex-col gap-2">
            {contactFormUrl && (
              <Channel icon={FileText} href={contactFormUrl} external>
                お問い合わせフォーム
              </Channel>
            )}
            {contactEmail && (
              <Channel icon={Mail} href={`mailto:${contactEmail}`}>
                {contactEmail}
              </Channel>
            )}
            {githubUrl && (
              <Channel icon={Bug} href={`${githubUrl.replace(/\/+$/, "")}/issues`} external>
                GitHub Issues で報告する
              </Channel>
            )}
            {xUrl && (
              <Channel icon={ExternalLink} href={xUrl} external>
                X（旧Twitter）で連絡する
              </Channel>
            )}
          </div>
        ) : (
          <p className="text-amber-200">
            現在、問い合わせ窓口を準備中です。
            <br />
            <span className="text-stone-300">
              （サイト運営者へ: <code className="text-stone-100">src/data/siteConfig.js</code> の{" "}
              <code className="text-stone-100">contactFormUrl</code> /{" "}
              <code className="text-stone-100">contactEmail</code> /{" "}
              <code className="text-stone-100">githubUrl</code> /{" "}
              <code className="text-stone-100">xUrl</code>{" "}
              のいずれかにURLを入れると、このページに連絡先ボタンが表示されます）
            </span>
          </p>
        )}
      </Section>
    </InfoPage>
  );
}
