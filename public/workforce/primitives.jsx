/* ============================================================
   Workforce Busytown — SVG primitives
   Reusable building, character, vehicle, and texture components.
   ============================================================ */

/* ---------- paper grain & sky ---------- */
function SceneDefs() {
  return (
    <defs>
      <pattern id="paper-grain" width="48" height="48" patternUnits="userSpaceOnUse">
        <circle cx="5"  cy="12" r="0.6" fill="#1F1A14" opacity="0.10" />
        <circle cx="18" cy="29" r="0.4" fill="#1F1A14" opacity="0.07" />
        <circle cx="33" cy="7"  r="0.5" fill="#1F1A14" opacity="0.09" />
        <circle cx="27" cy="22" r="0.35" fill="#1F1A14" opacity="0.06" />
        <circle cx="42" cy="38" r="0.55" fill="#1F1A14" opacity="0.08" />
        <circle cx="9"  cy="40" r="0.4" fill="#1F1A14" opacity="0.06" />
        <circle cx="22" cy="44" r="0.5" fill="#1F1A14" opacity="0.07" />
      </pattern>
      <pattern id="brick-pat" width="14" height="8" patternUnits="userSpaceOnUse">
        <rect width="14" height="8" fill="var(--brick)" />
        <line x1="0" y1="0" x2="14" y2="0" stroke="var(--brick-deep)" strokeWidth="0.6" />
        <line x1="0" y1="4" x2="14" y2="4" stroke="var(--brick-deep)" strokeWidth="0.6" />
        <line x1="6" y1="0" x2="6" y2="4" stroke="var(--brick-deep)" strokeWidth="0.6" />
        <line x1="0" y1="4" x2="0" y2="8" stroke="var(--brick-deep)" strokeWidth="0.6" />
      </pattern>
      <pattern id="stone-pat" width="32" height="32" patternUnits="userSpaceOnUse">
        <rect width="32" height="32" fill="var(--stone)" />
        <path d="M 0 14 Q 8 12 16 14 T 32 14" stroke="var(--stone-deep)" strokeWidth="0.7" fill="none" opacity="0.6" />
        <path d="M 0 26 Q 10 24 20 26 T 40 26" stroke="var(--stone-deep)" strokeWidth="0.7" fill="none" opacity="0.6" />
      </pattern>
      <pattern id="roof-shingle" width="20" height="10" patternUnits="userSpaceOnUse">
        <path d="M 0 0 L 10 6 L 20 0" stroke="#0006" strokeWidth="0.5" fill="none" />
        <path d="M 0 10 L 10 4 L 20 10" stroke="#0006" strokeWidth="0.5" fill="none" />
      </pattern>
      <filter id="paper-fuzz" x="-5%" y="-5%" width="110%" height="110%">
        <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="1" seed="3" />
        <feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.05 0" />
        <feComposite in2="SourceGraphic" operator="in" />
      </filter>
    </defs>
  );
}

/* ---------- Sky + ground band ---------- */
function SkyAndGround({ width, groundY }) {
  // Hills in the background
  const hills = [];
  for (let i = 0; i < 12; i++) {
    const cx = (i * width) / 11;
    const r  = 80 + ((i * 37) % 90);
    const ho = ((i * 53) % 30) - 12;
    hills.push(
      <ellipse key={i} cx={cx} cy={groundY + ho} rx={r * 1.2} ry={r * 0.5}
        fill="var(--grass)" opacity={0.55 - (i % 3) * 0.1} />
    );
  }
  // Clouds
  const clouds = [
    [ 280,  90, 1.0],
    [ 720, 130, 0.85],
    [1240,  80, 1.1],
    [1820, 120, 0.9],
    [2340,  85, 1.0],
    [2920, 110, 0.95],
    [3380,  95, 1.05],
  ];
  return (
    <g>
      {/* sky gradient strip */}
      <rect x="0" y="0" width={width} height={groundY + 20} fill="url(#sky-grad)" />
      <linearGradient id="sky-grad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#D9EAF0" />
        <stop offset="60%" stopColor="#BFE0E8" />
        <stop offset="100%" stopColor="#A8CCD6" />
      </linearGradient>
      {/* hills */}
      <g style={{ pointerEvents: 'none' }}>{hills}</g>
      {/* ground */}
      <rect x="0" y={groundY} width={width} height={1100 - groundY} fill="var(--grass)" />
      <rect x="0" y={groundY} width={width} height="14" fill="var(--grass-deep)" opacity="0.55" />
      <rect x="0" y={groundY + 60} width={width} height={1100 - groundY - 60} fill="var(--paper-shadow)" opacity="0.55" />
      {/* clouds */}
      <g style={{ pointerEvents: 'none' }}>
        {clouds.map(([x, y, s], i) => <Cloud key={i} x={x} y={y} scale={s} />)}
      </g>
    </g>
  );
}

function Cloud({ x, y, scale = 1 }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <ellipse cx="0"  cy="0" rx="40" ry="16" fill="#fff" stroke="var(--ink-soft)" strokeWidth="1.2" />
      <ellipse cx="-22" cy="-4" rx="22" ry="14" fill="#fff" stroke="var(--ink-soft)" strokeWidth="1.2" />
      <ellipse cx="22"  cy="-2" rx="26" ry="14" fill="#fff" stroke="var(--ink-soft)" strokeWidth="1.2" />
      <ellipse cx="0"   cy="-8" rx="20" ry="12" fill="#fff" stroke="var(--ink-soft)" strokeWidth="1.2" />
    </g>
  );
}

/* ============================================================
   BUILDING
   Always: <Building x y width height level entityId children/>
   The building wraps its body, roof, windows, sign. Children render
   inside the building's local coordinate system. Add interior
   cutaways (windows w/ characters) as children.
   ============================================================ */

