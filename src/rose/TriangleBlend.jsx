import { useMemo, useRef, useState } from 'react';
import Patterns from './Patterns';
import {
  TRIANGLE_ANCHORS,
  barycentric,
  clampToTriangle,
  mixSentence,
  blendColor,
} from './anchors';
import { usePointerDrag, useSvgPoint, useLockTouchScroll } from './usePointerDrag';

const A = { x: 200, y: 26 };
const B = { x: 34, y: 330 };
const C = { x: 366, y: 330 };
const VERTS = [A, B, C];

const mid = (p, q) => ({ x: (p.x + q.x) / 2, y: (p.y + q.y) / 2 });
const G = { x: (A.x + B.x + C.x) / 3, y: (A.y + B.y + C.y) / 3 };

export default function TriangleBlend() {
  const svgRef = useRef(null);
  const wrapRef = useRef(null);
  const [point, setPoint] = useState(G);
  const [active, setActive] = useState(false);
  useLockTouchScroll(wrapRef);

  const regions = useMemo(() => {
    const mAB = mid(A, B);
    const mBC = mid(B, C);
    const mCA = mid(C, A);
    const adj = [
      [mAB, mCA], // around A
      [mAB, mBC], // around B
      [mBC, mCA], // around C
    ];
    return VERTS.map((v, i) => {
      const [m1, m2] = adj[i];
      return {
        option: TRIANGLE_ANCHORS[i],
        vertex: v,
        path: `M ${v.x} ${v.y} L ${m1.x} ${m1.y} L ${G.x} ${G.y} L ${m2.x} ${m2.y} Z`,
        labelPoint: {
          x: v.x + (v.x - G.x) * 0.34,
          y: v.y + (v.y - G.y) * 0.34,
        },
      };
    });
  }, []);

  const weights = useMemo(() => barycentric(point, A, B, C), [point]);
  const weighted = useMemo(
    () => TRIANGLE_ANCHORS.map((option, i) => ({ option, weight: weights[i] })),
    [weights],
  );

  const getPoint = useSvgPoint(svgRef);
  const handlers = usePointerDrag(
    getPoint,
    (p) => setPoint(clampToTriangle(p, A, B, C)),
    () => setActive(true),
    () => setActive(false),
  );

  const puckColor = blendColor(weighted);
  const sentence = mixSentence(weighted);
  const triPath = `M ${A.x} ${A.y} L ${B.x} ${B.y} L ${C.x} ${C.y} Z`;

  return (
    <div className="rose-stage" ref={wrapRef}>
      <svg ref={svgRef} className="rose-svg" viewBox="-70 -60 540 520" {...handlers}>
        <Patterns anchors={TRIANGLE_ANCHORS} idPrefix="tri" />

        <path d={triPath} fill="#fff" />
        <path d={triPath} fill={puckColor} opacity="0.08" />

        {regions.map((r, i) => {
          const w = weighted[i].weight;
          return (
            <g key={r.option.id}>
              <path
                d={r.path}
                fill={`url(#tri-${r.option.id})`}
                opacity={0.14 + w * 1.1 > 1 ? 1 : 0.14 + w * 1.1}
                style={{ transition: active ? 'none' : 'opacity 0.25s' }}
              />
              <path
                d={r.path}
                fill={r.option.color}
                opacity={w * 0.4}
                style={{ transition: active ? 'none' : 'opacity 0.25s' }}
              />
            </g>
          );
        })}

        <path d={triPath} fill="none" stroke="rgba(0,0,0,0.12)" strokeWidth="2" />

        {/* vertex chips */}
        {regions.map((r, i) => {
          const w = weighted[i].weight;
          const dom = w > 0.45;
          return (
            <g key={`chip-${r.option.id}`} transform={`translate(${r.labelPoint.x}, ${r.labelPoint.y})`}>
              <circle r="14" fill={`url(#tri-${r.option.id})`} stroke={r.option.color} strokeWidth="2" />
              <text className="rose-label" textAnchor="middle" y="34" fill={dom ? r.option.color : '#6c6a60'} style={{ fontWeight: dom ? 700 : 500 }}>
                {r.option.label}
              </text>
              <text className="rose-pct" textAnchor="middle" y="52" fill={r.option.color}>
                {Math.round(w * 100)}%
              </text>
            </g>
          );
        })}

        <g style={{ transition: active ? 'none' : 'transform 0.18s' }}>
          <circle cx={point.x} cy={point.y} r={active ? 24 : 20} fill={puckColor} className="rose-puck" />
          <circle cx={point.x} cy={point.y} r={active ? 24 : 20} fill="none" stroke="#fff" strokeWidth="3" />
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
