import { ArrowDown, Bot } from "lucide-react";
import GithubMark from "./GithubMark.jsx";

export default function Hero({ t }) {
  const h = t.hero;
  return (
    <>
      <section className="tile paper hero">
        <h1>{h.title}</h1>
        <p className="lead">{h.lead}</p>
        <div className="actions">
          <a className="btn dark" href="#workspace"><ArrowDown size={18} />{h.start}</a>
          <a className="btn" href="https://github.com/IsAmirMmd/nim-byte-readme-maker"><GithubMark size={18} />{h.skill}</a>
        </div>
      </section>
      <section className="tile ink steps">
        <span className="label"><i />{h.stepsLabel}</span>
        <ol>{h.steps.map((s, k) => <li key={s}><span className="num">{(k + 1).toLocaleString(t.dir === "rtl" ? "fa-IR" : "en-US")}</span>{s}</li>)}</ol>
      </section>
      <section className="tile sand agents">
        <span className="label"><i />{h.agentsLabel}</span>
        <p><Bot size={22} />{h.agents}</p>
      </section>
      <a className="tile blue sample" href="#workspace">
        <span className="label"><i />{h.sampleLabel}</span>
        <img src="/images/sample-readme.png" alt={h.sample} />
        <span className="caption">{h.sample}</span>
      </a>
    </>
  );
}
