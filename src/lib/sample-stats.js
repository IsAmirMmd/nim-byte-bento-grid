// Stand-in numbers for the stats tiles in the editor; the real ones come from GitHub after the push.
const today = new Date();
const ago = (days) => new Date(today.getTime() - days * 864e5).toISOString().slice(0, 10);
let seed = 7;
const random = () => (seed = (seed * 16807) % 2147483647) / 2147483647;

export const sampleStats = {
  total: 7811,
  since: "2023-01-30",
  current: { start: ago(16), end: ago(0), length: 17 },
  longest: { start: "2025-03-24", end: "2025-04-16", length: 24 },
  views: 3268,
  lastYear: Array.from({ length: 52 * 7 + today.getUTCDay() + 1 }, () => (random() < 0.4 ? 0 : Math.floor(random() * 24))),
};
