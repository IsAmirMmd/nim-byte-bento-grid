import { useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

// A box that floats over the whole page next to its anchor: below it when there's room, above it
// when there isn't, kept inside the window, following the anchor as the page or panel scrolls.
// It's drawn in <body>, so no scrolling panel or list clips it.
export default function Popover({ anchor, width, className = "", children, onRef }) {
  const ref = useRef(null);
  const [pos, setPos] = useState(null);
  useLayoutEffect(() => {
    let frame = 0;
    const place = () => {
      frame = 0;
      const a = anchor.current?.getBoundingClientRect();
      const box = ref.current;
      if (!a || !box) return;
      const w = width ?? a.width;
      const h = box.offsetHeight;
      const room = window.innerHeight - a.bottom - 8;
      const up = room < h + 8 && a.top > room;
      const rtl = getComputedStyle(anchor.current).direction === "rtl";
      let left = rtl ? a.right - w : a.left;
      left = Math.max(8, Math.min(left, window.innerWidth - w - 8));
      const top = up ? Math.max(8, a.top - h - 6) : Math.min(a.bottom + 6, window.innerHeight - h - 8);
      setPos({ left, top, width: w, up });
    };
    const soon = () => { if (!frame) frame = requestAnimationFrame(place); };
    place();
    const watch = new ResizeObserver(soon);
    if (ref.current) watch.observe(ref.current);
    window.addEventListener("scroll", soon, true);
    window.addEventListener("resize", soon);
    return () => { cancelAnimationFrame(frame); watch.disconnect(); window.removeEventListener("scroll", soon, true); window.removeEventListener("resize", soon); };
  }, [anchor, width]);
  return createPortal(
    <div ref={(n) => { ref.current = n; onRef?.(n); }} className={`popover ${className}${pos?.up ? " up" : ""}`}
      dir={document.documentElement.dir} style={pos ? { left: pos.left, top: pos.top, width: pos.width } : { visibility: "hidden", left: 0, top: 0, width }}>
      {children}
    </div>,
    document.body,
  );
}
