import { Trash2, X, Upload } from "lucide-react";
import { useState } from "react";
import { FIELD_TEXT, KIND_TEXT, PALETTE_TEXT, TONE_TEXT } from "../../i18n.js";
import { FIELDS, TONE_OF, read, write } from "./fields.js";
import ThemeField from "./ThemeField.jsx";
import ToneField from "./ToneField.jsx";
import ImageEditor from "./ImageEditor.jsx";
import { ICONS } from "./Library.jsx";
import Select from "./Select.jsx";

function Field({ tile, spec, lang, t, theme, uploads, onData, onImage }) {
  const [name, type = "text"] = Array.isArray(spec) ? spec : [spec];
  const label = FIELD_TEXT[lang][{ groups: "groups", lines: "lines", links: "linkItems" }[type] ?? name] ?? name;
  const [text, setText] = useState(read(tile, name, type));
  const change = (v) => { setText(v); onData(write(tile, name, type, v)); };
  const id = `f-${tile.key}-${name}`;
  let input;
  if (["area", "groups", "lines", "links"].includes(type)) input = <textarea id={id} rows={type === "area" ? 3 : 5} dir="auto" value={text} onChange={(e) => change(e.target.value)} />;
  else if (type === "tone") input = <ToneField id={id} value={tile.data.tone ?? TONE_OF[tile.kind] ?? "paper"} theme={theme} names={TONE_TEXT[lang]} labels={t.color} onChange={change} />;
  else if (type === "dir") input = <Select id={id} value={tile.data.titleDir ?? "auto"} options={["auto", "rtl", "ltr"].map((v) => ({ value: v, label: FIELD_TEXT[lang][`dir-${v}`] }))} onChange={change} />;
  else if (type === "image") input = (
    <>
      <label className="upload" htmlFor={id}>
        <Upload size={16} /><span>{tile.data[name] ? tile.data[name].replace(/^images\//, "") : FIELD_TEXT[lang].upload}</span>
        <input id={id} type="file" accept="image/*" onChange={(e) => e.target.files[0] && onImage(name, e.target.files[0])} />
      </label>
      {tile.data[name] && <ImageEditor tile={tile} field={name} uploads={uploads} x={t.img} onData={onData} />}
    </>
  );
  else input = <input id={id} dir="auto" value={text} onChange={(e) => change(e.target.value)} />;
  return <div className="field"><label htmlFor={id}>{label}</label>{input}</div>;
}

// The side panel: the selected tile's fields and width, or the README's settings.
export default function Panel({ t, lang, model, tile, width, uploads, onData, onImage, onWidth, onRemove, onClose, onSettings }) {
  if (!tile) return (
    <div className="panel">
      <span className="label"><i />{t.ws.settings}</span>
      <div className="field"><label htmlFor="s-github">{t.ws.github}</label>
        <input id="s-github" dir="ltr" placeholder="your-username" value={model.github} onChange={(e) => onSettings({ github: e.target.value.trim() })} /></div>
      <div className="field"><label htmlFor="s-lang">{t.ws.readmeLang}</label>
        <Select id="s-lang" value={model.lang} onChange={(v) => onSettings({ lang: v })}
          options={[{ value: "fa", label: "فارسی (راست به چپ)" }, { value: "en", label: "English (left to right)" }]} /></div>
      <ThemeField theme={model.theme} names={PALETTE_TEXT[lang]} labels={t.color} onChange={(theme) => onSettings({ theme })} />
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
      {(tile.kind === "stat" || tile.kind === "year") && <p className="hint">{KIND_TEXT[lang][tile.kind][1]}. {t.ws.statsNote}</p>}
      {FIELDS[tile.kind].map((spec) => <Field key={String(spec)} tile={tile} spec={spec} lang={lang} t={t} theme={model.theme} uploads={uploads} onData={onData} onImage={onImage} />)}
      <div className="field">
        <label htmlFor="f-width">{t.ws.width} <output>{Math.round(width / 10)}%</output></label>
        <input id="f-width" type="range" min="120" max="1000" step="10" value={width} onChange={(e) => onWidth(Number(e.target.value))} />
      </div>
      <button type="button" className="btn ghost danger" onClick={onRemove}><Trash2 size={16} />{t.ws.remove}</button>
    </div>
  );
}
