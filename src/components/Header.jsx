import { Github, Languages } from "lucide-react";

const SKILL = "https://github.com/IsAmirMmd/nim-byte-readme-maker";

export default function Header({ t, onLang }) {
  return (
    <header className="tile paper header">
      <a className="brand" href="https://nimbyte.ir">
        <img src="/brand/pixel-mark.svg" alt="" width="36" height="36" />
        <span><b>{t.brand}</b><small>{t.product}</small></span>
      </a>
      <nav>
        <a href="#workspace">{t.nav.build}</a>
        <a href={SKILL}>{t.nav.skill}</a>
        <a className="icon-btn" href="https://github.com/IsAmirMmd/nim-byte-bento-grid" aria-label={t.nav.github}><Github size={18} /></a>
        <button type="button" className="btn" onClick={onLang}><Languages size={16} />{t.other}</button>
      </nav>
    </header>
  );
}
