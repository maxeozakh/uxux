import { useEffect, useMemo, useRef, useState } from 'react';
import { AGENTS } from '../agents/agents';
import AgentAvatar from '../agents/AgentAvatar';
import HandoffDial from './HandoffDial';
import { SCRIPT, FIRST_AGENT, dwell, CHAR_MS, USER_CHAR_MS } from './script';
import './delegationchat.css';

const byId = (id) => AGENTS.find((a) => a.id === id) || AGENTS[0];

// Split text into styled segments so *italic* survives partial reveals.
function parseSegments(text) {
  const segs = [];
  const re = /\*([^*]+)\*/g;
  let last = 0;
  let m;
  while ((m = re.exec(text))) {
    if (m.index > last) segs.push({ t: text.slice(last, m.index), em: false });
    segs.push({ t: m[1], em: true });
    last = re.lastIndex;
  }
  if (last < text.length) segs.push({ t: text.slice(last), em: false });
  return segs;
}

// Fully rendered (non-streaming) styled text.
function renderText(text) {
  return parseSegments(text).map((s, idx) =>
    s.em ? <em key={idx}>{s.t}</em> : <span key={idx}>{s.t}</span>,
  );
}

// Reveals an agent message character-by-character on mount (fake streaming).
function StreamingText({ text }) {
  const segs = useMemo(() => parseSegments(text), [text]);
  const total = useMemo(() => segs.reduce((n, s) => n + s.t.length, 0), [segs]);
  const [shown, setShown] = useState(0);

  useEffect(() => {
    setShown(0);
    let i = 0;
    const id = setInterval(() => {
      i += 1;
      setShown(i);
      if (i >= total) clearInterval(id);
    }, CHAR_MS);
    return () => clearInterval(id);
  }, [text, total]);

  let left = shown;
  return (
    <>
      {segs.map((s, idx) => {
        if (left <= 0) return null;
        const slice = s.t.slice(0, left);
        left -= s.t.length;
        return s.em ? <em key={idx}>{slice}</em> : <span key={idx}>{slice}</span>;
      })}
      {shown < total && <span className="dc-caret" />}
    </>
  );
}

// Types `target` into the composer one character at a time.
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

