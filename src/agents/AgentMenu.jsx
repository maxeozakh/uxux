import { useEffect, useRef, useState } from 'react';
import { AGENTS } from './agents';
import AgentAvatar from './AgentAvatar';
import './agentmenu.css';

const MARGIN = 58; // pivot inset from the bottom-left corner
const WIN_LO = 8; // lowest visible angle (deg, CCW from +x)
const WIN_HI = 100; // highest visible angle
const SELECT_ANGLE = 54; // apex: the agent scrolled here gets picked
const STEP = 22; // angular spacing between agents
const SPIN_GAIN = 0.3; // deg of scroll per px of finger travel

const toRad = (d) => (d * Math.PI) / 180;
const clamp = (v, a, b) => Math.min(Math.max(v, a), b);

const STORAGE_KEY = 'agent.pickedId';
const loadPickedId = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && AGENTS.some((a) => a.id === saved)) return saved;
  } catch {
    // ignore unavailable/blocked storage
  }
  return 'muse';
};

export default function AgentMenu() {
  const [pickedId, setPickedId] = useState(loadPickedId);
  const [open, setOpen] = useState(false);
  const [rot, setRot] = useState(0);
  const [popping, setPopping] = useState(false);
  const [vp, setVp] = useState({ w: window.innerWidth, h: window.innerHeight });
  const [pivot, setPivot] = useState({ x: MARGIN, y: window.innerHeight - MARGIN });

  const dockRef = useRef(null);
  const openRef = useRef(false);
  const drag = useRef({ startX: 0, startY: 0, startRot: 0, moved: false });

  useEffect(() => {
    const onResize = () => setVp({ w: window.innerWidth, h: window.innerHeight });
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, pickedId);
    } catch {
      // ignore unavailable/blocked storage
    }
  }, [pickedId]);

  // Fade lifecycle: keep mounted briefly after close so it can fade out.
  const [mounted, setMounted] = useState(false);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    if (open) {
      setMounted(true);
      const r = requestAnimationFrame(() => setShown(true));
      return () => cancelAnimationFrame(r);
    }
    setShown(false);
    const t = setTimeout(() => setMounted(false), 200);
    return () => clearTimeout(t);
  }, [open]);

  const n = AGENTS.length;
  const radius = clamp(Math.min(vp.w, vp.h) * 0.46, 150, 230);

  const pickedIndex = Math.max(0, AGENTS.findIndex((a) => a.id === pickedId));
  const picked = AGENTS[pickedIndex];

  const rotMax = SELECT_ANGLE - WIN_LO;
  const rotMin = SELECT_ANGLE - WIN_LO - (n - 1) * STEP;
  const baseAngle = (i) => WIN_LO + i * STEP;
  const displayAngle = (i, r) => baseAngle(i) + r;
  const rotFor = (i) => clamp(SELECT_ANGLE - baseAngle(i), rotMin, rotMax);

  // Index of the agent currently nearest the apex.
  const apexIndex = (r) => {
    let best = 0;
    let bd = Infinity;
    for (let i = 0; i < n; i++) {
      const d = Math.abs(displayAngle(i, r) - SELECT_ANGLE);
      if (d < bd) {
        bd = d;
        best = i;
      }
    }
    return best;
  };

  const active = mounted ? apexIndex(rot) : -1;

  const onDown = (e) => {
    e.preventDefault();
    dockRef.current?.setPointerCapture?.(e.pointerId);
    const r = dockRef.current?.getBoundingClientRect();
    if (r) setPivot({ x: r.left + r.width / 2, y: r.top + r.height / 2 });
    openRef.current = true;
    const startRot = open ? rot : rotFor(pickedIndex);
    drag.current = { startX: e.clientX, startY: e.clientY, startRot, moved: false };
    setRot(startRot);
    setOpen(true);
  };

  const onMove = (e) => {
    if (!openRef.current) return;
    const g = drag.current;
    const travel = e.clientX - g.startX + (e.clientY - g.startY);
    if (Math.abs(travel) > 5) g.moved = true;
    setRot(clamp(g.startRot - travel * SPIN_GAIN, rotMin, rotMax));
  };

  const onUp = () => {
    if (!openRef.current) return;
    const g = drag.current;
    if (g.moved) {
      const i = apexIndex(rot);
      setPickedId(AGENTS[i].id);
      setPopping(true);
      setTimeout(() => setPopping(false), 440);
    }
    openRef.current = false;
    setOpen(false);
  };

  return (
    <div className="agent-app">
      <div className="faux">
        <div className="faux__body">
          <div className="faux__row faux__row--in"><span style={{ width: '62%' }} /></div>
          <div className="faux__row faux__row--out"><span style={{ width: '48%' }} /></div>
          <div className="faux__row faux__row--in"><span style={{ width: '70%' }} /></div>
          <div className="faux__row faux__row--out"><span style={{ width: '40%' }} /></div>
          <div className="faux__row faux__row--in"><span style={{ width: '55%' }} /></div>
        </div>
      </div>

      {mounted && (
        <div className={`menu-layer ${shown ? 'is-open' : ''}`}>
          <div className="menu-backdrop" />

          {AGENTS.map((agent, i) => {
            const ang = displayAngle(i, rot);
            const visible = ang > WIN_LO - 14 && ang < WIN_HI + 14;
            let edge = 1;
            if (ang < WIN_LO) edge = clamp((ang - (WIN_LO - 14)) / 14, 0, 1);
            else if (ang > WIN_HI) edge = clamp((WIN_HI + 14 - ang) / 14, 0, 1);
            const x = pivot.x + radius * Math.cos(toRad(ang));
            const y = pivot.y - radius * Math.sin(toRad(ang));
            const isSel = i === active && visible && shown;
            return (
              <div
                key={agent.id}
                className={`marc ${isSel ? 'marc--sel' : ''}`}
                style={{ left: x, top: y, opacity: visible ? edge : 0, '--c': agent.color }}
              >
                <span className="marc__avatar" style={{ background: agent.bg }}>
                  <AgentAvatar agent={agent} size={50} />
                </span>
                <span className="marc__label">
                  <b>{agent.name}</b>
                  <em>{agent.role}</em>
                </span>
              </div>
            );
          })}

        </div>
      )}

      <div className="agent-dock">
        <button
          ref={dockRef}
          className={`agent-dock__avatar ${open ? 'is-open' : ''} ${popping ? 'is-pop' : ''}`}
          style={{ background: picked.bg }}
          onPointerDown={onDown}
          onPointerMove={onMove}
          onPointerUp={onUp}
          onPointerCancel={onUp}
        >
          <AgentAvatar agent={picked} size={56} />
        </button>
        <div className="agent-dock__name">{picked.name}</div>
      </div>
    </div>
  );
}
