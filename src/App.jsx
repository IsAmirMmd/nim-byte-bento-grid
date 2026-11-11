import { useEffect, useState } from "react";
import { T } from "./i18n.js";
import Header from "./components/Header.jsx";
import Hero from "./components/Hero.jsx";
import Footer from "./components/Footer.jsx";
import Workspace from "./components/workspace/Workspace.jsx";
import Tip from "./components/Tip.jsx";

const KEY = "nim-byte-bento-grid-ui";
const saved = () => { try { return localStorage.getItem(KEY); } catch { return null; } };

// The page is a bento grid of its own: header, hero, the workspace in one big tile, footer.
export default function App() {
  const [lang, setLang] = useState(saved() === "en" ? "en" : "fa");
  const t = T[lang];
  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = t.dir;
    try { localStorage.setItem(KEY, lang); } catch {}
  }, [lang, t.dir]);
  return (
    <div className="page">
      <Header t={t} onLang={() => setLang(lang === "fa" ? "en" : "fa")} />
      <Hero t={t} />
      <Workspace t={t} lang={lang} />
      <Footer t={t} />
      <Tip />
    </div>
  );
}
