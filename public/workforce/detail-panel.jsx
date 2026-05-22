/* ============================================================
   Detail Panel — clean side drawer with acronym, role, narrative,
   connections, and contested-question callouts.
   ============================================================ */

function DetailPanel({ entityId, onClose, onPick }) {
  const e = window.ENTITIES[entityId];
  if (!e) return null;
  const level = window.LEVELS[e.level];

  // Find which flows include this entity
  const flowsHere = Object.entries(window.FLOWS)
    .filter(([, f]) => f.stops.includes(entityId))
    .map(([id, f]) => ({ id, ...f }));

  const connectedEntities = (e.connects || [])
    .map(id => window.ENTITIES[id] ? { id, ent: window.ENTITIES[id] } : null)
    .filter(Boolean);

  return (
    <div className="detail-panel" onClick={(ev) => ev.stopPropagation()}>
      <button className="panel-close" onClick={onClose} aria-label="Close">×</button>
      <div className="panel-inner">

        <div className="scarry-label">{e.scarry || ''}</div>
        <h2>{e.longName}</h2>
        {e.acronym && <div className="acronym">{e.acronym}</div>}

        <div>
          <span className={'level-chip ' + (level ? level.chip : '')}>
            {level ? level.label : ''}
          </span>
        </div>

        {e.role && <p className="role">{e.role}</p>}

        {e.narr && <div className="narr">{e.narr}</div>}

        {e.facts && e.facts.length > 0 && (
          <>
            <div className="section-label">at a glance</div>
            <div>
              {e.facts.map(([k, v], i) => (
                <div className="stat-row" key={i}>
                  <span>{k}</span>
                  <span className="stat-val">{v}</span>
                </div>
              ))}
            </div>
          </>
        )}

        {flowsHere.length > 0 && (
          <>
            <div className="section-label">money flowing through</div>
            <ul>
              {flowsHere.map(f => (
                <li key={f.id}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <span>
                      <span style={{
                        display: 'inline-block', width: 10, height: 10, borderRadius: 2,
                        border: '1px solid var(--ink)', background: f.color,
                        marginRight: 6, verticalAlign: -1,
                      }} />
                      <strong>{f.label}</strong>
                      <span style={{ color: 'var(--ink-faint)', fontSize: 12, marginLeft: 6 }}>
                        {f.sub}
                      </span>
                    </span>
                    <span style={{ fontSize: 12, color: 'var(--ink-soft)' }}>{f.amount}</span>
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--ink-soft)', marginTop: 4, lineHeight: 1.4 }}>
                    {f.blurb}
                  </div>
                </li>
              ))}
            </ul>
          </>
        )}

        {connectedEntities.length > 0 && (
          <>
            <div className="section-label">connects to</div>
            <ul>
              {connectedEntities.map(({ id, ent }) => (
                <li key={id} className="link-row" onClick={() => onPick(id)}>
                  <span>
                    <strong>{ent.longName}</strong>
                    {ent.acronym && (
                      <span style={{ color: 'var(--ink-faint)', fontSize: 12, marginLeft: 6 }}>
                        {ent.acronym}
                      </span>
                    )}
                  </span>
                  <span className="arrow">→</span>
                </li>
              ))}
            </ul>
          </>
        )}

        {e.contested && (
          <div className="contested">
            <div className="ctitle">a contested question</div>
            {e.contested}
          </div>
        )}

        <div className="section-label">in plain English</div>
        <div style={{ fontSize: 13.5, color: 'var(--ink-soft)', lineHeight: 1.5 }}>
          On the map this is <em>{e.scarry || e.label}</em>. The label in the scene is just
          <em> "{e.label}"</em> — the human translation of <strong>{e.acronym || e.longName}</strong>.
        </div>
      </div>
    </div>
  );
}

window.DetailPanel = DetailPanel;
