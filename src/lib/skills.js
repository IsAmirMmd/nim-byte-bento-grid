// The skills the skills tile's rows offer: a ready list, the sample's own, and the ones the user
// added. Theirs are kept in their own localStorage key, so "back to the sample" keeps them.
import sample from "../data/default-profile.json";

const KEY = "nim-byte-bento-grid:skills";
const READY = [
  "HTML", "CSS", "JavaScript", "TypeScript", "Python", "Go", "Rust", "Java", "Kotlin", "Swift", "Dart", "C", "C++", "C#", "PHP", "Ruby",
  "Elixir", "Scala", "Lua", "R", "SQL", "Bash", "Regex", "Solidity",
  "React", "Next.js", "Vue", "Nuxt", "Svelte", "SvelteKit", "Angular", "Solid", "Astro", "Remix", "React Native", "Flutter", "Expo",
  "Tailwind CSS", "Sass", "Bootstrap", "Material UI", "shadcn/ui", "Framer Motion", "Three.js", "D3.js", "Highcharts", "Chart.js",
  "Redux", "Zustand", "TanStack Query", "GraphQL", "Apollo", "tRPC", "REST", "WebSockets",
  "Node.js", "Deno", "Bun", "Express", "NestJS", "Fastify", "Django", "Flask", "FastAPI", "Laravel", "Spring Boot", "Rails", ".NET", "Gin",
  "PostgreSQL", "MySQL", "SQLite", "MongoDB", "Redis", "Supabase", "Firebase", "Prisma", "Drizzle", "Elasticsearch",
  "Docker", "Kubernetes", "Nginx", "Linux", "AWS", "Google Cloud", "Azure", "Vercel", "Netlify", "Cloudflare", "GitHub Actions", "Terraform",
  "Git", "GitHub", "GitLab", "Figma", "Storybook", "Vite", "Webpack", "ESLint", "Prettier", "Jest", "Vitest", "Playwright", "Cypress",
  "Telegram Bots", "Telegram Mini Apps", "Claude Code", "Cursor", "LangChain", "PyTorch", "TensorFlow", "Pandas", "NumPy", "WordPress",
];

export function custom() {
  try { const v = JSON.parse(localStorage.getItem(KEY)); return Array.isArray(v) ? v : []; } catch { return []; }
}

// every skill to pick from, without repeats (by lower case), the user's own first
export function skills() {
  const seen = new Set();
  return [...custom(), ...READY, ...(sample.stack ?? []).flatMap((g) => g.items)].filter((s) => {
    const k = s.toLowerCase();
    return !seen.has(k) && seen.add(k);
  });
}

// keeps a skill the list didn't have
export function remember(skill) {
  const k = skill.toLowerCase();
  if (skills().some((s) => s.toLowerCase() === k)) return;
  try { localStorage.setItem(KEY, JSON.stringify([skill, ...custom()])); } catch {}
}
