import { ArrowLeft, Pickaxe } from "lucide-react";
import Footer from "./Footer";
import { bevelOut } from "../utils/styles";

// Shared dark, Minecraft-styled shell for About / Privacy / Contact.
export default function InfoPage({ title, navigate, children }) {
  const home = (e) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
    e.preventDefault();
    navigate("/");
  };

  return (
    <div
      className="min-h-screen w-full font-mono text-stone-100 p-4 sm:p-6"
      style={{ background: "linear-gradient(160deg,#2b2b31 0%,#1c1c20 100%)" }}
    >
      <div className="mx-auto max-w-3xl">
        <header className="flex items-center gap-3 mb-5">
          {/* A real link: crawlable, and middle-click opens a new tab. */}
          <a
            href="/"
            onClick={home}
            className="px-3 min-h-11 bg-stone-800 text-stone-100 text-[13px] inline-flex items-center gap-1 no-underline shrink-0 whitespace-nowrap"
            style={bevelOut}
          >
            <ArrowLeft className="w-4 h-4" aria-hidden="true" />
            ホーム
          </a>
          <div className="grid place-items-center w-9 h-9 bg-lime-700 shrink-0" style={bevelOut}>
            <Pickaxe className="w-5 h-5" aria-hidden="true" />
          </div>
          <h1 className="text-base sm:text-xl font-bold tracking-widest uppercase leading-tight min-w-0">
            {title}
          </h1>
        </header>

        {children}

        <Footer navigate={navigate} />
      </div>
    </div>
  );
}

export function Section({ title, children }) {
  return (
    <section className="p-4 sm:p-5 mb-5" style={{ ...bevelOut, background: "#33333a" }}>
      {title && (
        <h2 className="text-[15px] font-bold tracking-wide text-lime-300 mb-2">{title}</h2>
      )}
      <div className="text-[14px] text-stone-200 leading-relaxed space-y-2">{children}</div>
    </section>
  );
}
