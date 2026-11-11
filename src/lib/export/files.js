// What goes in the ZIP: the README with its tile pictures, and .bento/ as init.mjs would set it
// up (the skill's scripts, fonts, profile.json, the pictures, and the stats workflow), so the
// folder can be pushed to <user>/<user> as it is and rebuilt by any agent later.
const RAW = "https://raw.githubusercontent.com/IsAmirMmd/nim-byte-readme-maker/main/skills/bento-readme";
const SCRIPTS = ["build.mjs", "init.mjs", "layout.mjs", "preview.mjs", "readme.mjs", "stat-tiles.mjs", "stats.mjs", "tiles.mjs"];
const FONTS = ["Vazirmatn-Variable.woff2", "JetBrainsMono-Regular.woff2", "JetBrainsMono-ExtraBold.woff2", "OFL-Vazirmatn.txt", "OFL-JetBrainsMono.txt"];

const bytes = async (url) => {
  const r = await fetch(url);
  if (!r.ok) throw new Error(`${url}: ${r.status}`);
  return new Uint8Array(await r.arrayBuffer());
};

// the skill's files: → { path: bytes }, or throws when GitHub can't be reached
export async function skillFiles(stats) {
  const out = {};
  await Promise.all([
    ...SCRIPTS.map(async (f) => { out[`.bento/scripts/${f}`] = await bytes(`${RAW}/scripts/${f}`); }),
    ...FONTS.map(async (f) => { out[`.bento/fonts/${f}`] = await bytes(`/fonts/${f}`); }),
    stats && (async () => { out[".github/workflows/bento-stats.yml"] = await bytes(`${RAW}/templates/bento-stats.yml`); })(),
  ]);
  return out;
}

// the pictures profile.json names ("images/x.png"): uploads first, then the site's own
export async function pictureFiles(names, uploads) {
  const out = {};
  await Promise.all(names.map(async (name) => {
    try { out[`.bento/images/${name}`] = await bytes(uploads[name] ?? `/images/${name}`); } catch {}
  }));
  return out;
}
