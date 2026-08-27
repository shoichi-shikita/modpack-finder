import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { bevelOut } from "../utils/styles";

const MESSAGES = [
  "MODを検索しています…",
  "対応バージョンを確認しています…",
  "依存MODを追跡しています…",
  "パックを組み立てています…",
];

export default function LoadingState() {
  const [i, setI] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setI((n) => (n + 1) % MESSAGES.length), 1500);
    return () => clearInterval(id);
  }, []);

  return (
    <div
      className="p-6 flex items-center gap-3 text-stone-300"
      style={{ ...bevelOut, background: "#33333a" }}
    >
      <Loader2 className="w-5 h-5 animate-spin text-lime-400" />
      <span className="text-sm">{MESSAGES[i]}</span>
    </div>
  );
}