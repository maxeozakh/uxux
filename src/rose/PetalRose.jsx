import { useMemo, useRef, useState } from 'react';
import Patterns from './Patterns';
import {
  PETAL_ANCHORS,
  inverseDistanceWeights,
  clampToCircle,
  mixSentence,
  blendColor,
} from './anchors';
import { usePointerDrag, useSvgPoint, useLockTouchScroll } from './usePointerDrag';

const CX = 200;
const CY = 200;
const R_BASE = 42;
const R_TIP_MIN = 108;
const R_DRAG = 122;
const R_GROWTH = 92;
const PUCK_R = 18;
const HALF = (24 * Math.PI) / 180;

const polar = (r, a) => ({ x: CX + r * Math.cos(a), y: CY + r * Math.sin(a) });

function petalPath(ang, rTip) {
  const left = polar(R_BASE, ang - HALF);
  const right = polar(R_BASE, ang + HALF);
  const tip = polar(rTip, ang);
  const cL = polar(rTip * 0.82, ang - HALF * 1.7);
  const cR = polar(rTip * 0.82, ang + HALF * 1.7);
  return `M ${left.x} ${left.y} Q ${cL.x} ${cL.y} ${tip.x} ${tip.y} Q ${cR.x} ${cR.y} ${right.x} ${right.y} Z`;
}

export default function PetalRose() {
  const svgRef = useRef(null);
  const wrapRef = useRef(null);
  const [point, setPoint] = useState({ x: CX, y: CY });
  const [active, setActive] = useState(false);
  useLockTouchScroll(wrapRef);

  const base = useMemo(() => {
    const n = PETAL_ANCHORS.length;
    const step = (Math.PI * 2) / n;
    const start = -Math.PI / 2;
    return PETAL_ANCHORS.map((option, i) => {
      const ang = start + step * i;
      return { option, ang, anchorPoint: polar(R_TIP_MIN, ang) };
    });
  }, []);

  const weighted = useMemo(() => {
    const w = inverseDistanceWeights(point, base.map((b) => b.anchorPoint));
    return base.map((b, i) => ({ ...b, weight: w[i] }));
  }, [point, base]);

  const getPoint = useSvgPoint(svgRef);
  const handlers = usePointerDrag(
    getPoint,
    (p) => setPoint(clampToCircle(p, CX, CY, R_DRAG)),
    () => setActive(true),
    () => setActive(false),
  );

  const puckColor = blendColor(weighted);
  const sentence = mixSentence(weighted);

  return (
    <div className="rose-stage" ref={wrapRef}>
      <svg ref={svgRef} className="rose-svg" viewBox="-70 -70 540 540" {...handlers}>
        <Patterns anchors={PETAL_ANCHORS} idPrefix="petal" tile={10} />

        {weighted.map((b) => {
          const rTip = R_TIP_MIN + b.weight * R_GROWTH;
          const path = petalPath(b.ang, rTip);
          const tip = polar(rTip + 26, b.ang);
          const dom = b.weight > 0.28;
          return (
            <g key={b.option.id} style={{ transition: active ? 'none' : 'all 0.22s ease' }}>
              <path
                d={path}
                fill={b.option.color}
                opacity={0.16 + b.weight * 0.5}
                style={{ transition: active ? 'none' : 'd 0.22s, opacity 0.22s' }}
              />
              <path d={path} fill={`url(#petal-${b.option.id})`} opacity={0.5 + b.weight * 0.5} />
              <path d={path} fill="none" stroke={b.option.color} strokeWidth="1.5" opacity="0.55" />
              <text
                className="rose-label"
                x={tip.x}
                y={tip.y - 8}
                textAnchor="middle"
                dominantBaseline="middle"
                fill={dom ? b.option.color : '#6c6a60'}
                style={{ fontWeight: dom ? 700 : 500 }}
              >
                {b.option.label}
              </text>
              <text
                className="rose-pct"
                x={tip.x}
                y={tip.y + 11}
                textAnchor="middle"
                dominantBaseline="middle"
                fill={b.option.color}
              >
                {Math.round(b.weight * 100)}%
              </text>
            </g>
          );
        })}

        <circle cx={CX} cy={CY} r={R_BASE + 4} fill="#fff" />
        <circle cx={CX} cy={CY} r={R_BASE + 4} fill="none" stroke="rgba(0,0,0,0.06)" />

        <g transform={`translate(${point.x} ${point.y})`}>
          <g className={`rose-puck-body${active ? ' rose-puck-body--active' : ''}`}>
            <circle cx={0} cy={0} r={PUCK_R} fill={puckColor} className="rose-puck" />
            <circle cx={0} cy={0} r={PUCK_R} fill="none" stroke="#fff" strokeWidth="3" />
          </g>
        </g>
      </svg>

      <div className="rose-readout">
        <span className="rose-readout__kicker">your automation</span>
        <span className="rose-readout__text" style={{ color: puckColor }}>
          {sentence}
        </span>
      </div>
    </div>
  );
}
