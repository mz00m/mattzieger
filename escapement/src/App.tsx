import { useEffect } from 'react';
import { Bench } from './three/Bench';
import { AssemblyPanel } from './ui/AssemblyPanel';
import { Timegrapher } from './ui/Timegrapher';
import { Diagnostics } from './ui/Diagnostics';
import { TrainPanel } from './ui/TrainPanel';
import { Explainer } from './ui/Explainer';
import { Glossary } from './ui/Glossary';
import { PartInfo } from './ui/PartInfo';
import { CarePanel } from './ui/CarePanel';
import { ObjectiveBanner, ControlBar, Celebration } from './ui/Hud';
import { ensureAudio } from './audio/sound';
import { useGameStore } from './state/gameStore';

const LAYERS = [
  { n: 1, label: 'Placement' },
  { n: 2, label: 'Mechanism' },
  { n: 3, label: 'Regulation' },
] as const;

function TopBar() {
  const layer = useGameStore((s) => s.layer);
  const cutaway = useGameStore((s) => s.cutaway);
  const setCutaway = useGameStore((s) => s.setCutaway);
  const toggleGlossary = useGameStore((s) => s.toggleGlossary);
  const realism = useGameStore((s) => s.realism);
  const setRealism = useGameStore((s) => s.setRealism);

  return (
    <header className="topbar">
      <div className="brand">
        <span className="brand-mark">◷</span> Escapement
        <span className="brand-sub">the craft of the mechanical watch</span>
      </div>

      <div className="layers">
        {LAYERS.map((l) => (
          <div
            key={l.n}
            className={`layer-pip ${layer === l.n && !realism ? 'active' : layer > l.n || realism ? 'done' : ''}`}
          >
            <span className="layer-n">{l.n}</span>
            <strong>{l.label}</strong>
          </div>
        ))}
        <div className={`layer-pip mastery ${realism ? 'active' : ''}`}>
          <span className="layer-n">4</span>
          <strong>Mastery</strong>
        </div>
      </div>

      <div className="topbar-right">
        <label className={`realism-toggle ${realism ? 'on' : ''}`}>
          <input type="checkbox" checked={realism} onChange={(e) => setRealism(e.target.checked)} />
          Realism
        </label>
        <label className="cutaway">
          Cutaway
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={cutaway}
            onChange={(e) => setCutaway(Number(e.target.value))}
          />
        </label>
        <button className="ghost" onClick={toggleGlossary}>
          Glossary
        </button>
      </div>
    </header>
  );
}

export default function App() {
  // Browsers require a user gesture before audio can play — arm it once.
  useEffect(() => {
    const arm = () => ensureAudio();
    window.addEventListener('pointerdown', arm, { once: true });
    return () => window.removeEventListener('pointerdown', arm);
  }, []);

  return (
    <div className="app">
      <TopBar />
      <div className="stage">
        <aside className="left">
          <AssemblyPanel />
        </aside>

        <main className="canvas-wrap">
          <Bench />
          <ObjectiveBanner />
          <ControlBar />
        </main>

        <aside className="right">
          <Timegrapher />
          <Diagnostics />
          <CarePanel />
          <details className="panel collapsible">
            <summary>Going train — the ratios</summary>
            <TrainPanel />
          </details>
        </aside>
      </div>

      <Explainer />
      <Glossary />
      <PartInfo />
      <Celebration />
    </div>
  );
}
