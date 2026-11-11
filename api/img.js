// A cover or thumbnail from the music and video hosts, re-served from this site so the editor
// can draw it into its PNG, PDF and ZIP exports (those hosts don't allow it cross-origin).
const HOSTS = ["i.scdn.co", "image-cdn-ak.spotifycdn.com", "i1.sndcdn.com", "i.ytimg.com", "avatars.githubusercontent.com"];

export default async function handler(req, res) {
  let url;
  try { url = new URL(String(req.query.u ?? "")); } catch { return res.status(400).end(); }
  if (url.protocol !== "https:" || !HOSTS.includes(url.hostname)) return res.status(400).end();
  const r = await fetch(url, { redirect: "follow" });
  const type = r.headers.get("content-type") ?? "";
  if (!r.ok || !type.startsWith("image/")) return res.status(502).end();
  res.setHeader("content-type", type);
  res.setHeader("cache-control", "public, s-maxage=604800, immutable");
  return res.status(200).send(Buffer.from(await r.arrayBuffer()));
}
