import { Trash2, X } from "lucide-react";
import { useState } from "react";
import { KIND_TEXT, PALETTE_TEXT } from "../../i18n.js";
import { FIELDS } from "./fields.js";
import Field from "./Field.jsx";
import ThemeField from "./ThemeField.jsx";
import { ICONS } from "./Library.jsx";
import Select from "./Select.jsx";

// The side panel: the selected tile's fields and width, or the README's settings.
export default function Panel({ t, lang, model, tile, width, uploads, onData, onImage, onWidth, onRemove, onClose, onSettings }) {
  const [rev, setRev] = useState(0); // bumped when a link fills the tile, so every field shows the new text
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
      {FIELDS[tile.kind].map((spec) =>
         <Field key={`${spec}-${rev}`} tile={tile} spec={spec} lang={lang} t={t} theme={model.theme} uploads={uploads}
        onData={onData} onImage={onImage} onFilled={() => setRev((r) => r + 1)} />)}
      <div className="field">
        <label htmlFor="f-width">{t.ws.width} <output>{Math.round(width / 10)}%</output></label>
        <input id="f-width" type="range" min="120" max="1000" step="10" value={width} onChange={(e) => onWidth(Number(e.target.value))} />
      </div>
      <button type="button" className="btn ghost danger" onClick={onRemove}><Trash2 size={16} />{t.ws.remove}</button>
    </div>
  );
}
