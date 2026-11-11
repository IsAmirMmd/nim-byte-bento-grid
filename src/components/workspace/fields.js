// The form fields of each kind of tile, and how list-like fields read and write the tile's data.
export const TONES = ["paper", "sand", "accent-soft", "blue", "green"];
// the tone a tile has when none is set (as tiles.js draws it)
export const TONE_OF = { image: "accent-soft", quote: "accent-soft", number: "sand", status: "green" };
export const FIELDS = {
  hero: ["label", "title", ["lead", "area"], ["chips", "list"]],
  image: [["src", "image"], "caption", ["tone", "tone"], "href"],
  now: ["label", "title", "meta", ["text", "area"]],
  feature: ["label", "title", ["titleDir", "dir"], "subtitle", ["text", "area"], ["chips", "list"], "href"],
  stack: [["groups", "groups"]],
  experience: [["lines", "lines"]],
  education: ["label", "title", ["text", "area"], ["chips", "list"]],
  project: ["title", ["text", "area"], ["image", "image"], "href"],
  contact: ["label", "value", "href"],
  note: ["label", "title", ["text", "area"], ["tone", "tone"], "href"],
  quote: [["text", "area"], "author", ["tone", "tone"], "href"],
  chips: ["label", ["items", "list"], ["tone", "tone"], "href"],
  number: ["label", "value", "text", ["tone", "tone"], "href"],
  status: ["label", "title", "text", ["tone", "tone"], "href"],
  photo: [["src", "image"], "caption", "href"],
  links: ["label", ["items", "links"], ["tone", "tone"], "href"],
  stat: [], year: [],
};

const split = (v) => v.split(/[,،]/).map((x) => x.trim()).filter(Boolean);

export function read(tile, name, type) {
  const d = tile.data;
  if (type === "groups") return d.map((g) => `${g.group}: ${g.items.join(", ")}`).join("\n");
  if (type === "lines") return d.map((e) => [e.when, e.role, e.where].join(" | ")).join("\n");
  if (type === "links") return (d.items ?? []).map((i) => `${i.name} | ${i.value}`).join("\n");
  if (type === "list") return (d[name] ?? []).join(", ");
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
  else if (value === "" && !["title", "label", "value", "text"].includes(name)) delete d[name];
  else d[name] = value;
  return d;
}
