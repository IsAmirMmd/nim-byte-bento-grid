import { useDraggable } from "@dnd-kit/core";
import { AtSign, BadgeCheck, BarChart3, CalendarDays, BookOpen, Briefcase, Code2, FolderKanban, GraduationCap, Hash, Image, Images, Link2, Quote, Sparkles, StickyNote, Tags, User, Zap } from "lucide-react";
import { KINDS, SINGLE } from "../../lib/state.js";
import { KIND_TEXT } from "../../i18n.js";

export const ICONS = { hero: User, image: Image, now: Zap, feature: Sparkles, stack: Code2, experience: Briefcase, education: GraduationCap,
  project: FolderKanban, contact: AtSign, note: StickyNote, quote: Quote, chips: Tags, number: Hash, status: BadgeCheck, photo: Images, links: Link2, stat: BarChart3, year: CalendarDays };

function Item({ kind, lang, used, onAdd }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: `lib-${kind}`, data: { type: "library", kind }, disabled: used });
  const Icon = ICONS[kind] ?? BookOpen;
  const [name, line] = KIND_TEXT[lang][kind];
  return (
    <button ref={setNodeRef} type="button" className={`lib-item${isDragging ? " lifting" : ""}`} disabled={used}
      onClick={() => onAdd(kind)} {...attributes} {...listeners}>
      <span className="lib-icon"><Icon size={18} /></span>
      <span className="lib-text"><b>{name}</b><small>{line}</small></span>
    </button>
  );
}

// The kinds of tile: one of each for the singles (hero, picture, now, …), as many as you like of the rest.
export default function Library({ t, lang, tiles, onAdd }) {
  return (
    <div className="library">
      <span className="label"><i />{t.ws.library}</span>
      <p className="hint">{t.ws.libraryHint}</p>
      <div className="lib-list">
        {KINDS.map((k) => <Item key={k} kind={k} lang={lang} onAdd={onAdd} used={SINGLE.includes(k) && tiles.some((x) => x.kind === k)} />)}
      </div>
    </div>
  );
}
