/**
 * The teaching beat that pops up the first time a subsystem is met. Concise and
 * causal — explains the mechanism so the player can predict what the parts do.
 */

import { useGameStore } from '../state/gameStore';
import { EXPLAINERS } from '../content/explainers';
import { GROUP_COLORS } from '../content/parts';

export function Explainer() {
  const group = useGameStore((s) => s.explainerGroup);
  const close = useGameStore((s) => s.closeExplainer);
  if (!group) return null;
  const ex = EXPLAINERS[group];
  if (!ex) return null;

  return (
    <div className="modal-backdrop" onClick={close}>
      <div className="modal explainer" onClick={(e) => e.stopPropagation()}>
        <div className="explainer-bar" style={{ background: GROUP_COLORS[group] }} />
        <h2>{ex.title}</h2>
        {ex.body.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
        <p className="try-it">
          <strong>Try it:</strong> {ex.tryIt}
        </p>
        <button className="primary" onClick={close}>
          Got it
        </button>
      </div>
    </div>
  );
}
