import { Braces, ChevronDown, Download, FileArchive, FileImage, FileText, LoaderCircle } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const ITEMS = [["zip", FileArchive], ["png", FileImage], ["pdf", FileText], ["json", Braces]];

// The downloads: a ZIP to push to the profile repository as it is, the README as a PNG or a
// PDF, and profile.json. Pictures are drawn in the browser, so it takes a moment.
export default function ExportMenu({ x, onExport }) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(null);
  const [note, setNote] = useState("");
  const ref = useRef(null);
  useEffect(() => {
    if (!open) return;
    const away = (e) => !ref.current?.contains(e.target) && setOpen(false);
    const esc = (e) => e.key === "Escape" && setOpen(false);
    window.addEventListener("pointerdown", away);
    window.addEventListener("keydown", esc);
    return () => { window.removeEventListener("pointerdown", away); window.removeEventListener("keydown", esc); };
  }, [open]);
  async function run(kind) {
    setBusy(kind);
    setNote("");
    try {
      const r = await onExport(kind);
      setNote(kind === "zip" ? (r?.skipped ? x.zipSkipped : x.zipDone) : "");
      if (kind !== "zip") setOpen(false);
    } catch (e) {
      console.error(e);
      setNote(x.failed);
    } finally { setBusy(null); }
  }
  return (
    <div className="export" ref={ref}>
      <button type="button" className="btn ghost" aria-expanded={open} aria-haspopup="menu" onClick={() => setOpen((o) => !o)}>
        {busy ? <LoaderCircle size={16} className="spin" /> : <Download size={16} />}{x.title}<ChevronDown size={14} />
      </button>
      {open && (
        <div className="export-menu" role="menu">
          {ITEMS.map(([kind, Icon]) => (
            <button key={kind} type="button" role="menuitem" disabled={Boolean(busy)} onClick={() => run(kind)}>
              <span className="lib-icon">{busy === kind ? <LoaderCircle size={18} className="spin" /> : <Icon size={18} />}</span>
              <span className="lib-text"><b>{x[kind][0]}</b><small>{x[kind][1]}</small></span>
            </button>
          ))}
          {note && <p className="export-note" role="status">{note}</p>}
        </div>
      )}
    </div>
  );
}
