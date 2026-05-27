/* ============================================================
   LOCAL TOWN scene  (x 2200 – 3600)
   The densest scene. Town hall (LWDB) and AJC are the focal points.
   Employer district right, training row along the bottom.
   ============================================================ */

/* Grantee storefront. One small building per candidate org. Per-grantee
   detail (a server rack, a compass, a chat bubble, etc.) tints the
   identity while the body color + sign carry the brand. */
function GranteeBuilding({ id, grantee, pos, selected, dimmed, onClick, onHover, onLeave }) {
  const W = 140, H = 80;
  const x = pos.x, y = pos.y;

  // Each grantee gets a distinct facade detail.
  const detail = (() => {
    if (id === 'per-scholas') {
      // Server-rack inset + a worker at a screen
      return (
        <g>
          <CutawayWindow x={12} y={16} w={50} h={42}>
            <g transform="translate(10 6)">
              <rect x="0" y="0" width="14" height="30" fill="var(--paper-shadow)" stroke="var(--ink)" strokeWidth="1" />
              <circle cx="3" cy="4" r="1" fill="#3acf3a" />
              <circle cx="3" cy="9" r="1" fill="#3acf3a" />
              <circle cx="3" cy="14" r="1" fill="#f5c93a" />
              <circle cx="3" cy="19" r="1" fill="#3acf3a" />
              <rect x="20" y="2" width="18" height="14" fill="#1f2933" stroke="var(--ink)" strokeWidth="1" />
              <line x1="22" y1="6" x2="34" y2="6" stroke="#3acf3a" strokeWidth="0.8" />
              <line x1="22" y1="9" x2="32" y2="9" stroke="#3acf3a" strokeWidth="0.8" />
              <line x1="22" y1="12" x2="36" y2="12" stroke="#3acf3a" strokeWidth="0.8" />
            </g>
          </CutawayWindow>
          <Win x={78} y={18} w={50} h={40} color="var(--sky)" />
        </g>
      );
    }
    if (id === 'soar') {
      // Mountain silhouette window — Appalachian convener
      return (
        <g>
          <CutawayWindow x={12} y={16} w={W - 24} h={42}>
            {/* Sky behind mountains */}
            <rect x="0" y="0" width={W - 24} height="42" fill="#e8d9c4" />
            <polygon points="0,42 24,18 44,30 64,12 86,32 110,16 116,42"
                     fill={grantee.accent} stroke="var(--ink)" strokeWidth="1.2" strokeLinejoin="round" />
            <circle cx="78" cy="12" r="5" fill="var(--scarry-yellow)" stroke="var(--ink)" strokeWidth="1" />
          </CutawayWindow>
        </g>
      );
    }
    if (id === 'skillup') {
      // Compass / dashboard window — navigation layer
      return (
        <g>
          <CutawayWindow x={12} y={16} w={50} h={42}>
            <g transform="translate(25 21)">
              <circle cx="0" cy="0" r="14" fill="var(--paper)" stroke="var(--ink)" strokeWidth="1.5" />
              <polygon points="0,-10 3,0 0,10 -3,0" fill={grantee.color} stroke="var(--ink)" strokeWidth="1" />
              <line x1="-12" y1="0" x2="-9" y2="0" stroke="var(--ink)" strokeWidth="1" />
              <line x1="12"  y1="0" x2="9"  y2="0" stroke="var(--ink)" strokeWidth="1" />
              <line x1="0"   y1="-12" x2="0"   y2="-9" stroke="var(--ink)" strokeWidth="1" />
              <line x1="0"   y1="12"  x2="0"   y2="9" stroke="var(--ink)" strokeWidth="1" />
            </g>
          </CutawayWindow>
          {/* Stack of mini cards = listings */}
          <g transform="translate(78 22)">
            <rect x="0" y="0" width="48" height="10" fill="var(--paper)" stroke="var(--ink)" strokeWidth="1" />
            <rect x="0" y="14" width="48" height="10" fill="var(--paper)" stroke="var(--ink)" strokeWidth="1" />
            <rect x="0" y="28" width="48" height="10" fill="var(--paper)" stroke="var(--ink)" strokeWidth="1" />
            <line x1="3" y1="5" x2="30" y2="5" stroke="var(--ink)" strokeWidth="0.7" />
            <line x1="3" y1="19" x2="38" y2="19" stroke="var(--ink)" strokeWidth="0.7" />
            <line x1="3" y1="33" x2="26" y2="33" stroke="var(--ink)" strokeWidth="0.7" />
          </g>
        </g>
      );
    }
    if (id === 'empower-work') {
      // Big chat bubble + a peer counselor character
      return (
        <g>
          <CutawayWindow x={12} y={16} w={W - 24} h={42}>
            {/* Counselor character */}
            <g transform="translate(22 32)">
              <Character species="cat" costume={grantee.color} fur="var(--tan)" size={0.55} prop="phone" />
            </g>
            {/* Chat bubble */}
            <g transform="translate(54 8)">
              <rect x="0" y="0" width="56" height="22" rx="5" fill="var(--paper)" stroke="var(--ink)" strokeWidth="1.4" />
              <polygon points="6,22 10,28 14,22" fill="var(--paper)" stroke="var(--ink)" strokeWidth="1.4" />
              <line x1="6" y1="8" x2="48" y2="8" stroke={grantee.color} strokeWidth="1.5" />
              <line x1="6" y1="14" x2="40" y2="14" stroke="var(--ink-soft, #5a5040)" strokeWidth="1" opacity="0.5" />
            </g>
          </CutawayWindow>
        </g>
      );
    }
    return null;
  })();

  return (
    <g
      className={'building-group clickable grantee-building' +
        (selected ? ' is-selected' : '') +
        (dimmed ? ' dim' : '')}
      transform={`translate(${x} ${y})`}
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      onClick={onClick}
    >
      {/* hover ring */}
      <rect x={-4} y={-34} width={W + 8} height={H + 38} rx="6" className="hover-ring" />

      {/* Awning / canopy roof — slightly different per grantee */}
      <polygon points={`-6,0 ${W / 2},-24 ${W + 6},0`}
               fill={grantee.color} stroke="var(--ink)" strokeWidth="2.5" strokeLinejoin="round" />
      {/* Tiny pennant flag on top */}
      <line x1={W / 2} y1="-24" x2={W / 2} y2="-38" stroke="var(--ink)" strokeWidth="1.5" />
      <polygon points={`${W / 2},-38 ${W / 2 + 14},-34 ${W / 2},-30`}
               fill={grantee.accent} stroke="var(--ink)" strokeWidth="1.2" />

      {/* Body */}
      <rect x="-1.5" y="2" width={W} height={H} fill={grantee.color}
            className="building-body grantee-body" opacity="0.95" />
      <rect x="0" y="0" width={W} height={H} fill="none"
            stroke="var(--ink)" strokeWidth="2.5" strokeLinejoin="round"
            className="grantee-outline" />

      {/* Foundation */}
      <rect x="-4" y={H - 2} width={W + 8} height="8" fill="var(--brown)"
            stroke="var(--ink)" strokeWidth="1.5" />

      {/* Per-grantee facade detail */}
      {detail}

      {/* Door */}
      <Door x={W / 2 - 9} y={H - 28} w={18} h={28} color={grantee.accent} />

      {/* Sign — the grantee label */}
      <g style={{ pointerEvents: 'none' }}>
        {(() => {
          const signW = Math.min(132, W + 16);
          const halfW = signW / 2;
          const cx = W / 2;
          return (
            <>
              <line x1={cx - Math.min(36, halfW - 4)} y1="0" x2={cx - Math.min(36, halfW - 4)} y2="8"
                    stroke="var(--ink)" strokeWidth="1.2" />
              <line x1={cx + Math.min(36, halfW - 4)} y1="0" x2={cx + Math.min(36, halfW - 4)} y2="8"
                    stroke="var(--ink)" strokeWidth="1.2" />
              <rect x={cx - halfW} y="10" width={signW} height="22" rx="2"
                    fill="var(--ink)" opacity="0.18" />
              <rect x={cx - halfW} y="8" width={signW} height="22" rx="2"
                    fill="var(--paper)" stroke="var(--ink)" strokeWidth="1.6" />
              <text x={cx} y="24" textAnchor="middle"
                    style={{
                      fontFamily: 'Fraunces, serif',
                      fontSize: 10.5, fontWeight: 700,
                      fill: grantee.accent,
                      letterSpacing: '0.04em',
                      textTransform: 'uppercase',
                    }}>
                {grantee.label}
              </text>
            </>
          );
        })()}
      </g>

      {/* hit area */}
      <rect className="hit-area" x={-8} y={-40} width={W + 16} height={H + 50} />
    </g>
  );
}

