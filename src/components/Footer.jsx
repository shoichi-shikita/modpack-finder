import { SITE_CONFIG } from "../data/siteConfig";

export default function Footer({ navigate }) {
  const go = (e, path) => {
    // Real hrefs so the links are crawlable and middle-click / "open in new
    // tab" behave. The click handler keeps SPA navigation for normal clicks.
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
    e.preventDefault();
    navigate(path);
  };

  const linkCls = "text-stone-300 hover:text-lime-300 underline";

  const LINKS = [
    ["/", "ホーム"],
    ["/guide", "使い方ガイド"],
    ["/about", "このツールについて"],
    ["/privacy", "プライバシーポリシー"],
    ["/contact", "お問い合わせ"],
  ];

  return (
    <footer className="mt-10 pt-4 border-t border-stone-600 text-center text-[13px] text-stone-300 pb-8">
      <nav className="flex flex-wrap justify-center gap-x-4 gap-y-2 mb-3">
        {LINKS.map(([path, label]) => (
          <a key={path} href={path} onClick={(e) => go(e, path)} className={linkCls}>
            {label}
          </a>
        ))}
      </nav>

      <p className="text-[12px] text-stone-400 mb-1">
        {SITE_CONFIG.author && <>制作: {SITE_CONFIG.author}　</>}
        最終更新: {SITE_CONFIG.lastUpdated}
      </p>
      <p className="text-[12px] text-stone-400">
        MOD PACK FINDER is an unofficial fan-made tool. Not affiliated with Mojang,
        Microsoft or Modrinth.
      </p>
    </footer>
  );
}
