import { Link2, LoaderCircle, Upload, Wand2 } from "lucide-react";
import { useState } from "react";
import { FIELD_TEXT, HOLDER, TONE_TEXT } from "../../i18n.js";
import { LinkError, linkMeta } from "../../lib/link-meta.js";
import { TONE_OF, read, write } from "./fields.js";
import ImageEditor from "./ImageEditor.jsx";
import Select from "./Select.jsx";
import ToneField from "./ToneField.jsx";

const AREAS = ["area", "groups", "lines", "links", "bars"];

// A link's input: left to right, with a link icon on its left (and, for tiles filled from a link,
// a button that fills them).
function LinkInput({ id, value, holder, onChange, children }) {
  return (
    <div className="link-input" dir="ltr">
      <Link2 size={16} aria-hidden="true" />
      <input id={id} className="bare" type="url" inputMode="url" dir="ltr" spellCheck={false} placeholder={holder} value={value} onChange={(e) => onChange(e.target.value)} />
      {children}
    </div>
  );
}

// One field of the selected tile, by its spec ("name" or [name, type]).
export default function Field({ tile, spec, lang, t, theme, uploads, onData, onImage, onFilled }) {
  const [name, given = "text"] = Array.isArray(spec) ? spec : [spec];
  const type = given === "text" && name === "href" ? "link" : given;
  const words = FIELD_TEXT[lang];
  const label = words[{ groups: "groups", lines: "lines", links: "linkItems", bars: "bars" }[type] ?? name] ?? name;
  const holder = HOLDER[lang][`${tile.kind}.${name}`] ?? HOLDER[lang][type === "link" ? "link" : name] ?? "";
  const [text, setText] = useState(read(tile, name, type === "fetch" || type === "link" ? "text" : type));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const change = (v) => { setText(v); onData(write(tile, name, type === "fetch" || type === "link" ? "text" : type, v)); };
  const id = `f-${tile.key}-${name}`;

  async function fill() {
    if (!text.trim()) return;
    setBusy(true);
    setError("");
    try {
      onData({ ...tile.data, [name]: text.trim(), ...(await linkMeta(tile.kind, text)) });
      onFilled();
    } catch (e) {
      setError(words[`fetch-${e instanceof LinkError ? e.message : "down"}`]);
    } finally { setBusy(false); }
  }

  let input;
  if (AREAS.includes(type)) input = <textarea id={id} rows={type === "area" ? 3 : 5} dir="auto" placeholder={holder} value={text} onChange={(e) => change(e.target.value)} />;
  else if (type === "tone") input = <ToneField id={id} value={tile.data.tone ?? TONE_OF[tile.kind] ?? "paper"} theme={theme} names={TONE_TEXT[lang]} labels={t.color} onChange={change} />;
  else if (type === "dir") input = <Select id={id} value={tile.data.titleDir ?? "auto"} options={["auto", "rtl", "ltr"].map((v) => ({ value: v, label: words[`dir-${v}`] }))} onChange={change} />;
  else if (type === "link") input = <LinkInput id={id} value={text} holder={holder} onChange={change} />;
  else if (type === "fetch") input = (
    <>
      <LinkInput id={id} value={text} holder={holder} onChange={(v) => { setText(v); setError(""); }}>
        <button type="button" className="btn dark small" disabled={busy || !text.trim()} onClick={fill} onKeyDown={(e) => e.key === "Enter" && fill()}>
          {busy ? <LoaderCircle size={14} className="spin" /> : <Wand2 size={14} />}{words.fetch}
        </button>
      </LinkInput>
      {error && <p className="field-error" role="alert">{error}</p>}
    </>
  );
  else if (type === "image") input = (
    <>
      <label className="upload" htmlFor={id}>
        <Upload size={16} /><span>{tile.data[name] ? tile.data[name].replace(/^images\//, "") : words.upload}</span>
        <input id={id} type="file" accept="image/*" onChange={(e) => e.target.files[0] && onImage(name, e.target.files[0])} />
      </label>
      {tile.data[name] && <ImageEditor tile={tile} field={name} uploads={uploads} x={t.img} theme={theme} tones={TONE_TEXT[lang]} colors={t.color} onData={onData} />}
    </>
  );
  else input = <input id={id} dir={type === "num" || type === "clock" ? "ltr" : "auto"} inputMode={type === "num" ? "numeric" : undefined}
    placeholder={holder} value={text} onChange={(e) => change(e.target.value)} />;
  return <div className="field"><label htmlFor={id}>{label}</label>{input}</div>;
}
