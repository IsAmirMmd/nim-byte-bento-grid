// The three exports: the README as one PNG, as a PDF, and as a ZIP ready to push to <user>/<user>.
import { zipSync, strToU8 } from "fflate";
import { bentoBlock } from "../../skill/readme.js";
import { dirOf } from "../../skill/layout.js";
import { pictures } from "../prompt.js";
import { mountStage } from "./stage.js";
import { save, shooter } from "./capture.js";
import { pictureFiles, skillFiles } from "./files.js";

const isStat = (t) => t.kind === "stat" || t.kind === "year";
const stem = (p) => (p.github ? `${p.github}-readme` : "bento-readme");

async function whole(profile, uploads) {
  const s = await mountStage(profile, uploads);
  try { return await (await shooter(s.host)).whole(s.stage, profile.theme); } finally { s.remove(); }
}

export async function exportPng(profile, uploads) {
  const canvas = await whole(profile, uploads);
  save(await new Promise((ok) => canvas.toBlob(ok, "image/png")), `${stem(profile)}.png`);
}

export async function exportPdf(profile, uploads) {
  const [{ jsPDF }, canvas] = await Promise.all([import("jspdf"), whole(profile, uploads)]);
  const w = canvas.width / 2;
  const h = canvas.height / 2;
  const pdf = new jsPDF({ unit: "px", format: [w, h], orientation: w > h ? "landscape" : "portrait", hotfixes: ["px_scaling"], compress: true });
  pdf.addImage(canvas, "PNG", 0, 0, w, h);
  pdf.save(`${stem(profile)}.pdf`);
}

// → { skipped } (true when the skill's scripts couldn't be fetched: the ZIP then has the README only)
export async function exportZip(profile, uploads) {
  const s = await mountStage(profile, uploads);
  const files = {};
  const folder = "assets/bento/v1";
  try {
    const shot = await shooter(s.host);
    for (const t of s.tiles.filter((x) => !isStat(x))) {
      files[`${folder}/${t.id}.png`] = new Uint8Array(await (await shot.tile(t.el)).arrayBuffer());
      if (t.ink) files[`${folder}/${t.id}-dark.png`] = new Uint8Array(await (await shot.dark(t.el)).arrayBuffer());
    }
    // the stats tiles join the README once the workflow has drawn them, as build.mjs does
    const shown = s.rows.map((r) => ({ ...r, tiles: r.tiles.filter((t) => !isStat(t)) })).filter((r) => r.tiles.length);
    files["README.md"] = strToU8(`${bentoBlock({ rows: shown, dir: dirOf(profile), folder, statRows: null, statsFolder: "assets/bento/stats", github: profile.github })}\n`);
  } finally { s.remove(); }
  files[".bento/profile.json"] = strToU8(`${JSON.stringify(profile, null, 2)}\n`);
  files[".gitignore"] = strToU8(".bento/build/\nnode_modules/\n");
  Object.assign(files, await pictureFiles(pictures(profile, "", {}).map((p) => p.name), uploads));
  let skipped = false;
  try { Object.assign(files, await skillFiles(profile.stats)); } catch { skipped = true; }
  save(new Blob([zipSync(files, { level: 6 })], { type: "application/zip" }), `${stem(profile)}.zip`);
  return { skipped };
}