function Building({
  x, y, w, h, body = 'var(--brick)', roof = 'var(--scarry-red)',
  roofShape = 'flat', // 'flat' | 'gable' | 'mansard' | 'dome' | 'tower'
  outline = 'var(--ink)', strokeWidth = 3, sign, signColor,
  entity, hovered, selected, dimmed, onClick, onHover, onLeave,
  children, signText, signTextColor, hatch,
}) {
  const ringPad = 4;
  return (
    <g
      className={'building-group clickable' +
        (selected ? ' is-selected' : '') +
        (dimmed ? ' dim' : '')}
      transform={`translate(${x} ${y})`}
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      onClick={onClick}
    >
      {/* hover/select ring */}
      <rect x={-ringPad} y={-ringPad - 30} width={w + ringPad * 2}
            height={h + ringPad * 2 + 30} rx="6" className="hover-ring" />

      {/* Roof */}
      {roofShape === 'gable' && (
        <g>
          <polygon
            points={`${-8},0 ${w / 2},${-h * 0.32} ${w + 8},0`}
            fill={roof} stroke={outline} strokeWidth={strokeWidth}
            strokeLinejoin="round" />
        </g>
      )}
      {roofShape === 'flat' && (
        <rect x="-3" y="-12" width={w + 6} height="14" fill={roof}
              stroke={outline} strokeWidth={strokeWidth - 0.5}
              strokeLinejoin="round" />
      )}
      {roofShape === 'mansard' && (
        <g>
          <polygon
            points={`-4,0 8,${-22} ${w - 8},${-22} ${w + 4},0`}
            fill={roof} stroke={outline} strokeWidth={strokeWidth}
            strokeLinejoin="round" />
          <line x1="8" y1="-22" x2={w - 8} y2="-22"
                stroke={outline} strokeWidth="1" opacity="0.5" />
        </g>
      )}
      {roofShape === 'dome' && (
        <g>
          <ellipse cx={w / 2} cy="0" rx={w * 0.42} ry="36"
                   fill={roof} stroke={outline} strokeWidth={strokeWidth} />
          <line x1={w / 2} y1="-36" x2={w / 2} y2="-58"
                stroke={outline} strokeWidth="2" />
          <circle cx={w / 2} cy="-58" r="4" fill={roof}
                  stroke={outline} strokeWidth="2" />
        </g>
      )}
      {roofShape === 'tower' && (
        <g>
          <polygon
            points={`-4,0 ${w / 2},${-h * 0.45} ${w + 4},0`}
            fill={roof} stroke={outline} strokeWidth={strokeWidth}
            strokeLinejoin="round" />
        </g>
      )}

      {/* Body — slight fill/outline misregistration */}
      <rect x="-1.5" y="2" width={w} height={h} fill={body}
            className="building-body" opacity="0.95" />
      {hatch && <rect x="0" y="2" width={w} height={h} fill={hatch} opacity="0.5" />}
      <rect x="0" y="0" width={w} height={h} fill="none"
            stroke={outline} strokeWidth={strokeWidth} strokeLinejoin="round" />

      {/* Foundation */}
      <rect x="-4" y={h - 2} width={w + 8} height="8" fill="var(--brown)"
            stroke={outline} strokeWidth="1.5" />

      {children}

      {/* Sign — rendered LAST so towers/cutaways/extras can't occlude it.
         Hangs on a small post just inside the top edge of the body face. */}
      {sign && (() => {
        const signW = Math.min(124, Math.max(64, w + 16));
        const halfW = signW / 2;
        const cx = w / 2;
        const fontSize = signW < 90 ? 8.5 : signW < 110 ? 9.5 : 10.5;
        return (
        <g style={{ pointerEvents: 'none' }}>
          {/* Two thin posts attaching the plaque to the roof line */}
          <line x1={cx - Math.min(36, halfW - 4)} y1="0" x2={cx - Math.min(36, halfW - 4)} y2="8"
                stroke="var(--ink)" strokeWidth="1.2" />
          <line x1={cx + Math.min(36, halfW - 4)} y1="0" x2={cx + Math.min(36, halfW - 4)} y2="8"
                stroke="var(--ink)" strokeWidth="1.2" />
          {/* Plaque drop shadow */}
          <rect x={cx - halfW} y="10" width={signW} height="22" rx="2"
                fill="var(--ink)" opacity="0.18" />
          {/* Plaque body */}
          <rect x={cx - halfW} y="8" width={signW} height="22" rx="2"
                fill={signColor || 'var(--paper)'}
                stroke="var(--ink)" strokeWidth="1.6" />
          {/* Inner ruled line for that hand-painted feel */}
          <rect x={cx - halfW + 4} y="10" width={signW - 8} height="18" rx="1.5"
                fill="none" stroke="var(--ink)" strokeWidth="0.6" opacity="0.35" />
          <text x={cx} y="24" textAnchor="middle"
                style={{
                  fontFamily: 'Fraunces, serif',
                  fontSize: fontSize, fontWeight: 700,
                  fill: signTextColor || 'var(--ink)',
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase',
                  paintOrder: 'stroke',
                  stroke: signColor || 'var(--paper)',
                  strokeWidth: '2px',
                  strokeLinejoin: 'round',
                }}>
            {sign}
          </text>
        </g>
        );
      })()}

      {/* hit area — covers everything for click */}
      <rect className="hit-area" x={-8} y={-h * 0.5} width={w + 16} height={h * 1.6} />
    </g>
  );
}

/* ---------- Window cutaway primitive ---------- */
function CutawayWindow({ x, y, w = 44, h = 50, sill = true, sky = false, children }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect x="0" y="0" width={w} height={h}
            fill={sky ? 'var(--sky)' : 'var(--paper-shadow)'}
            stroke="var(--ink)" strokeWidth="1.6" />
      <rect x="0" y="0" width={w} height={h} fill="none"
            stroke="var(--ink)" strokeWidth="1.6" strokeLinejoin="round" />
      {sill && <rect x={-3} y={h - 3} width={w + 6} height="4"
                     fill="var(--brown)" stroke="var(--ink)" strokeWidth="1.2" />}
      {children}
    </g>
  );
}

