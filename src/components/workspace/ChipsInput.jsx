import { Plus, X } from "lucide-react";
import { useId, useRef, useState } from "react";
import Popover from "./Popover.jsx";

const SPLIT = /[,،]/;
const same = (a, b) => a.toLowerCase() === b.toLowerCase();

// A list as badges: type and press Enter or a comma to add one, × (or Backspace in an empty
// input) to remove it. With `options`, it's also a list to pick from as you type; what isn't on
// it can be added, and onNew hears about it.
export default function ChipsInput({ id, value = [], holder, icon: Icon, options, labels, onChange, onNew }) {
  const [text, setText] = useState("");
  const [open, setOpen] = useState(false);
  const [hi, setHi] = useState(0);
  const box = useRef(null);
  const input = useRef(null);
  const list = useId();
  const q = text.trim();
  const found = options ? options.filter((o) => !value.some((v) => same(v, o)) && o.toLowerCase().includes(q.toLowerCase())).slice(0, 40) : [];
  const fresh = options && q && !options.some((o) => same(o, q)) && !value.some((v) => same(v, q));
  // the list's own matches first (those that start with what's typed, then the rest), adding last
  const starts = (o) => (o.toLowerCase().startsWith(q.toLowerCase()) ? 0 : 1);
  const items = [...[...found].sort((a, b) => starts(a) - starts(b)).map((o) => ({ pick: o })), ...(fresh ? [{ add: q }] : [])];
  const show = open && options && items.length > 0;

  function add(raw) {
    const next = [...value];
    for (const part of raw.split(SPLIT).map((x) => x.trim()).filter(Boolean)) {
      if (next.some((v) => same(v, part))) continue;
      const known = options?.find((o) => same(o, part));
      next.push(known ?? part);
      if (options && !known) onNew?.(part);
    }
    if (next.length !== value.length) onChange(next);
    setText("");
    setHi(0);
  }
  const remove = (i) => onChange(value.filter((_, k) => k !== i));
  function type(v) {
    if (SPLIT.test(v)) {
      const parts = v.split(SPLIT);
      add(parts.slice(0, -1).join(","));
      setText(parts.at(-1));
    } else setText(v);
    setOpen(true);
    setHi(0);
  }
  function key(e) {
    const move = { ArrowDown: 1, ArrowUp: -1 }[e.key];
    if (move && options) { e.preventDefault(); setOpen(true); setHi((h) => (h + move + items.length) % Math.max(1, items.length)); }
    else if (e.key === "Enter") { e.preventDefault(); const it = show ? items[hi] : null; add(it ? it.add ?? it.pick : text); }
    else if (e.key === "Backspace" && !text && value.length) remove(value.length - 1);
    else if (e.key === "Escape" && show) { e.preventDefault(); setOpen(false); }
  }

  return (
    <div ref={box} className="chips-input" onClick={() => input.current?.focus()}>
      {Icon && <Icon size={16} aria-hidden="true" className="ci-icon" />}
      <div className="ci-badges">
        {value.map((v, i) => (
          <span key={`${v}-${i}`} className="badge" dir="auto">
            {v}
            <button type="button" aria-label={`${labels.remove} ${v}`} onClick={(e) => { e.stopPropagation(); remove(i); }}><X size={12} /></button>
          </span>
        ))}
        <input ref={input} id={id} className="bare" dir="auto" value={text} placeholder={value.length ? labels.more : holder}
          role={options ? "combobox" : undefined} aria-expanded={options ? show : undefined} aria-controls={options ? list : undefined}
          aria-activedescendant={show ? `${list}-${hi}` : undefined}
          onChange={(e) => type(e.target.value)} onKeyDown={key} onFocus={() => setOpen(true)}
          onBlur={() => { setOpen(false); if (text.trim()) add(text); }} />
      </div>
      {show && (
        <Popover anchor={box} className="select-pop">
          <ul id={list} role="listbox">
            {items.map((it, i) => (
              <li key={it.add ? `+${it.add}` : it.pick} id={`${list}-${i}`} role="option" aria-selected={i === hi} className={`${i === hi ? "hi" : ""}${it.add ? " add" : ""}`}
                onPointerEnter={() => setHi(i)} onPointerDown={(e) => e.preventDefault()} onClick={() => add(it.add ?? it.pick)}>
                {it.add ? <><Plus size={15} /><span>{labels.add.replace("{x}", it.add)}</span></> : <span dir="auto">{it.pick}</span>}
              </li>
            ))}
          </ul>
        </Popover>
      )}
    </div>
  );
}
