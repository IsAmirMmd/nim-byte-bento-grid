import { Plus } from "lucide-react";
import { useState } from "react";
import { themeOf, PALETTES } from "../../skill/tiles.js";
import { HEX } from "../../lib/color.js";
import ColorPicker from "./ColorPicker.jsx";

export const TONES = ["paper", "sand", "accent-soft", "accent", "accent-ink", "ink", "blue", "green"];
const ROLE = { paper: "paper", sand: "sand", "accent-soft": "accentSoft", accent: "accent", "accent-ink": "accentInk", ink: "ink", blue: "blueSoft", green: "greenSoft" };
export const toneColor = (tone, theme) => (HEX.test(tone) ? tone : themeOf(theme)[ROLE[tone]]);
// the theme's five shades, as the picker's quick swatches
export const shades = (theme) => { const t = themeOf(theme); return ["sand", "accentSoft", "accent", "accentInk", "ink"].map((r) => t[r]); };
const READY = [...new Set(Object.values(PALETTES).map((p) => p[2]))];

// A tile's colour: the palette's tones as swatches, or any colour from the picker.
export default function ToneField({ id, value, theme, names, labels, onChange }) {
  const [open, setOpen] = useState(false);
  const custom = HEX.test(value);
  return (
    <div className="tones" id={id} role="radiogroup">
      {TONES.map((t) => (
        <button key={t} type="button" role="radio" aria-checked={value === t} aria-label={names[t]} title={names[t]}
          className={`tone${value === t ? " on" : ""}`} style={{ backgroundColor: toneColor(t, theme) }} onClick={() => onChange(t)} />
      ))}
      <button type="button" data-picker-trigger role="radio" aria-checked={custom} title={labels.custom} aria-label={labels.custom}
        className={`tone more${custom ? " on" : ""}`} style={custom ? { backgroundColor: value } : undefined} onClick={() => setOpen((o) => !o)}>
        {!custom && <Plus size={16} />}
      </button>
      {open && <ColorPicker value={custom ? value : toneColor(value, theme)} swatches={[...shades(theme), ...READY]} labels={labels}
        onChange={onChange} onClose={() => setOpen(false)} />}
    </div>
  );
}
