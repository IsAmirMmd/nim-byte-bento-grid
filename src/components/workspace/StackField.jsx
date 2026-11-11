import { Code2, Layers, Plus, X } from "lucide-react";
import { useState } from "react";
import { uid } from "../../lib/state.js";
import { remember, skills } from "../../lib/skills.js";
import ChipsInput from "./ChipsInput.jsx";
import { IconInput } from "./IconInput.jsx";

// The skills tile as a table: a row per group, its name in one input and its skills in a wider
// one, picked from a list (or added to it). Empty rows stay here while you edit, not in the README.
export default function StackField({ id, value, words, holders, onChange }) {
  const [rows, setRows] = useState(() => (value.length ? value : [{ group: "", items: [] }]).map((r) => ({ group: r.group ?? "", items: r.items ?? [], k: uid("g") })));
  const [options, setOptions] = useState(skills);
  const commit = (next) => {
    setRows(next);
    onChange(next.filter((r) => r.group.trim() || r.items.length).map(({ group, items }) => ({ group, items })));
  };
  const edit = (k, patch) => commit(rows.map((r) => (r.k === k ? { ...r, ...patch } : r)));
  return (
    <div className="stack-edit" id={id}>
      <div className="stack-row stack-head" aria-hidden="true"><span>{words.group}</span><span>{words.skills}</span></div>
      {rows.map((r, i) => (
        <div className="stack-row" key={r.k}>
          <IconInput icon={Layers}>
            <input className="bare" dir="auto" aria-label={`${words.group} ${i + 1}`} placeholder={holders.group} value={r.group}
              onChange={(e) => edit(r.k, { group: e.target.value })} />
          </IconInput>
          <ChipsInput icon={Code2} value={r.items} options={options} holder={holders.skills} labels={words}
            onChange={(items) => edit(r.k, { items })} onNew={(s) => { remember(s); setOptions(skills()); }} />
          <button type="button" className="btn ghost icon" aria-label={`${words.removeRow} ${i + 1}`} onClick={() => commit(rows.filter((x) => x.k !== r.k))}><X size={16} /></button>
        </div>
      ))}
      <button type="button" className="btn ghost small" onClick={() => setRows([...rows, { group: "", items: [], k: uid("g") }])}><Plus size={14} />{words.addRow}</button>
    </div>
  );
}
