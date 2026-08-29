import { useEffect, useRef, useState } from "react";
import { Plus, Loader2, Search } from "lucide-react";
import { searchProjects } from "../services/modrinth";
import { fmtShort } from "../utils/format";
import { bevelIn, bevelOut } from "../utils/styles";

// "Add a mod" — the tool could previously only remove or swap, which meant the
// most natural request ("I definitely want Create, pick the rest for me") had
// no answer.
export default function AddModBox({ version, loader, onAdd }) {
  const [term, setTerm] = useState("");
  const [hits, setHits] = useState([]);
  const [searching, setSearching] = useState(false);
  const [addingId, setAddingId] = useState(null);
  const [open, setOpen] = useState(false);
  const reqId = useRef(0);

  useEffect(() => {
    const q = term.trim();
    // Nothing to search for yet — `visible` below hides any stale results, so
    // there is no state to clear here.
    if (q.length < 2) return undefined;
    const mine = ++reqId.current;
    const t = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await searchProjects({ version, loader, query: q, limit: 8 });
        if (reqId.current === mine) setHits(res);
      } catch {
        if (reqId.current === mine) setHits([]);
      } finally {
        if (reqId.current === mine) setSearching(false);
      }
    }, 350);
    return () => clearTimeout(t);
  }, [term, version, loader]);

  // Stale hits stay in state but are never shown once the box is emptied.
  const visible = term.trim().length >= 2 ? hits : [];

  async function add(hit) {
    setAddingId(hit.project_id);
    const { ok } = await onAdd(hit.slug || hit.project_id);
    setAddingId(null);
    if (ok) {
      setTerm("");
      setHits([]);
    }
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="w-full mb-5 px-4 min-h-12 bg-stone-800 text-stone-100 text-[13px] flex items-center justify-center gap-2"
        style={bevelOut}
      >
        <Plus className="w-4 h-4 text-lime-400" />
        入れたいMODを追加する
      </button>
    );
  }

  return (
    <div className="mb-5 p-4 sm:p-5" style={{ ...bevelOut, background: "#33333a" }}>
      <div className="flex items-center gap-2 mb-3">
        <Plus className="w-5 h-5 text-lime-400" />
        <h3 className="text-[15px] font-bold tracking-wide">MODを追加</h3>
      </div>

      <label className="block mb-3">
        <span className="sr-only">追加したいMODの名前</span>
        <div className="flex items-center gap-2 bg-stone-900 px-3" style={bevelIn}>
          <Search className="w-4 h-4 text-stone-400 shrink-0" />
          <input
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            placeholder="MOD名で検索（例: Create, JEI, Sodium）"
            className="w-full bg-transparent text-stone-100 py-3 outline-none placeholder:text-stone-500 text-[13px]"
            autoComplete="off"
          />
          {searching && <Loader2 className="w-4 h-4 animate-spin text-lime-400 shrink-0" />}
        </div>
      </label>

      {term.trim().length >= 2 && !searching && visible.length === 0 && (
        <p className="text-[13px] text-stone-400">
          {version} / {loader} で使えるMODが見つかりませんでした。
        </p>
      )}

      <ul className="flex flex-col gap-2">
        {visible.map((h) => (
          <li
            key={h.project_id}
            className="flex items-center gap-3 p-2 bg-stone-900"
            style={bevelIn}
          >
            <div className="w-9 h-9 shrink-0 bg-stone-800 grid place-items-center overflow-hidden">
              {h.icon_url ? (
                <img src={h.icon_url} alt="" className="w-full h-full object-cover" />
              ) : null}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[13px] font-bold truncate">{h.title}</div>
              <div className="text-[12px] text-stone-400 truncate">
                DL {fmtShort(h.downloads)}
              </div>
            </div>
            <button
              type="button"
              onClick={() => add(h)}
              disabled={addingId === h.project_id}
              className="shrink-0 px-3 min-h-11 bg-lime-600 text-white text-[13px] font-bold flex items-center gap-1 disabled:opacity-60"
              style={bevelOut}
            >
              {addingId === h.project_id ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Plus className="w-4 h-4" />
              )}
              追加
            </button>
          </li>
        ))}
      </ul>

      <button
        type="button"
        onClick={() => setOpen(false)}
        className="mt-3 px-3 min-h-11 bg-stone-800 text-stone-300 text-[13px]"
        style={bevelOut}
      >
        閉じる
      </button>
    </div>
  );
}
