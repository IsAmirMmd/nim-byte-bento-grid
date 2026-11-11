import { useDraggable } from "@dnd-kit/core";
import { MoreHorizontal } from "lucide-react";
import { useRef, useState } from "react";

// One tile on the canvas: drag it anywhere (it stays put, faded, until it's dropped), click to
// select, right-click (or ⋯ when selected) for its menu, and drag its inline-end edge to trade
// width with the next tile in the row.
export default function TileView({ tile, html, width, minHeight, selected, last, dir, dragged, onSelect, onResize, onMenu }) {
  const { attributes, listeners, setNodeRef } = useDraggable({ id: tile.key, data: { type: "tile" } });
  const [resizing, setResizing] = useState(false);
  const ref = useRef(null);

  function startResize(e) {
    e.stopPropagation();
    e.preventDefault();
    const row = ref.current.parentElement.getBoundingClientRect().width;
    const x0 = e.clientX;
    let sent = 0;
    setResizing(true);
    const move = (ev) => {
      const units = Math.round((((ev.clientX - x0) * (dir === "rtl" ? -1 : 1)) / row) * 1000);
      if (units !== sent) { onResize(tile.key, units - sent); sent = units; }
    };
    const up = () => { setResizing(false); window.removeEventListener("pointermove", move); window.removeEventListener("pointerup", up); };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  }

  return (
    <div
      ref={(n) => { setNodeRef(n); ref.current = n; }}
      data-key={tile.key}
      className={`wrap${selected ? " sel" : ""}${dragged ? " dragging" : ""}${resizing ? " resizing" : ""}`}
      style={{ width: `${width / 10}%`, minHeight: `calc(${minHeight} * var(--u))` }}
      {...attributes}
      {...listeners}
      onClick={() => onSelect(tile.key)}
      onContextMenu={(e) => { e.preventDefault(); onSelect(tile.key); onMenu(tile.key, e.clientX, e.clientY); }}
      onKeyDown={(e) => { if (e.key === "Enter") onSelect(tile.key); if (e.key === "ContextMenu") { const r = e.currentTarget.getBoundingClientRect(); onMenu(tile.key, r.left + 20, r.top + 20); } }}
    >
      <div className="tile-html" dangerouslySetInnerHTML={{ __html: html }} />
      {selected && (
        <button type="button" className="tile-more" aria-label="menu" onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => { e.stopPropagation(); const r = e.currentTarget.getBoundingClientRect(); onMenu(tile.key, r.left, r.bottom + 4); }}>
          <MoreHorizontal size={18} />
        </button>
      )}
      {resizing && <span className="width-badge">{Math.round(width / 10)}%</span>}
      {!last && <span className="rz" onPointerDown={startResize} role="separator" aria-orientation="vertical" aria-label="resize" />}
    </div>
  );
}
