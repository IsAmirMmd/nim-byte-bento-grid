import { useEffect, useState } from "react";

// One tooltip for the whole page: any element with data-tip shows it above itself on hover or
// keyboard focus. It's fixed to the window, so scrolling lists and transformed tiles don't clip it.
export default function Tip() {
  const [tip, setTip] = useState(null);
  useEffect(() => {
    const show = (e) => {
      const el = e.target.closest?.("[data-tip]");
      if (!el) return;
      const r = el.getBoundingClientRect();
      setTip({ text: el.dataset.tip, x: r.left + r.width / 2, y: r.top, below: r.top < 70, bottom: r.bottom });
    };
    const hide = (e) => { if (!e.relatedTarget?.closest?.("[data-tip]")) setTip(null); };
    const off = () => setTip(null);
    document.addEventListener("pointerover", show);
    document.addEventListener("focusin", show);
    document.addEventListener("pointerout", hide);
    document.addEventListener("focusout", off);
    window.addEventListener("scroll", off, true);
    document.addEventListener("pointerdown", off);
    return () => {
      document.removeEventListener("pointerover", show);
      document.removeEventListener("focusin", show);
      document.removeEventListener("pointerout", hide);
      document.removeEventListener("focusout", off);
      window.removeEventListener("scroll", off, true);
      document.removeEventListener("pointerdown", off);
    };
  }, []);
  if (!tip) return null;
  const left = Math.min(Math.max(tip.x, 140), window.innerWidth - 140);
  return (
    <div className={`tip${tip.below ? " below" : ""}`} role="tooltip" style={{ left, top: tip.below ? tip.bottom + 8 : tip.y - 8 }}>{tip.text}</div>
  );
}
