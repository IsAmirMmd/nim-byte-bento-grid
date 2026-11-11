// A tile's HTML for the canvas, drawn by the skill's own code, with pictures resolved: the
// README's pictures ("images/x.png") come from the user's uploads, then the site's own images.
import { TILES } from "../skill/tiles.js";
import { STRINGS, statRows } from "../skill/layout.js";
import { statTile, yearTile } from "../skill/stat-tiles.js";
import { sampleStats } from "./sample-stats.js";
import { scaled } from "./scoped-css.js";

export const BUNDLED = ["bitty.svg", "melting-bear.png", "adsprovider.png", "nakoja.png"];
const blank = (name) => `data:image/svg+xml;utf8,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="760"><rect width="100%" height="100%" fill="#ebe3d6"/><text x="50%" y="50%" font-family="sans-serif" font-size="54" fill="#5c5650" text-anchor="middle" dominant-baseline="middle">${name || "+"}</text></svg>`)}`;

export function picture(src, uploads) {
  if (!src) return blank("");
  if (/^(https?|data|blob):/.test(src)) return src;
  const name = src.replace(/^images\//, "");
  return uploads[name] ?? (BUNDLED.includes(name) ? `/images/${name}` : blank(name));
}

export function tileHtml(tile, lang, uploads) {
  const s = STRINGS[lang];
  const d = tile.data;
  const html = {
    image: () => TILES.image({ ...d, src: picture(d.src, uploads) }),
    project: () => TILES.project({ ...d, image: picture(d.image, uploads) }),
    photo: () => TILES.photo({ ...d, src: picture(d.src, uploads) }),
    stack: () => TILES.stack(d, { label: s.stack }),
    experience: () => TILES.experience(d, { label: s.experience }),
    education: () => TILES.education({ label: s.education, ...d }),
    stat: () => statTile(statData(d.id, lang), sampleStats, lang),
    year: () => yearTile(statData("year", lang), sampleStats, lang),
  }[tile.kind] ?? (() => TILES[tile.kind](d, {}));
  return scaled(html());
}

// a stats tile's title and tone, as the skill gives them
const statData = (id, lang) => statRows({ lang }).flatMap((r) => r.tiles).find((x) => x.id === `stat-${id}`).data;
export const statHtml = (t, lang) => scaled(t.kind === "stat" ? statTile(t.data, sampleStats, lang) : yearTile(t.data, sampleStats, lang));
export const MIN = { hero: 300, image: 300, now: 230, feature: 230, contact: 116, photo: 230, quote: 200, number: 180, status: 160, stat: 150, year: 200, music: 200, repo: 180, video: 230, progress: 160 };
