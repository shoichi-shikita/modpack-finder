import ModCard from "./ModCard";


export default function CategorySection({ category, onRemove, onSwap, busyId }) {
  return (
    <section className="category-section">
      <div className="flex items-center gap-2 mb-3">

        <h3 className="text-[15px] font-bold ">{category.label}</h3>
        <span className="text-[13px] text-stone-400 tabular-nums">{category.mods.length}</span>
      </div>

      <div className="mod-list">
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
