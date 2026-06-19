import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';

// ── leaf renderers ─────────────────────────────────────────────────────────
// Each block renders BOTH a skeleton layer and a content layer, stacked. The
// active one fades in while the block's height animates to its measured size,
// so a placeholder morphs into real content (or another shape) — never a blink.

function Skeleton({ block }) {
  switch (block.kind) {
    case 'title':
      return <div className="sk sk--title" style={{ width: block.w || '50%' }} />;
    case 'stats':
      return (
        <div className="gp-stats">
          {[0, 1, 2].map((i) => (
            <div className="gp-stat" key={i}>
              <div className="sk sk--val" />
              <div className="sk sk--lab" />
            </div>
          ))}
        </div>
      );
    case 'bars':
      return (
        <div className="gp-chart gp-chart--skel">
          <div className="gp-chart__bars">
            {[0.5, 0.7, 0.45, 0.8, 0.6, 0.9, 0.7].map((v, i) => (
              <span className="sk" key={i} style={{ height: `${v * 100}%` }} />
            ))}
          </div>
        </div>
      );
    case 'note':
      return <div className="sk sk--note" />;
    default:
      return null;
  }
}

function Content({ block }) {
  // Both layers always mount, so the content layer can run while the block is
  // still a skeleton (data not provided yet) — guard every data access.
  switch (block.kind) {
    case 'title':
      return <div className={`gp-title ${block.muted ? 'is-muted' : ''}`}>{block.text || ''}</div>;
    case 'stats':
      return (
        <div className="gp-stats">
          {(block.items || []).map((s, i) => (
            <div className="gp-stat" key={i}>
              <div className="gp-stat__val">{s.value}</div>
              <div className="gp-stat__lab">{s.label}</div>
            </div>
          ))}
        </div>
      );
    case 'bars':
      return (
        <div className="gp-chart">
          <div className="gp-chart__bars">
            {(block.bars || []).map((v, i) => (
              <span key={i} style={{ height: `${v * 100}%` }} />
            ))}
          </div>
          <div className="gp-chart__labels">
            {(block.labels || []).map((l, i) => (
              <span key={i}>{l}</span>
            ))}
          </div>
        </div>
      );
    case 'note':
      return <div className="gp-note">{block.text || ''}</div>;
    case 'chips':
      return (
        <div className="gp-chips">
          {(block.items || []).map((c, i) => (
            <button className="gp-chip" key={i} disabled>
              {c}
            </button>
          ))}
        </div>
      );
    case 'error':
      return (
        <div className="gp-error">
          <span className="gp-error__icon" aria-hidden="true">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 9v4M12 17h.01" />
              <path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" />
            </svg>
          </span>
          <div className="gp-error__text">
            <div className="gp-error__title">{block.title}</div>
            <div className="gp-error__sub">{block.sub}</div>
          </div>
        </div>
      );
    default:
      return null;
  }
}

// ── a single morphing block ────────────────────────────────────────────────
// Measures the active layer and FLIPs height from its previous value, so any
// content change (skel→real, or one shape→another) animates smoothly.
function Block({ block, exiting }) {
  const wrapRef = useRef(null);
  const skelRef = useRef(null);
  const realRef = useRef(null);
  const prevH = useRef(0);

  const isReal = block.state === 'real';
  const sig = useMemo(() => JSON.stringify(block), [block]);

  useLayoutEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    let target = 0;
    if (!exiting) {
      const active = isReal ? realRef.current : skelRef.current;
      target = active ? active.getBoundingClientRect().height : 0;
    }
    const from = prevH.current;
    wrap.style.height = `${from}px`;
    void wrap.offsetHeight; // force reflow so the transition runs from `from`
    wrap.style.height = `${target}px`;
    prevH.current = target;
  }, [sig, exiting, isReal]);

  return (
    <div ref={wrapRef} className={`gp-block ${exiting ? 'is-exit' : ''}`}>
      <div ref={skelRef} className={`gp-layer ${!isReal && !exiting ? 'is-on' : ''}`} aria-hidden="true">
        <div className="gp-pad">
          <Skeleton block={block} />
        </div>
      </div>
      <div ref={realRef} className={`gp-layer ${isReal && !exiting ? 'is-on' : ''}`}>
        <div className="gp-pad">
          <Content block={block} />
        </div>
      </div>
    </div>
  );
}

// ── the panel ──────────────────────────────────────────────────────────────
// Keeps an ordered presence list so blocks dropped between frames collapse in
// place (instead of vanishing), and new blocks expand from zero height.
export default function GenerativePanel({ frame }) {
  const [items, setItems] = useState([]);

  useEffect(() => {
    setItems((prev) => {
      const target = new Map(frame.blocks.map((b) => [b.id, b]));
      const out = [];
      const kept = new Set();
      // existing blocks keep their slot; update or mark for exit
      for (const it of prev) {
        if (target.has(it.id)) {
          out.push({ id: it.id, block: target.get(it.id), exiting: false });
          kept.add(it.id);
        } else if (!it.exiting) {
          out.push({ ...it, exiting: true });
        }
        // already-exiting items are dropped once gone
      }
      // brand-new blocks append in frame order
      for (const b of frame.blocks) {
        if (!kept.has(b.id)) out.push({ id: b.id, block: b, exiting: false });
      }
      return out;
    });
  }, [frame]);

  // sweep collapsed blocks after their transition finishes
  useEffect(() => {
    if (!items.some((i) => i.exiting)) return undefined;
    const t = setTimeout(() => setItems((prev) => prev.filter((i) => !i.exiting)), 480);
    return () => clearTimeout(t);
  }, [items]);

  return (
    <div className="gp">
      <div className={`gp-brain ${frame.settled ? 'is-settled' : ''}`}>
        {!frame.settled && <span className="gp-brain__pulse" />}
        <span className="gp-brain__txt" key={frame.hint}>
          {frame.hint}
        </span>
      </div>
      <div className="gp-blocks">
        {items.map((it) => (
          <Block key={it.id} block={it.block} exiting={it.exiting} />
        ))}
      </div>
    </div>
  );
}
