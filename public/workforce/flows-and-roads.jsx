/* ============================================================
   ROADS + FUNDING-FLOW VEHICLES + JOB-SEEKER JOURNEY
   ============================================================ */

/* ---------- Road network ---------- */
/* One main road runs across all three districts; side roads
   inside each district feed into it. Roads are drawn beneath
   buildings (rendered before scenes in the SVG tree). */

const ROAD_Y = 1010;  // main road centerline
const ROAD_W = 36;    // road width

function Roads({ groundY }) {
  return (
    <g id="roads" style={{ pointerEvents: 'none' }}>
      {/* Main road across the entire town */}
      <path
        d={`M -50 ${ROAD_Y} L 4100 ${ROAD_Y}`}
        stroke="var(--ink-soft)" strokeWidth={ROAD_W + 4} fill="none" />
      <path
        d={`M -50 ${ROAD_Y} L 4100 ${ROAD_Y}`}
        stroke="var(--paper-shadow)" strokeWidth={ROAD_W} fill="none" />
      <path
        d={`M -50 ${ROAD_Y} L 4100 ${ROAD_Y}`}
        stroke="var(--scarry-yellow)" strokeWidth="2" fill="none"
        strokeDasharray="22 18" opacity="0.85" />

      {/* Side roads inside each district — connect main road up to
          mid-tier buildings */}
      {/* Federal: connects up to the Mall greenway */}
      <path d={`M 280 ${ROAD_Y} L 280 ${groundY + 40}`} stroke="var(--ink-soft)" strokeWidth={28} fill="none" />
      <path d={`M 280 ${ROAD_Y} L 280 ${groundY + 40}`} stroke="var(--paper-shadow)" strokeWidth={24} fill="none" />
      <path d={`M 750 ${ROAD_Y} L 750 ${groundY + 40}`} stroke="var(--ink-soft)" strokeWidth={28} fill="none" />
      <path d={`M 750 ${ROAD_Y} L 750 ${groundY + 40}`} stroke="var(--paper-shadow)" strokeWidth={24} fill="none" />

      {/* State */}
      <path d={`M 1380 ${ROAD_Y} L 1380 ${groundY + 60}`} stroke="var(--ink-soft)" strokeWidth={28} fill="none" />
      <path d={`M 1380 ${ROAD_Y} L 1380 ${groundY + 60}`} stroke="var(--paper-shadow)" strokeWidth={24} fill="none" />
      <path d={`M 1730 ${ROAD_Y} L 1730 ${groundY + 60}`} stroke="var(--ink-soft)" strokeWidth={28} fill="none" />
      <path d={`M 1730 ${ROAD_Y} L 1730 ${groundY + 60}`} stroke="var(--paper-shadow)" strokeWidth={24} fill="none" />

      {/* Local */}
      <path d={`M 2780 ${ROAD_Y} L 2780 ${groundY + 60}`} stroke="var(--ink-soft)" strokeWidth={28} fill="none" />
      <path d={`M 2780 ${ROAD_Y} L 2780 ${groundY + 60}`} stroke="var(--paper-shadow)" strokeWidth={24} fill="none" />
      <path d={`M 3270 ${ROAD_Y} L 3270 ${groundY + 60}`} stroke="var(--ink-soft)" strokeWidth={28} fill="none" />
      <path d={`M 3270 ${ROAD_Y} L 3270 ${groundY + 60}`} stroke="var(--paper-shadow)" strokeWidth={24} fill="none" />
      <path d={`M 3680 ${ROAD_Y} L 3680 ${groundY + 60}`} stroke="var(--ink-soft)" strokeWidth={28} fill="none" />
      <path d={`M 3680 ${ROAD_Y} L 3680 ${groundY + 60}`} stroke="var(--paper-shadow)" strokeWidth={24} fill="none" />

      {/* District signposts on the main road */}
      <RoadSign x={1090} y={ROAD_Y - 36} text="STATE →" />
      <RoadSign x={2200} y={ROAD_Y - 36} text="TOWN →" />
    </g>
  );
}

function RoadSign({ x, y, text }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <line x1="0" y1="0" x2="0" y2="36" stroke="var(--brown)" strokeWidth="2" />
      <polygon points="0,-12 60,-12 70,0 60,12 0,12"
               fill="var(--scarry-yellow)" stroke="var(--ink)" strokeWidth="1.6" />
      <text x="32" y="4" textAnchor="middle"
            style={{ fontFamily: 'Fraunces, serif', fontSize: 11, fontWeight: 700, fill: 'var(--ink)', letterSpacing: '0.06em' }}>
        {text}
      </text>
    </g>
  );
}

