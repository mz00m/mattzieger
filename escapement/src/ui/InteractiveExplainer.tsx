/**
 * Interactive explainers — the 30–60s isolated mechanisms from the article.
 * The player manipulates a lone subsystem and feels the cause/effect before ever
 * placing the real part:
 *  - BalanceLab: tune a torsion spring's stiffness and inertia, feel the period.
 *  - MainspringLab: wind a lone spring, watch torque build then decay as it runs.
 */

import { useEffect, useRef, useState } from 'react';
import type { PartGroup } from '../content/parts';

/** A lone torsional oscillator: T = 2π√(I/k). */
function BalanceLab() {
  const [k, setK] = useState(50); // relative stiffness
  const [I, setI] = useState(50); // relative inertia
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Map sliders to a period; tuned so the midpoint lands near a real 0.25 s.
  const period = 0.25 * Math.sqrt((I / 50) / (k / 50));
  const freq = 1 / period;
  const bph = Math.round(freq * 2 * 3600);

  useEffect(() => {
    let raf = 0;
    const start = performance.now();
    const draw = () => {
      const c = canvasRef.current;
      if (c) {
        const ctx = c.getContext('2d')!;
        const w = c.width;
        const h = c.height;
        ctx.clearRect(0, 0, w, h);
        const t = (performance.now() - start) / 1000;
        const amp = (50 * Math.PI) / 180 + 1.6; // ~rad swing for show
        const angle = amp * Math.cos((2 * Math.PI * t) / period);
        const cx = w / 2;
        const cy = h / 2;
        const r = Math.min(w, h) * 0.36;
        // rim
        ctx.strokeStyle = '#c0463b';
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.stroke();
        // spokes rotated by angle
        ctx.strokeStyle = '#e0c558';
        ctx.lineWidth = 3;
        for (let i = 0; i < 4; i++) {
          const a = angle + (i * Math.PI) / 2;
          ctx.beginPath();
          ctx.moveTo(cx - Math.cos(a) * r, cy - Math.sin(a) * r);
          ctx.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r);
          ctx.stroke();
        }
        ctx.fillStyle = '#9fb7c9';
        ctx.beginPath();
        ctx.arc(cx, cy, 5, 0, Math.PI * 2);
        ctx.fill();
      }
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(raf);
  }, [period]);

  return (
    <div className="lab">
      <canvas ref={canvasRef} width={200} height={150} className="lab-canvas" />
      <div className="lab-readout">
        <div>
          <strong>{freq.toFixed(2)} Hz</strong> · {bph.toLocaleString()} bph
        </div>
        <div className="dim small">period {(period * 1000).toFixed(0)} ms</div>
      </div>
      <label className="lab-slider">
        Hairspring stiffness (k)
        <input type="range" min={20} max={90} value={k} onChange={(e) => setK(Number(e.target.value))} />
      </label>
      <label className="lab-slider">
        Balance inertia (I)
        <input type="range" min={20} max={90} value={I} onChange={(e) => setI(Number(e.target.value))} />
      </label>
      <p className="hint small">
        Stiffer spring → faster. Heavier balance → slower. The real watch is tuned so two beats take
        ¼ second — 28,800 bph.
      </p>
    </div>
  );
}

/** A lone mainspring: wind it, watch torque build and decay as it runs down. */
function MainspringLab() {
  const [wind, setWind] = useState(0);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      setWind((w) => Math.max(0, w - 0.012));
    }, 60);
    return () => clearInterval(id);
  }, [running]);

  // Torque keeps a floor (real springs don't fall to zero), like the sim.
  const torque = wind <= 0 ? 0 : 0.55 + 0.45 * wind;

  return (
    <div className="lab">
      <div className="lab-readout">
        <div>
          torque <strong>{(torque * 100).toFixed(0)}%</strong>
        </div>
        <div className="dim small">{(wind * 100).toFixed(0)}% wound</div>
      </div>
      <div className="cond-bar-track tall">
        <div className="cond-bar-fill good" style={{ width: `${torque * 100}%` }} />
      </div>
      <label className="lab-slider">
        Wind
        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={wind}
          onChange={(e) => {
            setWind(Number(e.target.value));
            setRunning(false);
          }}
        />
      </label>
      <div className="row gap">
        <button onClick={() => setWind(1)}>Full wind</button>
        <button className={running ? 'active' : ''} onClick={() => setRunning((r) => !r)}>
          {running ? 'Pause' : 'Let it run'}
        </button>
      </div>
      <p className="hint small">
        Torque is highest fully wound and tails off as the spring unwinds — which is why amplitude
        (and rate) drift as the watch runs down. That's the isochronism problem.
      </p>
    </div>
  );
}

export function InteractiveExplainer({ group }: { group: PartGroup }) {
  if (group === 'balance') return <BalanceLab />;
  if (group === 'power') return <MainspringLab />;
  return null;
}

export function hasInteractive(group: PartGroup): boolean {
  return group === 'balance' || group === 'power';
}
