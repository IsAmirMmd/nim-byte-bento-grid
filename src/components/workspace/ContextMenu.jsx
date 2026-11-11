import { ArrowDown, ArrowUp, Columns3, Copy, Pencil, Rows3, Trash2 } from "lucide-react";
import { useEffect, useRef } from "react";

const ICONS = { edit: Pencil, copy: Copy, ownRow: Rows3, equal: Columns3, up: ArrowUp, down: ArrowDown, remove: Trash2 };

// A tile's menu, opened by right-click or its ⋯ button: kept inside the window, closed by a click
// outside, Escape or scrolling.
export default function ContextMenu({ menu, items, labels, why, onPick, onClose }) {
  const ref = useRef(null);
  useEffect(() => {
    if (!menu) return;
    const away = (e) => !ref.current?.contains(e.target) && onClose();
    const key = (e) => e.key === "Escape" && onClose();
    window.addEventListener("pointerdown", away);
    window.addEventListener("keydown", key);
    window.addEventListener("scroll", onClose, true);
    ref.current?.querySelector("button:not([aria-disabled])")?.focus();
    return () => { window.removeEventListener("pointerdown", away); window.removeEventListener("keydown", key); window.removeEventListener("scroll", onClose, true); };
  }, [menu, onClose]);
  if (!menu) return null;
  const x = Math.min(menu.x, window.innerWidth - 230);
  const y = Math.min(menu.y, window.innerHeight - items.length * 42 - 20);
  return (
    <div ref={ref} className="ctx-menu" role="menu" style={{ left: Math.max(8, x), top: Math.max(8, y) }}>
      {items.map(({ id, disabled, reason }) => {
        const Icon = ICONS[id];
        return (
          <button key={id} type="button" role="menuitem" aria-disabled={disabled || undefined} data-tip={disabled ? why[reason] : undefined}
            className={id === "remove" ? "danger" : ""} onClick={() => { if (disabled) return; onPick(id); onClose(); }}>
            <Icon size={16} />{labels[id]}
          </button>
        );
      })}
    </div>
  );
}