function SceneLocal({ groundY, hoveredId, selectedId, dimmedSet, onPick, onHover, onLeave, showLabels, showExtras, jobSeekerStop, grantees = {} }) {
  const isDim = (id) => dimmedSet && !dimmedSet.has(id);
  const isSel = (id) => selectedId === id;
  const ev   = (id) => ({
    onClick: (e) => { e.stopPropagation(); onPick(id); },
    onHover: () => onHover && onHover(id),
    onLeave: () => onLeave && onLeave(id),
  });

  return (
    <g id="scene-local" data-screen-label="Local Town">

      {/* District banner */}
      <g style={{ pointerEvents: 'none' }}>
        <text x="2880" y="200" textAnchor="middle" className="district-title">
          The Town
        </text>
        <text x="2880" y="226" textAnchor="middle" className="narrative" style={{ fontSize: 14 }}>
          where people actually walk through the door
        </text>
      </g>

      {/* ============== TOP TIER — civic block ============== */}

      {/* CEO — mayor's house */}
      <Building x={2240} y={560} w={120} h={120} body="var(--scarry-yellow)"
                roof="var(--scarry-red)" roofShape="gable"
                sign="MAYOR" signColor="var(--scarry-red-deep)" signTextColor="var(--paper)"
                entity="ceo" selected={isSel('ceo')} dimmed={isDim('ceo')}
                {...ev('ceo')}>
        {/* Cutaway — mayor at desk with a phone */}
        <CutawayWindow x={20} y={36} w={36} h={44}>
          <g transform="translate(18 28)">
            <Character species="pig" costume="var(--scarry-blue)" fur="var(--scarry-pink)" hat="crown" size={0.5} prop="clipboard" />
          </g>
          <rect x="2" y="22" width="32" height="3" fill="var(--brown)" />
        </CutawayWindow>
        <Win x={70} y={36} w={36} h={44} color="var(--scarry-pink)" />
        <Door x={50} y={84} w={20} h={36} color="var(--brown)" />
        {/* Mayor stepping out — character on the steps */}
        <g transform="translate(60 122)">
          <Character species="pig" costume="var(--scarry-blue)" fur="var(--scarry-pink)" hat="crown" size={0.75} prop="briefcase" />
        </g>
      </Building>

      {/* TOWN HALL — LWDB */}
      <Building x={2380} y={540} w={150} h={140} body="var(--scarry-orange)"
                roof="var(--scarry-red-deep)" roofShape="mansard"
                sign="TOWN HALL" signColor="var(--paper)"
                entity="lwdb" selected={isSel('lwdb')} dimmed={isDim('lwdb')}
                {...ev('lwdb')}>
        {/* Clock tower */}
        <g transform="translate(58 -36)">
          <rect x="0" y="0" width="34" height="40" fill="var(--paper-shadow)" stroke="var(--ink)" strokeWidth="2" />
          <polygon points="-4,0 17,-18 38,0" fill="var(--scarry-red-deep)" stroke="var(--ink)" strokeWidth="2" />
          <circle cx="17" cy="20" r="10" fill="var(--paper)" stroke="var(--ink)" strokeWidth="1.5" />
          <line x1="17" y1="20" x2="17" y2="14" stroke="var(--ink)" strokeWidth="1.5" />
          <line x1="17" y1="20" x2="23" y2="22" stroke="var(--ink)" strokeWidth="1.2" />
          <circle cx="17" cy="20" r="1" fill="var(--ink)" />
        </g>
        {/* Cutaway — local board meeting */}
        <CutawayWindow x={18} y={48} w={114} h={50}>
          <ellipse cx="57" cy="35" rx="40" ry="12" fill="var(--brown)" stroke="var(--ink)" strokeWidth="1.3" />
          <g transform="translate(20 28)"><Character species="bear" costume="var(--scarry-red)" fur="var(--brown)" hat="hardhat" size={0.38} /></g>
          <g transform="translate(40 22)"><Character species="cat" costume="var(--scarry-yellow)" fur="var(--tan)" size={0.38} /></g>
          <g transform="translate(60 20)"><Character species="owl" costume="var(--scarry-blue)" fur="var(--tan)" size={0.38} hat="cardigan" /></g>
          <g transform="translate(80 22)"><Character species="fox" costume="var(--scarry-green-deep)" fur="var(--scarry-orange)" hat="cap" size={0.38} /></g>
          <g transform="translate(96 28)"><Character species="pig" costume="var(--scarry-pink)" fur="var(--scarry-pink)" size={0.38} /></g>
        </CutawayWindow>
        <Door x={64} y={104} w={22} h={36} color="var(--brown-deep)" />
        {/* Steps */}
        <rect x="-4" y="138" width="158" height="4" fill="var(--brown)" stroke="var(--ink)" strokeWidth="1" />
      </Building>

      {/* ONE-STOP OPERATOR — small office */}
      <Building x={2550} y={600} w={80} h={80} body="var(--scarry-purple)"
                roof="var(--scarry-purple)" roofShape="flat"
                sign="ONE-STOP MGR." signColor="var(--paper)"
                entity="one-stop-op" selected={isSel('one-stop-op')} dimmed={isDim('one-stop-op')}
                {...ev('one-stop-op')}>
        <CutawayWindow x={10} y={20} w={28} h={32}>
          <g transform="translate(14 22)">
            <Character species="fox" costume="var(--scarry-purple)" fur="var(--scarry-orange)" size={0.45} prop="clipboard" hat="cap" />
          </g>
        </CutawayWindow>
        <Win x={46} y={20} w={26} h={32} color="var(--sky)" />
        <Door x={32} y={50} w={16} h={30} color="var(--brown)" />
      </Building>

      {/* ====== THE JOBS OFFICE — AJC with 4 colored doors ====== */}
      <Building x={2660} y={460} w={290} h={220} body="var(--scarry-blue)"
                roof="var(--scarry-yellow)" roofShape="mansard"
                outline="var(--ink)" strokeWidth="3.5"
                sign="THE JOBS OFFICE" signColor="var(--paper)" signTextColor="var(--ink)"
                entity="ajc" selected={isSel('ajc')} dimmed={isDim('ajc')}
                {...ev('ajc')}>
        {/* Big "JOBS" sign over the building */}
        <g transform="translate(145 -54)">
          <rect x="-66" y="0" width="132" height="22" fill="var(--paper)" stroke="var(--ink)" strokeWidth="2" />
          <text x="0" y="16" textAnchor="middle" style={{ fontFamily: 'DM Serif Display, serif', fontSize: 17, fontWeight: 700, fill: 'var(--ink)' }}>
            JOBS
          </text>
          <rect x="-66" y="-4" width="6" height="6" fill="var(--scarry-red)" stroke="var(--ink)" strokeWidth="1" />
          <rect x="60" y="-4" width="6" height="6" fill="var(--scarry-red)" stroke="var(--ink)" strokeWidth="1" />
        </g>

        {/* Top floor cutaway — placement specialist on phone */}
        <CutawayWindow x={20} y={28} w={56} h={42}>
          <g transform="translate(24 26)">
            <Character species="cat" costume="var(--scarry-orange)" fur="var(--paper-shadow)" size={0.5} prop="clipboard" />
          </g>
          <rect x="2" y="20" width="52" height="3" fill="var(--brown)" />
        </CutawayWindow>
        {/* Top floor — career counselor */}
        <CutawayWindow x={86} y={28} w={56} h={42}>
          <g transform="translate(20 26)">
            <Character species="bear" costume="var(--scarry-blue-deep)" fur="var(--brown)" hat="cardigan" size={0.5} prop="clipboard" />
          </g>
          <g transform="translate(38 26)">
            <Character species="rabbit" costume="var(--scarry-green)" fur="var(--paper-shadow)" size={0.45} mirror prop="resume" />
          </g>
        </CutawayWindow>
        {/* Top floor — computer lab (job search) */}
        <CutawayWindow x={152} y={28} w={56} h={42}>
          {[0,1,2].map(i => (
            <g key={i} transform={`translate(${10 + i * 18} 20)`}>
              <rect x="-5" y="-2" width="10" height="7" fill="var(--ink-soft)" stroke="var(--ink)" strokeWidth="0.5" />
              <rect x="-4" y="-1" width="8" height="5" fill="var(--scarry-yellow)" />
              <Character species={['mouse', 'cat', 'rabbit'][i]} costume="var(--scarry-blue)" fur="var(--paper-shadow)" size={0.35} />
            </g>
          ))}
          <rect x="2" y="36" width="52" height="3" fill="var(--brown)" />
        </CutawayWindow>
        {/* Top floor — training classroom */}
        <CutawayWindow x={218} y={28} w={56} h={42}>
          {/* Whiteboard */}
          <rect x="3" y="3" width="22" height="14" fill="var(--paper)" stroke="var(--ink)" strokeWidth="0.7" />
          <line x1="6" y1="7" x2="22" y2="7" stroke="var(--ink-soft)" strokeWidth="0.5" />
          <line x1="6" y1="10" x2="20" y2="10" stroke="var(--ink-soft)" strokeWidth="0.5" />
          <g transform="translate(34 26)">
            <Character species="owl" costume="var(--scarry-purple)" fur="var(--tan)" size={0.45} hat="cardigan" prop="book" />
          </g>
        </CutawayWindow>

        {/* Floor divider */}
        <line x1="0" y1="88" x2="290" y2="88" stroke="var(--ink)" strokeWidth="2" />

        {/* Middle band — title program signs */}
        <g style={{ pointerEvents: 'none' }}>
          <rect x="10" y="96" width="270" height="22" fill="var(--paper-shadow)" stroke="var(--ink)" strokeWidth="1" />
          <text x="145" y="111" textAnchor="middle" style={{ fontFamily: 'Caveat, cursive', fontSize: 13, fill: 'var(--ink-soft)' }}>
            one door, one stop, four programs
          </text>
        </g>

        {/* THE FOUR COLORED DOORS — Title I/II/III/IV */}
        <g>
          <rect x="30" y="130" width="48" height="86" fill="var(--scarry-red)" stroke="var(--ink)" strokeWidth="2.2" />
          <rect x="34" y="134" width="40" height="60" fill="var(--scarry-red-deep)" />
          <circle cx="68" cy="170" r="2" fill="var(--scarry-yellow)" />
          <text x="54" y="208" textAnchor="middle" style={{ fontFamily: 'Fraunces, serif', fontSize: 10, fontWeight: 700, fill: 'var(--paper)' }}>I</text>

          <rect x="92" y="130" width="48" height="86" fill="var(--scarry-blue)" stroke="var(--ink)" strokeWidth="2.2" />
          <rect x="96" y="134" width="40" height="60" fill="var(--scarry-blue-deep)" />
          <circle cx="130" cy="170" r="2" fill="var(--scarry-yellow)" />
          <text x="116" y="208" textAnchor="middle" style={{ fontFamily: 'Fraunces, serif', fontSize: 10, fontWeight: 700, fill: 'var(--paper)' }}>II</text>

          <rect x="154" y="130" width="48" height="86" fill="var(--scarry-yellow)" stroke="var(--ink)" strokeWidth="2.2" />
          <rect x="158" y="134" width="40" height="60" fill="var(--scarry-yellow-deep)" />
          <circle cx="192" cy="170" r="2" fill="var(--ink)" />
          <text x="178" y="208" textAnchor="middle" style={{ fontFamily: 'Fraunces, serif', fontSize: 10, fontWeight: 700, fill: 'var(--ink)' }}>III</text>

          <rect x="216" y="130" width="48" height="86" fill="var(--scarry-green)" stroke="var(--ink)" strokeWidth="2.2" />
          <rect x="220" y="134" width="40" height="60" fill="var(--scarry-green-deep)" />
          <circle cx="254" cy="170" r="2" fill="var(--scarry-yellow)" />
          <text x="240" y="208" textAnchor="middle" style={{ fontFamily: 'Fraunces, serif', fontSize: 10, fontWeight: 700, fill: 'var(--paper)' }}>IV</text>
        </g>

        {/* Tiny door labels (always shown — central to the metaphor) */}
        <g style={{ pointerEvents: 'none' }}>
          <text x="54"  y="232" textAnchor="middle" className="label" style={{ fontSize: 8.5 }}>adult & dislocated</text>
          <text x="116" y="232" textAnchor="middle" className="label" style={{ fontSize: 8.5 }}>adult ed</text>
          <text x="178" y="232" textAnchor="middle" className="label" style={{ fontSize: 8.5 }}>job-matching</text>
          <text x="240" y="232" textAnchor="middle" className="label" style={{ fontSize: 8.5 }}>voc rehab</text>
        </g>
      </Building>

      {/* UNEMPLOYMENT — line outside */}
      <Building x={2970} y={580} w={110} h={100} body="var(--scarry-yellow)"
                roof="var(--scarry-blue)" roofShape="flat"
                sign="UI OFFICE" signColor="var(--scarry-blue)" signTextColor="var(--paper)"
                entity="unemployment" selected={isSel('unemployment')} dimmed={isDim('unemployment')}
                {...ev('unemployment')}>
        <Win x={12} y={26} w={28} h={36} color="var(--sky)" />
        <Win x={50} y={26} w={28} h={36} color="var(--sky)" />
        <Door x={86} y={36} w={18} h={56} color="var(--brown-deep)" />
        {/* People in line */}
      </Building>
      {/* Queue outside UI */}
      {showExtras && (
        <g style={{ pointerEvents: 'none' }}>
          <g transform={`translate(3060 ${680})`}><Character species="bear" costume="var(--scarry-red)" fur="var(--brown)" size={0.7} prop="resume" /></g>
          <g transform={`translate(3092 ${680})`}><Character species="cat" costume="var(--scarry-blue)" fur="var(--tan)" size={0.7} prop="resume" /></g>
          <g transform={`translate(3120 ${680})`}><Character species="mouse" costume="var(--scarry-pink)" fur="var(--paper-shadow)" size={0.7} prop="resume" /></g>
        </g>
      )}

      {/* ============== EMPLOYER DISTRICT (right edge) ============== */}

      {/* Manufacturer (factory with smokestack) */}
      <Building x={3160} y={520} w={140} h={160} body="var(--brick)" hatch="url(#brick-pat)"
                roof="var(--brick-deep)" roofShape="flat"
                sign="MFG. CO." signColor="var(--paper)"
                entity="employer-mfg" selected={isSel('employer-mfg')} dimmed={isDim('employer-mfg')}
                {...ev('employer-mfg')}>
        {/* Smokestacks */}
        <g transform="translate(20 -40)">
          <rect x="0" y="0" width="14" height="40" fill="var(--brick-deep)" stroke="var(--ink)" strokeWidth="1.5" />
          <ellipse cx="7" cy="-4" rx="10" ry="5" fill="#aaa" opacity="0.7" />
          <ellipse cx="2" cy="-10" rx="8" ry="4" fill="#aaa" opacity="0.5" />
          <ellipse cx="12" cy="-14" rx="6" ry="3" fill="#aaa" opacity="0.4" />
        </g>
        <g transform="translate(100 -28)">
          <rect x="0" y="0" width="10" height="28" fill="var(--brick-deep)" stroke="var(--ink)" strokeWidth="1.5" />
        </g>
        {/* Loading dock door */}
        <rect x="20" y="100" width="60" height="60" fill="var(--brown-deep)" stroke="var(--ink)" strokeWidth="2" />
        {/* Upper-floor windows + an on-site upskilling room */}
        <Win x={20} y={36} w={20} h={26} color="var(--scarry-yellow)" />
        <Win x={50} y={36} w={20} h={26} color="var(--scarry-yellow)" />
        <CutawayWindow x={78} y={34} w={54} h={30}>
          <rect x="2" y="-6" width="50" height="7" fill="var(--scarry-yellow)" stroke="var(--ink)" strokeWidth="0.8" />
          <text x="27" y="0" textAnchor="middle"
                style={{ fontFamily: 'Fraunces, serif', fontSize: 6, fontWeight: 700, fill: 'var(--ink)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            upskill room
          </text>
          {/* Whiteboard + 2 trainees */}
          <rect x="3" y="6" width="18" height="14" fill="var(--paper)" stroke="var(--ink)" strokeWidth="0.5" />
          <line x1="6" y1="10" x2="19" y2="10" stroke="var(--ink-soft)" strokeWidth="0.4" />
          <line x1="6" y1="13" x2="17" y2="13" stroke="var(--ink-soft)" strokeWidth="0.4" />
          <g transform="translate(30 18)"><Character species="bear" costume="var(--scarry-blue)" hat="hardhat" fur="var(--brown)" size={0.35} /></g>
          <g transform="translate(44 18)"><Character species="rabbit" costume="var(--scarry-orange)" hat="hardhat" fur="var(--paper-shadow)" size={0.35} mirror /></g>
        </CutawayWindow>
        {/* Worker on the lot in front */}
        <g transform="translate(50 130)">
          <Character species="bear" costume="var(--scarry-orange)" hat="hardhat" fur="var(--brown)" size={0.65} prop="tool" />
        </g>
      </Building>

      {/* Hospital */}
      <Building x={3320} y={520} w={130} h={160} body="var(--paper)"
                roof="var(--scarry-red)" roofShape="flat"
                sign="HOSPITAL" signColor="var(--scarry-red)" signTextColor="var(--paper)"
                entity="employer-hosp" selected={isSel('employer-hosp')} dimmed={isDim('employer-hosp')}
                {...ev('employer-hosp')}>
        {/* Red cross plaque */}
        <g transform="translate(65 30)">
          <rect x="-12" y="-12" width="24" height="24" fill="var(--scarry-red)" stroke="var(--ink)" strokeWidth="1.5" />
          <rect x="-3" y="-9" width="6" height="18" fill="var(--paper)" />
          <rect x="-9" y="-3" width="18" height="6" fill="var(--paper)" />
        </g>
        <Win x={12} y={62} w={22} h={28} color="var(--sky)" />
        <Win x={96} y={62} w={22} h={28} color="var(--sky)" />
        {/* Lower-floor nursing academy cutaway */}
        <CutawayWindow x={12} y={100} w={106} h={32}>
          <rect x="2" y="-6" width="102" height="7" fill="var(--scarry-yellow)" stroke="var(--ink)" strokeWidth="0.8" />
          <text x="53" y="0" textAnchor="middle"
                style={{ fontFamily: 'Fraunces, serif', fontSize: 6.2, fontWeight: 700, fill: 'var(--ink)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            nursing academy &amp; medical-assistant track
          </text>
          {/* Hospital bed with patient + nurse trainer */}
          <rect x="6" y="14" width="22" height="8" fill="var(--paper)" stroke="var(--ink)" strokeWidth="0.6" />
          <rect x="6" y="10" width="8" height="6" fill="var(--scarry-pink)" stroke="var(--ink)" strokeWidth="0.5" />
          <g transform="translate(36 18)"><Character species="owl" costume="var(--paper)" fur="var(--tan)" hat="cap" size={0.4} prop="clipboard" /></g>
          <g transform="translate(54 18)"><Character species="rabbit" costume="var(--paper-shadow)" fur="var(--paper-shadow)" hat="cap" size={0.4} /></g>
          <g transform="translate(72 18)"><Character species="mouse" costume="var(--paper-shadow)" fur="var(--tan)" hat="cap" size={0.4} mirror /></g>
          <g transform="translate(90 18)"><Character species="cat" costume="var(--paper-shadow)" fur="var(--tan)" hat="cap" size={0.4} mirror /></g>
        </CutawayWindow>
        <Door x={56} y={134} w={20} h={26} color="var(--brown)" />
        {/* Nurse on the steps */}
        <g transform="translate(66 162)">
          <Character species="cat" costume="var(--paper)" fur="var(--tan)" hat="cap" size={0.7} prop="clipboard" />
        </g>
      </Building>

      {/* Main street shops row — small employers tucked between anchors */}
      <g>
        <Building x={3460} y={600} w={40} h={80} body="var(--scarry-pink)"
                  roof="var(--scarry-red)" roofShape="gable"
                  entity="employer-shops" selected={isSel('employer-shops')} dimmed={isDim('employer-shops')}
                  {...ev('employer-shops')}>
          <Win x={6} y={20} w={28} h={22} color="var(--paper)" />
          <text x="20" y="36" textAnchor="middle" style={{ fontFamily: 'Caveat, cursive', fontSize: 9, fill: 'var(--ink)' }}>BAKERY</text>
          <Door x={14} y={52} w={14} h={28} color="var(--brown)" />
        </Building>
        <Building x={3505} y={620} w={40} h={60} body="var(--scarry-green)"
                  roof="var(--scarry-yellow)" roofShape="flat"
                  entity="employer-shops" selected={false} dimmedSet={dimmedSet}
                  onClick={(e) => { e.stopPropagation(); }}>
          <Win x={6} y={14} w={28} h={22} color="var(--paper)" />
          <text x="20" y="28" textAnchor="middle" style={{ fontFamily: 'Caveat, cursive', fontSize: 8, fill: 'var(--ink)' }}>BOOKS</text>
          <Door x={14} y={40} w={14} h={20} color="var(--brown)" />
        </Building>
      </g>

      {/* ===== DISTRIBUTION CENTER — warehouse + loading dock ===== */}
      <Building x={3570} y={540} w={180} h={140} body="var(--paper-shadow)"
                roof="var(--ink-soft)" roofShape="flat"
                sign="DISTRIBUTION CENTER" signColor="var(--scarry-yellow)" signTextColor="var(--ink)"
                entity="distribution-center" selected={isSel('distribution-center')} dimmed={isDim('distribution-center')}
                {...ev('distribution-center')}>
        {/* Roof signage strip */}
        <g style={{ pointerEvents: 'none' }}>
          <rect x="0" y="-10" width="180" height="6" fill="var(--scarry-blue-deep)" />
        </g>
        {/* Loading-dock doors — 3 bay doors */}
        {[0,1,2].map(i => (
          <g key={i}>
            <rect x={14 + i * 56} y="64" width="42" height="74"
                  fill="var(--brown-deep)" stroke="var(--ink)" strokeWidth="2" />
            <line x1={14 + i * 56} y1="74" x2={14 + i * 56 + 42} y2="74" stroke="var(--brown)" strokeWidth="0.6" />
            <line x1={14 + i * 56} y1="84" x2={14 + i * 56 + 42} y2="84" stroke="var(--brown)" strokeWidth="0.6" />
            <line x1={14 + i * 56} y1="94" x2={14 + i * 56 + 42} y2="94" stroke="var(--brown)" strokeWidth="0.6" />
            <line x1={14 + i * 56} y1="104" x2={14 + i * 56 + 42} y2="104" stroke="var(--brown)" strokeWidth="0.6" />
            {/* Bay number */}
            <rect x={14 + i * 56 + 14} y="58" width="14" height="8" fill="var(--paper)" stroke="var(--ink)" strokeWidth="0.8" />
            <text x={14 + i * 56 + 21} y="65" textAnchor="middle"
                  style={{ fontFamily: 'Fraunces, serif', fontSize: 7, fontWeight: 700, fill: 'var(--ink)' }}>{i+1}</text>
          </g>
        ))}
        {/* Cutaway window above bay 2 — on-site training room */}
        <CutawayWindow x={68} y={20} w={72} h={36}>
          {/* Tiny TRAINING banner */}
          <rect x="2" y="-6" width="68" height="7" fill="var(--scarry-yellow)" stroke="var(--ink)" strokeWidth="0.8" />
          <text x="36" y="0" textAnchor="middle"
                style={{ fontFamily: 'Fraunces, serif', fontSize: 6, fontWeight: 700, fill: 'var(--ink)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            in-house training
          </text>
          {/* Whiteboard / forklift cert visual */}
          <rect x="6" y="6" width="22" height="14" fill="var(--paper)" stroke="var(--ink)" strokeWidth="0.6" />
          <line x1="9" y1="11" x2="25" y2="11" stroke="var(--ink-soft)" strokeWidth="0.4" />
          <line x1="9" y1="14" x2="22" y2="14" stroke="var(--ink-soft)" strokeWidth="0.4" />
          <g transform="translate(40 24)">
            <Character species="bear" costume="var(--scarry-orange)" hat="hardhat" fur="var(--brown)" size={0.4} />
          </g>
          <g transform="translate(54 24)">
            <Character species="cat" costume="var(--scarry-blue)" hat="hardhat" fur="var(--tan)" size={0.4} mirror />
          </g>
        </CutawayWindow>
        {/* Side window — packages on a conveyor */}
        <Win x={148} y={20} w={24} h={28} color="var(--scarry-yellow)" mullion={false} />
        {/* Forklift parked at bay 1 */}
        <g transform="translate(-16 130)">
          <rect x="0" y="-14" width="22" height="18" fill="var(--scarry-yellow)" stroke="var(--ink)" strokeWidth="1.6" />
          <rect x="2" y="-22" width="3" height="22" fill="var(--ink-soft)" stroke="var(--ink)" strokeWidth="0.8" />
          <rect x="-4" y="-2" width="10" height="3" fill="var(--ink)" />
          <circle cx="4" cy="6" r="4" fill="var(--ink)" />
          <circle cx="18" cy="6" r="4" fill="var(--ink)" />
          <circle cx="4" cy="6" r="1.5" fill="var(--paper)" />
          <circle cx="18" cy="6" r="1.5" fill="var(--paper)" />
          {/* Stack of boxes on the forks */}
          <rect x="-6" y="-12" width="6" height="6" fill="var(--brown)" stroke="var(--ink)" strokeWidth="0.6" />
        </g>
      </Building>

      {/* ===== HOTEL — tall multi-story ===== */}
      <Building x={3770} y={460} w={150} h={220} body="var(--scarry-red-deep)"
                roof="var(--ink)" roofShape="flat"
                sign="HOTEL" signColor="var(--scarry-yellow)" signTextColor="var(--ink)"
                entity="hotel" selected={isSel('hotel')} dimmed={isDim('hotel')}
                {...ev('hotel')}>
        {/* Decorative cornice */}
        <g style={{ pointerEvents: 'none' }}>
          <rect x="0" y="-10" width="150" height="4" fill="var(--scarry-yellow)" />
        </g>
        {/* Vertical "HOTEL" wall-mounted sign */}
        <g transform="translate(0 50)" style={{ pointerEvents: 'none' }}>
          <rect x="-22" y="0" width="20" height="80" fill="var(--paper)" stroke="var(--ink)" strokeWidth="1.6" />
          {['H','O','T','E','L'].map((c,i)=>(
            <text key={i} x="-12" y={16 + i * 14} textAnchor="middle"
                  style={{ fontFamily: 'DM Serif Display, serif', fontSize: 11, fontWeight: 700, fill: 'var(--scarry-red-deep)' }}>{c}</text>
          ))}
        </g>
        {/* Upper-floor room windows (3 floors × 4 rooms) */}
        {[0,1,2].map(floor => [0,1,2,3].map(col => (
          <g key={`${floor}-${col}`}>
            <rect x={12 + col * 32} y={48 + floor * 30} width="22" height="22"
                  fill="var(--scarry-yellow)" stroke="var(--ink)" strokeWidth="1.2" />
            <line x1={23 + col * 32} y1={48 + floor * 30} x2={23 + col * 32} y2={70 + floor * 30}
                  stroke="var(--ink)" strokeWidth="0.6" opacity="0.5" />
          </g>
        )))}
        {/* Top-floor cutaway — hospitality training (front-desk simulation) */}
        <CutawayWindow x={12} y={48} w={60} h={28}>
          <rect x="2" y="-6" width="56" height="7" fill="var(--scarry-yellow)" stroke="var(--ink)" strokeWidth="0.8" />
          <text x="30" y="0" textAnchor="middle"
                style={{ fontFamily: 'Fraunces, serif', fontSize: 6, fontWeight: 700, fill: 'var(--ink)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            hotel academy
          </text>
          {/* Front-desk counter */}
          <rect x="3" y="14" width="32" height="6" fill="var(--brown)" stroke="var(--ink)" strokeWidth="0.6" />
          <g transform="translate(14 14)">
            <Character species="cat" costume="var(--scarry-blue-deep)" fur="var(--tan)" size={0.36} prop="clipboard" />
          </g>
          <g transform="translate(28 14)">
            <Character species="rabbit" costume="var(--scarry-pink)" fur="var(--paper-shadow)" size={0.36} mirror />
          </g>
          {/* "GUEST" sign */}
          <rect x="42" y="8" width="14" height="6" fill="var(--paper)" stroke="var(--ink)" strokeWidth="0.5" />
          <text x="49" y="13" textAnchor="middle" style={{ fontFamily: 'Caveat, cursive', fontSize: 6, fill: 'var(--ink)' }}>guest</text>
        </CutawayWindow>
        {/* Ground-floor awning + entrance */}
        <g>
          <path d="M 26 154 L 124 154 L 118 168 L 32 168 Z"
                fill="var(--scarry-yellow)" stroke="var(--ink)" strokeWidth="1.5" />
          {/* Awning stripes */}
          {[0,1,2,3,4,5].map(i => (
            <line key={i} x1={32 + i * 16} y1="154" x2={30 + i * 16} y2="168"
                  stroke="var(--scarry-red-deep)" strokeWidth="1" />
          ))}
          {/* Revolving door */}
          <rect x="56" y="170" width="38" height="48" fill="var(--paper-shadow)"
                stroke="var(--ink)" strokeWidth="1.8" />
          <line x1="75" y1="170" x2="75" y2="218" stroke="var(--ink)" strokeWidth="1" />
          <line x1="56" y1="194" x2="94" y2="194" stroke="var(--ink)" strokeWidth="1" />
        </g>
        {/* Doorman/bellhop on the steps */}
        <g transform="translate(120 218)">
          <Character species="dog" costume="var(--scarry-red-deep)" hat="cap" fur="var(--tan-deep)" size={0.7} />
        </g>
      </Building>

      {/* Chamber of Commerce — clubhouse */}
      <Building x={3170} y={700} w={90} h={70} body="var(--scarry-blue-deep)"
                roof="var(--scarry-yellow)" roofShape="gable"
                sign="CHAMBER" signColor="var(--paper)"
                entity="chamber" selected={isSel('chamber')} dimmed={isDim('chamber')}
                {...ev('chamber')}>
        <Win x={10} y={18} w={20} h={26} color="var(--scarry-yellow)" mullion={false} />
        <Win x={40} y={18} w={20} h={26} color="var(--scarry-yellow)" mullion={false} />
        <Door x={68} y={26} w={16} h={36} color="var(--brown-deep)" />
      </Building>

      {/* Sector roundtable — open-air table */}
      <g className={'clickable' + (isSel('sector-partner') ? ' is-selected' : '') + (isDim('sector-partner') ? ' dim' : '')}
         onClick={(e) => { e.stopPropagation(); onPick('sector-partner'); }}
         onMouseEnter={() => onHover && onHover('sector-partner')}
         onMouseLeave={() => onLeave && onLeave('sector-partner')}
         style={{ pointerEvents: 'all' }}>
        <rect className="hover-ring" x="3300" y="675" width="140" height="80" rx="6" />
        <ellipse cx="3370" cy={730} rx={60} ry={22} fill="var(--tan)" stroke="var(--ink)" strokeWidth="2" />
        <ellipse cx="3370" cy={728} rx={58} ry={20} fill="var(--tan-deep)" />
        <g transform={`translate(3320 ${720})`}><Character species="bear" costume="var(--scarry-orange)" hat="hardhat" fur="var(--brown)" size={0.55} /></g>
        <g transform={`translate(3350 ${712})`}><Character species="cat" costume="var(--paper)" fur="var(--tan)" hat="cap" size={0.55} /></g>
        <g transform={`translate(3390 ${712})`}><Character species="owl" costume="var(--scarry-blue)" fur="var(--tan)" hat="cardigan" size={0.55} /></g>
        <g transform={`translate(3420 ${720})`}><Character species="fox" costume="var(--scarry-blue-deep)" fur="var(--scarry-orange)" hat="cap" size={0.55} /></g>
        <text x="3370" y={702} textAnchor="middle" className="label" style={{ fontSize: 10 }}>sector roundtable</text>
      </g>

      {/* Union hall */}
      <Building x={3470} y={700} w={100} h={70} body="var(--scarry-red-deep)"
                roof="var(--ink)" roofShape="flat"
                sign="UNION HALL" signColor="var(--paper)"
                entity="union" selected={isSel('union')} dimmed={isDim('union')}
                {...ev('union')}>
        <Win x={10} y={16} w={20} h={26} color="var(--scarry-yellow)" />
        <Win x={40} y={16} w={20} h={26} color="var(--scarry-yellow)" />
        <Door x={70} y={26} w={18} h={36} color="var(--brown-deep)" />
        {/* Banner */}
        <g transform="translate(50 -16)">
          <rect x="-30" y="0" width="60" height="12" fill="var(--paper)" stroke="var(--ink)" strokeWidth="1" />
          <text x="0" y="9" textAnchor="middle" style={{ fontFamily: 'Caveat, cursive', fontSize: 10, fill: 'var(--scarry-red-deep)' }}>solidarity</text>
        </g>
      </Building>

      {/* ============== TRAINING ROW (bottom band) ============== */}

      {/* University */}
      <Building x={2210} y={830} w={140} h={130} body="var(--brick)" hatch="url(#brick-pat)"
                roof="var(--scarry-red-deep)" roofShape="mansard"
                sign="UNIVERSITY" signColor="var(--paper)"
                entity="university" selected={isSel('university')} dimmed={isDim('university')}
                {...ev('university')}>
        {/* Tall tower */}
        <g transform="translate(54 -50)">
          <rect x="0" y="0" width="32" height="52" fill="var(--brick)" stroke="var(--ink)" strokeWidth="2" />
          <polygon points="-4,0 16,-22 36,0" fill="var(--scarry-red-deep)" stroke="var(--ink)" strokeWidth="2" />
          <circle cx="16" cy="26" r="6" fill="var(--paper)" stroke="var(--ink)" strokeWidth="1" />
          <line x1="16" y1="26" x2="16" y2="22" stroke="var(--ink)" strokeWidth="1" />
          <line x1="16" y1="26" x2="20" y2="27" stroke="var(--ink)" strokeWidth="1" />
        </g>
        <Win x={14} y={26} w={20} h={28} color="var(--sky)" />
        <Win x={108} y={26} w={20} h={28} color="var(--sky)" />
        <Win x={14} y={70} w={20} h={28} color="var(--sky)" />
        <Win x={108} y={70} w={20} h={28} color="var(--sky)" />
        <Door x={58} y={94} w={24} h={36} color="var(--brown-deep)" />
        {/* Student with mortarboard */}
        <g transform="translate(70 130)">
          <Character species="rabbit" costume="var(--ink)" hat="mortarboard" fur="var(--paper-shadow)" size={0.7} prop="book" />
        </g>
      </Building>

      {/* High school CTE */}
      <Building x={2380} y={850} w={130} h={110} body="var(--scarry-red)"
                roof="var(--scarry-red-deep)" roofShape="gable"
                sign="HIGH SCHOOL" signColor="var(--paper)"
                entity="high-school" selected={isSel('high-school')} dimmed={isDim('high-school')}
                {...ev('high-school')}>
        {/* Bell */}
        <g transform="translate(60 -16)">
          <rect x="-5" y="0" width="10" height="10" fill="var(--paper)" stroke="var(--ink)" strokeWidth="1" />
          <polygon points="-7,0 0,-10 7,0" fill="var(--scarry-yellow)" stroke="var(--ink)" strokeWidth="1.2" />
        </g>
        <CutawayWindow x={14} y={22} w={36} h={42}>
          <g transform="translate(12 26)">
            <Character species="cat" costume="var(--scarry-purple)" fur="var(--tan)" size={0.45} />
          </g>
          <g transform="translate(28 26)">
            <Character species="mouse" costume="var(--scarry-yellow)" fur="var(--paper-shadow)" size={0.45} mirror />
          </g>
        </CutawayWindow>
        <Win x={60} y={22} w={26} h={32} color="var(--scarry-yellow)" />
        <Win x={94} y={22} w={26} h={32} color="var(--scarry-yellow)" />
        <Door x={52} y={70} w={24} h={40} color="var(--brown)" />
      </Building>

      {/* Community college — THE focal building of training row */}
      <Building x={2520} y={830} w={170} h={130} body="var(--scarry-pink)"
                roof="var(--scarry-green-deep)" roofShape="mansard"
                sign="COMMUNITY COLLEGE" signColor="var(--paper)"
                entity="community-college" selected={isSel('community-college')} dimmed={isDim('community-college')}
                {...ev('community-college')}>
        {/* Cutaway — nursing/welding classroom */}
        <CutawayWindow x={14} y={26} w={70} h={48}>
          {/* Whiteboard */}
          <rect x="6" y="4" width="28" height="16" fill="var(--paper)" stroke="var(--ink)" strokeWidth="0.7" />
          <line x1="10" y1="9" x2="30" y2="9" stroke="var(--ink-soft)" strokeWidth="0.5" />
          <line x1="10" y1="13" x2="26" y2="13" stroke="var(--ink-soft)" strokeWidth="0.5" />
          <g transform="translate(46 32)">
            <Character species="owl" costume="var(--scarry-pink)" fur="var(--tan)" hat="cardigan" size={0.45} prop="book" />
          </g>
          <g transform="translate(14 32)">
            <Character species="rabbit" costume="var(--scarry-blue)" fur="var(--paper-shadow)" size={0.4} />
          </g>
          <g transform="translate(30 32)">
            <Character species="bear" costume="var(--scarry-red)" fur="var(--brown)" size={0.4} />
          </g>
        </CutawayWindow>
        {/* Cutaway — welding workshop annex */}
        <CutawayWindow x={92} y={26} w={66} h={48}>
          <g transform="translate(24 32)">
            <Character species="bear" costume="var(--scarry-orange)" hat="hardhat" fur="var(--brown)" size={0.5} prop="tool" />
          </g>
          <g transform="translate(46 32)">
            <Character species="cat" costume="var(--scarry-blue)" hat="hardhat" fur="var(--tan)" size={0.5} mirror prop="tool" />
          </g>
          {/* Sparks */}
          <circle cx="38" cy="18" r="1" fill="var(--scarry-yellow)" />
          <circle cx="42" cy="20" r="0.7" fill="var(--scarry-orange)" />
          <circle cx="44" cy="16" r="0.7" fill="var(--scarry-yellow)" />
        </CutawayWindow>
        <Door x={75} y={84} w={20} h={40} color="var(--brown-deep)" />
        {/* Steps */}
        <rect x="-4" y="124" width="178" height="4" fill="var(--brown)" stroke="var(--ink)" strokeWidth="1" />
      </Building>

      {/* Apprenticeship workshop */}
      <Building x={2710} y={850} w={140} h={110} body="var(--brown)"
                roof="var(--scarry-orange)" roofShape="gable"
                sign="EARN & LEARN" signColor="var(--paper)"
                entity="apprenticeship" selected={isSel('apprenticeship')} dimmed={isDim('apprenticeship')}
                {...ev('apprenticeship')}>
        {/* Big workshop door */}
        <rect x="30" y="40" width="80" height="68" fill="var(--brown-deep)" stroke="var(--ink)" strokeWidth="2" />
        {/* X-bracing */}
        <line x1="30" y1="40" x2="110" y2="108" stroke="var(--brown)" strokeWidth="1.5" />
        <line x1="110" y1="40" x2="30" y2="108" stroke="var(--brown)" strokeWidth="1.5" />
        <Win x={10} y={20} w={16} h={20} color="var(--scarry-yellow)" />
        <Win x={114} y={20} w={16} h={20} color="var(--scarry-yellow)" />
        {/* Master + apprentice on bench in front */}
        <g transform="translate(54 108)">
          <Character species="bear" costume="var(--scarry-blue)" hat="hardhat" fur="var(--brown)" size={0.65} prop="tool" />
        </g>
        <g transform="translate(86 108)">
          <Character species="rabbit" costume="var(--scarry-yellow)" hat="hardhat" fur="var(--paper-shadow)" size={0.6} prop="tool" mirror />
        </g>
      </Building>

      {/* Voc rehab office */}
      <Building x={2870} y={870} w={100} h={90} body="var(--scarry-green)"
                roof="var(--scarry-green-deep)" roofShape="flat"
                sign="VOC REHAB" signColor="var(--paper)"
                entity="voc-rehab" selected={isSel('voc-rehab')} dimmed={isDim('voc-rehab')}
                {...ev('voc-rehab')}>
        <Win x={10} y={22} w={22} h={30} color="var(--sky)" />
        <Win x={42} y={22} w={22} h={30} color="var(--sky)" />
        <Door x={72} y={36} w={18} h={52} color="var(--brown)" />
        {/* Ramp */}
        <polygon points="-22,86 0,86 0,68" fill="var(--paper-shadow)"
                 stroke="var(--ink)" strokeWidth="1.5" />
      </Building>

      {/* Community-based organization */}
      <Building x={2990} y={870} w={120} h={90} body="var(--scarry-yellow)"
                roof="var(--scarry-blue)" roofShape="flat"
                sign="GOODHEART NONPROFIT" signColor="var(--paper)"
                entity="cbo" selected={isSel('cbo')} dimmed={isDim('cbo')}
                {...ev('cbo')}>
        <CutawayWindow x={10} y={20} w={40} h={42}>
          <g transform="translate(20 26)">
            <Character species="rabbit" costume="var(--scarry-pink)" fur="var(--paper-shadow)" hat="cardigan" size={0.5} />
          </g>
          <g transform="translate(2 26)">
            <Character species="dog" costume="var(--scarry-blue)" fur="var(--tan)" size={0.4} mirror />
          </g>
        </CutawayWindow>
        <Win x={58} y={22} w={26} h={32} color="var(--sky)" />
        <Door x={90} y={36} w={18} h={52} color="var(--brown)" />
        {/* Awning */}
        <g transform="translate(60 16)">
          <path d="M -30 0 L 30 0 L 26 8 L -26 8 Z" fill="var(--scarry-red)" stroke="var(--ink)" strokeWidth="1.4" />
          <line x1="-20" y1="0" x2="-22" y2="8" stroke="var(--paper)" strokeWidth="1" />
          <line x1="-10" y1="0" x2="-12" y2="8" stroke="var(--paper)" strokeWidth="1" />
          <line x1="0" y1="0" x2="-2" y2="8" stroke="var(--paper)" strokeWidth="1" />
          <line x1="10" y1="0" x2="8" y2="8" stroke="var(--paper)" strokeWidth="1" />
          <line x1="20" y1="0" x2="18" y2="8" stroke="var(--paper)" strokeWidth="1" />
        </g>
      </Building>

      {/* Foundation */}
      <Building x={3120} y={880} w={90} h={80} body="var(--scarry-purple)"
                roof="var(--scarry-purple)" roofShape="flat"
                sign="FOUNDATION" signColor="var(--paper)"
                entity="foundation" selected={isSel('foundation')} dimmed={isDim('foundation')}
                {...ev('foundation')}>
        <Win x={10} y={22} w={18} h={26} color="var(--scarry-yellow)" />
        <Win x={36} y={22} w={18} h={26} color="var(--scarry-yellow)" />
        <Door x={66} y={32} w={16} h={42} color="var(--brown)" />
        {/* Heart sign */}
        <g transform="translate(45 -10)">
          <path d="M 0 0 C -4 -5 -10 -2 -10 3 C -10 8 0 14 0 14 C 0 14 10 8 10 3 C 10 -2 4 -5 0 0 Z"
                fill="var(--scarry-red)" stroke="var(--ink)" strokeWidth="1.2" />
        </g>
      </Building>

      {/* Intermediary */}
      <Building x={3220} y={880} w={120} h={80} body="var(--scarry-blue)"
                roof="var(--scarry-blue-deep)" roofShape="flat"
                sign="NATL. INTERMEDIARY" signColor="var(--paper)"
                entity="intermediary" selected={isSel('intermediary')} dimmed={isDim('intermediary')}
                {...ev('intermediary')}>
        <Win x={12} y={22} w={22} h={30} color="var(--sky)" />
        <Win x={42} y={22} w={22} h={30} color="var(--sky)" />
        <Win x={72} y={22} w={22} h={30} color="var(--sky)" />
        <Door x={100} y={32} w={16} h={42} color="var(--brown)" />
      </Building>

      {/* EDA district */}
      <Building x={3360} y={880} w={120} h={80} body="var(--paper-shadow)"
                roof="var(--scarry-orange)" roofShape="gable"
                sign="EDA DISTRICT" signColor="var(--scarry-orange)" signTextColor="var(--paper)"
                entity="eda-district" selected={isSel('eda-district')} dimmed={isDim('eda-district')}
                {...ev('eda-district')}>
        <Win x={12} y={22} w={22} h={30} color="var(--sky)" />
        <Win x={42} y={22} w={22} h={30} color="var(--sky)" />
        <Win x={72} y={22} w={22} h={30} color="var(--sky)" />
        <Door x={100} y={32} w={16} h={42} color="var(--brown)" />
      </Building>

      {/* ============== STREET LIFE ============== */}
      {showExtras && (
        <g style={{ pointerEvents: 'none' }}>
          {/* Trees */}
          <Tree x={2340} y={groundY + 80} scale={0.85} />
          <Tree x={2660} y={groundY + 80} scale={0.9} />
          <Tree x={3030} y={groundY + 80} scale={0.85} kind="pine" />
          <Tree x={3140} y={groundY + 80} scale={0.85} />
          <Tree x={3450} y={groundY + 80} scale={0.85} />

          {/* Hot-dog cart (sausage-on-wheels) */}
          <g transform={`translate(2500 ${groundY + 86})`}>
            <ellipse cx="0" cy="0" rx="22" ry="8" fill="var(--scarry-orange)" stroke="var(--ink)" strokeWidth="1.4" />
            <ellipse cx="0" cy="-1" rx="20" ry="3" fill="var(--scarry-yellow)" opacity="0.6" />
            <line x1="-12" y1="6" x2="-12" y2="10" stroke="var(--ink)" strokeWidth="1.5" />
            <line x1="12" y1="6" x2="12" y2="10" stroke="var(--ink)" strokeWidth="1.5" />
            <circle cx="-12" cy="11" r="3" fill="var(--ink)" />
            <circle cx="12" cy="11" r="3" fill="var(--ink)" />
            <g transform="translate(28 -4)">
              <Character species="dog" costume="var(--paper)" fur="var(--tan)" hat="chef" size={0.65} />
            </g>
          </g>

          {/* Two characters chatting */}
          <g transform={`translate(2880 ${groundY + 86})`}>
            <Character species="bear" costume="var(--scarry-red)" fur="var(--brown)" size={0.7} />
          </g>
          <g transform={`translate(2910 ${groundY + 86})`}>
            <Character species="cat" costume="var(--scarry-yellow)" fur="var(--tan)" mirror size={0.7} />
          </g>

          {/* Dog-walker */}
          <g transform={`translate(2440 ${groundY + 88})`}>
            <Character species="fox" costume="var(--scarry-blue)" fur="var(--scarry-orange)" size={0.7} walking />
          </g>
          <g transform={`translate(2455 ${groundY + 92})`}>
            <ellipse cx="0" cy="0" rx="6" ry="3" fill="var(--paper-shadow)" stroke="var(--ink)" strokeWidth="0.8" />
            <line x1="-3" y1="3" x2="-3" y2="6" stroke="var(--ink)" strokeWidth="0.8" />
            <line x1="3" y1="3" x2="3" y2="6" stroke="var(--ink)" strokeWidth="0.8" />
            <ellipse cx="-7" cy="-1" rx="2" ry="1.5" fill="var(--paper-shadow)" stroke="var(--ink)" strokeWidth="0.8" />
          </g>
          <line x1="2448" y1={groundY + 78} x2="2458" y2={groundY + 90} stroke="var(--ink-soft)" strokeWidth="0.8" />

          {/* Stroller */}
          <g transform={`translate(3070 ${groundY + 84})`}>
            <Character species="rabbit" costume="var(--scarry-pink)" fur="var(--paper-shadow)" size={0.7} />
          </g>
          <g transform={`translate(3085 ${groundY + 92})`}>
            <rect x="-6" y="-4" width="12" height="8" rx="2" fill="var(--scarry-yellow)" stroke="var(--ink)" strokeWidth="1" />
            <circle cx="-4" cy="6" r="2" fill="var(--ink)" />
            <circle cx="4" cy="6" r="2" fill="var(--ink)" />
            <line x1="6" y1="-4" x2="10" y2="-8" stroke="var(--ink)" strokeWidth="1" />
          </g>

          {/* Hidden ladybug */}
          <HiddenLadybug x={2945} y={groundY - 22} rot={10} />

          {/* Help-wanted sign at the manufacturer */}
          <g transform={`translate(3200 ${groundY + 28})`}>
            <line x1="0" y1="0" x2="0" y2="20" stroke="var(--brown)" strokeWidth="1.5" />
            <rect x="-22" y="-14" width="44" height="14" fill="var(--paper)" stroke="var(--ink)" strokeWidth="1" />
            <text x="0" y="-3" textAnchor="middle" style={{ fontFamily: 'Caveat, cursive', fontSize: 11, fill: 'var(--scarry-red)' }}>help wanted</text>
          </g>

          {/* Closed-storefront detail — a character on a bench outside */}
          <Bench x={3540} y={groundY + 92} />
          <g transform={`translate(3540 ${groundY + 84})`}>
            <Character species="cat" costume="var(--ink-soft)" fur="var(--tan-deep)" size={0.65} prop="cane" />
          </g>

          {/* Streetlights & extras */}
          <Streetlight x={2620} y={groundY + 86} />
          <Streetlight x={3000} y={groundY + 86} />
          <Hydrant x={2820} y={groundY + 88} />
          <Mailbox x={3170} y={groundY + 88} />
        </g>
      )}

      {/* ============== GRANTEE ROW (candidate orgs, toggle on/off) ============== */}
      {/* Buildings are completely hidden when off (opacity 0 + pointer-events
         none). When the matching toggle flips on, the building fades in and
         rises into place; the dedicated grantee tour auto-starts. */}
      <g id="grantee-row">
        {window.GRANTEES && Object.values(window.GRANTEES).map(g => {
          const e = window.ENTITIES[g.id];
          if (!e) return null;
          const on = !!grantees[g.id];
          return (
            <g key={g.id}
               className={'grantee-wrap ' + (on ? 'grantee-on' : 'grantee-off')}
               style={on ? {} : { pointerEvents: 'none' }}>
              <GranteeBuilding
                id={g.id}
                grantee={g}
                pos={e.pos}
                selected={isSel(g.id)}
                dimmed={isDim(g.id)}
                {...ev(g.id)} />
            </g>
          );
        })}
      </g>

      {/* Narrative */}
      <g style={{ pointerEvents: 'none' }}>
        <Narrative x={2670} y={310}
          lines={[
            'When somebody loses a job, they come',
            'to the jobs office. There are four doors —',
            'one for each WIOA title.',
          ]} />
        <Narrative x={3380} y={310}
          lines={[
            'Across the way, employers',
            'are hiring. Some build things,',
            'some heal people, some sell bread.',
          ]} />
        <Narrative x={2900} y={1000}
          lines={[
            'And along the bottom: the schools, the workshops, and the nonprofits',
            'where most of the actual learning happens.',
          ]} anchor="middle" size={13} />
      </g>

      {/* Always-on focal labels */}
      {showLabels && (
        <g style={{ pointerEvents: 'none' }}>
          <LabelCallout x={2455} y={596} dx={-130} dy={-140} text="local workforce board" anchor="end" />
          <LabelCallout x={2785} y={530} dx={-160} dy={-130} text="the jobs office (AJC)" anchor="end" />
          <LabelCallout x={2570} y={886} dx={0} dy={-100} text="community college" anchor="middle" />
          <LabelCallout x={3225} y={580} dx={-30} dy={-150} text="the factory" anchor="end" />
          <LabelCallout x={3385} y={580} dx={50} dy={-150} text="the hospital" anchor="start" />
        </g>
      )}
    </g>
  );
}

window.SceneLocal = SceneLocal;
