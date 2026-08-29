import { AlertTriangle } from "lucide-react";
import { bevelOut } from "../utils/styles";

export default function WarningBox({ warning }) {
  return (
    <div className="p-3 mb-3 bg-amber-950/60 text-amber-50" style={bevelOut} role="note">
      <div className="flex items-center gap-2 font-bold text-sm text-amber-200">
        <AlertTriangle className="w-4 h-4" aria-hidden="true" />
        {warning.title}
      </div>
      <p className="text-[13px] text-amber-50 mt-1 leading-relaxed">{warning.message}</p>
      {warning.mods?.length > 0 && (
        <p className="text-[12px] text-amber-200/90 mt-1.5">対象: {warning.mods.join(", ")}</p>
      )}
    </div>
  );
}
