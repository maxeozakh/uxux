import PixelSprite from './PixelSprite';
import {
  VILLAGER,
  AGENT_A_PALETTE,
  BOB_PALETTE,
  HEART,
  HEART_PALETTE,
  CLOUD,
  CLOUD_PALETTE,
  FLOWER,
  flowerPalette,
  BUSH,
  BUSH_PALETTE,
  TREE,
  TREE_PALETTE,
} from './sprites';
import './meet.css';

const FLOWERS = [
  { petal: '#e87aa5', left: '14%', bottom: '11%', pixel: 5 },
  { petal: '#f3c969', left: '25%', bottom: '6%', pixel: 6 },
  { petal: '#c08ad0', left: '68%', bottom: '8%', pixel: 6 },
  { petal: '#ffffff', left: '82%', bottom: '13%', pixel: 5 },
  { petal: '#e0a458', left: '45%', bottom: '4%', pixel: 5 },
  { petal: '#e87aa5', left: '58%', bottom: '15%', pixel: 4 },
  { petal: '#ffffff', left: '36%', bottom: '9%', pixel: 4 },
];

function Actor({ id, palette, flip, name, line }) {
  return (
    <div className={`actor actor--${id}`}>
      <div className={`bubble bubble--${id}`}>
        {line}
        <span className="bubble__tail" />
      </div>
      <div className="actor__body">
        <PixelSprite grid={VILLAGER} palette={palette} pixel={7} flip={flip} />
        <div className="actor__shadow" />
      </div>
      <div className="actor__name">{name}</div>
    </div>
  );
}

export default function MeetScene() {
  return (
    <div className="meet-stage">
      <div className="sky">
        <div className="sun" />
        <div className="cloud cloud--1">
          <PixelSprite grid={CLOUD} palette={CLOUD_PALETTE} pixel={7} />
        </div>
        <div className="cloud cloud--2">
          <PixelSprite grid={CLOUD} palette={CLOUD_PALETTE} pixel={5} />
        </div>
        <div className="cloud cloud--3">
          <PixelSprite grid={CLOUD} palette={CLOUD_PALETTE} pixel={6} />
        </div>
      </div>

      <div className="ground">
        <div className="ground__horizon" />
        <div className="path" />
      </div>

      {/* scenery */}
      <div className="prop tree">
        <PixelSprite grid={TREE} palette={TREE_PALETTE} pixel={9} />
      </div>
      <div className="prop bush bush--1">
        <PixelSprite grid={BUSH} palette={BUSH_PALETTE} pixel={6} />
      </div>
      <div className="prop bush bush--2">
        <PixelSprite grid={BUSH} palette={BUSH_PALETTE} pixel={5} />
      </div>
      {FLOWERS.map((f, i) => (
        <div key={i} className="prop flower" style={{ left: f.left, bottom: f.bottom }}>
          <PixelSprite grid={FLOWER} palette={flowerPalette(f.petal)} pixel={f.pixel} />
        </div>
      ))}

      {/* actors facing each other */}
      <div className="actors">
        <Actor
          id="agent-a"
          palette={AGENT_A_PALETTE}
          flip={false}
          name="Alex's agent"
          line="I'm Alex's agent"
        />

        <div className="greet-hearts">
          <span className="gh gh--1"><PixelSprite grid={HEART} palette={HEART_PALETTE} pixel={5} /></span>
          <span className="gh gh--2"><PixelSprite grid={HEART} palette={HEART_PALETTE} pixel={4} /></span>
        </div>

        <Actor
          id="bob"
          palette={BOB_PALETTE}
          flip
          name="Bob's agent"
          line="let's tandem!"
        />
      </div>

      <div className="meet-caption">
        <span className="meet-caption__title">user agents, working in tandem</span>
        <span className="meet-caption__sub">many agents · one flow · no trillion tabs</span>
      </div>
    </div>
  );
}
