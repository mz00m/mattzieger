/**
 * Glossary drawer, color-keyed to part groups. Always one tap away.
 */

import { useGameStore } from '../state/gameStore';
import { GLOSSARY } from '../content/glossary';
import { GROUP_COLORS } from '../content/parts';

export function Glossary() {
  const open = useGameStore((s) => s.glossaryOpen);
  const toggle = useGameStore((s) => s.toggleGlossary);
  if (!open) return null;

  return (
    <div className="modal-backdrop" onClick={toggle}>
      <div className="drawer glossary" onClick={(e) => e.stopPropagation()}>
        <div className="drawer-head">
          <h2>Glossary</h2>
          <button className="ghost" onClick={toggle}>
            Close
          </button>
        </div>
        <div className="glossary-list">
          {GLOSSARY.map((g) => (
            <div key={g.term} className="glossary-entry">
              <span
                className="swatch"
                style={{ background: g.group === 'concept' ? '#c9a227' : GROUP_COLORS[g.group] }}
              />
              <div>
                <strong>{g.term}</strong>
                <p>{g.definition}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
