/**
 * A small popover describing a single part — opened from the tray, a diagnostic
 * chip, or by clicking a part. Reinforces the vocabulary in context.
 */

import { useGameStore } from '../state/gameStore';
import { GROUP_COLORS, PART_BY_ID } from '../content/parts';

export function PartInfo() {
  const id = useGameStore((s) => s.infoPart);
  const close = useGameStore((s) => s.setInfoPart);
  if (!id) return null;
  const def = PART_BY_ID[id];

  return (
    <div className="part-info" onClick={() => close(null)}>
      <div className="part-info-card" onClick={(e) => e.stopPropagation()}>
        <span className="swatch big" style={{ background: GROUP_COLORS[def.group] }} />
        <div>
          <strong>{def.label}</strong>
          <p>{def.blurb}</p>
          {def.teeth && <p className="hint small">{def.teeth} teeth</p>}
        </div>
        <button className="mini ghost" onClick={() => close(null)}>
          ✕
        </button>
      </div>
    </div>
  );
}