export default function DelegationChat() {
  // `cursor` = how many script steps have been consumed. Everything visible is
  // derived from it, so the timeline stays idempotent (StrictMode-safe).
  const [cursor, setCursor] = useState(0);
  const streamRef = useRef(null);

  const done = cursor >= SCRIPT.length;

  useEffect(() => {
    if (done) return;
    const step = SCRIPT[cursor];
    const t = setTimeout(() => setCursor((c) => c + 1), cursor === 0 ? 450 : dwell(step));
    return () => clearTimeout(t);
  }, [cursor, done]);

  const curStep = done ? null : SCRIPT[cursor];

  // Visible stream = every finished step (minus typing markers) plus the
  // current step if it's something that should already be on screen and
  // "in progress" (an agent message streaming, or a hand-off dial playing).
  const visible = useMemo(() => {
    const list = [];
    for (let k = 0; k < cursor; k++) {
      if (SCRIPT[k].kind !== 'typing') list.push({ step: SCRIPT[k], key: k, active: false });
    }
    const cur = cursor < SCRIPT.length ? SCRIPT[cursor] : null;
    if (cur && (cur.kind === 'agent' || cur.kind === 'handoff')) {
      list.push({ step: cur, key: cursor, active: true });
    }
    return list;
  }, [cursor]);

  // The agent currently holding the thread (driven by completed hand-offs).
  const activeId = useMemo(() => {
    let id = FIRST_AGENT;
    for (const s of SCRIPT.slice(0, cursor)) if (s.kind === 'handoff') id = s.to;
    return id;
  }, [cursor]);
  const active = byId(activeId);

  const dialStep = curStep?.kind === 'handoff' ? curStep : null;

  // Typing dots for the current step — and, if the script ends on a typing
  // step, keep them running so the demo closes on the agent still reasoning.
  const lastStep = SCRIPT[SCRIPT.length - 1];
  const typingAgent = curStep?.kind === 'typing'
    ? curStep.agent
    : done && lastStep.kind === 'typing'
      ? lastStep.agent
      : null;

  // While the cursor sits on a user step, type that message into the composer.
  const userDraftTarget = !done && SCRIPT[cursor]?.kind === 'user' ? SCRIPT[cursor].text : null;
  const userDraft = useTypewriter(userDraftTarget, USER_CHAR_MS);

  useEffect(() => {
    const el = streamRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
  }, [cursor]);

  const replay = () => setCursor(0);

  return (
    <div className="dc-app">
      <div className="dc-card">
        <header className="dc-top">
          <div className="dc-dock" key={activeId} style={{ background: active.bg, '--c': active.color }}>
            <AgentAvatar agent={active} size={42} />
            <span className="dc-dock__ring" />
          </div>
          <div className="dc-top__meta">
            <div className="dc-top__name">{active.name}</div>
            <div className="dc-top__role">
              <span className="dc-status" style={{ background: active.color }} />
              {active.role}
            </div>
          </div>
          <button className="dc-replay" onClick={replay} aria-label="Replay">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 12a9 9 0 1 0 3-6.7L3 8" />
              <path d="M3 3v5h5" />
            </svg>
          </button>
        </header>

        <div className="dc-stream" ref={streamRef}>
          {visible.map(({ step, key, active: streaming }, vi) => {
            if (step.kind === 'user') {
              return (
                <div className="dc-row dc-row--user" key={key}>
                  <div className="dc-bubble dc-bubble--user">{step.text}</div>
                </div>
              );
            }
            if (step.kind === 'handoff') {
              const from = byId(step.from);
              const to = byId(step.to);
              return (
                <div className="dc-handoff" key={key}>
                  <span className="dc-handoff__avatar" style={{ background: from.bg }}>
                    <AgentAvatar agent={from} size={22} />
                  </span>
                  <svg className="dc-handoff__arrow" width="34" height="14" viewBox="0 0 34 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 7h28" strokeDasharray="2 3" />
                    <path d="M25 2l5 5-5 5" />
                  </svg>
                  <span className="dc-handoff__avatar" style={{ background: to.bg, '--c': to.color }}>
                    <AgentAvatar agent={to} size={22} />
                  </span>
                  <span className="dc-handoff__note">{step.note}</span>
                </div>
              );
            }
            // agent message — name on the first of a run, avatar on the last
            // (so the newest bubble always keeps its avatar)
            const prev = visible[vi - 1]?.step;
            const next = visible[vi + 1]?.step;
            const startsRun = !prev || prev.kind !== 'agent' || prev.agent !== step.agent;
            const endsRun = !next || next.kind !== 'agent' || next.agent !== step.agent;
            const agent = byId(step.agent);
            return (
              <div className="dc-row dc-row--agent" key={key}>
                <div className="dc-row__avatar">
                  {endsRun && (
                    <span className="dc-avatar" style={{ background: agent.bg }}>
                      <AgentAvatar agent={agent} size={28} />
                    </span>
                  )}
                </div>
                <div className="dc-bubble dc-bubble--agent" style={{ '--c': agent.color }}>
                  {startsRun && <div className="dc-bubble__who">{agent.name}</div>}
                  {streaming ? <StreamingText text={step.text} /> : renderText(step.text)}
                </div>
              </div>
            );
          })}

          {typingAgent && (
            <div className="dc-row dc-row--agent">
              <div className="dc-row__avatar">
                <span className="dc-avatar" style={{ background: byId(typingAgent).bg }}>
                  <AgentAvatar agent={byId(typingAgent)} size={28} />
                </span>
              </div>
              <div className="dc-bubble dc-bubble--agent dc-bubble--typing">
                <span /><span /><span />
              </div>
            </div>
          )}
        </div>

        {dialStep && (
          <HandoffDial key={`dial-${cursor}`} fromId={dialStep.from} toId={dialStep.to} />
        )}

        <div className="dc-composer">
          <div className="dc-composer__field" data-typing={userDraftTarget ? 'true' : 'false'}>
            {userDraftTarget ? (
              <>
                <span className="dc-composer__draft">{userDraft}</span>
                <span className="dc-caret" />
              </>
            ) : (
              active.ph
            )}
          </div>
          <button
            className={`dc-composer__send ${userDraftTarget ? 'is-armed' : ''}`}
            style={{ background: userDraftTarget ? 'var(--accent)' : active.color }}
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
    </div>
  );
}
