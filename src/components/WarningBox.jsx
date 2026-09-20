

export default function WarningBox({ warning }) {
  return (
    <div className="warning-note" role="note">
      <div className="flex items-center gap-2 font-bold text-sm text-stone-200">

        {warning.title}
      </div>
      <p className="text-[13px] text-stone-300 mt-1 leading-relaxed">{warning.message}</p>
      {warning.mods?.length > 0 && (
        <p className="text-[12px] text-stone-400 mt-1.5">対象: {warning.mods.join(", ")}</p>
      )}
    </div>
  );
}
