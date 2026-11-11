// What a link holds, for the tiles filled from one: a repository from GitHub's API (it allows the
// browser), a song or a video through the site's /api/meta (their pages don't). → the tile's data.
const COLORS = { TypeScript: "#3178c6", JavaScript: "#f1e05a", Python: "#3572a5", Go: "#00add8", Rust: "#dea584", Java: "#b07219", Kotlin: "#a97bff",
  Swift: "#f05138", "C++": "#f34b7d", C: "#555555", "C#": "#178600", PHP: "#4f5d95", Ruby: "#701516", Dart: "#00b4ab", HTML: "#e34c26", CSS: "#663399",
  Vue: "#41b883", Svelte: "#ff3e00", Shell: "#89e051", Lua: "#000080", Elixir: "#6e4a7e", Zig: "#ec915c" };

export class LinkError extends Error {}

async function repo(link) {
  const m = link.trim().match(/^(?:https?:\/\/)?(?:www\.)?(?:github\.com\/)?([\w.-]+)\/([\w.-]+?)(?:\.git)?\/?(?:[?#].*)?$/);
  if (!m) throw new LinkError("bad");
  const r = await fetch(`https://api.github.com/repos/${m[1]}/${m[2]}`, { headers: { accept: "application/vnd.github+json" } });
  if (!r.ok) throw new LinkError(r.status === 404 ? "missing" : "down");
  const j = await r.json();
  return { repo: j.full_name, description: j.description ?? "", language: j.language ?? "", color: COLORS[j.language], stars: j.stargazers_count,
    forks: j.forks_count, href: j.html_url };
}

async function media(link) {
  let r;
  try { r = await fetch(`/api/meta?url=${encodeURIComponent(link.trim())}`); } catch { throw new LinkError("down"); }
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw new LinkError({ BAD_URL: "bad", UNSUPPORTED: "unsupported" }[j.error] ?? "down");
  return Object.fromEntries(Object.entries({ ...j, href: link.trim() }).filter(([, v]) => v != null && v !== ""));
}

export const linkMeta = (kind, link) => (kind === "repo" ? repo(link) : media(link));
