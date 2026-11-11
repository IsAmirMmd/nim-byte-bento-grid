// Where a dragged tile will land, and the rows as they'd look with it there. The target comes from
// the pointer and the model's own widths (not from rects that move while the preview opens space),
// so it holds still: { type: "row", row, index } or { type: "gap", index } (a new row before row index).
import { refit } from "./state.js";

const EDGE = 0.25; // the top and bottom quarter of a row start a new row above or below it

export function target(over, pointer, model, key, dir) {
  if (!over || !pointer) return null;
  const o = over.data.current;
  if (o?.type === "gap") return { type: "gap", index: o.index };
  if (o?.type !== "row") return null;
  const r = over.rect;
  const y = (pointer.y - r.top) / r.height;
  if (r.height > 60 && y < EDGE) return { type: "gap", index: o.row };
  if (r.height > 60 && y > 1 - EDGE) return { type: "gap", index: o.row + 1 };
  let f = (pointer.x - r.left) / r.width;
  if (dir === "rtl") f = 1 - f;
  const others = refit(model.rows[o.row].items.filter((e) => e.key !== key));
  let at = 0;
  let edge = 0;
  for (const e of others) { if (edge + e.width / 2 < f * 1000) at += 1; edge += e.width; }
  return { type: "row", row: o.row, index: at };
}

export const same = (a, b) => a?.type === b?.type && a?.row === b?.row && a?.index === b?.index;

// The width a tile gets in a row: its own when it moves within that row, else an equal share.
function share(row, key) {
  const own = row.items.find((e) => e.key === key);
  const others = row.items.filter((e) => e.key !== key);
  return { others, width: own ? own.width : 1000 / (others.length + 1) };
}
const scaleTo = (items, total) => {
  const sum = items.reduce((s, e) => s + e.width, 0) || 1;
  return items.map((e) => ({ ...e, width: (e.width * total) / sum }));
};

// The rows for the canvas while dragging: a placeholder where the tile would land, the rest of
// that row narrowed to make room, or an empty row in a gap.
export function preview(rows, key, t) {
  if (!t) return rows;
  if (t.type === "gap") {
    const out = [...rows]; // the tile stays where it is, faded, until it's dropped
    out.splice(t.index, 0, { id: "__new", placeholder: true, items: [{ key: "__ph", width: 1000, ph: true }] });
    return out;
  }
  return rows.map((r, i) => {
    if (i !== t.row) return r;
    const { others, width } = share(r, key);
    const items = scaleTo(others, 1000 - width);
    items.splice(t.index, 0, { key: "__ph", width, ph: true });
    return { ...r, items };
  });
}

// The move itself, on drop: → the new rows (entry is the tile's { key, width }, new or moved).
export function place(rows, key, t, newRowId) {
  let out = rows.map((r) => ({ ...r, items: [...r.items] }));
  if (t.type === "row") {
    const target = out[t.row].id;
    const { width } = share(out[t.row], key);
    out = out.map((r) => ({ ...r, items: r.id === target ? r.items : refit(r.items.filter((e) => e.key !== key)) }));
    const row = out.find((r) => r.id === target);
    const items = scaleTo(row.items.filter((e) => e.key !== key), 1000 - width);
    items.splice(t.index, 0, { key, width });
    row.items = refit(items);
    return out.filter((r) => r.items.length);
  }
  const before = out.slice(0, t.index).map((r) => r.id);
  out = out.map((r) => ({ ...r, items: refit(r.items.filter((e) => e.key !== key)) }));
  const at = out.filter((r) => before.includes(r.id) && r.items.length).length;
  out = out.filter((r) => r.items.length);
  out.splice(at, 0, { id: newRowId, items: [{ key, width: 1000 }] });
  return out;
}
