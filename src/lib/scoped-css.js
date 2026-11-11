// The skill's tile CSS is written in px for a 1040px canvas. Here every rule is scoped to the canvas
// (.bc) and every px becomes a unit of the canvas's own width (--u = 1/1040 of it, from a container
// query), so the tiles look the same at any size without zoom or transforms, which would throw off
// drag and drop.
import { css, THEMES } from "../skill/tiles.js";

const unit = (s) => s.replace(/(-?\d*\.?\d+)px/g, (_, n) => `calc(${n} * var(--u))`);

export function canvasCss(theme = {}) {
  const raw = css({ ...THEMES.nimbyte, ...theme }, "/fonts");
  const faces = raw.match(/@font-face[^}]*}/g).join("\n");
  const rules = raw.replace(/@font-face[^}]*}/g, "").replace(/:root\s*{/, ".bc {").replace(/(^|})\s*body\s*{[^}]*}/, "$1");
  const scoped = rules.replace(/(^|})\s*([^{}@]+){/g, (m, end, sel) => {
    if (sel.trim() === ".bc") return `${end} .bc {`;
    return `${end} ${sel.split(",").map((x) => `.bc ${x.trim()}`).join(", ")} {`;
  });
  return `${faces}\n${unit(scoped)}`;
}

// The px in a tile's own inline styles get the same treatment.
export const scaled = (html) => html.replace(/style="([^"]*)"/g, (_, s) => `style="${unit(s)}"`);
