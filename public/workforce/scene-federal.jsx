/* ============================================================
   FEDERAL MALL scene  (x 0 – 1100)
   Capitol on the hill, DOL on the left, ED on the right,
   HHS + Commerce on the far right. Smaller agency wings nearby.
   ============================================================ */

function SceneFederal({ groundY, hoveredId, selectedId, dimmedSet, onPick, onHover, onLeave, showLabels, showExtras }) {
  const isDim = (id) => dimmedSet && !dimmedSet.has(id);
  const isSel = (id) => selectedId === id;
  const ev   = (id) => ({
    onClick:  (e) => { e.stopPropagation(); onPick(id); },
    onHover:  () => onHover && onHover(id),
    onLeave:  () => onLeave && onLeave(id),
  });
  const E = window.ENTITIES;

  return (
    <g id="scene-federal" data-screen-label="Federal Mall">
      {/* District banner */}
      <g style={{ pointerEvents: 'none' }}>
        <text x="550" y="200" textAnchor="middle" className="district-title">
          The Federal Mall
        </text>
        <text x="550" y="226" textAnchor="middle" className="narrative" style={{ fontSize: 14 }}>
          where the laws are made and the money trucks are loaded up
        </text>
      </g>

      {/* The Mall greenway — long green band */}
      <g style={{ pointerEvents: 'none' }}>
        <rect x="80" y={groundY + 40} width="990" height="40" fill="var(--grass-deep)" opacity="0.55" />
        <rect x="80" y={groundY + 38} width="990" height="3" fill="var(--ink-soft)" opacity="0.3" />
        {/* Reflecting pool */}
        <rect x="430" y={groundY + 50} width="260" height="22" rx="4"
              fill="var(--sky)" stroke="var(--ink)" strokeWidth="1.5" />
      </g>

      {/* ====== CONGRESS — the big domed capitol, center back ====== */}
      <Building x={460} y={400} w={180} h={140} body="var(--stone)" hatch="url(#stone-pat)"
                roof="var(--stone-deep)" roofShape="dome"
                outline="var(--ink)" strokeWidth="3"
                sign="CONGRESS" signColor="var(--paper)"
                entity="congress" selected={isSel('congress')} dimmed={isDim('congress')}
                {...ev('congress')}>
        {/* Columns */}
        {[0,1,2,3,4,5].map(i => (
          <rect key={i} x={30 + i * 24} y="32" width="10" height="92"
                fill="var(--paper)" stroke="var(--ink)" strokeWidth="1.2" />
        ))}
        {/* Steps */}
        <rect x="-10" y="135" width="200" height="6" fill="var(--stone-deep)"
              stroke="var(--ink)" strokeWidth="1" />
        <rect x="-16" y="139" width="212" height="6" fill="var(--stone-deep)"
              stroke="var(--ink)" strokeWidth="1" />
        {/* Pediment */}
        <polygon points="20,32 90,5 160,32" fill="var(--stone)"
                 stroke="var(--ink)" strokeWidth="2" />
        {/* Tiny flag */}
        <g transform="translate(90 -82)"><Flag x={0} y={0} color="var(--scarry-red)" /></g>

        {/* Cutaway windows inside columns — debate happening */}
        <CutawayWindow x={66} y={56} w={48} h={50}>
          <g transform="translate(14 32)">
            <Character species="owl" costume="var(--ink)" hat="none" size={0.5} fur="var(--tan)" />
          </g>
          <g transform="translate(32 32)">
            <Character species="fox" costume="var(--scarry-red)" hat="none" size={0.5} fur="var(--scarry-orange)" />
          </g>
          <line x1="6" y1="20" x2="42" y2="20" stroke="var(--brown)" strokeWidth="1.5" />
        </CutawayWindow>
      </Building>

      {/* Building façade label up near dome */}

      {/* ====== DEPT OF LABOR — left side ====== */}
      <Building x={180} y={560} w={170} h={140} body="var(--stone)" hatch="url(#stone-pat)"
                roof="var(--stone-deep)" roofShape="mansard"
                sign="DEPT. OF LABOR" signColor="var(--scarry-blue)" signTextColor="var(--paper)"
                entity="dol" selected={isSel('dol')} dimmed={isDim('dol')}
                {...ev('dol')}>
        {/* columns */}
        {[0,1,2,3].map(i => (
          <rect key={i} x={20 + i * 36} y="26" width="9" height="100"
                fill="var(--paper)" stroke="var(--ink)" strokeWidth="1" />
        ))}
        <rect x="-6" y="135" width="182" height="5" fill="var(--stone-deep)" stroke="var(--ink)" strokeWidth="1" />

        {/* Cutaway — policy official at desk */}
        <CutawayWindow x={45} y={48} w={36} h={42}>
          <g transform="translate(18 26)">
            <Character species="cat" costume="var(--scarry-blue)" fur="var(--tan)" size={0.5} prop="clipboard" />
          </g>
          <rect x="2" y="20" width="32" height="3" fill="var(--brown)" />
        </CutawayWindow>
        {/* Cutaway — grant officer with stacked papers */}
        <CutawayWindow x={90} y={48} w={36} h={42}>
          <g transform="translate(18 26)">
            <Character species="bear" costume="var(--scarry-red)" fur="var(--brown)" size={0.5} prop="envelope" />
          </g>
          <rect x="3" y="6" width="6" height="14" fill="var(--paper-shadow)" stroke="var(--ink)" strokeWidth="0.5" />
        </CutawayWindow>
      </Building>

      {/* ETA — adjacent wing with loading dock */}
      <Building x={370} y={620} w={130} h={80} body="var(--scarry-blue-deep)"
                roof="var(--scarry-blue-deep)" roofShape="flat"
                sign="ETA" signColor="var(--paper)"
                entity="eta" selected={isSel('eta')} dimmed={isDim('eta')}
                {...ev('eta')}>
        {/* Loading dock */}
        <rect x="60" y="40" width="60" height="38" fill="var(--brown)" stroke="var(--ink)" strokeWidth="1.5" />
        <rect x="60" y="40" width="60" height="6" fill="var(--brown-deep)" />
        {/* Stack of boxes/money on dock */}
        <rect x="70" y="48" width="12" height="10" fill="var(--scarry-green)" stroke="var(--ink)" strokeWidth="1" />
        <text x="76" y="56" textAnchor="middle" style={{ fontFamily: 'Fraunces, serif', fontSize: 7, fontWeight: 700, fill: 'var(--paper)' }}>$</text>
        <rect x="86" y="52" width="12" height="10" fill="var(--scarry-green)" stroke="var(--ink)" strokeWidth="1" />
        <text x="92" y="60" textAnchor="middle" style={{ fontFamily: 'Fraunces, serif', fontSize: 7, fontWeight: 700, fill: 'var(--paper)' }}>$</text>
        {/* Windows */}
        <Win x={12} y={22} w={20} h={24} color="var(--scarry-yellow)" />
        <Win x={38} y={22} w={20} h={24} color="var(--scarry-yellow)" />
        {/* worker inside */}
        <g transform="translate(28 50)">
          <Character species="rabbit" costume="var(--scarry-yellow)" hat="cap" size={0.45} fur="var(--paper-shadow)" />
        </g>
      </Building>

      {/* OA — small office to left of DOL */}
      <Building x={70} y={650} w={90} h={70} body="var(--scarry-orange)"
                roof="var(--brown-deep)" roofShape="gable"
                sign="APPRENTICE OFFICE" signTextColor="var(--paper)" signColor="var(--brown-deep)"
                entity="oa" selected={isSel('oa')} dimmed={isDim('oa')}
                {...ev('oa')}>
        <Win x={12} y={20} w={20} h={26} color="var(--sky)" />
        <Win x={42} y={20} w={20} h={26} color="var(--sky)" />
        <Door x={70} y={32} w={14} h={28} color="var(--brown)" />
      </Building>

      {/* BLS — library/observatory */}
      <Building x={-10} y={690} w={70} h={70} body="var(--paper-shadow)"
                roof="var(--scarry-blue-deep)" roofShape="dome"
                sign="BLS" signColor="var(--scarry-blue)" signTextColor="var(--paper)"
                entity="bls" selected={isSel('bls')} dimmed={isDim('bls')}
                {...ev('bls')}>
        <CutawayWindow x={14} y={20} w={42} h={36}>
          <g transform="translate(20 22)">
            <Character species="mouse" costume="var(--scarry-blue)" hat="cardigan" fur="var(--paper-shadow)" size={0.45} prop="book" />
          </g>
        </CutawayWindow>
      </Building>

      {/* VETS — small annex right of ETA */}
      <Building x={380} y={700} w={70} h={50} body="var(--scarry-red-deep)"
                roof="var(--scarry-red-deep)" roofShape="flat"
                sign="VETS" signColor="var(--paper)"
                entity="vets" selected={isSel('vets')} dimmed={isDim('vets')}
                {...ev('vets')}>
        <Win x={10} y={14} w={16} h={20} color="var(--sky)" />
        <Win x={36} y={14} w={16} h={20} color="var(--sky)" />
      </Building>

      {/* ====== DEPT OF EDUCATION — right side ====== */}
      <Building x={660} y={560} w={170} h={140} body="var(--stone)" hatch="url(#stone-pat)"
                roof="var(--stone-deep)" roofShape="mansard"
                sign="DEPT. OF EDUCATION" signColor="var(--scarry-purple)" signTextColor="var(--paper)"
                entity="ed" selected={isSel('ed')} dimmed={isDim('ed')}
                {...ev('ed')}>
        {/* Bell tower */}
        <g transform="translate(74 -36)">
          <rect x="0" y="0" width="24" height="40" fill="var(--paper-shadow)" stroke="var(--ink)" strokeWidth="2" />
          <polygon points="-4,0 12,-18 28,0" fill="var(--scarry-red)" stroke="var(--ink)" strokeWidth="2" />
          <rect x="8" y="12" width="8" height="14" fill="var(--scarry-yellow)" stroke="var(--ink)" strokeWidth="1.5" />
          <text x="12" y="24" textAnchor="middle" style={{ fontFamily: 'Caveat, cursive', fontSize: 12, fontWeight: 600, fill: 'var(--ink)' }}>♪</text>
        </g>
        {/* columns */}
        {[0,1,2,3].map(i => (
          <rect key={i} x={20 + i * 36} y="26" width="9" height="100"
                fill="var(--paper)" stroke="var(--ink)" strokeWidth="1" />
        ))}
        <rect x="-6" y="135" width="182" height="5" fill="var(--stone-deep)" stroke="var(--ink)" strokeWidth="1" />

        {/* Cutaway — Pell envelope sorter */}
        <CutawayWindow x={50} y={48} w={36} h={42}>
          <g transform="translate(18 26)">
            <Character species="rabbit" costume="var(--scarry-purple)" fur="var(--paper-shadow)" size={0.5} prop="envelope" />
          </g>
          <rect x="2" y="6" width="32" height="3" fill="var(--brown)" />
          <rect x="6" y="3" width="6" height="3" fill="var(--paper-shadow)" stroke="var(--ink)" strokeWidth="0.4" />
        </CutawayWindow>
        {/* Cutaway — teacher / OCTAE */}
        <CutawayWindow x={94} y={48} w={36} h={42}>
          <g transform="translate(18 26)">
            <Character species="owl" costume="var(--scarry-orange)" fur="var(--tan)" size={0.5} hat="cardigan" />
          </g>
        </CutawayWindow>
      </Building>

      {/* OCTAE — small wing left of ED */}
      <Building x={560} y={650} w={90} h={70} body="var(--scarry-orange)"
                roof="var(--brown-deep)" roofShape="gable"
                sign="OCTAE" signColor="var(--paper)"
                entity="octae" selected={isSel('octae')} dimmed={isDim('octae')}
                {...ev('octae')}>
        <Win x={12} y={20} w={20} h={26} color="var(--sky)" />
        <Win x={42} y={20} w={20} h={26} color="var(--sky)" />
        <Door x={70} y={32} w={14} h={28} color="var(--brown)" />
      </Building>

      {/* FSA — pell envelope office (small annex) */}
      <Building x={730} y={680} w={80} h={50} body="var(--scarry-purple)"
                roof="var(--scarry-purple)" roofShape="flat"
                sign="FED. STUDENT AID" signColor="var(--paper)"
                entity="fsa" selected={isSel('fsa')} dimmed={isDim('fsa')}
                {...ev('fsa')}>
        <Win x={10} y={14} w={16} h={20} color="var(--scarry-yellow)" mullion={false} />
        {/* Stack of envelopes on table */}
        <rect x="34" y="22" width="14" height="3" fill="var(--paper)" stroke="var(--ink)" strokeWidth="0.6" />
        <rect x="36" y="18" width="12" height="3" fill="var(--paper)" stroke="var(--ink)" strokeWidth="0.6" />
        <rect x="34" y="14" width="14" height="3" fill="var(--paper)" stroke="var(--ink)" strokeWidth="0.6" />
        <Door x={56} y={20} w={14} h={30} color="var(--brown)" />
      </Building>

      {/* RSA — voc rehab annex right of ED */}
      <Building x={840} y={720} w={70} h={50} body="var(--scarry-green-deep)"
                roof="var(--scarry-green-deep)" roofShape="flat"
                sign="RSA" signColor="var(--paper)"
                entity="rsa" selected={isSel('rsa')} dimmed={isDim('rsa')}
                {...ev('rsa')}>
        <Win x={10} y={12} w={16} h={20} color="var(--sky)" />
        <Win x={36} y={12} w={16} h={20} color="var(--sky)" />
        {/* Ramp */}
        <polygon points="-12,50 -2,50 -2,40" fill="var(--paper-shadow)"
                 stroke="var(--ink)" strokeWidth="1.5" />
      </Building>

      {/* ====== HHS ====== */}
      <Building x={890} y={620} w={120} h={100} body="var(--paper)"
                roof="var(--scarry-red)" roofShape="gable"
                sign="HHS" signColor="var(--scarry-red)" signTextColor="var(--paper)"
                entity="hhs" selected={isSel('hhs')} dimmed={isDim('hhs')}
                {...ev('hhs')}>
        {/* Red cross plaque */}
        <g transform="translate(60 30)">
          <rect x="-10" y="-10" width="20" height="20" fill="var(--paper)" stroke="var(--ink)" strokeWidth="1.5" />
          <rect x="-3" y="-8" width="6" height="16" fill="var(--scarry-red)" />
          <rect x="-8" y="-3" width="16" height="6" fill="var(--scarry-red)" />
        </g>
        <Win x={12} y={56} w={22} h={28} color="var(--sky)" />
        <Win x={86} y={56} w={22} h={28} color="var(--sky)" />
        <Door x={50} y={62} w={20} h={32} color="var(--brown)" />
      </Building>

      {/* ====== COMMERCE ====== */}
      <Building x={1000} y={650} w={90} h={70} body="var(--brick)" hatch="url(#brick-pat)"
                roof="var(--brick-deep)" roofShape="flat"
                sign="COMMERCE" signColor="var(--paper)"
                entity="commerce" selected={isSel('commerce')} dimmed={isDim('commerce')}
                {...ev('commerce')}>
        {/* Smokestack on side */}
        <g transform="translate(76 -30)">
          <rect x="0" y="0" width="10" height="30" fill="var(--brick-deep)" stroke="var(--ink)" strokeWidth="1.5" />
          <ellipse cx="5" cy="-3" rx="8" ry="4" fill="#aaa" opacity="0.7" />
          <ellipse cx="0" cy="-8" rx="6" ry="3" fill="#aaa" opacity="0.5" />
        </g>
        <Win x={10} y={20} w={18} h={22} color="var(--scarry-yellow)" />
        <Win x={36} y={20} w={18} h={22} color="var(--scarry-yellow)" />
      </Building>

      {/* ====== STREET LIFE — extras ====== */}
      {showExtras && (
        <g style={{ pointerEvents: 'none' }}>
          {/* Trees along the mall */}
          <Tree x={120} y={groundY + 80} scale={0.85} />
          <Tree x={420} y={groundY + 78} scale={0.95} />
          <Tree x={730} y={groundY + 80} scale={0.85} />
          <Tree x={1040} y={groundY + 80} scale={0.8} />
          {/* Visitors strolling on the mall */}
          <g transform={`translate(280 ${groundY + 80})`}><Character species="bear" costume="var(--scarry-red)" fur="var(--brown)" size={0.7} walking /></g>
          <g transform={`translate(330 ${groundY + 80})`}><Character species="mouse" costume="var(--scarry-pink)" fur="var(--paper-shadow)" size={0.7} mirror walking /></g>
          <g transform={`translate(560 ${groundY + 80})`}><Character species="cat" costume="var(--scarry-yellow)" fur="var(--tan)" size={0.75} prop="briefcase" /></g>
          <g transform={`translate(630 ${groundY + 80})`}><Character species="fox" costume="var(--scarry-blue-deep)" fur="var(--scarry-orange)" size={0.75} prop="briefcase" hat="cap" /></g>
          <g transform={`translate(810 ${groundY + 80})`}><Character species="dog" costume="var(--scarry-blue)" fur="var(--tan-deep)" size={0.7} walking /></g>
          <g transform={`translate(950 ${groundY + 80})`}><Character species="pig" costume="var(--scarry-pink)" fur="var(--scarry-pink)" size={0.7} walking mirror /></g>

          {/* Pedestal speaker — character on a soapbox near Congress */}
          <g transform={`translate(640 ${groundY + 30})`}>
            <rect x="-12" y="0" width="24" height="14" fill="var(--brown)" stroke="var(--ink)" strokeWidth="1.5" />
            <g transform="translate(0 -2)">
              <Character species="fox" costume="var(--scarry-blue-deep)" hat="cap" fur="var(--scarry-orange)" size={0.65} />
            </g>
          </g>

          {/* Newspaper-vendor */}
          <g transform={`translate(400 ${groundY + 90})`}>
            <rect x="-6" y="-12" width="12" height="14" fill="var(--scarry-red)" stroke="var(--ink)" strokeWidth="1.2" />
            <text x="0" y="-2" textAnchor="middle" style={{ fontFamily: 'Caveat, cursive', fontSize: 7, fill: 'var(--paper)' }}>NEWS</text>
            <g transform="translate(15 0)"><Character species="cat" costume="var(--scarry-yellow)" fur="var(--paper-shadow)" size={0.7} /></g>
          </g>

          {/* Pigeon flock */}
          <g transform={`translate(580 ${groundY + 95})`}>
            <ellipse cx="0" cy="0" rx="3" ry="1.5" fill="var(--ink-soft)" />
            <ellipse cx="6" cy="0" rx="3" ry="1.5" fill="var(--ink-soft)" />
            <ellipse cx="3" cy="-3" rx="3" ry="1.5" fill="var(--ink-soft)" />
            <ellipse cx="12" cy="-1" rx="3" ry="1.5" fill="var(--ink-soft)" />
          </g>

          {/* Stuck balloon snagged on Congress dome */}
          <g transform="translate(550 360)">
            <line x1="0" y1="0" x2="0" y2="-22" stroke="var(--ink)" strokeWidth="0.8" />
            <ellipse cx="0" cy="-28" rx="5" ry="6" fill="var(--scarry-red)" stroke="var(--ink)" strokeWidth="1" />
          </g>

          {/* Hydrants & mailboxes */}
          <Hydrant x={210} y={groundY + 88} />
          <Mailbox x={490} y={groundY + 88} />
          <Streetlight x={870} y={groundY + 86} />

          {/* Hidden ladybug */}
          <HiddenLadybug x={88} y={groundY + 64} rot={-15} />
        </g>
      )}

      {/* Narrative block in the sky */}
      <g style={{ pointerEvents: 'none' }}>
        <Narrative x={170} y={310}
          lines={[
            'The Department of Labor sends money',
            'to the states. The states send it',
            'to the local boards.',
          ]} />
      </g>

      {/* Always-on labels on focal anchors */}
      {showLabels && (
        <g style={{ pointerEvents: 'none' }}>
          <LabelCallout x={550} y={478} dx={-110} dy={-110} text="congress" anchor="end" />
          <LabelCallout x={245} y={618} dx={-50} dy={-110} text="department of labor" anchor="end" />
          <LabelCallout x={720} y={618} dx={60} dy={-110} text="department of education" anchor="start" />
          <LabelCallout x={950} y={650} dx={70} dy={-120} text="health & human services" anchor="start" />
        </g>
      )}
    </g>
  );
}

window.SceneFederal = SceneFederal;
