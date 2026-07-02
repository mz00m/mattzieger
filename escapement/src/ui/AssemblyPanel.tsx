/**
 * The parts tray. Every part in build order — the next one glows, matching the
 * glowing socket on the bench. Click a name to learn what it is; place from here
 * or by clicking the socket in 3D. Bench checks (the deliberate faults) live in
 * a fold-out so the tray stays a tray.
 */

import { useGameStore } from '../state/gameStore';
import { ASSEMBLY_ORDER, GROUP_COLORS, PART_BY_ID } from '../content/parts';
import { ensureAudio, placeSound } from '../audio/sound';
import type { PartId } from '../sim/types';

export function AssemblyPanel() {
  const placed = useGameStore((s) => s.placed);
  const placePart = useGameStore((s) => s.placePart);
  const removePart = useGameStore((s) => s.removePart);
  const resetBench = useGameStore((s) => s.resetBench);
  const setInfoPart = useGameStore((s) => s.setInfoPart);

  const clickEngaged = useGameStore((s) => s.clickEngaged);
  const setClickEngaged = useGameStore((s) => s.setClickEngaged);
  const palletOriented = useGameStore((s) => s.palletOriented);
  const setPalletOriented = useGameStore((s) => s.setPalletOriented);
  const misMeshed = useGameStore((s) => s.misMeshed);
  const setMisMeshed = useGameStore((s) => s.setMisMeshed);

  const nextPart = ASSEMBLY_ORDER.find((p) => !placed.includes(p));

  const place = (id: PartId) => {
    ensureAudio();
    placePart(id);
    placeSound();
  };

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
                <button className={`mini ${isNext ? 'glow' : ''}`} onClick={() => place(id)}>
                  place
                </button>
              )}
            </div>
          );
        })}
      </div>

      <div className="row gap">
        {nextPart ? (
          <button className="primary" onClick={() => place(nextPart)}>
            Place next: {PART_BY_ID[nextPart].label}
          </button>
        ) : (
          <button className="primary" disabled>
            Fully assembled ✓
          </button>
        )}
        <button className="ghost" onClick={resetBench}>
          Reset
        </button>
      </div>

      <details className="bench-checks">
        <summary>Bench checks — break it on purpose</summary>
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
          Toggle these to stop the movement, then read how the diagnosis traces the cause.
        </p>
      </details>
    </div>
  );
}
