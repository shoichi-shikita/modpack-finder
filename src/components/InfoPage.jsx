import SiteHeader from "./SiteHeader";
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
      className="min-h-screen w-full font-sans text-stone-100 p-4 sm:p-6"
      style={{ background: "#181a1b" }}
    >
      <div className="mx-auto max-w-5xl">
        <SiteHeader />
        <main id="main-content">
        <header className="flex items-center gap-3 mb-5">
          {/* A real link: crawlable, and middle-click opens a new tab. */}
          <a
            href="/"
            onClick={home}
            className="px-3 min-h-11 bg-stone-800 text-stone-100 text-[13px] inline-flex items-center gap-1 no-underline shrink-0 whitespace-nowrap"
            style={bevelOut}
          >

            ホーム
          </a>
          <h1 className="text-base sm:text-xl font-bold   leading-tight min-w-0">
            {title}
          </h1>
        </header>

        {children}

        </main>
        <Footer navigate={navigate} />
      </div>
    </div>
  );
}

export function Section({ title, children }) {
  return (
    <section className="p-4 sm:p-5 mb-5" style={{ ...bevelOut, background: "#202224" }}>
      {title && (
        <h2 className="text-[15px] font-bold  text-lime-300 mb-2">{title}</h2>
      )}
      <div className="text-[14px] text-stone-200 leading-relaxed space-y-2">{children}</div>
    </section>
  );
}
