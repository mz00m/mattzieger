/**
 * Diagnostics panel: shows the causal chain when the movement won't run, the way
 * a watchmaker reasons from symptom to root cause. Never a bare "failed".
 */

import { useGameStore } from '../state/gameStore';
import { GROUP_COLORS, PART_BY_ID } from '../content/parts';

export function Diagnostics() {
  const snapshot = useGameStore((s) => s.snapshot);
  const setInfoPart = useGameStore((s) => s.setInfoPart);
  const diags = snapshot.diagnostics;

  if (snapshot.running && diags.length === 0) {
    return (
      <div className="panel diagnostics running">
        <div className="panel-title">Status</div>
        <p className="ok-line">▶ Running. The balance is swinging and the train is turning.</p>
      </div>
    );
  }

  return (
    <div className="panel diagnostics">
      <div className="panel-title">Diagnosis</div>
      {diags.length === 0 ? (
        <p className="ok-line">Idle — wind the mainspring to start.</p>
      ) : (
        <ol className="diag-list">
          {diags.map((d) => (
            <li key={d.code} className={d.severity}>
              <p>{d.message}</p>
              <div className="diag-parts">
                {d.parts.map((p) => (
                  <button
                    key={p}
                    className="chip"
                    style={{ borderColor: GROUP_COLORS[PART_BY_ID[p].group] }}
                    onClick={() => setInfoPart(p)}
                  >
                    {PART_BY_ID[p].label}
                  </button>
                ))}
              </div>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
