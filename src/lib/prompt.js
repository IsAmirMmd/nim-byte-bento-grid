// The prompt for the user's AI agent: use the bento-readme skill with this exact profile.json.
// Pictures that ship with this site are given as links; ones the user uploaded must be attached.
const SKILL = "https://github.com/IsAmirMmd/nim-byte-readme-maker";

export function pictures(profile, origin, uploaded) {
  const out = [];
  const add = (src, what) => {
    if (!src || /^https?:/.test(src)) return;
    const name = src.replace(/^images\//, "");
    out.push({ name, what, url: uploaded[name] ? null : `${origin}/images/${name}` });
  };
  add(profile.image?.src, "the picture tile");
  (profile.projects ?? []).forEach((p) => add(p.image, `the screenshot of "${p.title}"`));
  (profile.blocks ?? []).forEach((b) => b.type === "photo" && add(b.src, "a photo tile"));
  return out;
}

export function makePrompt(profile, pics, uiLang) {
  const user = profile.github || "<your-username>";
  const lines = pics.map((p) => `- \`${p.name}\`: ${p.what}${p.url ? `, download it from ${p.url}` : " (I'm attaching it)"}`);
  return `Make my GitHub profile README in the bento style, with the bento-readme skill from ${SKILL} (skills/bento-readme/SKILL.md). If you don't have the skill, clone that repository and follow SKILL.md step by step.

- My GitHub username is \`${user}\`, so the profile repository is \`${user}/${user}\` (if it doesn't exist, ask me, then create it as a public repository).
- Set it up with \`init.mjs\`${profile.stats ? " --stats" : ""}, then use exactly the \`.bento/profile.json\` below: it's the layout, the widths and the text I chose in the editor. Don't rearrange the tiles or rewrite my text; if something doesn't fit or looks like a typo, ask me.
${lines.length ? `- Put these pictures in \`.bento/images/\` under these names; if one is missing, ask me for it before building:\n${lines.join("\n")}` : "- There are no pictures."}
- Build, run the preview, and show me the previews (light, dark, phone). Push to the default branch only when I say so.${profile.stats ? "\n- Keep the stats workflow: after the push it adds the stats tiles." : ""}${uiLang === "fa" ? "\n- Talk to me in Persian." : ""}

\`.bento/profile.json\`:

\`\`\`json
${JSON.stringify(profile, null, 2)}
\`\`\`
`;
}
