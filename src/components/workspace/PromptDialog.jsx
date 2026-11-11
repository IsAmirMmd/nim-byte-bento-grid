import { Check, Copy, Download, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

// The prompt for the user's agent, with a copy button and profile.json to download.
export default function PromptDialog({ t, open, text, onClose, onDownload }) {
  const ref = useRef(null);
  const [copied, setCopied] = useState(false);
  useEffect(() => {
    const d = ref.current;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);
  async function copy() {
    try { await navigator.clipboard.writeText(text); } catch { ref.current.querySelector("textarea").select(); document.execCommand?.("copy"); }
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  }
  return (
    <dialog ref={ref} className="prompt" onClose={onClose} onClick={(e) => e.target === ref.current && onClose()}>
      <div className="prompt-head">
        <b>{t.ws.promptTitle}</b>
        <button type="button" className="btn ghost icon" onClick={onClose} aria-label={t.ws.close}><X size={18} /></button>
      </div>
      <p className="hint">{t.ws.promptHelp}</p>
      <textarea readOnly dir="ltr" value={text} rows={16} />
      <div className="actions">
        <button type="button" className="btn coral" onClick={copy}>{copied ? <Check size={18} /> : <Copy size={18} />}{copied ? t.ws.copied : t.ws.copy}</button>
        <button type="button" className="btn" onClick={onDownload}><Download size={18} />{t.ws.exportJson}</button>
      </div>
    </dialog>
  );
}
