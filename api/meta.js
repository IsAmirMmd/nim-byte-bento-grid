// What a song or video link shows, for the editor's music and video tiles (their pages can't be
// read from the browser): GET /api/meta?url=<a Spotify, SoundCloud or YouTube link>.
const UA = "Mozilla/5.0 (compatible; bento-readme/1.0; +https://nim-byte-bento-grid.vercel.app)";
const get = async (url) => {
  const r = await fetch(url, { headers: { "user-agent": UA, "accept-language": "en" }, redirect: "follow" });
  if (!r.ok) throw new Error(`${r.status}`);
  return r;
};
const meta = (html, key) => {
  const m = html.match(new RegExp(`<meta[^>]+(?:property|name|itemprop)="${key}"[^>]*content="([^"]*)"`, "i"))
    ?? html.match(new RegExp(`<meta[^>]+content="([^"]*)"[^>]*(?:property|name|itemprop)="${key}"`, "i"));
  return m ? m[1].replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#x27;|&#39;/g, "'") : null;
};
const iso = (d) => { const m = d?.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/); return m ? (+m[1] || 0) * 3600 + (+m[2] || 0) * 60 + (+m[3] || 0) : null; };

async function spotify(url) {
  const html = await (await get(url)).text();
  return { source: "Spotify", title: meta(html, "og:title"), artist: meta(html, "music:musician_description") ?? meta(html, "og:description")?.split(" · ")[0],
    cover: meta(html, "og:image"), duration: Number(meta(html, "music:duration")) || null };
}
async function soundcloud(url) {
  const o = await (await get(`https://soundcloud.com/oembed?format=json&url=${encodeURIComponent(url)}`)).json();
  let duration = null;
  try { duration = iso(meta(await (await get(url)).text(), "duration")); } catch {}
  const title = o.title?.endsWith(` by ${o.author_name}`) ? o.title.slice(0, -` by ${o.author_name}`.length) : o.title;
  return { source: "SoundCloud", title, artist: o.author_name, cover: o.thumbnail_url?.replace("-t500x500", "-t500x500"), duration };
}
async function youtube(url) {
  const o = await (await get(`https://www.youtube.com/oembed?format=json&url=${encodeURIComponent(url)}`)).json();
  const id = url.match(/(?:v=|youtu\.be\/|shorts\/|embed\/)([\w-]{11})/)?.[1];
  return { source: "YouTube", title: o.title, channel: o.author_name, thumb: id ? `https://i.ytimg.com/vi/${id}/hqdefault.jpg` : o.thumbnail_url };
}

export default async function handler(req, res) {
  const url = String(req.query.url ?? "");
  let host;
  try { host = new URL(url).hostname.replace(/^www\.|^m\./, ""); } catch { return res.status(400).json({ error: "BAD_URL" }); }
  const read = { "open.spotify.com": spotify, "soundcloud.com": soundcloud, "on.soundcloud.com": soundcloud,
    "youtube.com": youtube, "youtu.be": youtube, "music.youtube.com": youtube }[host];
  if (!read) return res.status(400).json({ error: "UNSUPPORTED" });
  try {
    res.setHeader("cache-control", "public, s-maxage=86400, stale-while-revalidate=604800");
    return res.status(200).json(await read(url));
  } catch (e) {
    return res.status(502).json({ error: "UPSTREAM", detail: String(e.message ?? e) });
  }
}
