import { MouseSensor, TouchSensor, pointerWithin, useSensor, useSensors } from "@dnd-kit/core";
import { useRef, useState } from "react";
import { place, same, target } from "../../lib/drop.js";
import { newTile, uid } from "../../lib/state.js";

// What's under the pointer, from the page itself: a gap between rows wins over the row around it.
// (dnd-kit's delta counts page scroll, so start + delta drifts from the real pointer after a
// scroll; reading the real pointer and the elements under it doesn't.)
function hit(x, y) {
  const els = document.elementsFromPoint(x, y);
  const gap = els.find((e) => e.dataset?.gap !== undefined);
  if (gap) return { data: { current: { type: "gap", index: Number(gap.dataset.gap) } }, rect: gap.getBoundingClientRect() };
  const row = els.find((e) => e.dataset?.row !== undefined);
  return row ? { data: { current: { type: "row", row: Number(row.dataset.row) } }, rect: row.getBoundingClientRect() } : null;
}
const pointOf = (e) => (e.touches?.[0] ? { x: e.touches[0].clientX, y: e.touches[0].clientY } : { x: e.clientX, y: e.clientY });

// Dragging tiles and library items: `drag` is { key, kind?, target, u } while something moves; the
// canvas draws drop.js's preview of `target`, and the drop applies it with place().
export function useBoardDrag({ model, change, canvasRef, onPlaced }) {
  const [drag, setDrag] = useState(null);
  const live = useRef(null); // { pointer, stop }
  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 180, tolerance: 8 } }),
  );
  const dir = model.lang === "fa" ? "rtl" : "ltr";
  const modelRef = useRef(model);
  modelRef.current = model;

  function follow(start) {
    let frame = 0;
    const update = () => {
      frame = 0;
      const { x, y } = live.current.pointer;
      setDrag((d) => {
        if (!d) return d;
        const t = target(hit(x, y), { x, y }, modelRef.current, d.key, dir);
        return same(t, d.target) ? d : { ...d, target: t };
      });
    };
    const soon = () => { if (!frame) frame = requestAnimationFrame(update); };
    const move = (e) => { live.current.pointer = pointOf(e); soon(); };
    window.addEventListener("pointermove", move);
    window.addEventListener("touchmove", move, { passive: true });
    window.addEventListener("scroll", soon, true);
    live.current = { pointer: start, stop: () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("touchmove", move);
      window.removeEventListener("scroll", soon, true);
    } };
  }
  const stop = () => { live.current?.stop(); live.current = null; };

  function onDragStart({ active, activatorEvent }) {
    const u = (canvasRef.current?.querySelector(".bc-stage")?.getBoundingClientRect().width ?? 1040) / 1040;
    const lib = active.data.current?.type === "library";
    // rows keep their height while something is dragged, so opening a slot never moves them
    const heights = Object.fromEntries([...(canvasRef.current?.querySelectorAll("[data-row-id]") ?? [])].map((e) => [e.dataset.rowId, e.offsetHeight]));
    setDrag({ key: lib ? "__lib" : active.id, kind: lib ? active.data.current.kind : null, target: null, u, heights });
    follow(pointOf(activatorEvent));
  }
  function onDragEnd() {
    stop();
    const d = drag;
    setDrag(null);
    if (!d?.target) return;
    const fresh = d.kind ? newTile(d.kind) : null;
    const key = fresh ? fresh.key : d.key;
    const row = uid("r");
    change((m) => {
      if (fresh) m.tiles.push(structuredClone(fresh));
      m.rows = place(m.rows, key, d.target, row);
    });
    onPlaced(key);
  }
  return { drag, sensors, collide: pointerWithin, handlers: { onDragStart, onDragEnd, onDragCancel: () => { stop(); setDrag(null); } } };
}
