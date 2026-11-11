import { Trash2, X, Upload } from "lucide-react";
import { useState } from "react";
import { FIELD_TEXT, KIND_TEXT } from "../../i18n.js";
import { FIELDS, TONES, read, write } from "./fields.js";
import { ICONS } from "./Library.jsx";

function Field({ tile, spec, lang, onData, onImage }) {
  const [name, type = "text"] = Array.isArray(spec) ? spec : [spec];
  const label = FIELD_TEXT[lang][{ groups: "groups", lines: "lines", links: "linkItems" }[type] ?? name] ?? name;
  const [text, setText] = useState(read(tile, name, type));
  const change = (v) => { setText(v); onData(write(tile, name, type, v)); };
  const id = `f-${tile.key}-${name}`;
  let input;
  if (["area", "groups", "lines", "links"].includes(type)) input = <textarea id={id} rows={type === "area" ? 3 : 5} dir="auto" value={text} onChange={(e) => change(e.target.value)} />;
  else if (type === "tone") input = <select id={id} value={tile.data.tone ?? ""} onChange={(e) => change(e.target.value)}>{TONES.map((x) => <option key={x}>{x}</option>)}</select>;
  else if (type === "dir") input = <select id={id} value={tile.data.titleDir ?? "auto"} onChange={(e) => change(e.target.value)}>{["auto", "rtl", "ltr"].map((x) => <option key={x}>{x}</option>)}</select>;
  else if (type === "image") input = (
    <label className="upload" htmlFor={id}>
      <Upload size={16} /><span>{tile.data[name] ? tile.data[name].replace(/^images\//, "") : FIELD_TEXT[lang].upload}</span>
      <input id={id} type="file" accept="image/*" onChange={(e) => e.target.files[0] && onImage(name, e.target.files[0])} />
    </label>
  );
  else input = <input id={id} dir="auto" value={text} onChange={(e) => change(e.target.value)} />;
  return <div className="field"><label htmlFor={id}>{label}</label>{input}</div>;
}

// The side panel: the selected tile's fields and width, or the README's settings.
export default function Panel({ t, lang, model, tile, width, onData, onImage, onWidth, onRemove, onClose, onSettings }) {
  if (!tile) return (
    <div className="panel">
      <span className="label"><i />{t.ws.settings}</span>
      <div className="field"><label htmlFor="s-github">{t.ws.github}</label>
        <input id="s-github" dir="ltr" placeholder="your-username" value={model.github} onChange={(e) => onSettings({ github: e.target.value.trim() })} /></div>
      <div className="field"><label htmlFor="s-lang">{t.ws.readmeLang}</label>
        <select id="s-lang" value={model.lang} onChange={(e) => onSettings({ lang: e.target.value })}>
          <option value="fa">فارسی (راست به چپ)</option><option value="en">English (left to right)</option></select></div>
      <label className="check"><input type="checkbox" checked={model.stats} onChange={(e) => onSettings({ stats: e.target.checked })} />{t.ws.stats}</label>
      <p className="hint">{t.ws.hint}</p>
    </div>
  );
  const Icon = ICONS[tile.kind];
  return (
    <div className="panel" key={tile.key}>
      <div className="panel-head">
        <span className="lib-icon"><Icon size={18} /></span><b>{KIND_TEXT[lang][tile.kind][0]}</b>
        <button type="button" className="btn ghost icon" onClick={onClose} aria-label={t.ws.close}><X size={18} /></button>
      </div>
      {FIELDS[tile.kind].map((spec) => <Field key={String(spec)} tile={tile} spec={spec} lang={lang} onData={onData} onImage={onImage} />)}
      <div className="field">
        <label htmlFor="f-width">{t.ws.width} <output>{Math.round(width / 10)}%</output></label>
        <input id="f-width" type="range" min="120" max="1000" step="10" value={width} onChange={(e) => onWidth(Number(e.target.value))} />
      </div>
      <button type="button" className="btn ghost danger" onClick={onRemove}><Trash2 size={16} />{t.ws.remove}</button>
    </div>
  );
}
