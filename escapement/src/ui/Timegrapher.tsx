/**
 * Timegrapher: the watchmaker's diagnostic readout. Shows rate (s/day),
 * amplitude (°), and beat error (ms), plus the regulation controls. A scrolling
 * beat trace gives the rate a visual slope, like a real timing machine.
 */

import { useEffect, useRef } from 'react';
import { useGameStore, RATE_TARGET, BEAT_TARGET } from '../state/gameStore';
import { POSITIONS, type WatchPosition } from '../sim/positions';

function within(value: number, target: number): boolean {
  return Math.abs(value) <= target;
}

function posLabel(pos: WatchPosition): string {
  return POSITIONS.find((p) => p.id === pos)?.label ?? pos;
}

function BeatTrace() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    let raf = 0;
    const draw = () => {
      const c = ref.current;
      if (c) {
        const ctx = c.getContext('2d')!;
        const { snapshot } = useGameStore.getState();
        const w = c.width;
        const h = c.height;
        ctx.clearRect(0, 0, w, h);
        ctx.fillStyle = '#0c1118';
        ctx.fillRect(0, 0, w, h);

        // Slope per row proportional to rate (s/day). Two dot lines (tick/tock).
        const slope = snapshot.running ? (snapshot.rateSecPerDay / 200) : 0;
        const beatGap = snapshot.beatErrorMs / 6; // visual separation
        const rows = 26;
        for (let line = 0; line < 2; line++) {
          ctx.fillStyle = line === 0 ? '#6fe0a3' : '#7fb6e8';
          for (let r = 0; r < rows; r++) {
            const y = (r / rows) * h;
            const baseX = w / 2 + (line === 0 ? -beatGap * 6 : beatGap * 6);
            const x = baseX + slope * (r - rows / 2) * 6;
            ctx.fillRect(((x % w) + w) % w, y, 2.5, 3);
          }
        }
      }
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(raf);
  }, []);

  return <canvas ref={ref} width={220} height={120} className="beat-trace" />;
}

export function Timegrapher() {
  const snapshot = useGameStore((s) => s.snapshot);
  const regulator = useGameStore((s) => s.regulator);
  const stud = useGameStore((s) => s.stud);
  const setRegulator = useGameStore((s) => s.setRegulator);
  const setStud = useGameStore((s) => s.setStud);
  const regulatedDone = useGameStore((s) => s.regulatedDone);

  const rateOk = snapshot.running && within(snapshot.rateSecPerDay, RATE_TARGET);
  const beatOk = snapshot.running && snapshot.beatErrorMs <= BEAT_TARGET;

  return (
    <div className="panel timegrapher">
      <div className="panel-title">Timegrapher</div>

      <BeatTrace />

      <div className="gauges">
        <div className={`gauge ${rateOk ? 'ok' : snapshot.running ? 'warn' : ''}`}>
          <div className="gauge-value">
            {snapshot.running ? `${snapshot.rateSecPerDay >= 0 ? '+' : ''}${snapshot.rateSecPerDay.toFixed(1)}` : '—'}
          </div>
          <div className="gauge-label">rate s/day</div>
        </div>
        <div className="gauge">
          <div className="gauge-value">{snapshot.running ? `${Math.round(snapshot.amplitudeDeg)}°` : '—'}</div>
          <div className="gauge-label">amplitude</div>
        </div>
        <div className={`gauge ${beatOk ? 'ok' : snapshot.running ? 'warn' : ''}`}>
          <div className="gauge-value">{snapshot.running ? `${snapshot.beatErrorMs.toFixed(1)}` : '—'}</div>
          <div className="gauge-label">beat err ms</div>
        </div>
      </div>

      <div className="reg-controls">
        <label>
          <span>
            Regulator <em>{regulator > 0 ? `+${regulator}` : regulator}</em>
            <span className="hint">— slide + to gain, − to lose</span>
          </span>
          <input
            type="range"
            min={-100}
            max={100}
            step={1}
            value={regulator}
            onChange={(e) => setRegulator(Number(e.target.value))}
          />
        </label>
        <label>
          <span>
            Hairspring stud <em>{stud > 0 ? `+${stud}°` : `${stud}°`}</em>
            <span className="hint">— centers the beat</span>
          </span>
          <input
            type="range"
            min={-45}
            max={45}
            step={1}
            value={stud}
            onChange={(e) => setStud(Number(e.target.value))}
          />
        </label>
      </div>

      {snapshot.realism && (
        <div className="reserve-line">
          Power reserve ≈ <strong>{snapshot.powerReserveHours.toFixed(0)} h</strong> · efficiency{' '}
          {(snapshot.trainEfficiency * 100).toFixed(0)}% · {posLabel(snapshot.position)}
        </div>
      )}

      <div className="target-line">
        Target: within ±{RATE_TARGET} s/day · beat error ≤ {BEAT_TARGET} ms
        {regulatedDone && <span className="done"> ✓ regulated</span>}
      </div>
    </div>
  );
}
