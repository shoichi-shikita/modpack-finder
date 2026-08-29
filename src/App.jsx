import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Pickaxe, BookOpen, RefreshCw } from "lucide-react";
import Filters from "./components/Filters";
import PackSummary from "./components/PackSummary";
import CategorySection from "./components/CategorySection";
import AddModBox from "./components/AddModBox";
import WarningBox from "./components/WarningBox";
import LoadingState from "./components/LoadingState";
import Guide from "./components/Guide";
import About from "./components/About";
import Privacy from "./components/Privacy";
import Contact from "./components/Contact";
import Footer from "./components/Footer";
import AdSlot from "./components/AdSlot";
import IntroSection from "./components/IntroSection";
import { getGameVersions } from "./services/modrinth";
import { buildPack, buildPackFromSlugs, packSignature } from "./utils/packBuilder";
import { removeMod, swapMod, addMod } from "./utils/packEdit";
import { buildMrpack, downloadBlob } from "./services/mrpack";
import { FALLBACK_VERSIONS, LOADERS } from "./data/categories";
import { isLoaderSupported, firstSupportedLoader } from "./data/loaderSupport";
import { applyRouteMeta } from "./utils/seo";
import {
  readUrlState, syncUrl, shareUrl, packSlugs, saveSettings, loadSettings,
} from "./utils/urlState";
import { fmtBytes } from "./utils/format";
import { bevelOut } from "./utils/styles";

// Tiny history-based router (no dependency). Cloudflare Pages serves index.html
// for the known routes via public/_redirects, so deep links like /about work.
function normalizePath(p) {
  const s = (p || "/").replace(/\/+$/, "");
  return s === "" ? "/" : s;
}

const LOADER_ORDER = LOADERS.map((l) => l.id);