/* ---------- Plain Window ---------- */
function Win({ x, y, w = 18, h = 22, color = 'var(--sky)', mullion = true }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect x="0" y="0" width={w} height={h} fill={color}
            stroke="var(--ink)" strokeWidth="1.3" />
      {mullion && (
        <>
          <line x1={w / 2} y1="0" x2={w / 2} y2={h}
                stroke="var(--ink)" strokeWidth="0.9" opacity="0.7" />
          <line x1="0" y1={h / 2} x2={w} y2={h / 2}
                stroke="var(--ink)" strokeWidth="0.9" opacity="0.7" />
        </>
      )}
    </g>
  );
}

function Door({ x, y, w = 24, h = 32, color = 'var(--brown)', knob = true }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect x="0" y="0" width={w} height={h} fill={color}
            stroke="var(--ink)" strokeWidth="1.5" />
      {knob && <circle cx={w - 4} cy={h / 2} r="1.5" fill="var(--ink)" />}
    </g>
  );
}

/* ============================================================
   CHARACTER
   Tiny anthropomorphic figure.
   props: species ('rabbit' | 'bear' | 'cat' | 'mouse' | 'pig' | 'fox' | 'owl' | 'dog')
          costume — color of the shirt
          hat — 'hardhat'|'postal'|'chef'|'cop'|'mortarboard'|'cap'|'lab'|'cardigan'|'none'
          accent — costume accent color
   Body is drawn around (0,0) which is the figure's feet.
   ============================================================ */

function Character({
  species = 'rabbit', costume = 'var(--scarry-blue)', accent = 'var(--paper)',
  hat = 'none', fur = 'var(--tan)', size = 1, label, labelOffset = 0,
  walking = false, mirror = false, prop = null, x = 0, y = 0,
}) {
  const s = size;
  return (
    <g transform={`translate(${x} ${y}) scale(${mirror ? -s : s} ${s})`}>
      {/* Legs */}
      <line x1="-4" y1="-6" x2={walking ? -7 : -4} y2="2"
            stroke="var(--ink)" strokeWidth="2.6" strokeLinecap="round" />
      <line x1="4" y1="-6" x2={walking ? 7 : 4} y2="2"
            stroke="var(--ink)" strokeWidth="2.6" strokeLinecap="round" />
      {/* Feet */}
      <ellipse cx={walking ? -7 : -4} cy="3" rx="3.5" ry="1.6" fill="var(--ink)" />
      <ellipse cx={walking ?  7 :  4} cy="3" rx="3.5" ry="1.6" fill="var(--ink)" />
      {/* Body */}
      <ellipse cx="0" cy="-14" rx="9.5" ry="10" fill={fur}
               stroke="var(--ink)" strokeWidth="1.8" />
      {/* Shirt/costume */}
      <path d="M -9 -10 Q 0 -6 9 -10 L 9 -3 Q 0 0 -9 -3 Z" fill={costume}
            stroke="var(--ink)" strokeWidth="1.6" strokeLinejoin="round" />
      {/* Buttons / accent */}
      <circle cx="0" cy="-7" r="0.9" fill={accent} />
      <circle cx="0" cy="-4.5" r="0.9" fill={accent} />
      {/* Arms */}
      <line x1="-8" y1="-12" x2="-12" y2="-5"
            stroke="var(--ink)" strokeWidth="2.2" strokeLinecap="round" />
      <line x1="8" y1="-12" x2={prop ? 13 : 12} y2={prop ? -8 : -5}
            stroke="var(--ink)" strokeWidth="2.2" strokeLinecap="round" />
      {/* Head */}
      <CharHead species={species} fur={fur} />
      {/* Hat */}
      <Hat type={hat} />
      {/* prop in hand */}
      {prop === 'clipboard' && (
        <g transform="translate(13 -10) rotate(-15)">
          <rect x="-3" y="-4" width="7" height="9" fill="var(--paper)"
                stroke="var(--ink)" strokeWidth="0.9" />
          <line x1="-2" y1="-1" x2="3" y2="-1" stroke="var(--ink)" strokeWidth="0.5" />
          <line x1="-2" y1="1" x2="3" y2="1" stroke="var(--ink)" strokeWidth="0.5" />
        </g>
      )}
      {prop === 'briefcase' && (
        <g transform="translate(13 -6)">
          <rect x="-4" y="-3" width="8" height="6" fill="var(--brown)"
                stroke="var(--ink)" strokeWidth="0.9" />
          <line x1="-2" y1="-3" x2="-2" y2="-5" stroke="var(--ink)" strokeWidth="0.9" />
          <line x1="2" y1="-3" x2="2" y2="-5" stroke="var(--ink)" strokeWidth="0.9" />
        </g>
      )}
      {prop === 'backpack' && (
        <g>
          <ellipse cx="-9" cy="-12" rx="4" ry="6" fill="var(--scarry-red)"
                   stroke="var(--ink)" strokeWidth="1.2" />
        </g>
      )}
      {prop === 'envelope' && (
        <g transform="translate(13 -8)">
          <rect x="-3" y="-2" width="6" height="4" fill="var(--paper)"
                stroke="var(--ink)" strokeWidth="0.9" />
          <line x1="-3" y1="-2" x2="0" y2="0" stroke="var(--ink)" strokeWidth="0.7" />
          <line x1="3" y1="-2" x2="0" y2="0" stroke="var(--ink)" strokeWidth="0.7" />
        </g>
      )}
      {prop === 'tool' && (
        <g transform="translate(13 -6)">
          <rect x="-1" y="-7" width="2" height="10" fill="var(--ink-soft)" />
          <rect x="-3" y="-9" width="6" height="3" fill="var(--ink-soft)" />
        </g>
      )}
      {prop === 'book' && (
        <g transform="translate(13 -8)">
          <rect x="-3" y="-2" width="6" height="5" fill="var(--scarry-green)"
                stroke="var(--ink)" strokeWidth="0.9" />
          <line x1="0" y1="-2" x2="0" y2="3" stroke="var(--ink)" strokeWidth="0.6" />
        </g>
      )}
      {prop === 'broom' && (
        <g transform="translate(12 0)">
          <line x1="0" y1="-12" x2="-2" y2="6" stroke="var(--brown)" strokeWidth="1.5" />
          <path d="M -5 6 L 1 6 L 0 12 L -4 12 Z" fill="var(--scarry-yellow)" stroke="var(--ink)" strokeWidth="0.8" />
        </g>
      )}
      {prop === 'cane' && (
        <line x1="13" y1="-8" x2="11" y2="6" stroke="var(--brown)" strokeWidth="1.8" />
      )}
      {prop === 'resume' && (
        <g transform="translate(13 -8) rotate(-10)">
          <rect x="-3" y="-3" width="6" height="8" fill="var(--paper)"
                stroke="var(--ink)" strokeWidth="0.9" />
          <line x1="-2" y1="-1" x2="2" y2="-1" stroke="var(--ink)" strokeWidth="0.4" />
          <line x1="-2" y1="0.5" x2="2" y2="0.5" stroke="var(--ink)" strokeWidth="0.4" />
          <line x1="-2" y1="2" x2="2" y2="2" stroke="var(--ink)" strokeWidth="0.4" />
        </g>
      )}
      {/* Label tag below */}
      {label && (
        <text x="0" y={20 + labelOffset} textAnchor="middle" className="label label--sm"
              style={{ fontSize: 9 }}>
          {label}
        </text>
      )}
    </g>
  );
}

