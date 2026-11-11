// The editor's model: tiles (key, kind, data) and rows that place them ({ id, items: [{ key, width }] },
// widths on the README's 1000 scale). fromProfile/toProfile convert to and from the skill's profile.json.
import { fit, rows as defaultRows } from "../skill/layout.js";

// The stats tiles: four counters and the year, placed like any tile (ids stat-<id> in profile.json).
export const STAT_IDS = ["total", "current", "longest", "views", "year"];
const statTile = (id) => ({ key: uid(), kind: id === "year" ? "year" : "stat", data: { id } });
export const isStat = (t) => t.kind === "stat" || t.kind === "year";

export const SINGLE = ["hero", "image", "now", "feature", "stack", "experience", "education"];
export const LISTS = { project: ["projects", "work"], contact: ["contacts", "contact"], note: ["notes", "note"] };
export const BLOCKS = ["quote", "chips", "number", "status", "photo", "links", "music", "repo", "video", "progress"];
export const KINDS = [...SINGLE, "project", "contact", "note", ...BLOCKS];
const STORE = "nim-byte-bento-grid";
let seq = 0;
export const uid = (p = "t") => `${p}${Date.now().toString(36)}${(seq++).toString(36)}`;

export function fromProfile(p) {
  const tiles = [];
  const ids = {};
  const add = (id, kind, data) => { const t = { key: uid(), kind, data: structuredClone(data) }; tiles.push(t); ids[id] = t.key; };
  for (const k of SINGLE) if (p[k] && (!Array.isArray(p[k]) || p[k].length)) add(k, k, p[k]);
  for (const [kind, [list, prefix]] of Object.entries(LISTS)) (p[list] ?? []).forEach((d, i) => add(`${prefix}-${i + 1}`, kind, d));
  (p.blocks ?? []).forEach((b, i) => BLOCKS.includes(b.type) && add(`block-${i + 1}`, b.type, b));
  if (p.stats !== false) for (const id of STAT_IDS) { const t = statTile(id); tiles.push(t); ids[`stat-${id}`] = t.key; }
  const source = p.layout?.length ? p.layout.map((r) => r.map((e) => (typeof e === "string" ? { id: e } : e)))
    : defaultRows(p).map((r) => r.tiles.map((t) => ({ id: t.id, width: t.width })));
  if (p.stats !== false && !source.some((r) => r.some((e) => e.id.startsWith("stat-"))))
    source.push(STAT_IDS.slice(0, 4).map((id) => ({ id: `stat-${id}`, width: 250 })), [{ id: "stat-year", width: 1000 }]);
  const rows = source.map((r) => r.filter((e) => ids[e.id]).map((e) => ({ key: ids[e.id], width: e.width ?? 0 })))
    .filter((r) => r.length).map((items) => ({ id: uid("r"), items: refit(items) }));
  const placed = new Set(rows.flatMap((r) => r.items.map((e) => e.key)));
  return { github: p.github ?? "", lang: p.lang === "fa" ? "fa" : "en", stats: p.stats !== false, theme: p.theme ?? {}, tiles: tiles.filter((t) => placed.has(t.key)), rows };
}

export function toProfile(s) {
  const p = { github: s.github, lang: s.lang, stats: s.stats };
  if (Object.keys(s.theme ?? {}).length) p.theme = s.theme;
  const byKey = new Map(s.tiles.map((t) => [t.key, t]));
  p.layout = s.rows.map((r) => r.items.map((e) => {
    const t = byKey.get(e.key);
    let id = t.kind;
    if (isStat(t)) id = `stat-${t.data.id}`;
    else if (SINGLE.includes(t.kind)) p[t.kind] = t.data;
    else if (LISTS[t.kind]) {
      const [list, prefix] = LISTS[t.kind];
      (p[list] ??= []).push(t.data);
      id = `${prefix}-${p[list].length}`;
    } else {
      (p.blocks ??= []).push({ ...t.data, type: t.kind });
      id = `block-${p.blocks.length}`;
    }
    return { id, width: Math.round(e.width) };
  }));
  return p;
}

// Widths that add up to 1000, keeping each one's share.
export const refit = (items) => fit(items.map((e) => e.width)).map((w, k) => ({ ...items[k], width: w }));

export const BLANK = {
  hero: { label: "github.com/you", title: "Hi! I'm …", lead: "One line about what you do.", chips: ["Open source"] },
  image: { src: "", caption: "", tone: "accent-soft" },
  now: { label: "Now", title: "Your role", meta: "Company · 2024–now", text: "" },
  feature: { label: "my project", title: "Project", subtitle: "project.dev", chips: [] },
  stack: [{ group: "Languages", items: ["TypeScript", "JavaScript"] }],
  experience: [{ when: "2024–now", role: "Role", where: "Company" }],
  education: { title: "Degree", text: "University, year", chips: [] },
  project: { title: "Project", text: "What it is, in one line", image: "", href: "" },
  contact: { label: "Email", value: "you@example.com", href: "" },
  note: { label: "Note", title: "A short title", text: "A line of text.", tone: "paper" },
  quote: { text: "Make it work, make it right, make it fast.", author: "Kent Beck", tone: "accent-soft" },
  chips: { label: "Currently learning", items: ["Rust", "Three.js"], tone: "paper" },
  number: { label: "Coding since", value: "2015", text: "and never stopped", tone: "sand" },
  status: { label: "Status", title: "Open to work", text: "Remote, full-time", tone: "green" },
  photo: { src: "", caption: "" },
  links: { label: "Elsewhere", items: [{ name: "Blog", value: "example.com/blog" }], tone: "paper" },
  music: { label: "Now playing", title: "Song title", artist: "Artist", cover: "", duration: 210, source: "Spotify" },
  repo: { label: "Repository", repo: "you/project", description: "What it does, in one line.", language: "TypeScript", color: "#3178c6", stars: 128, forks: 12 },
  video: { title: "Video title", channel: "Channel", thumb: "" },
  progress: { label: "Learning", items: [{ name: "Rust", value: 40 }, { name: "Three.js", value: 70 }] },
};
export const newTile = (kind) => ({ key: uid(), kind, data: structuredClone(BLANK[kind]) });

// Turning the stats on adds their two rows at the end; off removes every stats tile.
export function setStats(m, on) {
  m.stats = on;
  const keys = new Set(m.tiles.filter(isStat).map((t) => t.key));
  if (!on) {
    m.tiles = m.tiles.filter((t) => !keys.has(t.key));
    m.rows = m.rows.map((r) => ({ ...r, items: refit(r.items.filter((e) => !keys.has(e.key))) })).filter((r) => r.items.length);
  } else if (!keys.size) {
    const tiles = STAT_IDS.map(statTile);
    m.tiles.push(...tiles);
    m.rows.push({ id: uid("r"), items: tiles.slice(0, 4).map((t) => ({ key: t.key, width: 250 })) }, { id: uid("r"), items: [{ key: tiles[4].key, width: 1000 }] });
  }
}

// A copy of a tile, right after it in its row (singles and stats tiles have no copies).
export const canCopy = (t) => !isStat(t) && !SINGLE.includes(t.kind);

export function save(s) { try { localStorage.setItem(STORE, JSON.stringify({ ...s, images: undefined })); } catch {} }
export function load() { try { return JSON.parse(localStorage.getItem(STORE)); } catch { return null; } }
export function forget() { try { localStorage.removeItem(STORE); } catch {} }
