import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useRef, useState } from "react";

// One tile on the canvas: sortable (drag it anywhere), selectable, and with a handle on its
// inline-end edge that trades width with the next tile in the row.
export default function TileView({ tile, html, width, minHeight, selected, rowId, last, dir, onSelect, onResize }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: tile.key, data: { type: "tile", rowId } });
  const [resizing, setResizing] = useState(false);
  const ref = useRef(null);
  const style = {
    width: `${width / 10}%`,
    minHeight: `calc(${minHeight} * var(--u))`,
    transform: CSS.Translate.toString(transform),
    transition,
  };

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
      className={`wrap${selected ? " sel" : ""}${isDragging ? " dragging" : ""}${resizing ? " resizing" : ""}`}
      style={style}
      {...attributes}
      {...listeners}
      onClick={() => onSelect(tile.key)}
      onKeyDown={(e) => { listeners?.onKeyDown?.(e); if (e.key === "Enter") onSelect(tile.key); }}
    >
      <div className="tile-html" dangerouslySetInnerHTML={{ __html: html }} />
      {resizing && <span className="width-badge">{Math.round(width / 10)}%</span>}
      {!last && <span className="rz" onPointerDown={startResize} role="separator" aria-orientation="vertical" aria-label="resize" />}
    </div>
  );
}
