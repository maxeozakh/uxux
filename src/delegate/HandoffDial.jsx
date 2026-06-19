import { useEffect, useState } from 'react';
import { AGENTS } from '../agents/agents';
import AgentAvatar from '../agents/AgentAvatar';

// Fans every agent on a shallow arc, then spins the ring so the new agent
// lands at the top apex — the same "marking menu" gesture as the picker,
// replayed automatically as a hand-off flourish.
const SPREAD = 32; // degrees between adjacent agents
const RADIUS = 104; // arc radius in px

const angleFor = (i) => (i - (AGENTS.length - 1) / 2) * SPREAD;
const ringFor = (i) => -angleFor(i); // ring rotation that puts agent i on top

export default function HandoffDial({ fromId, toId }) {
  const fromIndex = Math.max(0, AGENTS.findIndex((a) => a.id === fromId));
  const toIndex = Math.max(0, AGENTS.findIndex((a) => a.id === toId));

  const [rot, setRot] = useState(ringFor(fromIndex));
  const [landed, setLanded] = useState(fromIndex);
  const [phase, setPhase] = useState('in'); // in → spin → out

  useEffect(() => {
    const fan = requestAnimationFrame(() => setPhase('spin'));
    const spin = setTimeout(() => {
      setRot(ringFor(toIndex));
      setLanded(toIndex);
    }, 200);
    // collapse shortly after the pick lands — keeps the swap feeling clicky
    const out = setTimeout(() => setPhase('out'), 200 + 560);
    return () => {
      cancelAnimationFrame(fan);
      clearTimeout(spin);
      clearTimeout(out);
    };
  }, [toIndex]);

  return (
    <div className={`dial ${phase !== 'in' ? 'is-shown' : ''} ${phase === 'out' ? 'is-out' : ''}`}>
      <div className="dial__backdrop" />
      <div className="dial__pivot">
        <span className="dial__apex" />
        {AGENTS.map((agent, i) => {
          const disp = angleFor(i) + rot;
          const isLanded = i === landed;
          return (
            <div
              key={agent.id}
              className={`dial__slot ${isLanded ? 'is-landed' : ''}`}
              style={{
                transform: `rotate(${disp}deg) translateY(-${RADIUS}px) rotate(${-disp}deg)`,
                '--c': agent.color,
              }}
            >
              <span className="dial__avatar" style={{ background: agent.bg }}>
                <AgentAvatar agent={agent} size={46} />
              </span>
              <span className="dial__name">{agent.name}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