function CharHead({ species, fur }) {
  // Head sits at (0, -28)
  const common = (
    <>
      <circle cx="-2.5" cy="-29" r="1" fill="var(--ink)" />
      <circle cx="2.5" cy="-29" r="1" fill="var(--ink)" />
    </>
  );
  if (species === 'rabbit') {
    return (
      <g>
        <ellipse cx="-3.5" cy="-38" rx="1.8" ry="5.5" fill={fur}
                 stroke="var(--ink)" strokeWidth="1.2" />
        <ellipse cx="3.5" cy="-38" rx="1.8" ry="5.5" fill={fur}
                 stroke="var(--ink)" strokeWidth="1.2" />
        <ellipse cx="-3.5" cy="-39" rx="0.7" ry="3" fill="var(--scarry-pink)" />
        <ellipse cx="3.5" cy="-39" rx="0.7" ry="3" fill="var(--scarry-pink)" />
        <circle cx="0" cy="-28" r="7.5" fill={fur}
                stroke="var(--ink)" strokeWidth="1.6" />
        {common}
        <ellipse cx="0" cy="-25" rx="1.2" ry="0.8" fill="var(--scarry-pink)" />
        <path d="M -2 -23.5 Q 0 -22.5 2 -23.5" stroke="var(--ink)" strokeWidth="0.7" fill="none" />
      </g>
    );
  }
  if (species === 'bear') {
    return (
      <g>
        <circle cx="-6" cy="-33" r="2.5" fill={fur} stroke="var(--ink)" strokeWidth="1.2" />
        <circle cx="6"  cy="-33" r="2.5" fill={fur} stroke="var(--ink)" strokeWidth="1.2" />
        <circle cx="-6" cy="-33" r="1.2" fill="var(--brown)" />
        <circle cx="6"  cy="-33" r="1.2" fill="var(--brown)" />
        <circle cx="0" cy="-28" r="8.5" fill={fur}
                stroke="var(--ink)" strokeWidth="1.6" />
        <ellipse cx="0" cy="-24" rx="5" ry="3.5" fill="var(--tan-deep)" opacity="0.5" />
        {common}
        <ellipse cx="0" cy="-24" rx="1.6" ry="1" fill="var(--ink)" />
        <path d="M -2.5 -22 Q 0 -20.5 2.5 -22" stroke="var(--ink)" strokeWidth="0.7" fill="none" />
      </g>
    );
  }
  if (species === 'cat') {
    return (
      <g>
        <polygon points="-7,-35 -3,-31 -6,-31" fill={fur} stroke="var(--ink)" strokeWidth="1.2" />
        <polygon points="7,-35 3,-31 6,-31" fill={fur} stroke="var(--ink)" strokeWidth="1.2" />
        <polygon points="-6,-34 -4,-32 -5,-32" fill="var(--scarry-pink)" />
        <polygon points="6,-34 4,-32 5,-32" fill="var(--scarry-pink)" />
        <circle cx="0" cy="-28" r="7.5" fill={fur}
                stroke="var(--ink)" strokeWidth="1.6" />
        {common}
        <ellipse cx="0" cy="-25" rx="1.2" ry="0.8" fill="var(--ink)" />
        <line x1="-7" y1="-28" x2="-3" y2="-28" stroke="var(--ink)" strokeWidth="0.5" />
        <line x1="7" y1="-28" x2="3" y2="-28" stroke="var(--ink)" strokeWidth="0.5" />
      </g>
    );
  }
  if (species === 'mouse') {
    return (
      <g>
        <circle cx="-5" cy="-32" r="3" fill={fur} stroke="var(--ink)" strokeWidth="1.2" />
        <circle cx="5"  cy="-32" r="3" fill={fur} stroke="var(--ink)" strokeWidth="1.2" />
        <circle cx="-5" cy="-32" r="1.5" fill="var(--scarry-pink)" />
        <circle cx="5"  cy="-32" r="1.5" fill="var(--scarry-pink)" />
        <circle cx="0" cy="-28" r="6.5" fill={fur}
                stroke="var(--ink)" strokeWidth="1.6" />
        {common}
        <ellipse cx="0" cy="-24" rx="0.9" ry="0.7" fill="var(--scarry-pink)" />
      </g>
    );
  }
  if (species === 'pig') {
    return (
      <g>
        <ellipse cx="-4" cy="-35" rx="2" ry="2" fill={fur} stroke="var(--ink)" strokeWidth="1" />
        <ellipse cx="4" cy="-35" rx="2" ry="2" fill={fur} stroke="var(--ink)" strokeWidth="1" />
        <circle cx="0" cy="-28" r="8" fill={fur}
                stroke="var(--ink)" strokeWidth="1.6" />
        {common}
        <ellipse cx="0" cy="-23" rx="3.5" ry="2.5" fill={fur}
                 stroke="var(--ink)" strokeWidth="1.2" />
        <circle cx="-1" cy="-23" r="0.6" fill="var(--ink)" />
        <circle cx="1" cy="-23" r="0.6" fill="var(--ink)" />
      </g>
    );
  }
  if (species === 'fox') {
    return (
      <g>
        <polygon points="-7,-36 -3,-31 -6,-30" fill={fur} stroke="var(--ink)" strokeWidth="1.2" />
        <polygon points="7,-36 3,-31 6,-30" fill={fur} stroke="var(--ink)" strokeWidth="1.2" />
        <ellipse cx="0" cy="-28" rx="7.5" ry="8" fill={fur}
                 stroke="var(--ink)" strokeWidth="1.6" />
        <path d="M -8 -28 Q 0 -18 8 -28 Z" fill="var(--paper)" opacity="0.3" />
        {common}
        <path d="M 0 -25 L -2 -22 L 2 -22 Z" fill="var(--ink)" />
      </g>
    );
  }
  if (species === 'owl') {
    return (
      <g>
        <circle cx="0" cy="-28" r="8.5" fill={fur}
                stroke="var(--ink)" strokeWidth="1.6" />
        <circle cx="-3.5" cy="-29" r="3" fill="var(--paper)"
                stroke="var(--ink)" strokeWidth="1" />
        <circle cx="3.5" cy="-29" r="3" fill="var(--paper)"
                stroke="var(--ink)" strokeWidth="1" />
        <circle cx="-3.5" cy="-29" r="1.4" fill="var(--ink)" />
        <circle cx="3.5" cy="-29" r="1.4" fill="var(--ink)" />
        <polygon points="0,-26 -1.5,-24 1.5,-24" fill="var(--scarry-yellow-deep)"
                 stroke="var(--ink)" strokeWidth="0.7" />
        <polygon points="-7,-36 -5,-32 -9,-33" fill={fur} stroke="var(--ink)" strokeWidth="1" />
        <polygon points="7,-36 5,-32 9,-33" fill={fur} stroke="var(--ink)" strokeWidth="1" />
      </g>
    );
  }
  if (species === 'dog') {
    return (
      <g>
        <ellipse cx="-7" cy="-30" rx="2.5" ry="4" fill={fur}
                 stroke="var(--ink)" strokeWidth="1.2" />
        <ellipse cx="7" cy="-30" rx="2.5" ry="4" fill={fur}
                 stroke="var(--ink)" strokeWidth="1.2" />
        <circle cx="0" cy="-28" r="7.5" fill={fur}
                stroke="var(--ink)" strokeWidth="1.6" />
        {common}
        <ellipse cx="0" cy="-23" rx="2.5" ry="2" fill={fur}
                 stroke="var(--ink)" strokeWidth="1" />
        <ellipse cx="0" cy="-24" rx="1.2" ry="0.8" fill="var(--ink)" />
      </g>
    );
  }
  return null;
}

