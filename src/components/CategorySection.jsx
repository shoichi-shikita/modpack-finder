import { Boxes } from "lucide-react";
import ModCard from "./ModCard";
import { bevelOut } from "../utils/styles";

export default function CategorySection({ category, onRemove, onSwap, busyId }) {
  return (
    <div className="mb-5 p-4 sm:p-5" style={{ ...bevelOut, background: "#33333a" }}>
      <div className="flex items-center gap-2 mb-3">
        <Boxes className="w-5 h-5 text-lime-400" />
        <h3 className="text-base font-bold tracking-wide">{category.label}</h3>
        <span className="text-[11px] text-stone-500">{category.mods.length}</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
    </div>
  );
}
