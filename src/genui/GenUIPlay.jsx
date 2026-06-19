import { useState } from 'react';
import GenUIColumn from './GenUIColumn';
import { SCENARIOS } from './genscript';
import '../delegate/delegationchat.css';
import './genui.css';

// Interactive, mobile-friendly version: pick one of the three scenarios and
// watch it play. Switching a tab (or replay) remounts the column so it restarts.
export default function GenUIPlay() {
  const [sel, setSel] = useState(SCENARIOS[0].id);
  const [runId, setRunId] = useState(0);

  const scenario = SCENARIOS.find((s) => s.id === sel) || SCENARIOS[0];
  const pick = (id) => {
    setSel(id);
    setRunId((r) => r + 1);
  };

  return (
    <div className="play-app">
      <div className="play-panel">
        <div className="play-head">
          <div className="play-head__title">Generative UI</div>
          <div className="play-head__sub">
            pick a scenario — watch the interface predict, build, then adapt
          </div>
        </div>

        <div className="play-tabs">
          {SCENARIOS.map((s) => (
            <button
              key={s.id}
              className={`play-tab ${s.id === sel ? 'is-active' : ''}`}
              onClick={() => pick(s.id)}
            >
              {s.label}
            </button>
          ))}
        </div>

        <GenUIColumn key={`${sel}-${runId}`} scenario={scenario} />

        <button className="play-replay" onClick={() => setRunId((r) => r + 1)}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 12a9 9 0 1 0 3-6.7L3 8" />
            <path d="M3 3v5h5" />
          </svg>
          replay
        </button>
      </div>
    </div>
  );
}