export default function App() {
  const [route, setRoute] = useState(() => normalizePath(window.location.pathname));

  // Initial state: URL first (shared link), then last-used settings, then defaults.
  const initial = useMemo(() => {
    const url = readUrlState();
    const saved = url.hasAny ? null : loadSettings();
    const src = url.hasAny ? url : saved || {};
    const version = src.version || FALLBACK_VERSIONS[0];
    const wanted = src.loader || "fabric";
    return {
      version,
      loader: isLoaderSupported(wanted, version) ? wanted : firstSupportedLoader(version, LOADER_ORDER),
      themeIds: src.themeIds && src.themeIds.length ? src.themeIds : ["adventure"],
      query: src.query || "",
      includePerformance:
        src.includePerformance === undefined || src.includePerformance === null
          ? true
          : !!src.includePerformance,
      slugs: url.hasAny ? url.slugs : [],
      autoRun: url.hasAny,
    };
  }, []);

  const [versions, setVersions] = useState(FALLBACK_VERSIONS);
  const [version, setVersion] = useState(initial.version);
  const [loader, setLoader] = useState(initial.loader);
  const [themeIds, setThemeIds] = useState(initial.themeIds);
  const [query, setQuery] = useState(initial.query);
  const [includePerformance, setIncludePerformance] = useState(initial.includePerformance);

  const [pack, setPack] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [downloading, setDownloading] = useState(false);
  const [downloadNote, setDownloadNote] = useState("");
  const [busyId, setBusyId] = useState(null);
  const [editNote, setEditNote] = useState("");
  const [copied, setCopied] = useState(false);

  const resultRef = useRef(null);
  const scrollWanted = useRef(false);
  const didAutoRun = useRef(false);

  // --- routing -------------------------------------------------------------
  useEffect(() => {
    const onPop = () => setRoute(normalizePath(window.location.pathname));
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  useEffect(() => {
    applyRouteMeta(route);
  }, [route]);

  const navigate = useCallback((path) => {
    const p = normalizePath(path);
    if (p !== normalizePath(window.location.pathname)) {
      window.history.pushState({}, "", p);
    }
    setRoute(p);
    window.scrollTo(0, 0);
  }, []);

  // --- live version list ---------------------------------------------------
  useEffect(() => {
    let alive = true;
    getGameVersions()
      .then((v) => {
        if (!alive || !v.length) return;
        setVersions(v);
        // Only jump to the newest release when the user hasn't chosen one.
        setVersion((cur) => (v.includes(cur) ? cur : v[0]));
      })
      .catch(() => {
        /* keep fallback versions */
      });
    return () => {
      alive = false;
    };
  }, []);

  // --- keep the URL and localStorage in step with the form -----------------
  const formState = useMemo(
    () => ({ version, loader, themeIds, query, includePerformance }),
    [version, loader, themeIds, query, includePerformance]
  );

  useEffect(() => {
    if (route !== "/") return;
    syncUrl({ ...formState, slugs: packSlugs(pack) });
    saveSettings(formState);
  }, [route, formState, pack]);

  // Selecting a version a loader never supported silently produced unusable
  // packs (1.7.10 x Fabric). Correct the loader as part of the change itself.
  const handleVersionChange = useCallback(
    (next) => {
      setVersion(next);
      if (isLoaderSupported(loader, next)) return;
      const fallback = firstSupportedLoader(next, LOADER_ORDER);
      setLoader(fallback);
      setError(
        `Minecraft ${next} には ${
          LOADERS.find((l) => l.id === loader)?.label || loader
        } が存在しないため、${
          LOADERS.find((l) => l.id === fallback)?.label || fallback
        } に切り替えました。`
      );
    },
    [loader]
  );

  // --- generate ------------------------------------------------------------
  const runBuild = useCallback(
    async (opts) => {
      setError("");
      setEditNote("");
      setDownloadNote("");
      setLoading(true);
      setPack(null);
      scrollWanted.current = true;
      try {
        const result = opts && opts.slugs && opts.slugs.length
          ? await buildPackFromSlugs({
              version: opts.version,
              loader: opts.loader,
              slugs: opts.slugs,
              signature: packSignature({
                version: opts.version,
                loader: opts.loader,
                themeIds: opts.themeIds,
                query: opts.query,
                includePerformance: opts.includePerformance,
              }),
            })
          : await buildPack(opts);
        setPack(result);
      } catch {
        setError("MODパックの生成に失敗しました。時間をおいてもう一度お試しください。");
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Open a shared link straight into its result.
  useEffect(() => {
    if (didAutoRun.current || !initial.autoRun || route !== "/") return;
    didAutoRun.current = true;
    runBuild({
      version: initial.version,
      loader: initial.loader,
      themeIds: initial.themeIds,
      query: initial.query,
      includePerformance: initial.includePerformance,
      slugs: initial.slugs,
    });
  }, [initial, route, runBuild]);

  // Move the viewport to the result. Without this the page looks unchanged
  // after pressing the button, because the result renders below the fold.
  useEffect(() => {
    if (!scrollWanted.current) return;
    if (!loading && !pack) return;
    const el = resultRef.current;
    if (!el) return;
    scrollWanted.current = loading; // keep the intent until the result lands
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
  }, [loading, pack]);

  function toggleTheme(id) {
    setThemeIds((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  }

  async function handleGenerate() {
    if (themeIds.length === 0) {
      setError("やりたいことを1つ以上選んでください。");
      return;
    }
    await runBuild({ version, loader, themeIds, query, includePerformance });
  }

  async function handleDownload() {
    if (!pack) return;
    setDownloading(true);
    setDownloadNote("");
    try {
      const themePart = themeIds.slice(0, 3).join("-");
      const stamp = new Date().toISOString().slice(0, 10).replace(/-/g, "");
      const packName = `MPF ${version} ${loader}${themePart ? ` ${themePart}` : ""} ${stamp}`;
      const result = await buildMrpack(pack, packName);
      downloadBlob(result.blob, result.name);

      const notes = [
        `${result.included} 個のMODを書き出しました（約 ${fmtBytes(result.totalSize)}）。`,
      ];
      if (result.skipped > 0) {
        notes.push(`${result.skipped} 個はファイル情報を取得できず除外しました。`);
      }
      if (result.clientOnly > 0) {
        notes.push(
          `うち ${result.clientOnly} 個はクライアント専用MODです（サーバーに入れる場合は除いてください）。`
        );
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

  async function handleCopyLink() {
    try {
      await navigator.clipboard.writeText(
        shareUrl({ ...formState, slugs: packSlugs(pack) })
      );
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      setEditNote("リンクのコピーに失敗しました。アドレスバーのURLをそのままコピーしてください。");
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
      const { pack: next, error: swapError } = await swapMod(pack, projectId);
      if (swapError) setEditNote(swapError);
      else setPack(next);
    } catch {
      setEditNote("入れ替えに失敗しました。もう一度試してください。");
    } finally {
      setBusyId(null);
    }
  }

  async function handleAdd(idOrSlug) {
    if (!pack) return { ok: false };
    setEditNote("");
    try {
      const { pack: next, error: addError } = await addMod(pack, idOrSlug);
      if (addError) {
        setEditNote(addError);
        return { ok: false };
      }
      setPack(next);
      return { ok: true };
    } catch {
      setEditNote("MODの追加に失敗しました。もう一度試してください。");
      return { ok: false };
    }
  }

  function handleClear() {
    setPack(null);
    setError("");
    setDownloadNote("");
    setEditNote("");
  }

  // --- routing -------------------------------------------------------------
  if (route === "/about") return <About navigate={navigate} />;
  if (route === "/privacy") return <Privacy navigate={navigate} />;
  if (route === "/contact") return <Contact navigate={navigate} />;
  if (route === "/guide") return <Guide onBack={() => navigate("/")} navigate={navigate} />;

  const isEmptyPack = pack && pack.categories.length === 0;
  const currentSignature = packSignature({ version, loader, themeIds, query, includePerformance });
  const isStale = !!pack && !!pack.signature && pack.signature !== currentSignature;

  return (
    <div
      className="min-h-screen w-full font-mono text-stone-100 p-4 sm:p-6"
      style={{ background: "linear-gradient(160deg,#2b2b31 0%,#1c1c20 100%)" }}
    >
      <div className="mx-auto max-w-5xl">
        <header className="flex items-center gap-3 mb-4">
          <div className="grid place-items-center w-11 h-11 bg-lime-700 shrink-0" style={bevelOut}>
            <Pickaxe className="w-6 h-6" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[12px] tracking-[0.2em] uppercase text-lime-400 leading-none mb-1">
              MOD PACK FINDER
            </p>
            <h1 className="text-lg sm:text-2xl font-bold leading-tight">
              マイクラのMOD構成を、3クリックで組み立てる
            </h1>
          </div>
          <button
            type="button"
            onClick={() => navigate("/guide")}
            className="shrink-0 px-3 min-h-11 bg-stone-800 text-stone-100 text-[13px] flex items-center gap-1"
            style={bevelOut}
          >
            <BookOpen className="w-4 h-4" />
            使い方
          </button>
        </header>

        <p className="text-[13px] text-stone-300 leading-relaxed mb-3 max-w-3xl">
          バージョン・Mod Loader・遊びたい方向を選ぶだけ。対応バージョンと依存MODを確認済みの構成を{" "}
          <b className="text-stone-100">.mrpack</b> で書き出し、Modrinth App / Prism Launcher
          にドラッグするだけで導入できます。
        </p>
        <ul className="flex flex-wrap gap-x-4 gap-y-1 text-[12px] text-stone-400 mb-5">
          <li>✓ 登録不要</li>
          <li>✓ 完全無料</li>
          <li>✓ Modrinth の公開データを使用</li>
          <li>✓ 所要 30 秒</li>
        </ul>

        <Filters
          versions={versions}
          version={version}
          onVersionChange={handleVersionChange}
          loader={loader}
          onLoaderChange={setLoader}
          themeIds={themeIds}
          onToggleTheme={toggleTheme}
          query={query}
          onQueryChange={setQuery}
          includePerformance={includePerformance}
          onTogglePerformance={() => setIncludePerformance((v) => !v)}
          onGenerate={handleGenerate}
          onClear={handleClear}
          loading={loading}
          canClear={!!pack}
          error={error}
        />

        <div ref={resultRef} className="scroll-mt-4" />

        {loading && <LoadingState />}

        {!loading && pack && (
          <>
            {isStale && (
              <div
                className="p-3 mb-4 bg-amber-950/60 text-amber-100 text-[13px] flex flex-wrap items-center gap-2"
                style={bevelOut}
                role="status"
              >
                <RefreshCw className="w-4 h-4 text-amber-300 shrink-0" />
                <span className="flex-1 min-w-0">
                  条件が変更されています。下の構成は変更前のものです。
                </span>
                <button
                  type="button"
                  onClick={handleGenerate}
                  className="px-3 min-h-11 bg-lime-600 text-white text-[13px] font-bold"
                  style={bevelOut}
                >
                  この条件で作り直す
                </button>
              </div>
            )}

            {pack.errors.length > 0 &&
              pack.errors.map((e, i) => (
                <div
                  key={`err-${e}-${i}`}
                  className="p-3 mb-3 bg-red-950/50 text-red-100 text-[13px]"
                  style={bevelOut}
                >
                  {e}
                </div>
              ))}

            {isEmptyPack ? (
              <div
                className="p-6 text-center text-stone-300 text-[13px]"
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
                  disabled={isStale}
                  onCopyLink={handleCopyLink}
                  copied={copied}
                  onOpenGuide={() => navigate("/guide")}
                />

                {downloadNote && (
                  <div
                    className="p-3 mb-5 bg-stone-800 text-stone-200 text-[13px]"
                    style={bevelOut}
                    role="status"
                  >
                    {downloadNote}
                    <button
                      type="button"
                      onClick={() => navigate("/guide")}
                      className="ml-2 text-lime-300 underline"
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
                    className="p-3 mb-5 bg-stone-800 text-amber-100 text-[13px]"
                    style={bevelOut}
                    role="status"
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

                <AddModBox version={pack.version} loader={pack.loader} onAdd={handleAdd} />

                {/* Ad slot: after the full result list (never near buttons/cards). */}
                <AdSlot slot="results-end" />
              </>
            )}
          </>
        )}

        <IntroSection />
        <AdSlot slot="page-bottom" />
        <Footer navigate={navigate} />
      </div>
    </div>
  );
}
