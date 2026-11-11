// The form fields of each kind of tile, and how list-like fields read and write the tile's data.
// the tone a tile has when none is set (as tiles.js draws it)
export const TONE_OF = { image: "accent-soft", quote: "accent-soft", number: "sand", status: "green", now: "ink", music: "ink", feature: "accent", education: "blue" };
export const FIELDS = {
  hero: ["label", "title", ["lead", "area"], ["chips", "list"], ["tone", "tone"]],
  image: [["src", "image"], "caption", ["tone", "tone"], "href"],
  now: ["label", "title", "meta", ["text", "area"], ["tone", "tone"]],
  feature: ["label", "title", ["titleDir", "dir"], "subtitle", ["text", "area"], ["chips", "list"], ["tone", "tone"], "href"],
  stack: [["groups", "groups"]],
  experience: [["lines", "lines"]],
  education: ["label", "title", ["text", "area"], ["chips", "list"], ["tone", "tone"]],
  project: ["title", ["text", "area"], ["image", "image"], ["tone", "tone"], "href"],
  contact: ["label", "value", ["tone", "tone"], "href"],
  note: ["label", "title", ["text", "area"], ["tone", "tone"], "href"],
  quote: [["text", "area"], "author", ["tone", "tone"], "href"],
  chips: ["label", ["items", "list"], ["tone", "tone"], "href"],
  number: ["label", "value", "text", ["tone", "tone"], "href"],
  status: ["label", "title", "text", ["tone", "tone"], "href"],
  photo: [["src", "image"], "caption", "href"],
  links: ["label", ["items", "links"], ["tone", "tone"], "href"],
  music: [["url", "fetch"], "label", "title", "artist", ["duration", "clock"], ["cover", "link"], ["tone", "tone"]],
  repo: [["repo", "fetch"], "label", ["description", "area"], "language", ["stars", "num"], ["forks", "num"], ["tone", "tone"], "href"],
  video: [["url", "fetch"], "title", "channel", ["thumb", "link"], ["tone", "tone"]],
  progress: ["label", ["items", "bars"], ["tone", "tone"], "href"],
  stat: [], year: [],
};

const split = (v) => v.split(/[,،]/).map((x) => x.trim()).filter(Boolean);

export function read(tile, name, type) {
  const d = tile.data;
  if (type === "groups") return d.map((g) => `${g.group}: ${g.items.join(", ")}`).join("\n");
  if (type === "lines") return d.map((e) => [e.when, e.role, e.where].join(" | ")).join("\n");
  if (type === "links") return (d.items ?? []).map((i) => `${i.name} | ${i.value}`).join("\n");
  if (type === "list") return (d[name] ?? []).join(", ");
  if (type === "bars") return (d.items ?? []).map((i) => `${i.name} | ${i.value}`).join("\n");
  if (type === "clock") return d[name] ? `${Math.floor(d[name] / 60)}:${String(Math.round(d[name] % 60)).padStart(2, "0")}` : "";
  if (type === "num") return d[name] ?? "";
  return d[name] ?? "";
}

// → the tile's new data (a copy)
export function write(tile, name, type, value) {
  if (type === "groups") return value.split("\n").filter((l) => l.trim()).map((l) => {
    const [group, rest = ""] = l.split(/:(.*)/s);
    return { group: group.trim(), items: split(rest) };
  });
  if (type === "lines") return value.split("\n").filter((l) => l.trim()).map((l) => {
    const [when = "", role = "", where = ""] = l.split("|").map((x) => x.trim());
    return { when, role, where };
  });
  const d = { ...tile.data };
  if (type === "links") d.items = value.split("\n").filter((l) => l.trim()).map((l) => {
    const [n = "", v = ""] = l.split("|").map((x) => x.trim());
    return { name: n, value: v };
  });
  else if (type === "list") d[name] = split(value);
  else if (type === "bars") d.items = value.split("\n").filter((l) => l.trim()).map((l) => {
    const [n = "", v = "0"] = l.split("|").map((x) => x.trim());
    return { name: n, value: Math.max(0, Math.min(100, Number(v.replace("%", "")) || 0)) };
  });
  else if (type === "clock") {
    const [m, sec] = value.includes(":") ? value.split(":") : ["0", value];
    const total = Number(m) * 60 + Number(sec);
    if (value.trim() && Number.isFinite(total)) d[name] = total; else delete d[name];
  } else if (type === "num") {
    if (value.trim() && Number.isFinite(Number(value))) d[name] = Number(value); else delete d[name];
  }
  else if (value === "" && !["title", "label", "value", "text"].includes(name)) delete d[name];
  else d[name] = value;
  return d;
}