/* ---------- Flow connection lines + animated vehicles ---------- */
/* Each FLOW has a list of `stops` (entity ids). We build a polyline
   through those entity positions. The line is dashed and tinted with
   the flow's color; it lights up only when that flow is selected.
   Vehicles ride along that polyline.

   Stop positions: we route stops at the *front-door* level — slightly
   above the building's pos.y — so the line snakes through the town. */

function flowPolyline(flow) {
  return flow.stops
    .map(id => window.ENTITIES[id])
    .filter(Boolean)
    .map(e => ({ x: e.pos.x, y: e.pos.y + 90 }));
}

function FlowLines({ selectedFlow }) {
  if (!selectedFlow) return null;
  const flow = window.FLOWS[selectedFlow];
  if (!flow) return null;
  const pts = flowPolyline(flow);
  const d = pts.map((p, i) => `${i ? 'L' : 'M'} ${p.x} ${p.y}`).join(' ');
  return (
    <g id="flow-lines" style={{ pointerEvents: 'none' }}>
      <path d={d} stroke={flow.color} strokeWidth="6" fill="none"
            strokeDasharray="14 9" strokeLinecap="round" opacity="0.85" />
      {/* Stop dots */}
      {pts.map((p, i) => (
        <g key={i}>
          <circle cx={p.x} cy={p.y} r="9" fill="var(--paper)" stroke={flow.color} strokeWidth="3" />
          <text x={p.x} y={p.y + 4} textAnchor="middle"
                style={{ fontFamily: 'Fraunces, serif', fontWeight: 700, fontSize: 11, fill: flow.color }}>
            {i + 1}
          </text>
        </g>
      ))}
    </g>
  );
}

/* ---------- Compute position along a polyline ---------- */
function buildPath(points) {
  const segs = [];
  let total = 0;
  for (let i = 1; i < points.length; i++) {
    const a = points[i - 1], b = points[i];
    const len = Math.hypot(b.x - a.x, b.y - a.y);
    segs.push({ a, b, len, start: total });
    total += len;
  }
  return { segs, total };
}

function pointAt(path, t) {
  // t in [0,1]; loop
  const tt = ((t % 1) + 1) % 1;
  const dist = tt * path.total;
  for (const s of path.segs) {
    if (dist <= s.start + s.len) {
      const k = (dist - s.start) / s.len;
      return {
        x: s.a.x + (s.b.x - s.a.x) * k,
        y: s.a.y + (s.b.y - s.a.y) * k,
        dx: s.b.x - s.a.x,
        dy: s.b.y - s.a.y,
      };
    }
  }
  const last = path.segs[path.segs.length - 1];
  return { x: last.b.x, y: last.b.y, dx: 1, dy: 0 };
}

/* ---------- Vehicle on the main road ---------- */
/* Vehicles ride a *route* — a chain of stops on the polyline of their
   flow, sampled at the road level. We layer in a small road approach
   (drop down to ROAD_Y between stops) so the truck actually drives. */

function flowRoadPath(flow) {
  // Start at federal level, snake through buildings via main road
  const stopPts = flow.stops
    .map(id => window.ENTITIES[id])
    .filter(Boolean);
  if (!stopPts.length) return null;
  const pts = [];
  stopPts.forEach((e, i) => {
    // Approach the building from the road
    pts.push({ x: e.pos.x, y: ROAD_Y });
    // Building door
    pts.push({ x: e.pos.x, y: e.pos.y + 110 });
    // Back to the road
    pts.push({ x: e.pos.x, y: ROAD_Y });
  });
  return buildPath(pts);
}

function FlowVehicle({ flowId, t, dimmed, animate }) {
  const flow = window.FLOWS[flowId];
  const pathObj = React.useMemo(() => flowRoadPath(flow), [flowId]);
  if (!pathObj) return null;
  const pos = pointAt(pathObj, t);
  const mirror = pos.dx < 0;
  return (
    <Vehicle type={flow.vehicle} x={pos.x - 30} y={pos.y - 18}
             mirror={mirror} scale={1} dimmed={dimmed} />
  );
}

