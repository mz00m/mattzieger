/**
 * The game HUD, overlaid on the bench:
 *  - ObjectiveBanner (top): always tells the player their next concrete move,
 *    with assembly progress.
 *  - ControlBar (bottom): wind the crown, set time scale, toggle sound, and read
 *    the time the watch itself is keeping.
 *  - Celebration: the moment the movement is regulated to target, the bench
 *    certifies it — stats, chime, and the invitation into Layer 4.
 */

import { useEffect, useRef, useState } from 'react';
import { useGameStore, RATE_TARGET, BEAT_TARGET } from '../state/gameStore';
import { ASSEMBLY_ORDER, PART_BY_ID } from '../content/parts';
import { chimeSound, ensureAudio, placeSound, windClickSound } from '../audio/sound';

function useNextPart() {
  const placed = useGameStore((s) => s.placed);
  return ASSEMBLY_ORDER.find((p) => !placed.includes(p));
}

export function ObjectiveBanner() {
  const placed = useGameStore((s) => s.placed);
  const snapshot = useGameStore((s) => s.snapshot);
  const regulatedDone = useGameStore((s) => s.regulatedDone);
  const realism = useGameStore((s) => s.realism);
  const next = useNextPart();

  let title: string;
  let hint: string | null = null;

  if (next) {
    title = `Place the ${PART_BY_ID[next].label.toLowerCase()}`;
    hint = PART_BY_ID[next].blurb;
  } else if (!snapshot.running && snapshot.wind <= 0.02) {
    title = 'Wind the mainspring';
    hint = 'Use the crown below — listen for the click of the ratchet.';
  } else if (!snapshot.running) {
    title = 'It won’t run — diagnose it';
    hint = 'Read the diagnosis panel: it traces the symptom back to the cause.';
  } else if (!regulatedDone) {
    const rate = snapshot.rateSecPerDay;
    title = `Regulate it: ${rate >= 0 ? '+' : ''}${rate.toFixed(1)} s/day`;
    hint = `Bring the rate within ±${RATE_TARGET} s/day and beat error under ${BEAT_TARGET} ms on the timegrapher.`;
  } else if (!realism) {
    title = 'Certified. Ready for the watchmaker’s standard?';
    hint = 'Turn on Realism to add oiling, positions, wear and handling damage.';
  } else {
    title = 'Keep it running like a craftsman';
    hint = 'Oil every jewel, regulate across positions, and mind your handling.';
  }

  const done = placed.length;
  const total = ASSEMBLY_ORDER.length;

  return (
    <div className="hud-banner">
      <div className="hud-banner-title">{title}</div>
      {hint && <div className="hud-banner-hint">{hint}</div>}
      {next && (
        <div className="hud-progress">
          <div className="hud-progress-fill" style={{ width: `${(done / total) * 100}%` }} />
          <span>
            {done}/{total} parts
          </span>
        </div>
      )}
    </div>
  );
}

const TIME_SCALES = [1, 60, 600, 3600];

function watchTime(secondsAngle: number): string {
  const total = (secondsAngle / (Math.PI * 2)) * 60; // fourth wheel: 1 rev = 60 s
  const base = 10 * 3600 + 8 * 60 + 37; // starts at the flattering 10:08:37
  const t = Math.floor(base + total);
  const h = Math.floor(t / 3600) % 12 || 12;
  const m = Math.floor((t % 3600) / 60);
  const s = t % 60;
  return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export function ControlBar() {
  const snapshot = useGameStore((s) => s.snapshot);
  const wind = useGameStore((s) => s.wind);
  const timeScale = useGameStore((s) => s.timeScale);
  const setTimeScale = useGameStore((s) => s.setTimeScale);
  const soundOn = useGameStore((s) => s.soundOn);
  const toggleSound = useGameStore((s) => s.toggleSound);

  const doWind = (turns: number) => {
    ensureAudio();
    wind(turns);
    // A little run of ratchet clicks, like a real crown.
    for (let i = 0; i < Math.min(5, Math.ceil(turns * 3)); i++) {
      setTimeout(windClickSound, i * 55);
    }
  };

  return (
    <div className="controlbar">
      <div className="cb-group">
        <span className="cb-label">crown</span>
        <button className="cb-btn" onClick={() => doWind(1)} title="Wind one turn">
          wind +1
        </button>
        <button className="cb-btn" onClick={() => doWind(7)} title="Wind fully">
          full wind
        </button>
        <div className="cb-windbar" title={`${Math.round(snapshot.wind * 100)}% wound`}>
          <div className="cb-windfill" style={{ width: `${Math.round(snapshot.wind * 100)}%` }} />
        </div>
      </div>

      <div className="cb-group">
        <span className="cb-label">time</span>
        {TIME_SCALES.map((ts) => (
          <button
            key={ts}
            className={`cb-btn seg ${timeScale === ts ? 'active' : ''}`}
            onClick={() => setTimeScale(ts)}
          >
            {ts >= 3600 ? `${ts / 3600}h/s` : ts >= 60 ? `${ts / 60}m/s` : '1×'}
          </button>
        ))}
      </div>

      <div className="cb-group">
        <div className={`cb-clock ${snapshot.running ? 'running' : ''}`}>
          {watchTime(snapshot.secondsAngle)}
        </div>
        <button
          className={`cb-btn snd ${soundOn ? 'active' : ''}`}
          onClick={() => {
            ensureAudio();
            toggleSound();
          }}
          title="Tick sound"
        >
          {soundOn ? '♪ on' : '♪ off'}
        </button>
      </div>
    </div>
  );
}

export function Celebration() {
  const regulatedDone = useGameStore((s) => s.regulatedDone);
  const snapshot = useGameStore((s) => s.snapshot);
  const setRealism = useGameStore((s) => s.setRealism);
  const initiallyDone = useRef(regulatedDone);
  const [dismissed, setDismissed] = useState(false);
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Only celebrate a regulation achieved in *this* session.
    if (regulatedDone && !initiallyDone.current && !dismissed) {
      setShow(true);
      chimeSound();
    }
  }, [regulatedDone, dismissed]);

  if (!show) return null;
  return (
    <div className="modal-backdrop celebrate-backdrop">
      <div className="modal celebrate">
        <div className="celebrate-seal">✓</div>
        <h2>Movement certified</h2>
        <p>
          From loose parts to a regulated, running mechanical movement — assembled, powered, and
          tuned by hand. That's the craft.
        </p>
        <div className="celebrate-stats">
          <div>
            <strong>
              {snapshot.rateSecPerDay >= 0 ? '+' : ''}
              {snapshot.rateSecPerDay.toFixed(1)}
            </strong>
            <span>s/day</span>
          </div>
          <div>
            <strong>{Math.round(snapshot.amplitudeDeg)}°</strong>
            <span>amplitude</span>
          </div>
          <div>
            <strong>{snapshot.beatErrorMs.toFixed(1)}</strong>
            <span>ms beat</span>
          </div>
        </div>
        <div className="row gap center">
          <button
            className="primary"
            onClick={() => {
              setRealism(true);
              setDismissed(true);
              setShow(false);
              placeSound();
            }}
          >
            Enter Layer 4 — Realism
          </button>
          <button
            className="ghost"
            onClick={() => {
              setDismissed(true);
              setShow(false);
            }}
          >
            Keep tinkering
          </button>
        </div>
      </div>
    </div>
  );
}
