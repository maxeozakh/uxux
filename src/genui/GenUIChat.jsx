import { useState } from 'react';
import GenUIColumn from './GenUIColumn';
import { SCENARIOS } from './genscript';
import '../delegate/delegationchat.css';
import './genui.css';

// Three chat columns side by side — the same prompt resolving into clarify /
// success / error — all starting in sync so the whole story records as one GIF.
export default function GenUIChat() {
  const [runId, setRunId] = useState(0);

  return (
    <div className="gen3-app">
      <div className="gen3-row">
        {SCENARIOS.map((s) => (
          <div className="gen3-col" key={`${s.id}-${runId}`}>
            <div className="gen3-col__label">{s.label}</div>
            <GenUIColumn scenario={s} />
          </div>
        ))}
      </div>

      <button className="gen3-replay" onClick={() => setRunId((r) => r + 1)}>
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 12a9 9 0 1 0 3-6.7L3 8" />
          <path d="M3 3v5h5" />
        </svg>
        replay all
      </button>
    </div>
  );
}
