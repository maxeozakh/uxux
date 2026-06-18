import { useMemo, useRef, useState } from 'react';
import Patterns from './Patterns';
import {
  WHEEL_ANCHORS,
  inverseDistanceWeights,
  clampToCircle,
  mixSentence,
  blendColor,
} from './anchors';
import { usePointerDrag, useSvgPoint, useLockTouchScroll } from './usePointerDrag';

const CX = 200;
const CY = 200;
const R_OUT = 150;
const R_IN = 66;
const R_PUCK = 132;

function polar(cx, cy, r, angle) {
  return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) };
}

function annularSector(a0, a1) {
  const p0 = polar(CX, CY, R_OUT, a0);
  const p1 = polar(CX, CY, R_OUT, a1);
  const p2 = polar(CX, CY, R_IN, a1);
  const p3 = polar(CX, CY, R_IN, a0);
  const large = a1 - a0 > Math.PI ? 1 : 0;
  return `M ${p0.x} ${p0.y} A ${R_OUT} ${R_OUT} 0 ${large} 1 ${p1.x} ${p1.y} L ${p2.x} ${p2.y} A ${R_IN} ${R_IN} 0 ${large} 0 ${p3.x} ${p3.y} Z`;
}

export default function BlendWheel() {
  const svgRef = useRef(null);
  const wrapRef = useRef(null);
  const [point, setPoint] = useState({ x: CX, y: CY });
  const [active, setActive] = useState(false);
  useLockTouchScroll(wrapRef);

  const geo = useMemo(() => {
    const n = WHEEL_ANCHORS.length;
    const step = (Math.PI * 2) / n;
    const start = -Math.PI / 2;
    return WHEEL_ANCHORS.map((option, i) => {
      const center = start + step * i;
      const a0 = center - step / 2;
      const a1 = center + step / 2;
      return {
        option,
        center,
        a0,
        a1,
        anchorPoint: polar(CX, CY, R_OUT * 0.92, center),
        labelPoint: polar(CX, CY, R_OUT + 34, center),
        path: annularSector(a0 + 0.012, a1 - 0.012),
      };
    });
  }, []);

  const weighted = useMemo(() => {
    const w = inverseDistanceWeights(point, geo.map((g) => g.anchorPoint));
    return geo.map((g, i) => ({ option: g.option, weight: w[i] }));
  }, [point, geo]);

  const getPoint = useSvgPoint(svgRef);
  const handlers = usePointerDrag(
    getPoint,
    (p) => setPoint(clampToCircle(p, CX, CY, R_PUCK)),
    () => setActive(true),
    () => setActive(false),
  );

  const puckColor = blendColor(weighted);
  const sentence = mixSentence(weighted);

  return (
    <div className="rose-stage" ref={wrapRef}>
      <svg
        ref={svgRef}
        className="rose-svg"
        viewBox="-60 -60 520 520"
        {...handlers}
      >
        <Patterns anchors={WHEEL_ANCHORS} idPrefix="wheel" />

        <circle cx={CX} cy={CY} r={R_OUT + 8} fill="#fff" className="rose-disc" />

        {geo.map((g, i) => {
          const weight = weighted[i].weight;
          return (
            <g key={g.option.id}>
              <path d={g.path} fill={g.option.color} opacity={0.08} />
              <path
                d={g.path}
                fill={`url(#wheel-${g.option.id})`}
                opacity={0.18 + weight * 1.6 > 1 ? 1 : 0.18 + weight * 1.6}
                style={{ transition: active ? 'none' : 'opacity 0.25s' }}
              />
              <path
                d={g.path}
                fill={g.option.color}
                opacity={weight * 0.55}
                style={{ transition: active ? 'none' : 'opacity 0.25s' }}
              />
            </g>
          );
        })}

        <circle cx={CX} cy={CY} r={R_IN} fill="#fff" />
        <circle cx={CX} cy={CY} r={R_IN} fill="none" stroke="rgba(0,0,0,0.06)" />

        {/* labels */}
        {geo.map((g, i) => {
          const w = weighted[i].weight;
          const dom = w > 0.32;
          return (
            <g key={`lbl-${g.option.id}`} transform={`translate(${g.labelPoint.x}, ${g.labelPoint.y})`}>
              <text
                textAnchor="middle"
                dominantBaseline="middle"
                className="rose-label"
                fill={dom ? g.option.color : '#6c6a60'}
                style={{ fontWeight: dom ? 700 : 500, transition: 'fill 0.2s' }}
              >
                {g.option.label}
              </text>
            </g>
          );
        })}

        {/* connector + puck */}
        <line
          x1={CX}
          y1={CY}
          x2={point.x}
          y2={point.y}
          stroke={puckColor}
          strokeWidth="3"
          strokeLinecap="round"
          opacity="0.5"
        />
        <circle cx={CX} cy={CY} r="5" fill={puckColor} />
        <g style={{ transition: active ? 'none' : 'transform 0.18s' }}>
          <circle
            cx={point.x}
            cy={point.y}
            r={active ? 26 : 22}
            fill={puckColor}
            className="rose-puck"
          />
          <circle cx={point.x} cy={point.y} r={active ? 26 : 22} fill="none" stroke="#fff" strokeWidth="3" />
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
