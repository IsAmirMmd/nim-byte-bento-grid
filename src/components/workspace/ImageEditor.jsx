import { Move, RotateCcw } from "lucide-react";
import { useRef } from "react";
import { picture } from "../../lib/render.js";

const MASKS = ["rounded", "square", "circle", "arch"];
const CAPS = ["below", "top-right", "top-left", "bottom-right", "bottom-left"];
const parse = (pos = "50% 50%") => pos.split(" ").map((v) => parseFloat(v));
const clamp = (v) => Math.round(Math.min(100, Math.max(0, v)));

function Segments({ name, value, options, labels, onPick }) {
  return (
    <div className="segments" role="radiogroup" aria-label={name}>
      {options.map((o) => (
        <button key={o} type="button" role="radio" aria-checked={value === o} className={value === o ? "on" : ""} onClick={() => onPick(o)}>{labels[o] ?? o}</button>
      ))}
    </div>
  );
}

// The picture's crop, in the panel: drag the preview to move the picture in its frame, zoom it,
// pick how it fills (cover or contain) and its mask, and where the caption sits.
export default function ImageEditor({ tile, field, uploads, x, onData }) {
  const d = tile.data;
  const ref = useRef(null);
  const fit = d.fit ?? (tile.kind === "image" ? "contain" : "cover");
  const set = (patch) => {
    const n = { ...d, ...patch };
    for (const [k, v] of Object.entries(patch)) if (v === undefined) delete n[k];
    onData(n);
  };
  function drag(e) {
    e.preventDefault();
    const box = ref.current.getBoundingClientRect();
    const [px, py] = parse(d.pos);
    const x0 = e.clientX;
    const y0 = e.clientY;
    const k = 100 / Math.max(1, (d.zoom ?? 1) - 0.4);
    const move = (ev) => set({ pos: `${clamp(px - ((ev.clientX - x0) / box.width) * k)}% ${clamp(py - ((ev.clientY - y0) / box.height) * k)}%` });
    const up = () => { window.removeEventListener("pointermove", move); window.removeEventListener("pointerup", up); };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  }
  const src = picture(d[field], uploads);
  const pos = d.pos ?? "50% 50%";
  const caps = tile.kind !== "project";
  return (
    <div className="img-edit">
      <div ref={ref} className={`img-stage mask-${d.mask ?? "rounded"}${tile.kind === "photo" ? " tall" : ""}`} onPointerDown={drag}>
        <img src={src} alt="" draggable="false" style={{ objectFit: fit, objectPosition: pos, transform: `scale(${d.zoom ?? 1})`, transformOrigin: pos }} />
        <span className="img-hint"><Move size={14} />{x.drag}</span>
      </div>
      <div className="field">
        <label htmlFor={`z-${tile.key}`}>{x.zoom} <output>{Math.round((d.zoom ?? 1) * 100)}%</output></label>
        <input id={`z-${tile.key}`} type="range" min="1" max="3" step="0.05" value={d.zoom ?? 1} onChange={(e) => set({ zoom: Number(e.target.value) === 1 ? undefined : Number(e.target.value) })} />
      </div>
      <div className="field"><label>{x.fit}</label><Segments name={x.fit} value={fit} options={["cover", "contain"]} labels={x} onPick={(v) => set({ fit: v })} /></div>
      <div className="field"><label>{x.mask}</label><Segments name={x.mask} value={d.mask ?? "rounded"} options={MASKS} labels={x} onPick={(v) => set({ mask: v === "rounded" ? undefined : v })} /></div>
      {caps && <div className="field"><label>{x.capPos}</label><Segments name={x.capPos} value={d.capPos ?? "below"} options={CAPS} labels={x} onPick={(v) => set({ capPos: v === "below" ? undefined : v })} /></div>}
      <button type="button" className="btn ghost small" onClick={() => set({ fit: undefined, pos: undefined, zoom: undefined, mask: undefined, capPos: undefined })}><RotateCcw size={14} />{x.reset}</button>
    </div>
  );
}
