// The README drawn off screen at its real size (a 1040px page, so --u is 1px), the way the skill's
// build.mjs draws it: rows of .wrap boxes, each with its tile, from the skill's own layout.
import { rows as layout, dirOf } from "../../skill/layout.js";
import { canvasCss } from "../scoped-css.js";
import { tileHtml } from "../render.js";

export async function mountStage(profile, uploads) {
  const host = document.createElement("div");
  host.className = "bc export-stage";
  host.setAttribute("aria-hidden", "true");
  Object.assign(host.style, { position: "fixed", left: "-12000px", top: "0", width: "1040px", pointerEvents: "none" });
  const rows = layout(profile);
  const lang = profile.lang === "fa" ? "fa" : "en";
  host.innerHTML = `<style>${canvasCss(profile.theme)}</style><div class="bc-stage" dir="${dirOf(profile)}">${rows.map((r) =>
    `<div class="x-row" style="display:flex;align-items:stretch">${r.tiles.map((t) =>
      `<div class="wrap" data-id="${t.id}" style="width:${t.width}px;min-height:${r.minHeight ?? 0}px">${tileHtml({ kind: t.kind, data: t.data }, lang, uploads)}</div>`).join("")}</div>`).join("")}</div>`;
  document.body.append(host);
  await document.fonts.ready;
  await Promise.all([...host.querySelectorAll("img")].map((i) => (i.complete ? null : new Promise((ok) => { i.onload = i.onerror = ok; }))));
  const tiles = rows.flatMap((r) => r.tiles).map((t) => ({ ...t, el: host.querySelector(`[data-id="${t.id}"]`) }));
  return { host, stage: host.querySelector(".bc-stage"), rows, tiles, remove: () => host.remove() };
}
