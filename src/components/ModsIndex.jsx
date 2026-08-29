import InfoPage from "./InfoPage";
import { SEO_LANDING_PAGES } from "../data/seoLandingPages";
import { bevelOut } from "../utils/styles";

export default function ModsIndex({ navigate }) {
  const byVersion = SEO_LANDING_PAGES.reduce((groups, page) => {
    if (!groups[page.version]) groups[page.version] = [];
    groups[page.version].push(page);
    return groups;
  }, {});

  return (
    <InfoPage
      title="Minecraft MOD構成一覧"
      navigate={navigate}
    >
      <p className="text-[14px] text-stone-200 leading-relaxed mb-5">
        人気のMinecraftバージョン、対応ローダー、遊びたいテーマから選べる構成ページです。
        各ページでは条件を設定済みの状態から、MODの自動選定・編集・.mrpack出力を始められます。
      </p>

      {Object.entries(byVersion).map(([version, pages]) => (
        <section key={version} className="mb-5">
          <h2 className="text-[15px] font-bold text-lime-200 mb-2">Minecraft {version}</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {pages.map((page) => (
              <a
                key={page.path}
                href={page.path}
                className="block p-4 bg-stone-800 hover:bg-stone-700 text-stone-100"
                style={bevelOut}
              >
                <span className="block text-[14px] font-bold">{page.loaderLabel}・{page.themeLabel}</span>
                <span className="block text-[12px] text-stone-300 mt-1 leading-relaxed">{page.intro}</span>
              </a>
            ))}
          </div>
        </section>
      ))}
    </InfoPage>
  );
}