function Hat({ type }) {
  if (type === 'hardhat') {
    return (
      <g>
        <ellipse cx="0" cy="-34" rx="9" ry="3" fill="var(--scarry-yellow)"
                 stroke="var(--ink)" strokeWidth="1.4" />
        <path d="M -7 -34 Q 0 -42 7 -34 Z" fill="var(--scarry-yellow)"
              stroke="var(--ink)" strokeWidth="1.4" />
      </g>
    );
  }
  if (type === 'postal') {
    return (
      <g>
        <rect x="-7" y="-38" width="14" height="5" fill="var(--scarry-blue)"
              stroke="var(--ink)" strokeWidth="1.2" />
        <rect x="-9" y="-34" width="18" height="2" fill="var(--scarry-blue)"
              stroke="var(--ink)" strokeWidth="1" />
      </g>
    );
  }
  if (type === 'chef') {
    return (
      <g>
        <rect x="-6" y="-36" width="12" height="3" fill="var(--paper)"
              stroke="var(--ink)" strokeWidth="1" />
        <ellipse cx="0" cy="-42" rx="7" ry="5" fill="var(--paper)"
                 stroke="var(--ink)" strokeWidth="1.2" />
      </g>
    );
  }
  if (type === 'cop') {
    return (
      <g>
        <ellipse cx="0" cy="-37" rx="10" ry="3" fill="var(--ink)" />
        <rect x="-7" y="-42" width="14" height="6" fill="var(--scarry-blue-deep)"
              stroke="var(--ink)" strokeWidth="1.2" />
        <circle cx="0" cy="-40" r="1.4" fill="var(--scarry-yellow)" />
      </g>
    );
  }
  if (type === 'mortarboard') {
    return (
      <g>
        <rect x="-9" y="-39" width="18" height="3" fill="var(--ink)" />
        <ellipse cx="0" cy="-35" rx="7" ry="2" fill="var(--ink)" />
        <line x1="9" y1="-37" x2="13" y2="-32" stroke="var(--scarry-red)" strokeWidth="1.2" />
        <circle cx="13" cy="-32" r="1.5" fill="var(--scarry-red)" />
      </g>
    );
  }
  if (type === 'cap') {
    return (
      <g>
        <ellipse cx="0" cy="-34" rx="9" ry="2.5" fill="var(--scarry-red)"
                 stroke="var(--ink)" strokeWidth="1.2" />
        <ellipse cx="0" cy="-37" rx="6" ry="3" fill="var(--scarry-red)"
                 stroke="var(--ink)" strokeWidth="1.2" />
      </g>
    );
  }
  if (type === 'lab') {
    return (
      <g>
        <path d="M -9 -12 Q -9 -2 -8 4 L 8 4 Q 9 -2 9 -12"
              fill="var(--paper)" stroke="var(--ink)" strokeWidth="1.4" opacity="0.95" />
      </g>
    );
  }
  if (type === 'cardigan') {
    return (
      <g>
        <path d="M -2 -29 L 2 -29 L 2.8 -27 L -2.8 -27 Z" fill="var(--paper)"
              stroke="var(--ink)" strokeWidth="0.6" />
        <line x1="-2.5" y1="-28" x2="-1.5" y2="-25"
              stroke="var(--ink)" strokeWidth="0.5" />
        <line x1="2.5" y1="-28" x2="1.5" y2="-25"
              stroke="var(--ink)" strokeWidth="0.5" />
      </g>
    );
  }
  if (type === 'crown') {
    return (
      <g>
        <polygon points="-7,-34 -7,-40 -3,-37 0,-43 3,-37 7,-40 7,-34"
                 fill="var(--scarry-yellow)" stroke="var(--ink)" strokeWidth="1.2" />
        <circle cx="0" cy="-39" r="1" fill="var(--scarry-red)" />
      </g>
    );
  }
  return null;
}

