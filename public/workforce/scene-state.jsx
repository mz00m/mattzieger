/* ============================================================
   STATE CAPITAL scene  (x 1100 – 2200)
   Governor on the hill, State Board with the round-table cutaway,
   state agencies along a street.
   ============================================================ */

function SceneState({ groundY, hoveredId, selectedId, dimmedSet, onPick, onHover, onLeave, showLabels, showExtras }) {
  const isDim = (id) => dimmedSet && !dimmedSet.has(id);
  const isSel = (id) => selectedId === id;
  const ev   = (id) => ({
    onClick: (e) => { e.stopPropagation(); onPick(id); },
    onHover: () => onHover && onHover(id),
    onLeave: () => onLeave && onLeave(id),
  });

  return (
    <g id="scene-state" data-screen-label="State Capital">

      {/* District banner */}
      <g style={{ pointerEvents: 'none' }}>
        <text x="1640" y="200" textAnchor="middle" className="district-title">
          The State Capital
        </text>
        <text x="1640" y="226" textAnchor="middle" className="narrative" style={{ fontSize: 14 }}>
          where the governor splits the money among the local boards
        </text>
      </g>

      {/* Hill behind the governor's mansion */}
      <g style={{ pointerEvents: 'none' }}>
        <ellipse cx={1410} cy={groundY + 14} rx={260} ry={86} fill="var(--grass)" />
        <ellipse cx={1410} cy={groundY + 14} rx={260} ry={86} fill="none"
                 stroke="var(--ink-soft)" strokeWidth="1.2" opacity="0.4" />
        {/* Path up the hill */}
        <path d={`M ${1410} ${groundY + 80} Q ${1410} ${groundY + 50} ${1380} ${groundY - 30}`}
              fill="none" stroke="var(--tan-deep)" strokeWidth="9" />
        <path d={`M ${1410} ${groundY + 80} Q ${1410} ${groundY + 50} ${1380} ${groundY - 30}`}
              fill="none" stroke="var(--paper)" strokeWidth="6" />
      </g>

      {/* ====== GOVERNOR'S MANSION — atop the hill, central ====== */}
      <Building x={1280} y={400} w={140} h={120} body="var(--paper)"
                roof="var(--scarry-red)" roofShape="mansard"
                sign="GOVERNOR" signColor="var(--scarry-red-deep)" signTextColor="var(--paper)"
                entity="governor" selected={isSel('governor')} dimmed={isDim('governor')}
                {...ev('governor')}>
        {/* Columns */}
        {[0,1,2].map(i => (
          <rect key={i} x={30 + i * 32} y="22" width="8" height="92"
                fill="var(--paper)" stroke="var(--ink)" strokeWidth="1" />
        ))}
        {/* Pediment */}
        <polygon points="22,22 70,4 118,22" fill="var(--paper-shadow)"
                 stroke="var(--ink)" strokeWidth="1.6" />
        <Flag x={70} y={-10} color="var(--scarry-blue)" />
        {/* Cutaway — governor at desk */}
        <CutawayWindow x={50} y={50} w={40} h={42}>
          <g transform="translate(20 26)">
            <Character species="bear" costume="var(--scarry-blue-deep)" hat="cap" fur="var(--brown)" size={0.5} prop="clipboard" />
          </g>
          <rect x="2" y="20" width="36" height="3" fill="var(--brown)" />
        </CutawayWindow>
        <Door x={62} y={86} w={16} h={28} color="var(--brown-deep)" />
        {/* Steps down to the path */}
        <rect x="20" y="115" width="100" height="4" fill="var(--paper-shadow)" stroke="var(--ink)" strokeWidth="1" />
      </Building>

      {/* ====== STATE LEGISLATURE — left of state agencies ====== */}
      <Building x={1130} y={560} w={120} h={140} body="var(--stone)" hatch="url(#stone-pat)"
                roof="var(--stone-deep)" roofShape="dome"
                sign="LEGISLATURE" signColor="var(--scarry-yellow)" signTextColor="var(--ink)"
                entity="state-legislature" selected={isSel('state-legislature')} dimmed={isDim('state-legislature')}
                {...ev('state-legislature')}>
        {/* Columns */}
        {[0,1,2,3].map(i => (
          <rect key={i} x={14 + i * 26} y="22" width="7" height="100"
                fill="var(--paper)" stroke="var(--ink)" strokeWidth="0.9" />
        ))}
        {/* Cutaway — debate */}
        <CutawayWindow x={28} y={48} w={64} h={42}>
          <g transform="translate(18 28)">
            <Character species="cat" costume="var(--scarry-red)" fur="var(--tan)" size={0.45} />
          </g>
          <g transform="translate(46 28)">
            <Character species="pig" costume="var(--scarry-blue)" fur="var(--scarry-pink)" size={0.45} mirror />
          </g>
        </CutawayWindow>
        <rect x="-8" y="135" width="136" height="5" fill="var(--stone-deep)" stroke="var(--ink)" strokeWidth="1" />
      </Building>

      {/* ====== STATE WORKFORCE BOARD — the round-table house ====== */}
      <Building x={1440} y={540} w={170} h={160} body="var(--scarry-green)"
                roof="var(--scarry-green-deep)" roofShape="gable"
                sign="STATE WORKFORCE BOARD" signColor="var(--paper)"
                entity="state-board" selected={isSel('state-board')} dimmed={isDim('state-board')}
                {...ev('state-board')}>
        {/* Big cutaway showing the round table */}
        <CutawayWindow x={20} y={42} w={130} h={70}>
          {/* Round table */}
          <ellipse cx="65" cy="48" rx="44" ry="18" fill="var(--brown)" stroke="var(--ink)" strokeWidth="1.4" />
          <ellipse cx="65" cy="46" rx="42" ry="16" fill="var(--brown-deep)" />
          {/* Board members around the table */}
          <g transform="translate(25 38)"><Character species="bear" costume="var(--scarry-red)" fur="var(--brown)" size={0.4} hat="hardhat" /></g>
          <g transform="translate(45 30)"><Character species="cat" costume="var(--scarry-yellow)" fur="var(--tan)" size={0.4} hat="cap" /></g>
          <g transform="translate(65 28)"><Character species="owl" costume="var(--scarry-blue)" fur="var(--tan)" size={0.4} hat="cardigan" /></g>
          <g transform="translate(85 30)"><Character species="fox" costume="var(--scarry-blue-deep)" fur="var(--scarry-orange)" size={0.4} hat="cap" /></g>
          <g transform="translate(105 38)"><Character species="pig" costume="var(--scarry-pink)" fur="var(--scarry-pink)" size={0.4} /></g>
        </CutawayWindow>
        {/* Door */}
        <Door x={72} y={120} w={22} h={36} color="var(--brown)" />
        {/* Sign post: "51% business" */}
        <g transform="translate(135 130)">
          <rect x="-26" y="-12" width="52" height="14" fill="var(--paper)" stroke="var(--ink)" strokeWidth="1" />
          <text x="0" y="-2" textAnchor="middle" style={{ fontFamily: 'Caveat, cursive', fontSize: 10, fill: 'var(--ink)' }}>51% business</text>
          <line x1="0" y1="2" x2="0" y2="12" stroke="var(--ink)" strokeWidth="1" />
        </g>
      </Building>

      {/* ====== State agency row across the bottom band ====== */}

      {/* STATE WORKFORCE AGENCY */}
      <Building x={1310} y={720} w={140} h={90} body="var(--scarry-blue)"
                roof="var(--scarry-blue-deep)" roofShape="flat"
                sign="STATE LABOR DEPT." signColor="var(--paper)"
                entity="state-agency" selected={isSel('state-agency')} dimmed={isDim('state-agency')}
                {...ev('state-agency')}>
        {/* Cutaway — administrator at desk */}
        <CutawayWindow x={14} y={20} w={40} h={42}>
          <g transform="translate(20 26)">
            <Character species="fox" costume="var(--scarry-blue-deep)" fur="var(--scarry-orange)" size={0.5} prop="clipboard" hat="cap" />
          </g>
          <rect x="2" y="20" width="36" height="3" fill="var(--brown)" />
        </CutawayWindow>
        <Win x={64} y={20} w={22} h={28} color="var(--scarry-yellow)" />
        <Win x={94} y={20} w={22} h={28} color="var(--scarry-yellow)" />
        <Door x={56} y={56} w={20} h={32} color="var(--brown)" />
      </Building>

      {/* STATE EDUCATION AGENCY */}
      <Building x={1480} y={740} w={120} h={70} body="var(--scarry-pink)"
                roof="var(--scarry-red)" roofShape="gable"
                sign="STATE EDUCATION" signColor="var(--paper)"
                entity="state-ed" selected={isSel('state-ed')} dimmed={isDim('state-ed')}
                {...ev('state-ed')}>
        {/* Bell */}
        <g transform="translate(60 -14)">
          <rect x="-5" y="0" width="10" height="10" fill="var(--paper)" stroke="var(--ink)" strokeWidth="1" />
          <polygon points="-7,0 0,-10 7,0" fill="var(--scarry-red-deep)" stroke="var(--ink)" strokeWidth="1.2" />
        </g>
        <Win x={12} y={18} w={22} h={28} color="var(--sky)" />
        <Win x={84} y={18} w={22} h={28} color="var(--sky)" />
        <Door x={50} y={26} w={20} h={36} color="var(--brown)" />
      </Building>

      {/* STATE HIGHER ED */}
      <Building x={1660} y={750} w={120} h={60} body="var(--paper-shadow)"
                roof="var(--scarry-blue)" roofShape="mansard"
                sign="HIGHER ED COMMISSION" signColor="var(--scarry-blue)" signTextColor="var(--paper)"
                entity="state-higher-ed" selected={isSel('state-higher-ed')} dimmed={isDim('state-higher-ed')}
                {...ev('state-higher-ed')}>
        <Win x={12} y={18} w={20} h={26} color="var(--sky)" />
        <Win x={42} y={18} w={20} h={26} color="var(--sky)" />
        <Win x={72} y={18} w={20} h={26} color="var(--sky)" />
        <Door x={100} y={22} w={16} h={34} color="var(--brown)" />
      </Building>

      {/* STATE VR */}
      <Building x={1830} y={720} w={100} h={80} body="var(--scarry-green)"
                roof="var(--scarry-green-deep)" roofShape="flat"
                sign="STATE VR" signColor="var(--paper)"
                entity="state-vr" selected={isSel('state-vr')} dimmed={isDim('state-vr')}
                {...ev('state-vr')}>
        <Win x={10} y={18} w={18} h={24} color="var(--sky)" />
        <Win x={38} y={18} w={18} h={24} color="var(--sky)" />
        <Win x={66} y={18} w={18} h={24} color="var(--sky)" />
        {/* Ramp */}
        <polygon points="-16,76 -2,76 -2,60" fill="var(--paper-shadow)"
                 stroke="var(--ink)" strokeWidth="1.4" />
        <Door x={42} y={46} w={16} h={32} color="var(--brown)" />
      </Building>

      {/* STATE SAA */}
      <Building x={1970} y={740} w={100} h={60} body="var(--scarry-orange)"
                roof="var(--brown-deep)" roofShape="gable"
                sign="STATE APPRENTICE" signColor="var(--paper)"
                entity="state-saa" selected={isSel('state-saa')} dimmed={isDim('state-saa')}
                {...ev('state-saa')}>
        <Win x={10} y={16} w={18} h={24} color="var(--sky)" />
        <Win x={38} y={16} w={18} h={24} color="var(--sky)" />
        <Door x={68} y={22} w={16} h={34} color="var(--brown)" />
      </Building>

      {/* STATE HS / TANF */}
      <Building x={2090} y={730} w={100} h={70} body="var(--scarry-pink)"
                roof="var(--scarry-red)" roofShape="flat"
                sign="STATE HUMAN SVCS" signColor="var(--paper)"
                entity="state-hs" selected={isSel('state-hs')} dimmed={isDim('state-hs')}
                {...ev('state-hs')}>
        <Win x={10} y={16} w={20} h={26} color="var(--sky)" />
        <Win x={40} y={16} w={20} h={26} color="var(--sky)" />
        <Door x={70} y={28} w={18} h={36} color="var(--brown)" />
      </Building>

      {/* ====== STREET LIFE — extras ====== */}
      {showExtras && (
        <g style={{ pointerEvents: 'none' }}>
          {/* Trees and lamps */}
          <Tree x={1170} y={groundY + 80} scale={0.85} kind="pine" />
          <Tree x={1290} y={groundY + 82} scale={0.85} />
          <Tree x={1620} y={groundY + 78} scale={0.9} kind="pine" />
          <Tree x={1900} y={groundY + 80} scale={0.85} />
          <Tree x={2150} y={groundY + 80} scale={0.85} kind="pine" />

          {/* Visitors */}
          <g transform={`translate(1230 ${groundY + 84})`}><Character species="cat" costume="var(--scarry-blue)" fur="var(--tan)" size={0.7} walking /></g>
          <g transform={`translate(1280 ${groundY + 84})`}><Character species="dog" costume="var(--scarry-red)" fur="var(--tan-deep)" size={0.7} mirror walking /></g>
          <g transform={`translate(1500 ${groundY + 90})`}><Character species="fox" costume="var(--scarry-blue-deep)" fur="var(--scarry-orange)" prop="briefcase" hat="cap" size={0.75} /></g>
          <g transform={`translate(1570 ${groundY + 90})`}><Character species="bear" costume="var(--scarry-yellow)" fur="var(--brown)" prop="clipboard" size={0.75} mirror /></g>

          {/* Two characters chatting on a step */}
          <g transform={`translate(1800 ${groundY + 90})`}>
            <Character species="pig" costume="var(--scarry-pink)" fur="var(--scarry-pink)" size={0.7} />
          </g>
          <g transform={`translate(1830 ${groundY + 90})`}>
            <Character species="rabbit" costume="var(--scarry-green)" fur="var(--paper-shadow)" mirror size={0.7} />
          </g>

          {/* Bicycle messenger */}
          <g transform={`translate(2010 ${groundY + 86})`}>
            <circle cx="-7" cy="6" r="5" fill="none" stroke="var(--ink)" strokeWidth="1.5" />
            <circle cx="7"  cy="6" r="5" fill="none" stroke="var(--ink)" strokeWidth="1.5" />
            <line x1="-7" y1="6" x2="3" y2="-2" stroke="var(--ink)" strokeWidth="1.5" />
            <line x1="7" y1="6" x2="3" y2="-2" stroke="var(--ink)" strokeWidth="1.5" />
            <line x1="3" y1="-2" x2="0" y2="-6" stroke="var(--ink)" strokeWidth="1.5" />
            <g transform="translate(0 -6)"><Character species="rabbit" costume="var(--scarry-red)" fur="var(--paper-shadow)" size={0.55} hat="cap" /></g>
          </g>

          {/* Garbage being swept by a janitor */}
          <g transform={`translate(2100 ${groundY + 92})`}>
            <Character species="dog" costume="var(--scarry-blue)" fur="var(--tan)" size={0.7} prop="broom" mirror />
          </g>

          {/* Bench with someone reading */}
          <Bench x={1450} y={groundY + 92} />
          <g transform={`translate(1450 ${groundY + 84})`}>
            <Character species="owl" costume="var(--scarry-blue)" fur="var(--tan)" size={0.6} hat="cardigan" prop="book" />
          </g>

          <Mailbox x={1380} y={groundY + 88} />
          <Streetlight x={1720} y={groundY + 86} />
          <Hydrant x={1990} y={groundY + 88} />

          {/* State seal on a sign */}
          <g transform={`translate(1430 ${groundY + 30})`}>
            <line x1="0" y1="0" x2="0" y2="40" stroke="var(--brown)" strokeWidth="2" />
            <circle cx="0" cy="0" r="14" fill="var(--paper)" stroke="var(--ink)" strokeWidth="1.5" />
            <text x="0" y="4" textAnchor="middle" style={{ fontFamily: 'DM Serif Display, serif', fontSize: 11, fill: 'var(--ink)' }}>★</text>
          </g>

          {/* Hidden ladybug */}
          <HiddenLadybug x={1640} y={460} rot={20} />
        </g>
      )}

      {/* Narrative */}
      <g style={{ pointerEvents: 'none' }}>
        <Narrative x={1700} y={420}
          lines={[
            'The Governor draws up a plan,',
            'the State Board argues about it,',
            'and the local boards spend it.',
          ]} />
      </g>

      {/* Always-on focal labels */}
      {showLabels && (
        <g style={{ pointerEvents: 'none' }}>
          <LabelCallout x={1335} y={478} dx={-100} dy={-100} text="the governor" anchor="end" />
          <LabelCallout x={1530} y={605} dx={130} dy={-180} text="state workforce board" anchor="start" />
          <LabelCallout x={1380} y={770} dx={-110} dy={-220} text="state labor dept." anchor="end" />
        </g>
      )}
    </g>
  );
}

window.SceneState = SceneState;
