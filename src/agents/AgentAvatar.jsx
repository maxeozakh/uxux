import { loreleiFace } from './agents';

// Shared "loose ink" look to match DiceBear's Lorelei Neutral: black hand-drawn
// strokes on a transparent background (the avatar circle provides the fill color).
const INK = '#000';
const inkStroke = {
  fill: 'none',
  stroke: INK,
  strokeWidth: 3.2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
};

// Atlas (knowledge), drawn as a hand-inked heart with a little of the blue-heart emoji color.
function AtlasMark({ size }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" className="ink-mark atlas-mark">
      <path
        d="M50 76 C29 59 17 47 17 36 C17 26 25 19 34 19 C41 19 47 24 50 31 C53 24 59 19 66 19 C75 19 83 26 83 36 C83 47 71 59 50 76 Z"
        {...inkStroke}
        fill="#2F6FE0"
        fillOpacity={0.16}
      />
      <path d="M31 31 C29 34 29 39 31 43" {...inkStroke} strokeWidth={2.6} stroke="#2F6FE0" />
    </svg>
  );
}

export default function AgentAvatar({ agent, size = 58 }) {
  if (agent.avatar === 'atlas') return <AtlasMark size={size} />;
  return (
    <img
      src={loreleiFace(agent.seed, agent.bg)}
      width={size}
      height={size}
      alt={agent.name}
      draggable={false}
      style={{ display: 'block' }}
    />
  );
}
