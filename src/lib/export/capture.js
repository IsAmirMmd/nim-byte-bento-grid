// Pictures of the off-screen README: each tile (2x, transparent around it, like build.mjs's
// screenshots), its dark-theme variant, or the whole README on the theme's ground.
import { getFontEmbedCSS, toBlob, toCanvas } from "html-to-image";
import { themeOf } from "../../skill/tiles.js";

export async function shooter(host) {
  const fontEmbedCSS = await getFontEmbedCSS(host);
  const opts = { pixelRatio: 2, fontEmbedCSS, cacheBust: false };
  return {
    tile: (el) => toBlob(el, opts),
    async dark(el) {
      const tile = el.querySelector(".tile");
      tile.classList.add("dark");
      try { return await toBlob(el, opts); } finally { tile.classList.remove("dark"); }
    },
    whole: (stage, theme) => toCanvas(stage, { ...opts, backgroundColor: themeOf(theme).cream }),
  };
}

export function save(blob, name) {
  const a = Object.assign(document.createElement("a"), { href: URL.createObjectURL(blob), download: name });
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 4000);
}