/* ---------- Job-seeker journey ---------- */
/* Rabbit with a backpack & résumé. Loops:
   manufacturer (laid off) → AJC → community college → hospital → AJC
   She walks along ground-level paths between the buildings.            */
const JOURNEY_PTS = [
  { x: 3220, y: 700, narr: 'just laid off — leaves the factory' },
  { x: 3000, y: 720, narr: 'walks to the jobs office' },
  { x: 2840, y: 700, narr: 'enters the AJC' },
  { x: 2840, y: 870, narr: 'down to the college for training' },
  { x: 2640, y: 990, narr: 'finishes a credential' },
  { x: 2840, y: 870, narr: 'back through the AJC for placement' },
  { x: 3000, y: 720, narr: 'on her way to a new job' },
  { x: 3380, y: 700, narr: 'starts at the hospital' },
];

function buildJourney() {
  return buildPath(JOURNEY_PTS);
}

function JobSeeker({ t, dimmed }) {
  const path = React.useMemo(buildJourney, []);
  const pos = pointAt(path, t);
  const mirror = pos.dx < 0;
  return (
    <g style={{ pointerEvents: 'none' }} opacity={dimmed ? 0.25 : 1}>
      {/* faint footprints trail */}
      {/* Character */}
      <g transform={`translate(${pos.x} ${pos.y})`}>
        <Character species="rabbit" costume="var(--scarry-red)" fur="var(--paper-shadow)"
                   hat="cap" prop="backpack" walking mirror={mirror} size={0.95} />
        {/* Résumé in other hand */}
        <g transform={`scale(${mirror ? -1 : 1} 1)`}>
          <rect x="11" y="-12" width="6" height="9" fill="var(--paper)"
                stroke="var(--ink)" strokeWidth="0.7" />
          <line x1="12" y1="-9" x2="16" y2="-9" stroke="var(--ink)" strokeWidth="0.4" />
          <line x1="12" y1="-7" x2="16" y2="-7" stroke="var(--ink)" strokeWidth="0.4" />
        </g>
      </g>
      {/* Pulsing yellow ring around her — she's the focal character */}
      <circle cx={pos.x} cy={pos.y - 12} r="32"
              fill="none" stroke="var(--scarry-yellow)" strokeWidth="2.5"
              strokeDasharray="4 4" opacity="0.6">
        <animate attributeName="r" values="28;36;28" dur="2.4s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.7;0.2;0.7" dur="2.4s" repeatCount="indefinite" />
      </circle>
      {/* Floating handwritten caption */}
      <g transform={`translate(${pos.x} ${pos.y - 56})`}>
        <text textAnchor="middle" style={{
          fontFamily: 'Caveat, cursive', fontSize: 16, fill: 'var(--ink-soft)',
          paintOrder: 'stroke', stroke: 'var(--paper)', strokeWidth: 3,
        }}>the job seeker</text>
      </g>
    </g>
  );
}

/* ---------- Top-level FlowsLayer: lines + vehicles ---------- */
function FlowsLayer({ selectedFlow, animate, dimmedSet }) {
  const [t, setT] = React.useState(0);
  const reqRef = React.useRef(0);
  const lastRef = React.useRef(performance.now());

  React.useEffect(() => {
    if (!animate) {
      cancelAnimationFrame(reqRef.current);
      return;
    }
    const loop = (now) => {
      const dt = (now - lastRef.current) / 1000;
      lastRef.current = now;
      setT(prev => prev + dt * 0.02); // base speed
      reqRef.current = requestAnimationFrame(loop);
    };
    lastRef.current = performance.now();
    reqRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(reqRef.current);
  }, [animate]);

  const flows = Object.keys(window.FLOWS);
  // Vehicle phases (so they don't all align)
  const PHASES = { title1: 0.05, title2: 0.4, title3: 0.7, title4: 0.2,
                   pell: 0.55, perkins: 0.35, tanf: 0.8, apprent: 0.65 };

  return (
    <g id="flows-layer">
      <FlowLines selectedFlow={selectedFlow} />
      {flows.map(fid => {
        const flowDim = selectedFlow && selectedFlow !== fid;
        return (
          <FlowVehicle key={fid} flowId={fid}
                       t={t + (PHASES[fid] || 0)}
                       dimmed={flowDim}
                       animate={animate} />
        );
      })}
      <JobSeeker t={t * 1.6 + 0.15} dimmed={!!selectedFlow} />
    </g>
  );
}

window.Roads = Roads;
window.FlowsLayer = FlowsLayer;
