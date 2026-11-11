import { Check, ChevronDown } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import Popover from "./Popover.jsx";

// A select in the site's look (the browser's own list can't be styled): a paper button and a
// raised list under it. Keyboard: arrows, Home/End, Enter or Space to pick, Escape to close.
export default function Select({ id, value, options, onChange, swatch }) {
  const [open, setOpen] = useState(false);
  const [hi, setHi] = useState(0);
  const ref = useRef(null);
  const list_ = useRef(null);
  const list = useId();
  const at = Math.max(0, options.findIndex((o) => o.value === value));
  useEffect(() => {
    if (!open) return;
    const away = (e) => !ref.current?.contains(e.target) && !list_.current?.contains(e.target) && setOpen(false);
    window.addEventListener("pointerdown", away);
    return () => window.removeEventListener("pointerdown", away);
  }, [open]);
  useEffect(() => { if (open) list_.current?.querySelector(`[data-i="${hi}"]`)?.scrollIntoView({ block: "nearest" }); }, [open, hi]);
  const pick = (i) => { onChange(options[i].value); setOpen(false); ref.current?.querySelector("button")?.focus(); };
  function key(e) {
    const n = options.length;
    const move = { ArrowDown: 1, ArrowUp: -1 }[e.key];
    if (move) { e.preventDefault(); if (!open) { setOpen(true); setHi(at); } else setHi((h) => (h + move + n) % n); }
    else if (e.key === "Home" || e.key === "End") { e.preventDefault(); setHi(e.key === "Home" ? 0 : n - 1); }
    else if (e.key === "Enter" || e.key === " ") { e.preventDefault(); if (open) pick(hi); else { setOpen(true); setHi(at); } }
    else if (e.key === "Escape" && open) { e.preventDefault(); setOpen(false); }
    else if (e.key === "Tab") setOpen(false);
  }
  const Dot = ({ v }) => swatch && <i className={`swatch sw-${v}`} />;
  return (
    <div className={`select${open ? " open" : ""}`} ref={ref} onKeyDown={key}>
      <button id={id} type="button" role="combobox" aria-expanded={open} aria-controls={list} aria-haspopup="listbox"
        aria-activedescendant={open ? `${list}-${hi}` : undefined} onClick={() => { setOpen((o) => !o); setHi(at); }}>
        <Dot v={options[at]?.value} /><span>{options[at]?.label}</span><ChevronDown size={16} />
      </button>
      {open && (
        <Popover anchor={ref} className="select-pop" onRef={(n) => { list_.current = n; }}>
        <ul id={list} role="listbox">
          {options.map((o, i) => (
            <li key={o.value} id={`${list}-${i}`} data-i={i} role="option" aria-selected={o.value === value}
              className={i === hi ? "hi" : ""} onPointerEnter={() => setHi(i)} onClick={() => pick(i)}>
              <Dot v={o.value} /><span>{o.label}</span>{o.value === value && <Check size={15} />}
            </li>
          ))}
        </ul>
        </Popover>
      )}
    </div>
  );
}
