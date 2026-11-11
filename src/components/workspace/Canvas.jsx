import { useDroppable } from "@dnd-kit/core";
import { useMemo } from "react";
import { canvasCss } from "../../lib/scoped-css.js";
import { tileHtml, MIN } from "../../lib/render.js";
import TileView from "./TileView.jsx";

function Gap({ index, label, open }) {
  const { setNodeRef } = useDroppable({ id: `gap-${index}`, data: { type: "gap", index } });
  return <div ref={setNodeRef} className={`bc-gap${open ? " open" : ""}`}>{open && <div className="ph-row"><b>{label}</b></div>}</div>;
}

function Row({ row, index, tiles, ctx }) {
  const { setNodeRef } = useDroppable({ id: row.id, data: { type: "row", row: index }, disabled: row.placeholder });
  const min = Math.max(0, ...row.items.map((e) => MIN[tiles.get(e.key)?.kind] ?? (e.ph ? 120 : 0)));
  return (
    <div ref={setNodeRef} className="bc-row">
      {row.items.map((e, k) => {
        if (e.ph) return <div key="__ph" className="wrap ph" style={{ width: `${e.width / 10}%`, minHeight: `calc(${Math.max(min, 120)} * var(--u))` }}><div className="ph-box" /></div>;
        const t = tiles.get(e.key);
        return t && (
          <TileView key={e.key} tile={t} html={tileHtml(t, ctx.lang, ctx.uploads)} width={e.width} minHeight={min}
            selected={ctx.selected === e.key} last={k === row.items.length - 1} dir={ctx.dir} dragged={ctx.dragKey === e.key}
            onSelect={ctx.onSelect} onResize={ctx.onResize} onMenu={ctx.onMenu} />
        );
      })}
    </div>
  );
}

// The README as it will look. While something is dragged, `rows` is the preview (drop.js): a
// placeholder where it would land, or an empty row in the gap it's over.
export default function Canvas({ model, rows, uploads, selected, drag, t, onSelect, onResize, onMenu }) {
  const style = useMemo(() => canvasCss(model.theme), [model.theme]);
  const tiles = useMemo(() => new Map(model.tiles.map((x) => [x.key, x])), [model.tiles]);
  const dir = model.lang === "fa" ? "rtl" : "ltr";
  const ctx = { lang: model.lang, uploads, selected, dir, dragKey: drag?.key, onSelect, onResize, onMenu };
  let gap = 0;
  let afterOpen = false; // the row after an open gap doesn't draw its own (same index)
  return (
    <div className={`bc${drag ? " is-dragging" : ""}`}>
      <style>{style}</style>
      <div className="bc-stage" dir={dir}>
        {rows.length === 0 && <p className="bc-empty">{t.ws.empty}</p>}
        {rows.map((row) => {
          if (row.placeholder) { afterOpen = true; return <Gap key="__new" index={gap} label={t.ws.newRow} open />; }
          const i = gap++;
          const skip = afterOpen;
          afterOpen = false;
          return (
            <div key={row.id}>
              {!skip && <Gap index={i} label={t.ws.newRow} />}
              <Row row={row} index={i} tiles={tiles} ctx={ctx} />
            </div>
          );
        })}
        {!afterOpen && <Gap index={gap} label={t.ws.newRow} />}
        {model.stats && <p className="bc-note">{t.ws.statsNote}</p>}
      </div>
    </div>
  );
}
