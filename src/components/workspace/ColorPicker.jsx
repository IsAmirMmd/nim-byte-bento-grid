import { Pipette } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { parseHex, toHex, toHsv } from "../../lib/color.js";
import Popover from "./Popover.jsx";

// Drags a pointer over an element: fn gets x and y as 0–1 of its box, on press and on every move.
function track(e, el, fn) {
  e.preventDefault();
  const at = (ev) => {
    const r = el.getBoundingClientRect();
    fn(Math.min(1, Math.max(0, (ev.clientX - r.left) / r.width)), Math.min(1, Math.max(0, (ev.clientY - r.top) / r.height)));
  };
  at(e);
  const up = () => { window.removeEventListener("pointermove", at); window.removeEventListener("pointerup", up); };
  window.addEventListener("pointermove", at);
  window.addEventListener("pointerup", up);
}

// The site's own colour picker (not the browser's): a saturation and brightness square, a hue
// strip, the hex, and quick swatches. Changes apply as you drag; arrows nudge the square.
export default function ColorPicker({ anchor, value, swatches = [], labels, onChange, onClose }) {
  const [hsv, setHsv] = useState(() => toHsv(value));
  const [text, setText] = useState(value);
  const box = useRef(null);
  const hue = useRef(null);
  const root = useRef(null);
  useEffect(() => {
    const away = (e) => !root.current?.contains(e.target) && !e.target.closest?.("[data-picker-trigger]") && onClose();
    window.addEventListener("pointerdown", away);
    return () => window.removeEventListener("pointerdown", away);
  }, [onClose]);
  const set = (next) => { setHsv(next); const hex = toHex(next); setText(hex); onChange(hex); };
  const pick = (hex) => { setHsv(toHsv(hex)); setText(hex); onChange(hex); };
  function keys(e) {
    const step = e.shiftKey ? 0.1 : 0.02;
    const d = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, step], ArrowDown: [0, -step] }[e.key];
    if (e.key === "Escape") onClose();
    if (!d) return;
    e.preventDefault();
    set({ ...hsv, s: Math.min(1, Math.max(0, hsv.s + d[0])), v: Math.min(1, Math.max(0, hsv.v + d[1])) });
  }
  const pure = toHex({ h: hsv.h, s: 1, v: 1 });
  return (
    <Popover anchor={anchor} width={260} className="picker" onRef={(n) => { root.current = n; }}>
    <div onKeyDown={keys} className="picker-body">
      <div ref={box} className="picker-sv" tabIndex={0} role="slider" aria-label={labels.shade} aria-valuetext={text}
        style={{ backgroundColor: pure }} onPointerDown={(e) => track(e, box.current, (x, y) => set({ ...hsv, s: x, v: 1 - y }))}>
        <span className="picker-dot" style={{ left: `${hsv.s * 100}%`, top: `${(1 - hsv.v) * 100}%`, backgroundColor: toHex(hsv) }} />
      </div>
      <div ref={hue} className="picker-hue" role="slider" tabIndex={0} aria-label={labels.hue} aria-valuenow={Math.round(hsv.h)} aria-valuemin={0} aria-valuemax={360}
        onKeyDown={(e) => { const d = { ArrowLeft: -4, ArrowRight: 4 }[e.key]; if (d) { e.preventDefault(); e.stopPropagation(); set({ ...hsv, h: (hsv.h + d + 360) % 360 }); } }}
        onPointerDown={(e) => track(e, hue.current, (x) => set({ ...hsv, h: x * 359.9 }))}>
        <span className="picker-dot" style={{ left: `${(hsv.h / 360) * 100}%`, top: "50%", backgroundColor: pure }} />
      </div>
      <div className="picker-row">
        <span className="picker-now" style={{ backgroundColor: toHex(hsv) }} />
        <input className="mono" dir="ltr" value={text} aria-label="hex" spellCheck={false}
          onChange={(e) => { setText(e.target.value); const h = parseHex(e.target.value); if (h) { setHsv(toHsv(h)); onChange(h); } }} />
        {"EyeDropper" in window && (
          <button type="button" className="btn ghost icon" aria-label={labels.dropper}
            onClick={async () => { try { pick((await new window.EyeDropper().open()).sRGBHex); } catch {} }}><Pipette size={16} /></button>
        )}
      </div>
      {swatches.length > 0 && (
        <div className="picker-swatches">
          {swatches.map((c) => <button key={c} type="button" aria-label={c} className={c === text ? "on" : ""} style={{ backgroundColor: c }} onClick={() => pick(c)} />)}
        </div>
      )}
    </div>
    </Popover>
  );
}
