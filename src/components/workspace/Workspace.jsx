import { DndContext, DragOverlay, KeyboardSensor, MeasuringStrategy, MouseSensor, TouchSensor, pointerWithin, rectIntersection, useSensor, useSensors } from "@dnd-kit/core";
import { arrayMove, sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { FileDown, FileUp, RotateCcw, Wand2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import defaultProfile from "../../data/default-profile.json";
import { fromProfile, toProfile, newTile, refit, uid, save, load, forget } from "../../lib/state.js";
import { makePrompt, pictures } from "../../lib/prompt.js";
import { tileHtml } from "../../lib/render.js";
import { KIND_TEXT } from "../../i18n.js";
import Canvas from "./Canvas.jsx";
import Library, { ICONS } from "./Library.jsx";
import Panel from "./Panel.jsx";
import PromptDialog from "./PromptDialog.jsx";
import "../../styles/workspace.css";

const MIN_W = 120;
const rowOf = (m, key) => m.rows.findIndex((r) => r.items.some((e) => e.key === key));
const collide = (args) => { const hits = pointerWithin(args); return hits.length ? hits : rectIntersection(args); };

// Takes a tile out of its row (dropping the row when it empties) and returns its entry.
function take(m, key) {
  const i = rowOf(m, key);
  const entry = m.rows[i].items.find((e) => e.key === key);
  m.rows[i].items = m.rows[i].items.filter((e) => e.key !== key);
  if (!m.rows[i].items.length) m.rows.splice(i, 1);
  else m.rows[i].items = refit(m.rows[i].items);
  return { entry, row: i };
}
// Puts an entry in row i at position k, giving it an equal share of the row.
function put(m, i, k, entry) {
  const items = m.rows[i].items;
  items.splice(k, 0, { ...entry, width: 1000 / (items.length + 1) });
  m.rows[i].items = refit(items);
}

export default function Workspace({ t, lang }) {
  const [model, setModel] = useState(() => load() ?? fromProfile(defaultProfile));
  const [uploads, setUploads] = useState({});
  const [selected, setSelected] = useState(null);
  const [active, setActive] = useState(null);
  const [promptOpen, setPromptOpen] = useState(false);
  const canvasRef = useRef(null);
  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 180, tolerance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );
  useEffect(() => save(model), [model]);
  const change = (fn) => setModel((m) => { const n = structuredClone(m); fn(n); return n; });

  function dragStart({ active: a }) {
    const u = (canvasRef.current?.querySelector(".bc-stage")?.getBoundingClientRect().width ?? 1040) / 1040;
    setActive({ id: a.id, ...a.data.current, u });
  }
  function dragOver({ active: a, over }) {
    if (a.data.current?.type !== "tile" || !over) return;
    const o = over.data.current;
    if (o?.type === "tile" || o?.type === "row") change((m) => {
      const from = rowOf(m, a.id);
      const to = o.type === "tile" ? rowOf(m, over.id) : m.rows.findIndex((r) => r.id === o.rowId);
      if (from < 0 || to < 0 || from === to) return;
      const target = m.rows[to].id;
      const { entry } = take(m, a.id);
      const i = m.rows.findIndex((r) => r.id === target);
      const k = o.type === "tile" ? m.rows[i].items.findIndex((e) => e.key === over.id) : m.rows[i].items.length;
      put(m, i, Math.max(0, k), entry);
    });
  }
  function dragEnd({ active: a, over }) {
    setActive(null);
    const kind = a.data.current?.type === "library" ? a.data.current.kind : null;
    const o = over?.data.current;
    const fresh = kind ? newTile(kind) : null;
    const newRow = uid("r");
    if (fresh) setSelected(fresh.key);
    change((m) => {
      let entry;
      if (fresh) {
        m.tiles.push(structuredClone(fresh));
        entry = { key: fresh.key, width: 1000 };
      } else if (o?.type === "gap") entry = take(m, a.id).entry;
      if (o?.type === "gap" || (kind && !o)) {
        let at = o ? o.index : m.rows.length;
        if (!kind && m.rows.length && at > m.rows.length) at = m.rows.length;
        m.rows.splice(Math.min(at, m.rows.length), 0, { id: newRow, items: [{ ...entry, width: 1000 }] });
      } else if (kind && o) {
        const i = o.type === "tile" ? rowOf(m, over.id) : m.rows.findIndex((r) => r.id === o.rowId);
        const k = o.type === "tile" ? m.rows[i].items.findIndex((e) => e.key === over.id) + 1 : m.rows[i].items.length;
        put(m, i, k, entry);
      } else if (o?.type === "tile" && a.id !== over.id) {
        const i = rowOf(m, a.id);
        if (i === rowOf(m, over.id)) {
          const items = m.rows[i].items;
          m.rows[i].items = arrayMove(items, items.findIndex((e) => e.key === a.id), items.findIndex((e) => e.key === over.id));
        }
      }
    });
  }

  function add(kind) {
    const tile = newTile(kind);
    const row = uid("r");
    change((m) => { m.tiles.push(structuredClone(tile)); m.rows.push({ id: row, items: [{ key: tile.key, width: 1000 }] }); });
    setSelected(tile.key);
  }
  const resize = (key, delta) => change((m) => {
    const row = m.rows[rowOf(m, key)].items;
    const k = row.findIndex((e) => e.key === key);
    if (k < 0 || k === row.length - 1) return;
    const total = row[k].width + row[k + 1].width;
    row[k].width = Math.min(total - MIN_W, Math.max(MIN_W, row[k].width + delta));
    row[k + 1].width = total - row[k].width;
  });
  const setWidth = (key, w) => change((m) => {
    const row = m.rows[rowOf(m, key)].items;
    const me = row.find((e) => e.key === key);
    const others = row.filter((e) => e !== me);
    if (!others.length) return;
    me.width = Math.min(1000 - MIN_W * others.length, Math.max(MIN_W, w));
    const sum = others.reduce((s, e) => s + e.width, 0);
    others.forEach((e) => (e.width = ((1000 - me.width) * e.width) / sum));
  });
  const remove = (key) => { change((m) => { take(m, key); m.tiles = m.tiles.filter((x) => x.key !== key); }); setSelected(null); };
  const setData = (key, data) => change((m) => { m.tiles.find((x) => x.key === key).data = data; });
  function image(key, field, file) {
    const name = file.name.toLowerCase().replace(/[^a-z0-9.\-_]+/g, "-");
    setUploads((u) => ({ ...u, [name]: URL.createObjectURL(file) }));
    change((m) => { m.tiles.find((x) => x.key === key).data[field] = `images/${name}`; });
  }
  function download() {
    const a = Object.assign(document.createElement("a"), { download: "profile.json",
      href: URL.createObjectURL(new Blob([JSON.stringify(toProfile(model), null, 2)], { type: "application/json" })) });
    a.click();
  }
  async function importJson(e) {
    const file = e.target.files[0];
    if (!file) return;
    setModel(fromProfile(JSON.parse(await file.text())));
    setSelected(null);
  }

  const tile = model.tiles.find((x) => x.key === selected);
  const width = tile ? model.rows[rowOf(model, tile.key)]?.items.find((e) => e.key === tile.key)?.width ?? 1000 : 0;
  const profile = toProfile(model);
  const prompt = makePrompt(profile, pictures(profile, window.location.origin, uploads), lang);
  const overlayTile = active?.type === "tile" ? model.tiles.find((x) => x.key === active.id) : null;
  const OverlayIcon = active?.type === "library" ? ICONS[active.kind] : null;

  return (
    <section id="workspace" className="tile paper workspace">
      <div className="ws-head">
        <div><span className="label"><i />{t.ws.title}</span><p className="hint">{t.ws.hint}</p></div>
        <div className="ws-actions">
          <button type="button" className="btn ghost" onClick={() => { forget(); setModel(fromProfile(defaultProfile)); setSelected(null); }}><RotateCcw size={16} />{t.ws.reset}</button>
          <label className="btn ghost file"><FileUp size={16} />{t.ws.importJson}<input type="file" accept=".json,application/json" onChange={importJson} /></label>
          <button type="button" className="btn ghost" onClick={download}><FileDown size={16} />{t.ws.exportJson}</button>
          <button type="button" className="btn coral" onClick={() => setPromptOpen(true)}><Wand2 size={18} />{t.ws.prompt}</button>
        </div>
      </div>
      <DndContext sensors={sensors} collisionDetection={collide} measuring={{ droppable: { strategy: MeasuringStrategy.Always } }}
        onDragStart={dragStart} onDragOver={dragOver} onDragEnd={dragEnd} onDragCancel={() => setActive(null)}>
        <div className="ws-body">
          <Library t={t} lang={lang} tiles={model.tiles} onAdd={add} />
          <div className="ws-canvas" ref={canvasRef}>
            <Canvas model={model} uploads={uploads} selected={selected} dragging={Boolean(active)} t={t}
              onSelect={setSelected} onResize={resize} />
          </div>
          <Panel t={t} lang={lang} model={model} tile={tile} width={width}
            onData={(d) => setData(tile.key, d)} onImage={(f, file) => image(tile.key, f, file)} onWidth={(w) => setWidth(tile.key, w)}
            onRemove={() => remove(tile.key)} onClose={() => setSelected(null)} onSettings={(s) => change((m) => Object.assign(m, s))} />
        </div>
        <DragOverlay dropAnimation={{ duration: 220, easing: "cubic-bezier(.2,.8,.2,1)" }}>
          {overlayTile && (
            <div className="bc drag-overlay" style={{ "--u": `${active.u}px` }} dir={model.lang === "fa" ? "rtl" : "ltr"}>
              <div className="wrap" style={{ width: "100%", height: "100%" }}><div className="tile-html" dangerouslySetInnerHTML={{ __html: tileHtml(overlayTile, model.lang, uploads) }} /></div>
            </div>
          )}
          {OverlayIcon && <div className="lib-ghost"><span className="lib-icon"><OverlayIcon size={18} /></span><b>{KIND_TEXT[lang][active.kind][0]}</b></div>}
        </DragOverlay>
      </DndContext>
      <PromptDialog t={t} open={promptOpen} text={prompt} onClose={() => setPromptOpen(false)} onDownload={download} />
    </section>
  );
}
