import { useDroppable } from "@dnd-kit/core";
import { SortableContext, rectSortingStrategy } from "@dnd-kit/sortable";
import { useMemo } from "react";
import { statRows } from "../../skill/layout.js";
import { canvasCss } from "../../lib/scoped-css.js";
import { tileHtml, statHtml, MIN } from "../../lib/render.js";
import TileView from "./TileView.jsx";

function Gap({ index, label }) {
  const { setNodeRef, isOver } = useDroppable({ id: `gap-${index}`, data: { type: "gap", index } });
  return <div ref={setNodeRef} className={`bc-gap${isOver ? " over" : ""}`}><span>{label}</span></div>;
}

function Row({ row, tiles, model, uploads, selected, onSelect, onResize }) {
  const { setNodeRef, isOver } = useDroppable({ id: row.id, data: { type: "row", rowId: row.id } });
  const min = Math.max(0, ...row.items.map((e) => MIN[tiles.get(e.key)?.kind] ?? 0));
  return (
    <SortableContext id={row.id} items={row.items.map((e) => e.key)} strategy={rectSortingStrategy}>
      <div ref={setNodeRef} className={`bc-row${isOver ? " over" : ""}`}>
        {row.items.map((e, k) => {
          const t = tiles.get(e.key);
          return t && (
            <TileView key={e.key} tile={t} html={tileHtml(t, model.lang, uploads)} width={e.width} minHeight={min}
              selected={selected === e.key} rowId={row.id} last={k === row.items.length - 1}
              dir={model.lang === "fa" ? "rtl" : "ltr"} onSelect={onSelect} onResize={onResize} />
          );
        })}
      </div>
    </SortableContext>
  );
}

// The README as it will look: rows of sortable tiles, drop zones between them, then the stats.
export default function Canvas({ model, uploads, selected, dragging, t, onSelect, onResize }) {
  const style = useMemo(() => canvasCss(model.theme), [model.theme]);
  const tiles = useMemo(() => new Map(model.tiles.map((x) => [x.key, x])), [model.tiles]);
  const dir = model.lang === "fa" ? "rtl" : "ltr";
  return (
    <div className={`bc${dragging ? " is-dragging" : ""}`}>
      <style>{style}</style>
      <div className="bc-stage" dir={dir}>
        {model.rows.length === 0 && <p className="bc-empty">{t.ws.empty}</p>}
        {model.rows.map((row, i) => (
          <div key={row.id}>
            <Gap index={i} label={t.ws.newRow} />
            <Row row={row} tiles={tiles} model={model} uploads={uploads} selected={selected} onSelect={onSelect} onResize={onResize} />
          </div>
        ))}
        <Gap index={model.rows.length} label={t.ws.newRow} />
        {model.stats && (
          <div className="bc-stats" title={t.ws.statsNote}>
            {statRows({ lang: model.lang }).map((r, i) => (
              <div className="bc-row" key={i}>
                {r.tiles.map((x) => <div key={x.id} className="wrap" style={{ width: `${x.width / 10}%`, minHeight: `calc(${r.minHeight} * var(--u))` }}
                  dangerouslySetInnerHTML={{ __html: statHtml(x, model.lang) }} />)}
              </div>
            ))}
            <p className="bc-note">{t.ws.statsNote}</p>
          </div>
        )}
      </div>
    </div>
  );
}
