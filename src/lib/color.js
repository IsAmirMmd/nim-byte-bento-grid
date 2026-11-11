// Colours for the picker: hex ⇄ HSV (h 0–360, s and v 0–1).
export const HEX = /^#[0-9a-f]{6}$/i;

export function toHsv(hex) {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
  const max = Math.max(r, g, b);
  const d = max - Math.min(r, g, b);
  let h = 0;
  if (d) h = max === r ? ((g - b) / d) % 6 : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
  return { h: (h * 60 + 360) % 360, s: max ? d / max : 0, v: max };
}

export function toHex({ h, s, v }) {
  const f = (n) => {
    const k = (n + h / 60) % 6;
    return Math.round((v - v * s * Math.max(0, Math.min(k, 4 - k, 1))) * 255).toString(16).padStart(2, "0");
  };
  return `#${f(5)}${f(3)}${f(1)}`;
}

// a hex typed by hand: "#abc", "abc", "aabbcc" → "#aabbcc", or null
export function parseHex(text) {
  let t = text.trim().replace(/^#/, "").toLowerCase();
  if (/^[0-9a-f]{3}$/.test(t)) t = t.replace(/./g, "$&$&");
  return /^[0-9a-f]{6}$/.test(t) ? `#${t}` : null;
}
