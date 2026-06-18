import { useState, useEffect } from 'react';
import RosePage from './rose/RosePage';
import AgentMenu from './agents/AgentMenu';

function useHashRoute() {
  const [hash, setHash] = useState(() => window.location.hash.replace('#', '') || 'rose');
  useEffect(() => {
    const onChange = () => setHash(window.location.hash.replace('#', '') || 'rose');
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);
  return hash;
}

const DEMOS = [
  { id: 'rose', label: 'Automations', icon: '🌸' },
  { id: 'agents', label: 'Marking menu', icon: '🎛️' },
];

function DemoNav({ route }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        className={`side-toggle ${open ? 'side-toggle--open' : ''}`}
        onClick={() => setOpen((v) => !v)}
        aria-label="Toggle demos"
      >
        <span /><span /><span />
      </button>

      {open && <div className="side-backdrop" onClick={() => setOpen(false)} />}

      <nav className={`side-nav ${open ? 'side-nav--open' : ''}`}>
        <div className="side-nav__title">Demos</div>
        {DEMOS.map((d) => (
          <a
            key={d.id}
            className={`side-nav__item ${route === d.id ? 'side-nav__item--active' : ''}`}
            href={`#${d.id}`}
            onClick={() => setOpen(false)}
          >
            <span className="side-nav__emoji">{d.icon}</span>
            {d.label}
          </a>
        ))}
      </nav>
    </>
  );
}

export default function App() {
  const route = useHashRoute();
  return (
    <>
      {route === 'agents' ? <AgentMenu /> : <RosePage />}
      <DemoNav route={route} />
    </>
  );
}