/* ============================================================
   VEHICLE
   Whimsical truck shapes. Each carries one flow.
   ============================================================ */

function Vehicle({
  type = 'dollar-truck', x = 0, y = 0, mirror = false, scale = 1, dimmed = false,
}) {
  return (
    <g transform={`translate(${x} ${y}) scale(${mirror ? -scale : scale} ${scale})`}
       opacity={dimmed ? 0.15 : 1}
       style={{ transition: 'opacity 200ms ease' }}>
      {VEHICLE_PARTS[type] || VEHICLE_PARTS['dollar-truck']}
    </g>
  );
}

const Wheels = ({ x1 = 8, x2 = 56, y = 18 }) => (
  <g>
    <circle cx={x1} cy={y} r="6" fill="var(--ink)" />
    <circle cx={x2} cy={y} r="6" fill="var(--ink)" />
    <circle cx={x1} cy={y} r="2.6" fill="var(--paper)" stroke="var(--ink)" strokeWidth="0.8" />
    <circle cx={x2} cy={y} r="2.6" fill="var(--paper)" stroke="var(--ink)" strokeWidth="0.8" />
  </g>
);

const VEHICLE_PARTS = {
  /* Dollar / armored money truck — WIOA Title I */
  'dollar-truck': (
    <g>
      <rect x="0"  y="0"  width="46" height="18" rx="2" fill="var(--scarry-green)" stroke="var(--ink)" strokeWidth="2" />
      <rect x="46" y="4"  width="18" height="14" rx="2" fill="var(--scarry-green)" stroke="var(--ink)" strokeWidth="2" />
      <rect x="48" y="6"  width="14" height="8"  fill="var(--sky)" stroke="var(--ink)" strokeWidth="1" />
      <circle cx="22" cy="9" r="7" fill="var(--paper)" stroke="var(--ink)" strokeWidth="1.5" />
      <text x="22" y="13" textAnchor="middle" style={{ fontFamily: 'Fraunces, serif', fontSize: 11, fontWeight: 700, fill: 'var(--scarry-green-deep)' }}>$</text>
      <Wheels x1="10" x2="56" />
      {/* Driver bear */}
      <g transform="translate(54 4)"><circle cx="0" cy="0" r="3" fill="var(--brown)" stroke="var(--ink)" strokeWidth="0.8" /></g>
    </g>
  ),
  /* School-money envelope van — Pell */
  'envelope-van': (
    <g>
      <rect x="0" y="0" width="58" height="18" rx="2" fill="var(--scarry-purple)" stroke="var(--ink)" strokeWidth="2" />
      <line x1="0" y1="0" x2="29" y2="10" stroke="var(--ink)" strokeWidth="1.5" />
      <line x1="58" y1="0" x2="29" y2="10" stroke="var(--ink)" strokeWidth="1.5" />
      <rect x="20" y="6" width="18" height="6" fill="var(--paper)" stroke="var(--ink)" strokeWidth="0.8" />
      <text x="29" y="11" textAnchor="middle" style={{ fontFamily: 'Caveat, cursive', fontSize: 8, fill: 'var(--ink)' }}>PELL</text>
      <Wheels x1="10" x2="48" />
    </g>
  ),
  /* Mail truck — Title III job-matching */
  'mail-truck': (
    <g>
      <rect x="0" y="2" width="44" height="16" rx="2" fill="var(--scarry-yellow)" stroke="var(--ink)" strokeWidth="2" />
      <rect x="44" y="6" width="14" height="12" rx="2" fill="var(--scarry-yellow)" stroke="var(--ink)" strokeWidth="2" />
      <rect x="46" y="8" width="10" height="7" fill="var(--sky)" stroke="var(--ink)" strokeWidth="0.8" />
      <rect x="6" y="6" width="32" height="10" fill="none" stroke="var(--ink)" strokeWidth="1" />
      <text x="22" y="13" textAnchor="middle" style={{ fontFamily: 'Fraunces, serif', fontSize: 8, fontWeight: 600, fill: 'var(--ink)' }}>JOBS</text>
      <Wheels x1="10" x2="50" />
    </g>
  ),
  /* Book bus — Title II adult ed */
  'book-bus': (
    <g>
      <rect x="0" y="0" width="62" height="18" rx="3" fill="var(--scarry-blue)" stroke="var(--ink)" strokeWidth="2" />
      {/* book pages on the side */}
      <rect x="6" y="4" width="22" height="11" fill="var(--paper)" stroke="var(--ink)" strokeWidth="1" />
      <rect x="32" y="4" width="22" height="11" fill="var(--paper)" stroke="var(--ink)" strokeWidth="1" />
      <line x1="30" y1="3" x2="30" y2="16" stroke="var(--ink)" strokeWidth="1.5" />
      <line x1="10" y1="7" x2="24" y2="7" stroke="var(--ink-soft)" strokeWidth="0.5" />
      <line x1="10" y1="10" x2="24" y2="10" stroke="var(--ink-soft)" strokeWidth="0.5" />
      <line x1="36" y1="7" x2="50" y2="7" stroke="var(--ink-soft)" strokeWidth="0.5" />
      <line x1="36" y1="10" x2="50" y2="10" stroke="var(--ink-soft)" strokeWidth="0.5" />
      <Wheels x1="12" x2="52" />
    </g>
  ),
  /* Ramp van — Title IV voc rehab */
  'ramp-van': (
    <g>
      <rect x="0" y="2" width="52" height="16" rx="2" fill="var(--scarry-green)" stroke="var(--ink)" strokeWidth="2" />
      <rect x="6" y="6" width="10" height="9" fill="var(--sky)" stroke="var(--ink)" strokeWidth="1" />
      <rect x="20" y="6" width="10" height="9" fill="var(--sky)" stroke="var(--ink)" strokeWidth="1" />
      <rect x="34" y="6" width="10" height="9" fill="var(--sky)" stroke="var(--ink)" strokeWidth="1" />
      {/* accessibility symbol */}
      <circle cx="46" cy="11" r="3" fill="var(--paper)" stroke="var(--ink)" strokeWidth="0.8" />
      <circle cx="46" cy="11" r="1" fill="var(--ink)" />
      <Wheels x1="10" x2="44" />
    </g>
  ),
  /* Wrench truck — Apprenticeship */
  'wrench-truck': (
    <g>
      <rect x="0" y="0" width="46" height="18" rx="2" fill="var(--scarry-orange)" stroke="var(--ink)" strokeWidth="2" />
      <rect x="46" y="4" width="14" height="14" rx="2" fill="var(--scarry-orange)" stroke="var(--ink)" strokeWidth="2" />
      <g transform="translate(22 9) rotate(-30)">
        <rect x="-9" y="-1.5" width="14" height="3" fill="var(--paper-shadow)" stroke="var(--ink)" strokeWidth="0.8" />
        <circle cx="5" cy="0" r="3" fill="var(--paper-shadow)" stroke="var(--ink)" strokeWidth="0.8" />
        <circle cx="5" cy="0" r="1" fill="var(--scarry-orange)" />
      </g>
      <Wheels x1="10" x2="52" />
    </g>
  ),
  'wrench-truck-brown': (
    <g>
      <rect x="0" y="0" width="46" height="18" rx="2" fill="var(--brown)" stroke="var(--ink)" strokeWidth="2" />
      <rect x="46" y="4" width="14" height="14" rx="2" fill="var(--brown)" stroke="var(--ink)" strokeWidth="2" />
      <g transform="translate(22 9) rotate(-30)">
        <rect x="-9" y="-1.5" width="14" height="3" fill="var(--paper-shadow)" stroke="var(--ink)" strokeWidth="0.8" />
        <circle cx="5" cy="0" r="3" fill="var(--paper-shadow)" stroke="var(--ink)" strokeWidth="0.8" />
        <circle cx="5" cy="0" r="1" fill="var(--brown)" />
      </g>
      <Wheels x1="10" x2="52" />
    </g>
  ),
  /* Grocery / aid truck — TANF & SNAP */
  'grocery-truck': (
    <g>
      <rect x="0" y="0" width="50" height="18" rx="2" fill="var(--scarry-pink)" stroke="var(--ink)" strokeWidth="2" />
      {/* basket of goods on top */}
      <rect x="10" y="-8" width="28" height="10" rx="2" fill="var(--tan)" stroke="var(--ink)" strokeWidth="1.5" />
      <ellipse cx="16" cy="-9" rx="3" ry="3" fill="var(--scarry-red)" stroke="var(--ink)" strokeWidth="0.9" />
      <ellipse cx="24" cy="-10" rx="3" ry="3.5" fill="var(--scarry-yellow)" stroke="var(--ink)" strokeWidth="0.9" />
      <ellipse cx="32" cy="-9" rx="3" ry="3" fill="var(--scarry-green)" stroke="var(--ink)" strokeWidth="0.9" />
      <Wheels x1="10" x2="44" />
    </g>
  ),
};

