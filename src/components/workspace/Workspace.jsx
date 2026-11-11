import { DndContext, DragOverlay, MeasuringStrategy } from "@dnd-kit/core";
import { FileUp, RotateCcw, Wand2 } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import defaultProfile from "../../data/default-profile.json";
import { fromProfile, toProfile, newTile, uid, save, load, forget, setStats } from "../../lib/state.js";
import { preview } from "../../lib/drop.js";
import { makePrompt, pictures } from "../../lib/prompt.js";
import { tileHtml } from "../../lib/render.js";
import { KIND_TEXT } from "../../i18n.js";
import { act, menuItems, rowOf, take } from "./actions.js";
import { useBoardDrag } from "./useBoardDrag.js";
import Canvas from "./Canvas.jsx";
import ContextMenu from "./ContextMenu.jsx";
import Library, { ICONS } from "./Library.jsx";
import Panel from "./Panel.jsx";
import PromptDialog from "./PromptDialog.jsx";
import ExportMenu from "./ExportMenu.jsx";
import "../../styles/workspace.css";
import "../../styles/controls.css";

const MIN_W = 120;

export default function Workspace({ t, lang }) {
  const [model, setModel] = useState(() => { const m = load(); return m?.rows ? m : fromProfile(defaultProfile); });
  const [uploads, setUploads] = useState({});
  const [selected, setSelected] = useState(null);
  const [menu, setMenu] = useState(null);
  const [promptOpen, setPromptOpen] = useState(false);
  const [reveal, setReveal] = useState(null); // a tile to scroll to and flash: one just added, or asked for
  const canvasRef = useRef(null);
  useEffect(() => save(model), [model]);
  useEffect(() => {
    if (!reveal) return;
    const el = canvasRef.current?.querySelector(`[data-key="${reveal}"]`);
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "center" });
    el.classList.remove("flash");
    void el.offsetWidth;
    el.classList.add("flash");
    setReveal(null);
  }, [reveal, model]);
  const change = useCallback((fn) => setModel((m) => { const n = structuredClone(m); fn(n); return n; }), []);
  const { drag, sensors, collide, handlers } = useBoardDrag({ model, change, canvasRef, onPlaced: setSelected });
  const closeMenu = useCallback(() => setMenu(null), []);

  function add(kind) {
    const tile = newTile(kind);
    const row = uid("r");
    change((m) => { m.tiles.push(structuredClone(tile)); m.rows.push({ id: row, items: [{ key: tile.key, width: 1000 }] }); });
    setSelected(tile.key);
    setReveal(tile.key);
  }
  function show(kind) {
    const tile = model.tiles.find((x) => x.kind === kind);
    if (tile) { setSelected(tile.key); setReveal(tile.key); }
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
  function pick(id) {
    const key = menu.key;
    if (id === "edit") return setSelected(key);
    const copy = uid();
    change((m) => act(m, key, id, copy));
    setSelected(id === "remove" ? null : id === "copy" ? copy : key);
    if (id !== "remove") setReveal(id === "copy" ? copy : key);
  }
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
  async function exportAs(kind) {
    if (kind === "json") return download();
    const { exportPng, exportPdf, exportZip } = await import("../../lib/export/index.js");
    return { png: exportPng, pdf: exportPdf, zip: exportZip }[kind](toProfile(model), uploads);
  }
  const settings = (s) => change((m) => { if ("stats" in s) setStats(m, s.stats); else Object.assign(m, s); });

  const tile = model.tiles.find((x) => x.key === selected);
  const width = tile ? model.rows[rowOf(model, tile.key)]?.items.find((e) => e.key === tile.key)?.width ?? 1000 : 0;
  const profile = toProfile(model);
  const prompt = makePrompt(profile, pictures(profile, window.location.origin, uploads), lang);
  const overlayTile = drag && !drag.kind ? model.tiles.find((x) => x.key === drag.key) : null;
  const OverlayIcon = drag?.kind ? ICONS[drag.kind] : null;

  return (
    <section id="workspace" className="tile paper workspace">
      <div className="ws-head">
        <div><span className="label"><i />{t.ws.title}</span><p className="hint">{t.ws.hint}</p></div>
        <div className="ws-actions">
          <button type="button" className="btn ghost" onClick={() => { forget(); setModel(fromProfile(defaultProfile)); setSelected(null); }}><RotateCcw size={16} />{t.ws.reset}</button>
          <label className="btn ghost file"><FileUp size={16} />{t.ws.importJson}<input type="file" accept=".json,application/json" onChange={importJson} /></label>
          <ExportMenu x={t.export} onExport={exportAs} />
          <button type="button" className="btn coral" onClick={() => setPromptOpen(true)}><Wand2 size={18} />{t.ws.prompt}</button>
        </div>
      </div>
      <DndContext sensors={sensors} collisionDetection={collide} autoScroll={{ threshold: { x: 0, y: 0.08 }, layoutShiftCompensation: false }} measuring={{ droppable: { strategy: MeasuringStrategy.Always } }} {...handlers}>
        <div className="ws-body">
          <Library t={t} lang={lang} tiles={model.tiles} onAdd={add} onReveal={show} />
          <div className="ws-canvas" ref={canvasRef}>
            <Canvas model={model} rows={drag ? preview(model.rows, drag.key, drag.target) : model.rows} uploads={uploads} selected={selected}
              drag={drag} t={t} onSelect={setSelected} onResize={resize} onMenu={(key, x, y) => setMenu({ key, x, y })} />
          </div>
          <Panel t={t} lang={lang} model={model} tile={tile} width={width}
            onData={(d) => setData(tile.key, d)} onImage={(f, file) => image(tile.key, f, file)} onWidth={(w) => setWidth(tile.key, w)}
            onRemove={() => remove(tile.key)} onClose={() => setSelected(null)} onSettings={settings} uploads={uploads} />
        </div>
        <DragOverlay dropAnimation={null}>
          {overlayTile && (
            <div className="bc drag-overlay" style={{ "--u": `${drag.u}px` }} dir={model.lang === "fa" ? "rtl" : "ltr"}>
              <div className="wrap" style={{ width: "100%", height: "100%" }}><div className="tile-html" dangerouslySetInnerHTML={{ __html: tileHtml(overlayTile, model.lang, uploads) }} /></div>
            </div>
          )}
          {OverlayIcon && <div className="lib-ghost"><span className="lib-icon"><OverlayIcon size={18} /></span><b>{KIND_TEXT[lang][drag.kind][0]}</b></div>}
        </DragOverlay>
      </DndContext>
      <ContextMenu menu={menu} items={menu ? menuItems(model, menu.key) : []} labels={t.menu} why={t.why} onPick={pick} onClose={closeMenu} />
      <PromptDialog t={t} open={promptOpen} text={prompt} onClose={() => setPromptOpen(false)} onDownload={download} />
    </section>
  );
}
