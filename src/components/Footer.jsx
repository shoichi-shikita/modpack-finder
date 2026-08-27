export default function Footer({ navigate }) {
  const go = (e, path) => {
    e.preventDefault();
    navigate(path);
  };

  const linkCls = "text-stone-400 hover:text-lime-400 underline";

  return (
    <footer className="mt-10 pt-4 border-t border-stone-700/60 text-center text-[11px] text-stone-500 pb-8">
      <nav className="flex flex-wrap justify-center gap-4 mb-2">
        <a href="/about" onClick={(e) => go(e, "/about")} className={linkCls}>
          About
        </a>
        <a href="/privacy" onClick={(e) => go(e, "/privacy")} className={linkCls}>
          Privacy Policy
        </a>
        <a href="/contact" onClick={(e) => go(e, "/contact")} className={linkCls}>
          Contact
        </a>
      </nav>
      <p className="text-stone-600">
        MOD PACK FINDER is an unofficial fan-made tool. Not affiliated with Mojang,
        Microsoft or Modrinth.
      </p>
    </footer>
  );
}