/* ============================================================
   Label callout — dot + line + word
   ============================================================ */

function LabelCallout({ x, y, dx = 70, dy = 0, text, anchor = 'start', visible = true }) {
  if (!visible) return null;
  const textOffset = anchor === 'end' ? -4 : anchor === 'middle' ? 0 : 4;
  return (
    <g style={{ pointerEvents: 'none' }}>
      <circle cx={x} cy={y} r="2.5" fill="var(--ink)" />
      <line x1={x} y1={y} x2={x + dx} y2={y + dy} stroke="var(--ink-soft)" strokeWidth="1" />
      <text x={x + dx + textOffset} y={y + dy + 4}
            textAnchor={anchor} className="label">{text}</text>
    </g>
  );
}

/* ============================================================
   Narrative text block — italic serif tucked in white space
   ============================================================ */
function Narrative({ x, y, lines, anchor = 'start', size = 14 }) {
  return (
    <g style={{ pointerEvents: 'none' }}>
      <text x={x} y={y} textAnchor={anchor} className="narrative"
            style={{ fontSize: size }}>
        {lines.map((l, i) => (
          <tspan key={i} x={x} dy={i === 0 ? 0 : size * 1.3}>{l}</tspan>
        ))}
      </text>
    </g>
  );
}

/* ============================================================
   Hidden helper — a tiny ladybug tucked somewhere
   ============================================================ */
