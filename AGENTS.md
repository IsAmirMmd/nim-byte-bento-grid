# AGENTS.md

The editor site for the bento-readme skill (`IsAmirMmd/nim-byte-readme-maker`): React 19, Vite, dnd-kit.

- `src/skill/` is a copy of the skill's `scripts/tiles.mjs`, `layout.mjs` and `stat-tiles.mjs`. When the skill
  changes its tiles, copy them again (only the stat-tiles import path changes) so the editor draws what the agent builds.
- `src/lib/state.js` turns the skill's `profile.json` into tiles and rows and back; the round trip must keep the
  layout exactly. New tile kinds go in the skill first, then in `state.js` (`BLANK`, `KINDS`), `fields.js` and the
  i18n texts.
- The look is نیم‌بایت's bento: rounded tiles on cream, no outlines, soft shadows only on what's clicked, one coral
  action per view, Persian (RTL) first.
- Check every change with `npm run build` and in a browser (desktop and phone width, both languages, a drag, a
  resize) before committing. Commit each significant change on its own; `main` deploys to Vercel.
