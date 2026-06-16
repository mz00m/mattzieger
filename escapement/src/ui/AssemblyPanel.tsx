/**
 * Assembly + bench controls. The tray lists every part in build order; the next
 * one is highlighted. Placing parts is forgiving (Layer 1). Below the tray are
 * the running controls — wind, time scale — and the "bench checks" that let the
 * player experience the escapement faults the diagnostics explain.
 */

import { useGameStore } from '../state/gameStore';
import { ASSEMBLY_ORDER, GROUP_COLORS, PART_BY_ID } from '../content/parts';
import type { PartId } from '../sim/types';

const TIME_SCALES = [1, 60, 600, 3600];

export function AssemblyPanel() {
  const placed = useGameStore((s) => s.placed);
  const placePart = useGameStore((s) => s.placePart);
  const removePart = useGameStore((s) => s.removePart);
  const placeNext = useGameStore((s) => s.placeNext);
  const resetBench = useGameStore((s) => s.resetBench);
  const setInfoPart = useGameStore((s) => s.setInfoPart);

  const wind = useGameStore((s) => s.wind);
  const snapshot = useGameStore((s) => s.snapshot);
  const timeScale = useGameStore((s) => s.timeScale);
  const setTimeScale = useGameStore((s) => s.setTimeScale);

  const clickEngaged = useGameStore((s) => s.clickEngaged);
  const setClickEngaged = useGameStore((s) => s.setClickEngaged);
  const palletOriented = useGameStore((s) => s.palletOriented);
  const setPalletOriented = useGameStore((s) => s.setPalletOriented);
  const misMeshed = useGameStore((s) => s.misMeshed);
  const setMisMeshed = useGameStore((s) => s.setMisMeshed);

  const nextPart = ASSEMBLY_ORDER.find((p) => !placed.includes(p));
  const allPlaced = !nextPart;

  return (
    <div className="panel assembly">
      <div className="panel-title">Bench 1 · Time-only movement</div>

      <div className="tray">
        {ASSEMBLY_ORDER.map((id: PartId) => {
          const def = PART_BY_ID[id];
          const isPlaced = placed.includes(id);
          const isNext = id === nextPart;
          return (
            <div key={id} className={`tray-row ${isPlaced ? 'placed' : ''} ${isNext ? 'next' : ''}`}>
              <span className="swatch" style={{ background: GROUP_COLORS[def.group] }} />
              <button className="tray-name" onClick={() => setInfoPart(id)} title={def.blurb}>
                {def.label}
              </button>
              {isPlaced ? (
                <button className="mini ghost" onClick={() => removePart(id)}>
                  remove
                </button>
              ) : (
                <button className="mini" onClick={() => placePart(id)}>
                  place
                </button>
              )}
            </div>
          );
        })}
      </div>

      <div className="row gap">
        {!allPlaced ? (
          <button className="primary" onClick={placeNext}>
            Place next: {PART_BY_ID[nextPart!].label}
          </button>
        ) : (
          <button className="primary" disabled>
            Fully assembled
          </button>
        )}
        <button className="ghost" onClick={resetBench}>
          Reset
        </button>
      </div>

      <div className="control-block">
        <div className="control-head">Power</div>
        <div className="wind-bar">
          <div className="wind-fill" style={{ width: `${Math.round(snapshot.wind * 100)}%` }} />
          <span>{Math.round(snapshot.wind * 100)}% wound</span>
        </div>
        <div className="row gap">
          <button onClick={() => wind(1)}>Wind +1 turn</button>
          <button onClick={() => wind(7)}>Full wind</button>
        </div>
      </div>

      <div className="control-block">
        <div className="control-head">Time scale</div>
        <div className="row gap">
          {TIME_SCALES.map((ts) => (
            <button
              key={ts}
              className={timeScale === ts ? 'active' : ''}
              onClick={() => setTimeScale(ts)}
            >
              {ts}×
            </button>
          ))}
        </div>
      </div>

      <div className="control-block">
        <div className="control-head">Bench checks</div>
        <label className="check">
          <input
            type="checkbox"
            checked={clickEngaged}
            onChange={(e) => setClickEngaged(e.target.checked)}
          />
          Click seated against the ratchet
        </label>
        <label className="check">
          <input
            type="checkbox"
            checked={palletOriented}
            onChange={(e) => setPalletOriented(e.target.checked)}
          />
          Pallet fork oriented correctly
        </label>
        <label className="check inline">
          Mis-meshed wheel:
          <select
            value={misMeshed[0] ?? ''}
            onChange={(e) => setMisMeshed(e.target.value ? [e.target.value as PartId] : [])}
          >
            <option value="">none</option>
            <option value="centerWheel">center</option>
            <option value="thirdWheel">third</option>
            <option value="fourthWheel">fourth</option>
          </select>
        </label>
        <p className="hint small">
          Toggle these to break the movement and read how the diagnosis traces the cause.
        </p>
      </div>
    </div>
  );
}