function HiddenLadybug({ x, y, rot = 0 }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot})`} style={{ pointerEvents: 'none' }}>
      <ellipse cx="0" cy="0" rx="5" ry="4" fill="var(--scarry-red)" stroke="var(--ink)" strokeWidth="0.8" />
      <line x1="0" y1="-4" x2="0" y2="4" stroke="var(--ink)" strokeWidth="0.8" />
      <circle cx="-1.5" cy="-1" r="0.6" fill="var(--ink)" />
      <circle cx="1.5" cy="-1" r="0.6" fill="var(--ink)" />
      <circle cx="-1.5" cy="1.5" r="0.6" fill="var(--ink)" />
      <circle cx="1.5" cy="1.5" r="0.6" fill="var(--ink)" />
      <circle cx="0" cy="-5" r="1.2" fill="var(--ink)" />
    </g>
  );
}

/* ============================================================
   Small props — bench, mailbox, tree, fire hydrant, flag, etc.
   ============================================================ */

function Tree({ x, y, scale = 1, kind = 'maple' }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      {kind === 'maple' && (
        <g>
          <rect x="-3" y="-10" width="6" height="14" fill="var(--brown)"
                stroke="var(--ink)" strokeWidth="1.2" />
          <circle cx="0" cy="-22" r="16" fill="var(--scarry-green)"
                  stroke="var(--ink)" strokeWidth="1.6" />
          <circle cx="-9" cy="-18" r="10" fill="var(--scarry-green)"
                  stroke="var(--ink)" strokeWidth="1.4" />
          <circle cx="9" cy="-18" r="10" fill="var(--scarry-green)"
                  stroke="var(--ink)" strokeWidth="1.4" />
        </g>
      )}
      {kind === 'pine' && (
        <g>
          <rect x="-2.5" y="-6" width="5" height="10" fill="var(--brown)"
                stroke="var(--ink)" strokeWidth="1" />
          <polygon points="-12,-6 12,-6 0,-20" fill="var(--scarry-green-deep)"
                   stroke="var(--ink)" strokeWidth="1.4" />
          <polygon points="-10,-16 10,-16 0,-28" fill="var(--scarry-green-deep)"
                   stroke="var(--ink)" strokeWidth="1.4" />
          <polygon points="-8,-24 8,-24 0,-34" fill="var(--scarry-green-deep)"
                   stroke="var(--ink)" strokeWidth="1.4" />
        </g>
      )}
    </g>
  );
}

function Mailbox({ x, y }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <line x1="0" y1="0" x2="0" y2="-12" stroke="var(--ink)" strokeWidth="2" />
      <rect x="-7" y="-22" width="14" height="10" rx="6"
            fill="var(--scarry-blue)" stroke="var(--ink)" strokeWidth="1.5" />
      <rect x="6" y="-19" width="3" height="4" fill="var(--scarry-red)" stroke="var(--ink)" strokeWidth="0.8" />
    </g>
  );
}

function Hydrant({ x, y }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect x="-4" y="-12" width="8" height="12" fill="var(--scarry-red)"
            stroke="var(--ink)" strokeWidth="1.4" />
      <ellipse cx="0" cy="-12" rx="4" ry="2" fill="var(--scarry-red)"
               stroke="var(--ink)" strokeWidth="1.4" />
      <circle cx="0" cy="-14" r="1.5" fill="var(--scarry-red-deep)"
              stroke="var(--ink)" strokeWidth="1" />
      <rect x="-6" y="-8" width="2" height="3" fill="var(--scarry-red)"
            stroke="var(--ink)" strokeWidth="1" />
      <rect x="4" y="-8" width="2" height="3" fill="var(--scarry-red)"
            stroke="var(--ink)" strokeWidth="1" />
    </g>
  );
}

function Flag({ x, y, color = 'var(--scarry-red)' }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <line x1="0" y1="0" x2="0" y2="-30" stroke="var(--ink)" strokeWidth="1.6" />
      <path d="M 0 -30 Q 8 -28 14 -22 Q 8 -20 0 -22 Z" fill={color}
            stroke="var(--ink)" strokeWidth="1.2" />
      <circle cx="0" cy="-31" r="1.5" fill="var(--scarry-yellow)" />
    </g>
  );
}

function Bench({ x, y }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect x="-12" y="-6" width="24" height="3" fill="var(--brown)"
            stroke="var(--ink)" strokeWidth="1.2" />
      <rect x="-10" y="-3" width="2" height="6" fill="var(--brown)"
            stroke="var(--ink)" strokeWidth="1" />
      <rect x="8" y="-3" width="2" height="6" fill="var(--brown)"
            stroke="var(--ink)" strokeWidth="1" />
    </g>
  );
}

function Streetlight({ x, y }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <line x1="0" y1="0" x2="0" y2="-40" stroke="var(--ink)" strokeWidth="2" />
      <line x1="0" y1="-40" x2="10" y2="-40" stroke="var(--ink)" strokeWidth="2" />
      <ellipse cx="10" cy="-37" rx="3" ry="4" fill="var(--scarry-yellow)"
               stroke="var(--ink)" strokeWidth="1" />
    </g>
  );
}

/* ============================================================
   Export to window so other scripts can use them.
   ============================================================ */
Object.assign(window, {
  SceneDefs, SkyAndGround, Cloud,
  Building, CutawayWindow, Win, Door,
  Character, CharHead, Hat,
  Vehicle,
  LabelCallout, Narrative, HiddenLadybug,
  Tree, Mailbox, Hydrant, Flag, Bench, Streetlight,
});
