/**
 * Layer 4: the care bench — lubrication, position testing, and condition/repair.
 * Only shown when realism is enabled. This is where assembling "that goes
 * together" becomes "that runs accurately and survives".
 */

import { useGameStore } from '../state/gameStore';
import { LUBE_SITES, OIL_LABELS, classify, type OilType } from '../sim/lubrication';
import { POSITIONS } from '../sim/positions';

const OIL_OPTIONS: OilType[] = ['none', 'light', 'heavy', 'grease', 'escapement'];

const FAULT_LABEL: Record<string, { text: string; cls: string }> = {
  ok: { text: 'ok', cls: 'ok' },
  dry: { text: 'dry', cls: 'err' },
  starved: { text: 'starved', cls: 'warn' },
  flooded: { text: 'flooded', cls: 'warn' },
  'wrong-oil': { text: 'wrong oil', cls: 'warn' },
};

function PositionTester() {
  const sim = useGameStore((s) => s.sim);
  const position = useGameStore((s) => s.position);
  const setPosition = useGameStore((s) => s.setPosition);
  useGameStore((s) => s.snapshot); // re-render on tick

  const rates = POSITIONS.map((p) => ({ ...p, rate: sim.positionRate(p.id) }));
  const spread = Math.max(...rates.map((r) => r.rate)) - Math.min(...rates.map((r) => r.rate));

  return (
    <div className="control-block">
      <div className="control-head">Positions — regulate across all six</div>
      <div className="pos-grid">
        {rates.map((r) => (
          <button
            key={r.id}
            className={`pos-cell ${position === r.id ? 'active' : ''}`}
            onClick={() => setPosition(r.id)}
          >
            <span className="pos-label">{r.label}</span>
            <span className="pos-rate">
              {r.rate >= 0 ? '+' : ''}
              {r.rate.toFixed(1)}
            </span>
          </button>
        ))}
      </div>
      <p className="hint small">
        Cross-position spread: <strong>{spread.toFixed(1)} s/day</strong>. A poised balance keeps
        this small — aim under 10.
      </p>
    </div>
  );
}

function OilingTable() {
  const lube = useGameStore((s) => s.lube);
  const applyOil = useGameStore((s) => s.applyOil);
  const oilAll = useGameStore((s) => s.oilAllCorrectly);

  return (
    <div className="control-block">
      <div className="control-head">Lubrication</div>
      <div className="lube-table">
        {LUBE_SITES.map((site) => {
          const app = lube[site.id];
          const fault = classify(app);
          const badge = FAULT_LABEL[fault];
          return (
            <div key={site.id} className="lube-row">
              <div className="lube-name">
                {site.label}
                <span className="dim small"> wants {OIL_LABELS[site.correctOil]}</span>
              </div>
              <div className="lube-controls">
                <select
                  value={app?.oil ?? 'none'}
                  onChange={(e) => applyOil(site.id, e.target.value as OilType, app?.dose ?? 1)}
                >
                  {OIL_OPTIONS.map((o) => (
                    <option key={o} value={o}>
                      {OIL_LABELS[o]}
                    </option>
                  ))}
                </select>
                <input
                  type="range"
                  min={0}
                  max={1.8}
                  step={0.1}
                  value={app?.dose ?? 0}
                  disabled={!app}
                  onChange={(e) => applyOil(site.id, app?.oil ?? 'light', Number(e.target.value))}
                  title="dose"
                />
                <span className={`badge ${badge.cls}`}>{badge.text}</span>
              </div>
            </div>
          );
        })}
      </div>
      <button className="primary" onClick={oilAll}>
        Oil all correctly (expert dose)
      </button>
    </div>
  );
}

function ConditionPanel() {
  const snapshot = useGameStore((s) => s.snapshot);
  const clean = useGameStore((s) => s.cleanMovement);
  const service = useGameStore((s) => s.serviceMovement);
  const recenter = useGameStore((s) => s.recenterHairspring);
  const rework = useGameStore((s) => s.reworkBalance);
  const shock = useGameStore((s) => s.shockMovement);

  return (
    <div className="control-block">
      <div className="control-head">Condition</div>
      <div className="cond-bars">
        <Bar label="Contamination" value={snapshot.contamination} danger />
        <Bar label="Pivot wear" value={snapshot.wear} danger />
        <Bar label="Reserve" value={snapshot.powerReserveHours / 40} suffix={`${snapshot.powerReserveHours.toFixed(0)} h`} />
      </div>
      {snapshot.hairspringBentDeg > 0.5 && (
        <p className="cond-flag warn">Hairspring bent {snapshot.hairspringBentDeg.toFixed(0)}°</p>
      )}
      {snapshot.balancePivotBroken && <p className="cond-flag err">Balance pivot broken</p>}
      <div className="row gap">
        <button onClick={clean}>Clean</button>
        <button onClick={recenter} disabled={snapshot.hairspringBentDeg <= 0.5}>
          Re-center hairspring
        </button>
        <button onClick={rework} disabled={!snapshot.balancePivotBroken}>
          Rework balance
        </button>
        <button className="primary" onClick={service}>
          Full service
        </button>
      </div>
      <button className="ghost danger-btn" onClick={() => shock(0.5)}>
        ⚠ Knock the bench (simulate a drop)
      </button>
    </div>
  );
}

function Bar({
  label,
  value,
  danger,
  suffix,
}: {
  label: string;
  value: number;
  danger?: boolean;
  suffix?: string;
}) {
  const pct = Math.round(Math.min(1, Math.max(0, value)) * 100);
  return (
    <div className="cond-bar">
      <span className="cond-bar-label">{label}</span>
      <div className="cond-bar-track">
        <div
          className={`cond-bar-fill ${danger ? 'danger' : 'good'}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="cond-bar-val">{suffix ?? `${pct}%`}</span>
    </div>
  );
}

export function CarePanel() {
  const realism = useGameStore((s) => s.realism);
  if (!realism) {
    return (
      <div className="panel care-panel">
        <div className="panel-title">Layer 4 · Mastery</div>
        <p className="hint">
          Turn on <strong>Realism</strong> (top bar) to add lubrication, positional timing, wear,
          contamination, and handling damage. The same movement — now held to a watchmaker's
          standard.
        </p>
      </div>
    );
  }
  return (
    <div className="panel care-panel">
      <div className="panel-title">Layer 4 · Care & repair</div>
      <PositionTester />
      <OilingTable />
      <ConditionPanel />
    </div>
  );
}
