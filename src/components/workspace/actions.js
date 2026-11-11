// What a tile's menu does, on a draft of the model.
import { refit, uid, canCopy } from "../../lib/state.js";

export const rowOf = (m, key) => m.rows.findIndex((r) => r.items.some((e) => e.key === key));

// Takes a tile out of its row (dropping the row when it empties) → its entry.
export function take(m, key) {
  const r = rowOf(m, key);
  const entry = m.rows[r].items.find((e) => e.key === key);
  m.rows[r].items = m.rows[r].items.filter((e) => e.key !== key);
  if (!m.rows[r].items.length) m.rows.splice(r, 1);
  else m.rows[r].items = refit(m.rows[r].items);
  return entry;
}

// up / down: a tile alone in its row swaps rows with its neighbour; one that shares a row gets a
// row of its own above or below.
export function menuItems(m, key) {
  const t = m.tiles.find((x) => x.key === key);
  const r = rowOf(m, key);
  const alone = m.rows[r]?.items.length === 1;
  return [
    { id: "edit" }, { id: "copy", disabled: !canCopy(t) }, { id: "ownRow", disabled: alone }, { id: "equal", disabled: alone },
    { id: "up", disabled: alone && r === 0 }, { id: "down", disabled: alone && r === m.rows.length - 1 }, { id: "remove" },
  ];
}

export function act(m, key, id, newKey) {
  const r = rowOf(m, key);
  if (r < 0) return;
  const row = m.rows[r];
  const alone = row.items.length === 1;
  if (id === "copy") {
    m.tiles.push({ ...structuredClone(m.tiles.find((x) => x.key === key)), key: newKey });
    row.items.splice(row.items.findIndex((e) => e.key === key) + 1, 0, { key: newKey, width: 1000 / (row.items.length + 1) });
    row.items = refit(row.items);
  } else if (id === "equal") {
    row.items = refit(row.items.map((e) => ({ ...e, width: 1 })));
  } else if (id === "ownRow" || id === "up" || id === "down") {
    if (alone) {
      const to = id === "up" ? r - 1 : r + 1;
      if (to >= 0 && to < m.rows.length) [m.rows[r], m.rows[to]] = [m.rows[to], m.rows[r]];
      return;
    }
    take(m, key);
    m.rows.splice(id === "up" ? r : r + 1, 0, { id: uid("r"), items: [{ key, width: 1000 }] });
  } else if (id === "remove") {
    take(m, key);
    m.tiles = m.tiles.filter((x) => x.key !== key);
  }
}
