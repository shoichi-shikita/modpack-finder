
export default function SiteHeader() {
  const path = typeof window === "undefined" ? "" : window.location.pathname;
  return <>
    <a className="skip-link" href="#main-content">本文へ移動</a>
    <header className="site-header">
      <a className="site-brand" href="/">MOD PACK FINDER</a>
      <nav aria-label="メインナビゲーション">
        {[["/", "構成を作る"], ["/mods/", "構成一覧"], ["/guide/", "使い方"], ["/about/", "このサイトについて"]].map(([href, label]) =>
          <a key={href} href={href} aria-current={path === href ? "page" : undefined}>{label}</a>
        )}
      </nav>
    </header>

  </>;
}
