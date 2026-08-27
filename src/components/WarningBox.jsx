import { AlertTriangle } from "lucide-react";
import { bevelOut } from "../utils/styles";

export default function WarningBox({ warning }) {
  return (
    <div
      className="p-3 mb-3 bg-amber-950/40 text-amber-100"
      style={bevelOut}
    >
      <div className="flex items-center gap-2 font-bold text-sm text-amber-300">
        <AlertTriangle className="w-4 h-4" />
        {warning.title}
      </div>
      <p className="text-[11px] text-amber-100/90 mt-1 leading-snug">
        {warning.message}
      </p>
      {warning.mods?.length > 0 && (
        <p className="text-[10px] text-amber-400/80 mt-1">
          対象: {warning.mods.join(", ")}
        </p>
      )}
    </div>
  );
}