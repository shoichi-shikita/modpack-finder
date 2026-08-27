import { ArrowLeft, Pickaxe } from "lucide-react";
import Footer from "./Footer";
import { bevelOut } from "../utils/styles";

// Shared dark, Minecraft-styled shell for About / Privacy / Contact.
export default function InfoPage({ title, navigate, children }) {
  return (
    <div
      className="min-h-screen w-full font-mono text-stone-100 p-4 sm:p-6"
      style={{ background: "linear-gradient(160deg,#2b2b31 0%,#1c1c20 100%)" }}
    >
      <div className="mx-auto max-w-3xl">
        {/* header */}
        <div className="flex items-center gap-3 mb-5">
          <button
            type="button"
            onClick={() => navigate("/")}
            className="px-3 py-2 bg-stone-800 text-stone-200 text-xs flex items-center gap-1"
            style={bevelOut}
          >
            <ArrowLeft className="w-4 h-4" />
            ホーム
          </button>
          <div className="grid place-items-center w-9 h-9 bg-lime-700" style={bevelOut}>
            <Pickaxe className="w-5 h-5" />
          </div>
          <h1 className="text-lg sm:text-xl font-bold tracking-widest uppercase leading-none">
            {title}
          </h1>
        </div>

        {children}

        <Footer navigate={navigate} />
      </div>
    </div>
  );
}

// A titled beveled panel used inside info pages.
export function Section({ title, children }) {
  return (
    <div className="p-4 sm:p-5 mb-5" style={{ ...bevelOut, background: "#33333a" }}>
      {title && (
        <h2 className="text-base font-bold tracking-wide text-lime-300 mb-2">
          {title}
        </h2>
      )}
      <div className="text-[12px] text-stone-300 leading-relaxed space-y-2">
        {children}
      </div>
    </div>
  );
}
