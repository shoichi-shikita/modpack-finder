import { useEffect, useState } from "react";
import { getProjects } from "../services/modrinth";
import { SEO_LANDING_PAGES } from "../data/seoLandingPages";

const COLLECTIONS = [
  { theme: "adventure", slug: "terralith", name: "Terralith", note: "地形・構造物・探索支援" },
  { theme: "tech", slug: "create", name: "Create", note: "機械・加工・自動化" },
  { theme: "magic", slug: "botania", name: "Botania", note: "魔法・装備・新しい遊び方" },
  { theme: "light", slug: "sodium", name: "Sodium", note: "描画・メモリ・処理の最適化" },
];

export default function StarterLibrary() {
  const [projects, setProjects] = useState({});
  useEffect(() => {
    let alive = true;
    getProjects(COLLECTIONS.map(item => item.slug))
      .then(items => { if (alive) setProjects(Object.fromEntries(items.map(item => [item.slug, item]))); })
      .catch(() => { /* Text links remain usable if image metadata is unavailable. */ });
    return () => { alive = false; };
  }, []);

  return <section className="start-panel" aria-labelledby="library-title">
    <div className="library-heading">
      <div><h2 id="library-title">テーマから探す</h2><p>条件を設定して始める、4つの構成。</p></div>
      <a href="/mods/">構成一覧</a>
    </div>
    <div className="collection-grid">
      {COLLECTIONS.map(item => {
        const page = SEO_LANDING_PAGES.find(p => p.theme === item.theme && p.checkedMods.some(mod => mod.slug === item.slug && mod.versionId));
        const project = projects[item.slug];
        const gallery = project?.gallery || [];
        const featured = item.theme === "adventure";
        const cover = featured ? gallery.find(image => image.featured) || gallery[0] : null;
        return <article className={`collection${featured ? " collection-featured" : ""}`} key={item.theme}>
          <a className="collection-link" href={page.href}>
            <div className={`collection-art${cover ? "" : " collection-art-icon"}`}>
              {(cover?.url || project?.icon_url) && <img src={cover?.raw_url || cover?.url || project.icon_url}
                alt="" loading="lazy" onError={e => { e.currentTarget.style.visibility = "hidden"; }} />}
            </div>
            <div className="collection-copy">
              <h3>{page.themeLabel}</h3><p>{item.note}</p>
              <small>{page.version} / {page.loaderLabel}</small>
            </div>
          </a>
          <div className="collection-source">参考MOD: <a href={`https://modrinth.com/mod/${item.slug}`} target="_blank" rel="noreferrer">{project?.title || item.name}</a></div>
        </article>;
      })}
    </div>
    <p className="library-note">画像はModrinth掲載の参考MODです。対応バージョンと依存関係は構成時に確認します。</p>
  </section>;
}
