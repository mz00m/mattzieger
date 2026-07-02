/**
 * Going-train teaching panel: shows each mesh ratio multiplying out to the full
 * barrel→seconds reduction, so the ratios the player is taught are demonstrably
 * the ones the sim runs on.
 */

import { useGameStore } from '../state/gameStore';
import { BENCH1_MESHES, BENCH1_NODES, meshRatio } from '../sim/gearTrain';

export function TrainPanel() {
  const sim = useGameStore((s) => s.sim);
  const r = sim.reductions;

  let running = 1;

  return (
    <div className="train-panel">
      <table className="ratio-table">
        <tbody>
          {BENCH1_MESHES.map((m) => {
            const ratio = meshRatio(BENCH1_NODES, m);
            running *= ratio;
            const from = BENCH1_NODES.find((n) => n.id === m.from)!;
            const to = BENCH1_NODES.find((n) => n.id === m.to)!;
            return (
              <tr key={`${m.from}-${m.to}`}>
                <td>
                  {from.label} <span className="dim">({from.wheelTeeth}t)</span> →{' '}
                  {to.label} <span className="dim">({to.pinionTeeth}p)</span>
                </td>
                <td className="num">×{ratio.toFixed(2)}</td>
                <td className="num dim">{running.toFixed(1)}:1</td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <p className="hint small">
        Barrel → seconds wheel: <strong>{Math.round(r.barrelToFourth)}:1</strong>. The escape wheel
        ({r.escapeWheelTeeth}t) turns {r.fourthToEscape}× the seconds wheel — 16 rev/min at 28,800
        bph.
      </p>
    </div>
  );
}
