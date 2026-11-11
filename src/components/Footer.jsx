import { ArrowUpLeft, ArrowUpRight } from "lucide-react";

export default function Footer({ t }) {
  const Arrow = t.dir === "rtl" ? ArrowUpLeft : ArrowUpRight;
  return (
    <footer className="tile ink footer">
      <a className="footer-brand" href="https://nimbyte.ir">
        <img src="/brand/pixel-mark.svg" alt="" width="44" height="44" />
        <span><b>نیم‌بایت</b><small className="mono">nimbyte</small></span>
      </a>
      <p>{t.footer.line}</p>
      <a className="btn" href="https://nimbyte.ir">{t.footer.visit}<Arrow size={16} /></a>
    </footer>
  );
}
