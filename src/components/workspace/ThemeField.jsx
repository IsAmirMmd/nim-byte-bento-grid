import { useCallback, useRef, useState } from "react";
import { PALETTES } from "../../skill/tiles.js";
import ColorPicker from "./ColorPicker.jsx";
import { shades } from "./ToneField.jsx";

// The README's palette: ten ready ones, five shades each, or your own five (any of them edited).
export default function ThemeField({ theme = {}, names, labels, onChange }) {
  const [edit, setEdit] = useState(null);
  const own = useRef(null);
  const now = shades(theme);
  const current = theme.colors ? "custom" : theme.palette ?? "nimbyte";
  const close = useCallback(() => setEdit(null), []);
  return (
    <div className="field">
      <label>{labels.palette}</label>
      <div className="palettes" role="radiogroup" aria-label={labels.palette}>
        {Object.entries(PALETTES).map(([name, five]) => (
          <button key={name} type="button" role="radio" aria-checked={current === name} className={`palette${current === name ? " on" : ""}`}
            onClick={() => onChange(name === "nimbyte" ? {} : { palette: name })}>
            <span className="stripes">{five.map((c) => <i key={c} style={{ backgroundColor: c }} />)}</span>
            <small>{names[name]}</small>
          </button>
        ))}
      </div>
      <label>{labels.own}{current === "custom" && <output>{names.custom}</output>}</label>
      <div className="own" ref={own}>
        {now.map((c, k) => (
          <button key={k} type="button" data-picker-trigger className={`tone${edit === k ? " on" : ""}`} style={{ backgroundColor: c }}
            aria-label={`${labels.shade} ${k + 1}`} onClick={() => setEdit(edit === k ? null : k)} />
        ))}
        {edit !== null && (
          <ColorPicker key={edit} anchor={own} value={now[edit]} swatches={now} labels={labels} onClose={close}
            onChange={(hex) => onChange({ colors: now.map((c, k) => (k === edit ? hex : c)) })} />
        )}
      </div>
      <p className="hint">{labels.ownHint}</p>
    </div>
  );
}
