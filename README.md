# nim-byte-bento-grid

**[nim-byte-bento-grid.vercel.app](https://nim-byte-bento-grid.vercel.app/)**: an editor for a bento-grid GitHub profile
README, by [نیم‌بایت](https://nimbyte.ir). Drag the tiles around, drag their edges to change widths, pick new tiles from
the list, write their text, then copy one prompt and give it to your AI agent (Claude Code, Codex, Cursor, Copilot,
Gemini CLI, …). The agent builds the README with the
[bento-readme skill](https://github.com/IsAmirMmd/nim-byte-readme-maker) and puts it on your profile.

The editor opens with [IsAmirMmd's README](https://github.com/IsAmirMmd); everything you change is kept in your browser.

## What's inside

- **The page** is a bento grid of its own: header, hero, the workspace in one big tile, and a footer. Persian
  (right to left) by default, English with one click.
- **The canvas** draws the README with the skill's own tile code (`src/skill/`), so what you see is what the agent
  builds. Its CSS is scoped to the canvas and sized in units of the canvas's width (`src/lib/scoped-css.js`).
- **Drag and drop** with [dnd-kit](https://dndkit.com): tiles lift, the others make room, rows accept tiles from other
  rows, and strips between rows start new ones. Works with a mouse, on touch screens and with the keyboard.
- **Sixteen kinds of tile**: intro, picture, now, feature, stack, experience, education, project, contact, note,
  quote, chips, number, status, photo and links.
- **The prompt** carries the whole layout as the skill's `profile.json`, with links to the site's own pictures and a
  list of the ones you uploaded, to attach.

## Run it

```bash
npm install
```
```bash
npm run dev
```

`npm run build` writes `dist/`; Vercel builds it as is (Vite preset).

## Credits

Made by [Amirmohammad Lotfipour](https://github.com/IsAmirMmd) for [نیم‌بایت](https://nimbyte.ir). Fonts:
[Vazirmatn](https://github.com/rastikerdar/vazirmatn) and [JetBrains Mono](https://github.com/JetBrains/JetBrainsMono)
(SIL Open Font License 1.1). Icons: [Lucide](https://lucide.dev).
