// The editor's model: tiles (key, kind, data) and rows that place them ({ id, items: [{ key, width }] },
// widths on the README's 1000 scale). fromProfile/toProfile convert to and from the skill's profile.json.
import { fit, rows as defaultRows } from "../skill/layout.js";

export const SINGLE = ["hero", "image", "now", "feature", "stack", "experience", "education"];
export const LISTS = { project: ["projects", "work"], contact: ["contacts", "contact"], note: ["notes", "note"] };
export const BLOCKS = ["quote", "chips", "number", "status", "photo", "links"];
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
  const source = p.layout?.length ? p.layout.map((r) => r.map((e) => (typeof e === "string" ? { id: e } : e)))
    : defaultRows(p).map((r) => r.tiles.map((t) => ({ id: t.id, width: t.width })));
  const rows = source.map((r) => r.filter((e) => ids[e.id]).map((e) => ({ key: ids[e.id], width: e.width ?? 0 })))
    .filter((r) => r.length).map((items) => ({ id: uid("r"), items: refit(items) }));
  return { github: p.github ?? "", lang: p.lang === "fa" ? "fa" : "en", stats: p.stats !== false, theme: p.theme ?? {}, tiles, rows };
}

export function toProfile(s) {
  const p = { github: s.github, lang: s.lang, stats: s.stats };
  if (Object.keys(s.theme ?? {}).length) p.theme = s.theme;
  const byKey = new Map(s.tiles.map((t) => [t.key, t]));
  p.layout = s.rows.map((r) => r.items.map((e) => {
    const t = byKey.get(e.key);
    let id = t.kind;
    if (SINGLE.includes(t.kind)) p[t.kind] = t.data;
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
};
export const newTile = (kind) => ({ key: uid(), kind, data: structuredClone(BLANK[kind]) });

export function save(s) { try { localStorage.setItem(STORE, JSON.stringify({ ...s, images: undefined })); } catch {} }
export function load() { try { return JSON.parse(localStorage.getItem(STORE)); } catch { return null; } }
export function forget() { try { localStorage.removeItem(STORE); } catch {} }
