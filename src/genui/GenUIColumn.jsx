import { useEffect, useMemo, useRef, useState } from 'react';
import { AGENTS } from '../agents/agents';
import AgentAvatar from '../agents/AgentAvatar';
import GenerativePanel from './GenerativePanel';
import { PROMPT, AGENT_ID, USER_CHAR_MS, DEFAULT_FRAME_HOLD, THINK_MS } from './genscript';

const agent = AGENTS.find((a) => a.id === AGENT_ID) || AGENTS[0];

function useTypewriter(target, speed) {
  const [val, setVal] = useState('');
  useEffect(() => {
    if (target == null) {
      setVal('');
      return undefined;
    }
    setVal('');
    let i = 0;
    const id = setInterval(() => {
      i += 1;
      setVal(target.slice(0, i));
      if (i >= target.length) clearInterval(id);
    }, speed);
    return () => clearInterval(id);
  }, [target, speed]);
  return val;
}

// One chat column = the same prompt resolving into a single scenario:
//   user(PROMPT) → think → panel(frames)
export default function GenUIColumn({ scenario }) {
  const steps = useMemo(
    () => [
      { kind: 'user', text: scenario.prompt || PROMPT },
      { kind: 'think' },
      { kind: 'panel', frames: scenario.frames },
    ],
    [scenario],
  );

  const [cursor, setCursor] = useState(0);
  const [frame, setFrame] = useState(0);
  const streamRef = useRef(null);

  const done = cursor >= steps.length;
  const curStep = done ? null : steps[cursor];

  useEffect(() => {
    if (done) return undefined;
    const step = steps[cursor];

    if (step.kind === 'panel') {
      const frames = step.frames;
      const isLast = frame >= frames.length - 1;
      const hold = frames[frame].hold || DEFAULT_FRAME_HOLD;
      if (!isLast) {
        const t = setTimeout(() => setFrame((f) => f + 1), hold);
        return () => clearTimeout(t);
      }
      return undefined; // settled — hold on the final frame
    }

    const delay = step.kind === 'user' ? step.text.length * USER_CHAR_MS + 520 : THINK_MS;
    const t = setTimeout(() => setCursor((c) => c + 1), cursor === 0 ? 450 : delay);
    return () => clearTimeout(t);
  }, [cursor, frame, done, steps]);

  const rows = useMemo(() => {
    const list = [];
    for (let k = 0; k < cursor; k++) list.push({ step: steps[k], key: k, active: false });
    if (cursor < steps.length) list.push({ step: steps[cursor], key: cursor, active: true });
    return list;
  }, [cursor, steps]);

  const userDraftTarget = !done && curStep?.kind === 'user' ? curStep.text : null;
  const userDraft = useTypewriter(userDraftTarget, USER_CHAR_MS);

  useEffect(() => {
    const el = streamRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
  }, [cursor, frame]);

  return (
    <div className="dc-card">
      <header className="dc-top">
        <div className="dc-dock" style={{ background: agent.bg, '--c': agent.color }}>
          <AgentAvatar agent={agent} size={42} />
        </div>
        <div className="dc-top__meta">
          <div className="dc-top__name">{agent.name}</div>
          <div className="dc-top__role">
            <span className="dc-status" style={{ background: agent.color }} />
            {agent.role}
          </div>
        </div>
      </header>

      <div className="dc-stream" ref={streamRef}>
        {rows.map(({ step, key, active }) => {
          if (step.kind === 'user') {
            if (active) return null;
            return (
              <div className="dc-row dc-row--user" key={key}>
                <div className="dc-bubble dc-bubble--user">{step.text}</div>
              </div>
            );
          }

          if (step.kind === 'think') {
            if (!active) return null;
            return (
              <div className="dc-row dc-row--agent" key={key}>
                <div className="dc-row__avatar">
                  <span className="dc-avatar" style={{ background: agent.bg }}>
                    <AgentAvatar agent={agent} size={28} />
                  </span>
                </div>
                <div className="dc-bubble dc-bubble--agent dc-bubble--typing">
                  <span /><span /><span />
                </div>
              </div>
            );
          }

          const frames = step.frames;
          const shownFrame = active ? frames[frame] : frames[frames.length - 1];
          return (
            <div className="dc-row dc-row--agent" key={key}>
              <div className="dc-row__avatar">
                <span className="dc-avatar" style={{ background: agent.bg }}>
                  <AgentAvatar agent={agent} size={28} />
                </span>
              </div>
              <GenerativePanel frame={shownFrame} />
            </div>
          );
        })}
      </div>

      <div className="dc-composer">
        <div className="dc-composer__field" data-typing={userDraftTarget ? 'true' : 'false'}>
          {userDraftTarget ? (
            <>
              <span className="dc-composer__draft">{userDraft}</span>
              <span className="dc-caret" />
            </>
          ) : (
            agent.ph
          )}
        </div>
        <button
          className={`dc-composer__send ${userDraftTarget ? 'is-armed' : ''}`}
          style={{ background: userDraftTarget ? 'var(--accent)' : agent.color }}
          aria-label="Send"
          disabled
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 2 11 13" />
            <path d="M22 2 15 22l-4-9-9-4 20-7Z" />
          </svg>
        </button>
      </div>
    </div>
  );
}
