import { useDraggable } from "@dnd-kit/core";
import { AtSign, BadgeCheck, BarChart3, CalendarDays, BookOpen, Briefcase, Code2, FolderKanban, GraduationCap, Hash, Image, Images, Link2, Quote, Sparkles, StickyNote, Tags, User, Zap } from "lucide-react";
import { KINDS, SINGLE } from "../../lib/state.js";
import { KIND_TEXT } from "../../i18n.js";

export const ICONS = { hero: User, image: Image, now: Zap, feature: Sparkles, stack: Code2, experience: Briefcase, education: GraduationCap,
  project: FolderKanban, contact: AtSign, note: StickyNote, quote: Quote, chips: Tags, number: Hash, status: BadgeCheck, photo: Images, links: Link2, stat: BarChart3, year: CalendarDays };

function Item({ kind, lang, used, why, onAdd, onReveal }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: `lib-${kind}`, data: { type: "library", kind }, disabled: used });
  const Icon = ICONS[kind] ?? BookOpen;
  const [name, line] = KIND_TEXT[lang][kind];
  return (
    <button ref={setNodeRef} type="button" className={`lib-item${isDragging ? " lifting" : ""}`}
      {...attributes} {...listeners} aria-disabled={used} data-tip={used ? why : undefined} onClick={() => (used ? onReveal(kind) : onAdd(kind))}>
      <span className="lib-icon"><Icon size={18} /></span>
      <span className="lib-text"><b>{name}</b><small>{line}</small></span>
    </button>
  );
}

// The kinds of tile: one of each for the singles (hero, picture, now, …), as many as you like of the rest.
export default function Library({ t, lang, tiles, onAdd, onReveal }) {
  return (
    <div className="library">
      <span className="label"><i />{t.ws.library}</span>
      <p className="hint">{t.ws.libraryHint}</p>
      <div className="lib-list">
        {KINDS.map((k) => <Item key={k} kind={k} lang={lang} onAdd={onAdd} onReveal={onReveal} why={t.why.single(KIND_TEXT[lang][k][0])}
          used={SINGLE.includes(k) && tiles.some((x) => x.kind === k)} />)}
      </div>
    </div>
  );
}
