import { Boxes } from "lucide-react";
import ModCard from "./ModCard";
import { bevelOut } from "../utils/styles";

export default function CategorySection({ category, onRemove, onSwap, busyId }) {
  return (
    <section className="mb-5 p-4 sm:p-5" style={{ ...bevelOut, background: "#33333a" }}>
      <div className="flex items-center gap-2 mb-3">
        <Boxes className="w-5 h-5 text-lime-400" aria-hidden="true" />
        <h3 className="text-[15px] font-bold tracking-wide">{category.label}</h3>
        <span className="text-[13px] text-stone-400 tabular-nums">{category.mods.length}</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
        {category.mods.map((mod) => (
          <ModCard
            key={mod.project_id}
            mod={mod}
            onRemove={onRemove}
            onSwap={onSwap}
            busy={busyId === mod.project_id}
          />
        ))}
      </div>
    </section>
  );
}
