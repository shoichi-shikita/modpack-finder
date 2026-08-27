import { useEffect, useState } from "react";
import { Pickaxe, BookOpen } from "lucide-react";
import Filters from "./components/Filters";
import PackSummary from "./components/PackSummary";
import CategorySection from "./components/CategorySection";
import WarningBox from "./components/WarningBox";
import LoadingState from "./components/LoadingState";
import Guide from "./components/Guide";
import { getGameVersions } from "./services/modrinth";
import { buildPack } from "./utils/packBuilder";
import { removeMod, swapMod } from "./utils/packEdit";
import { buildMrpack, downloadBlob } from "./services/mrpack";
import { FALLBACK_VERSIONS } from "./data/categories";
import { bevelOut } from "./utils/styles";

export default function App() {
  const [versions, setVersions] = useState(FALLBACK_VERSIONS);
  const [version, setVersion] = useState(FALLBACK_VERSIONS[0]);
  const [loader, setLoader] = useState("fabric");
  const [themeIds, setThemeIds] = useState(["adventure"]);
  const [query, setQuery] = useState("");

  const [pack, setPack] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [downloading, setDownloading] = useState(false);
  const [downloadNote, setDownloadNote] = useState("");
  const [view, setView] = useState("finder"); // "finder" | "guide"
  const [busyId, setBusyId] = useState(null); // project_id being swapped
  const [editNote, setEditNote] = useState("");

  // Load live Minecraft versions once.
  useEffect(() => {
    let alive = true;
    getGameVersions()
      .then((v) => {
        if (alive && v.length) {
          setVersions(v);
          setVersion(v[0]);
        }
      })
      .catch(() => {
        /* keep fallback versions */
      });
    return () => {
      alive = false;
    };
  }, []);

  function toggleTheme(id) {
    setThemeIds((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  }

  async function handleGenerate() {
    if (themeIds.length === 0) {
      setError("やりたいことを1つ以上選んでください。");
      return;
    }
    setError("");
    setLoading(true);
    setPack(null);
    try {
      const result = await buildPack({ version, loader, themeIds, query });
      setPack(result);
    } catch {
      setError("MODパックの生成に失敗しました。もう一度試してください。");
    } finally {
      setLoading(false);
    }
  }

  async function handleDownload() {
    if (!pack) return;
    setDownloading(true);
    setDownloadNote("");
    try {
      const packName = `MPF ${version} ${loader}`;
      const result = await buildMrpack(pack, packName);
      downloadBlob(result.blob, result.name);

      const notes = [`${result.included} 個のMODを書き出しました。`];
      if (result.skipped > 0) {
        notes.push(`${result.skipped} 個はファイル情報を取得できず除外しました。`);
      }
      if (result.loaderMissing) {
        notes.push("ローダーのバージョンを自動取得できませんでした。ランチャー側で選び直してください。");
      }
      setDownloadNote(notes.join(" "));
    } catch {
      setDownloadNote("書き出しに失敗しました。もう一度試してください。");
    } finally {
      setDownloading(false);
    }
  }

  function handleRemove(projectId) {
    if (!pack) return;
    setEditNote("");
    setPack(removeMod(pack, projectId));
  }

  async function handleSwap(projectId) {
    if (!pack || busyId) return;
    setEditNote("");
    setBusyId(projectId);
    try {
      const { pack: next, error } = await swapMod(pack, projectId);
      if (error) {
        setEditNote(error);
      } else {
        setPack(next);
      }
    } catch {
      setEditNote("入れ替えに失敗しました。もう一度試してください。");
    } finally {
      setBusyId(null);
    }
  }

  function handleClear() {
    setPack(null);
    setError("");
    setDownloadNote("");
    setEditNote("");
  }

  const isEmptyPack = pack && pack.categories.length === 0;

  if (view === "guide") {
    return <Guide onBack={() => setView("finder")} />;
  }

  return (
    <div
      className="min-h-screen w-full font-mono text-stone-100 p-4 sm:p-6"
      style={{ background: "linear-gradient(160deg,#2b2b31 0%,#1c1c20 100%)" }}
    >
      <div className="mx-auto max-w-5xl">
        {/* header */}
        <div className="flex items-center gap-3 mb-5">
          <div
            className="grid place-items-center w-11 h-11 bg-lime-700"
            style={bevelOut}
          >
            <Pickaxe className="w-6 h-6" />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold tracking-widest uppercase leading-none">
              MOD PACK FINDER
            </h1>
            <p className="text-[11px] text-stone-400 mt-1">
              条件を入れると、1つの完成したMODパック構成を自動で設計します
            </p>
          </div>
          <button
            type="button"
            onClick={() => setView("guide")}
            className="shrink-0 px-3 py-2 bg-stone-800 text-stone-200 text-xs flex items-center gap-1"
            style={bevelOut}
          >
            <BookOpen className="w-4 h-4" />
            使い方
          </button>
        </div>

        <Filters
          versions={versions}
          version={version}
          onVersionChange={setVersion}
          loader={loader}
          onLoaderChange={setLoader}
          themeIds={themeIds}
          onToggleTheme={toggleTheme}
          query={query}
          onQueryChange={setQuery}
          onGenerate={handleGenerate}
          onClear={handleClear}
          loading={loading}
          canClear={!!pack}
          error={error}
        />

        {loading && <LoadingState />}

        {!loading && pack && (
          <>
            {pack.errors.length > 0 &&
              pack.errors.map((e, i) => (
                <div
                  key={`err-${e}-${i}`}
                  className="p-3 mb-3 bg-red-950/40 text-red-200 text-xs"
                  style={bevelOut}
                >
                  {e}
                </div>
              ))}

            {isEmptyPack ? (
              <div
                className="p-6 text-center text-stone-400 text-sm"
                style={{ ...bevelOut, background: "#33333a" }}
              >
                この条件に合うMODが見つかりませんでした。バージョンやローダー、テーマを変えて試してください。
              </div>
            ) : (
              <>
                <PackSummary
                  pack={pack}
                  onDownload={handleDownload}
                  downloading={downloading}
                />

                {downloadNote && (
                  <div
                    className="p-3 mb-5 bg-stone-800 text-stone-300 text-xs"
                    style={bevelOut}
                  >
                    {downloadNote}
                    <button
                      type="button"
                      onClick={() => setView("guide")}
                      className="ml-2 text-lime-400 underline"
                    >
                      使い方を見る →
                    </button>
                  </div>
                )}

                {pack.warnings.length > 0 && (
                  <div className="mb-5">
                    {pack.warnings.map((w) => (
                      <WarningBox key={w.id} warning={w} />
                    ))}
                  </div>
                )}

                {editNote && (
                  <div
                    className="p-3 mb-5 bg-stone-800 text-amber-200 text-xs"
                    style={bevelOut}
                  >
                    {editNote}
                  </div>
                )}

                {pack.categories.map((category) => (
                  <CategorySection
                    key={category.id}
                    category={category}
                    onRemove={handleRemove}
                    onSwap={handleSwap}
                    busyId={busyId}
                  />
                ))}
              </>
            )}
          </>
        )}

        <p className="text-center text-[10px] text-stone-600 mt-6">
          MODデータ提供: Modrinth ・ カードをタップで配布ページへ
        </p>
      </div>
    </div>
  );
}
