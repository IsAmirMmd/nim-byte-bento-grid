import { MouseSensor, TouchSensor, pointerWithin, useSensor, useSensors } from "@dnd-kit/core";
import { useRef, useState } from "react";
import { place, same, target } from "../../lib/drop.js";
import { newTile, uid } from "../../lib/state.js";

// Gaps between rows win over the rows around them, so a new row is easy to make.
const collide = (args) => {
  const hits = pointerWithin(args);
  const gaps = hits.filter((h) => args.droppableContainers.find((c) => c.id === h.id)?.data.current?.type === "gap");
  return gaps.length ? gaps : hits;
};
const pointOf = (e) => (e?.touches?.[0] ? { x: e.touches[0].clientX, y: e.touches[0].clientY } : e ? { x: e.clientX, y: e.clientY } : null);

// Dragging tiles and library items: `drag` is { key, kind?, target, u } while something moves; the
// canvas draws drop.js's preview of `target`, and the drop applies it with place().
export function useBoardDrag({ model, change, canvasRef, onPlaced }) {
  const [drag, setDrag] = useState(null);
  const origin = useRef(null);
  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 180, tolerance: 8 } }),
  );
  const dir = model.lang === "fa" ? "rtl" : "ltr";

  function onDragStart({ active, activatorEvent }) {
    origin.current = pointOf(activatorEvent);
    const u = (canvasRef.current?.querySelector(".bc-stage")?.getBoundingClientRect().width ?? 1040) / 1040;
    const lib = active.data.current?.type === "library";
    setDrag({ key: lib ? "__lib" : active.id, kind: lib ? active.data.current.kind : null, target: null, u });
  }
  function onDragMove({ over, delta }) {
    if (!origin.current) return;
    const pointer = { x: origin.current.x + delta.x, y: origin.current.y + delta.y };
    setDrag((d) => {
      if (!d) return d;
      const t = target(over, pointer, model, d.key, dir);
      return same(t, d.target) ? d : { ...d, target: t };
    });
  }
  function onDragEnd() {
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
  return { drag, sensors, collide, handlers: { onDragStart, onDragMove, onDragEnd, onDragCancel: () => setDrag(null) } };
}
