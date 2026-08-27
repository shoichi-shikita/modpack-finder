import { Info, ListChecks } from "lucide-react";
import { bevelOut, bevelIn } from "../utils/styles";

const STEPS = [
  "Minecraftのバージョンを選ぶ",
  "Mod Loader（Fabric / Forge / NeoForge / Quilt）を選ぶ",
  "遊びたいテーマを選ぶ（複数OK）",
  "「MODパックを生成」を押す",
  "内容を確認し、不要なMODは外す・別候補に入れ替える",
  ".mrpack として出力してランチャーに読み込む",
];

export default function IntroSection() {
  return (
    <div className="mt-8">
      <div className="p-4 sm:p-5 mb-5" style={{ ...bevelOut, background: "#33333a" }}>
        <div className="flex items-center gap-2 mb-2">
          <Info className="w-5 h-5 text-lime-400" />
          <h2 className="text-base font-bold tracking-wide">MOD PACK FINDER とは？</h2>
        </div>
        <p className="text-[12px] text-stone-300 leading-relaxed">
          Minecraftのバージョン・Mod Loader・遊びたいテーマを選ぶだけで、条件に合うMODを役割ごとに
          選び、依存MODまで含めた「そのまま遊べるMODパック構成」を自動で提案する無料ツールです。
          「MODは入れたいけど、対応バージョンや依存関係を1つずつ調べるのが大変」という人に向いています。
          できあがった構成は <b>.mrpack</b> として出力でき、Modrinth App や Prism Launcher に読み込めば
          依存MODごとまとめて導入できます。
        </p>
      </div>

      <div className="p-4 sm:p-5" style={{ ...bevelOut, background: "#33333a" }}>
        <div className="flex items-center gap-2 mb-3">
          <ListChecks className="w-5 h-5 text-lime-400" />
          <h2 className="text-base font-bold tracking-wide">使い方</h2>
        </div>
        <ol className="space-y-2">
          {STEPS.map((s, i) => (
            <li key={s} className="flex gap-3 items-start">
              <span
                className="shrink-0 w-6 h-6 grid place-items-center bg-lime-700 text-white text-xs font-bold"
                style={bevelIn}
              >
                {i + 1}
              </span>
              <span className="text-[12px] text-stone-300 leading-relaxed pt-0.5">{s}</span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
