import { Mail, ExternalLink } from "lucide-react";
import InfoPage, { Section } from "./InfoPage";
import { SITE_CONFIG } from "../data/siteConfig";
import { bevelOut } from "../utils/styles";

export default function Contact({ navigate }) {
  const hasEmail = !!SITE_CONFIG.contactEmail;
  const hasX = !!SITE_CONFIG.xUrl;
  const hasAny = hasEmail || hasX;

  return (
    <InfoPage title="お問い合わせ" navigate={navigate}>
      <Section title="受け付けている内容">
        <p>次のようなご連絡を歓迎しています。</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>不具合・バグの報告</li>
          <li>MOD情報の誤り（対応バージョンや依存関係の間違いなど）</li>
          <li>機能の要望・改善のアイデア</li>
          <li>その他のお問い合わせ</li>
        </ul>
      </Section>

      <Section title="連絡方法">
        {hasAny ? (
          <div className="flex flex-col gap-2">
            {hasEmail && (
              <a
                href={`mailto:${SITE_CONFIG.contactEmail}`}
                className="px-3 py-2 bg-stone-800 text-stone-100 text-sm flex items-center gap-2 w-fit"
                style={bevelOut}
              >
                <Mail className="w-4 h-4 text-lime-400" />
                {SITE_CONFIG.contactEmail}
              </a>
            )}
            {hasX && (
              <a
                href={SITE_CONFIG.xUrl}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-2 bg-stone-800 text-stone-100 text-sm flex items-center gap-2 w-fit"
                style={bevelOut}
              >
                <ExternalLink className="w-4 h-4 text-lime-400" />
                X（旧Twitter）で連絡する
              </a>
            )}
          </div>
        ) : (
          <p className="text-stone-400">
            現在、連絡先を準備中です。近日中に問い合わせ方法を掲載します。
          </p>
        )}
      </Section>
    </InfoPage>
  );
}
