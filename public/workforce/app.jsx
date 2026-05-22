/* ============================================================
   Workforce Busytown — main app
   Pan/zoom, top-level state, district jumps, tweaks panel,
   flow toggles.
   ============================================================ */

const SCENE_W = 4000;
const SCENE_H = 1100;
const GROUND_Y = 700;

const DISTRICT_VIEWS = {
  federal: { cx: 540,  cy: 540, scale: 0.85 },
  state:   { cx: 1640, cy: 560, scale: 0.85 },
  local:   { cx: 3050, cy: 660, scale: 0.7 },
  full:    { cx: 2000, cy: 620, scale: 0.32 },
};

const FLOW_PILLS = [
  { id: 'title1',  label: 'Title I' },
  { id: 'title2',  label: 'Title II' },
  { id: 'title3',  label: 'Title III' },
  { id: 'title4',  label: 'Title IV' },
  { id: 'pell',    label: 'Pell' },
  { id: 'perkins', label: 'Perkins' },
  { id: 'tanf',    label: 'TANF' },
  { id: 'apprent', label: 'Apprent.' },
];

function App() {
  const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
    "showLabels": true,
    "showExtras": true,
    "animateVehicles": true
  }/*EDITMODE-END*/;

  const [tweaks, setTweak] = window.useTweaks
    ? window.useTweaks(TWEAK_DEFAULTS)
    : [TWEAK_DEFAULTS, () => {}];

  const [selected, setSelected] = React.useState(null);
  const [selectedFlow, setSelectedFlow] = React.useState(null);
  const [hoveredId, setHoveredId] = React.useState(null);

  /* Mouse position tracking for tooltip */
  const tooltipRef = React.useRef(null);
  const lastMouseRef = React.useRef({ x: 0, y: 0 });
  React.useEffect(() => {
    const onMove = (e) => {
      lastMouseRef.current = { x: e.clientX, y: e.clientY };
      if (tooltipRef.current) {
        const tip = tooltipRef.current;
        const pad = 18;
        // Flip to left/above edge if too close to viewport edge
        const rect = tip.getBoundingClientRect();
        const rightOverflow = e.clientX + pad + rect.width  > window.innerWidth;
        const bottomOverflow = e.clientY + pad + rect.height > window.innerHeight;
        tip.style.left = (rightOverflow  ? e.clientX - pad - rect.width  : e.clientX + pad) + 'px';
        tip.style.top  = (bottomOverflow ? e.clientY - pad - rect.height : e.clientY + pad) + 'px';
      }
    };
    window.addEventListener('mousemove', onMove);
    return () => window.removeEventListener('mousemove', onMove);
  }, []);

  /* ----- Tour state ----- */
  const [pickerOpen, setPickerOpen] = React.useState(false);
  const [fundingSheetOpen, setFundingSheetOpen] = React.useState(false);
  const [activeTour, setActiveTour] = React.useState(null);  // tour id
  const [tourStep, setTourStep] = React.useState(0);
  const [tourPlaying, setTourPlaying] = React.useState(true);
  const [tourProgress, setTourProgress] = React.useState(0); // 0..1

  // Pan/zoom state — view in scene coords (cx,cy = scene point at viewport center; scale)
  const [view, setView] = React.useState(DISTRICT_VIEWS.local);
  const viewRef = React.useRef(view);
  React.useEffect(() => { viewRef.current = view; }, [view]);
  const stageRef = React.useRef(null);
  const draggingRef = React.useRef(null);
  const pointersRef = React.useRef(new Map());
  const pinchRef = React.useRef(null);
  const movedRef = React.useRef(false);

  // Animate transitions between district jumps
  const [vp, setVp] = React.useState({ w: window.innerWidth, h: window.innerHeight });
  React.useEffect(() => {
    const r = () => setVp({ w: window.innerWidth, h: window.innerHeight });
    window.addEventListener('resize', r);
    return () => window.removeEventListener('resize', r);
  }, []);

  // viewBox math: center on (view.cx, view.cy) at view.scale
  const visW = vp.w / view.scale;
  const visH = vp.h / view.scale;
  const vbx = view.cx - visW / 2;
  const vby = view.cy - visH / 2;

  // Pan + pinch (pointer events: unified mouse / touch / pen)
  const isChromeTarget = (target) => target.closest(
    '.detail-panel, .topbar, .zoom-controls, .district-jump, .tweaks-panel, .mobile-bar, .mobile-sheet, .mobile-sheet-backdrop, .poster-titlestrip, .tour-controls, .tour-caption'
  );
  const onPointerDown = (e) => {
    if (isChromeTarget(e.target)) return;
    e.target.setPointerCapture?.(e.pointerId);
    pointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    movedRef.current = false;
    if (pointersRef.current.size === 1) {
      draggingRef.current = { x: e.clientX, y: e.clientY, view: viewRef.current };
      stageRef.current?.classList.add('dragging');
      pinchRef.current = null;
    } else if (pointersRef.current.size === 2) {
      draggingRef.current = null;
      movedRef.current = true; // any 2-finger gesture counts as movement
      const pts = [...pointersRef.current.values()];
      const midX = (pts[0].x + pts[1].x) / 2;
      const midY = (pts[0].y + pts[1].y) / 2;
      const dist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
      const rect = stageRef.current.getBoundingClientRect();
      const v = viewRef.current;
      pinchRef.current = {
        startDist: dist,
        startScale: v.scale,
        anchorX: v.cx + (midX - rect.left - rect.width / 2) / v.scale,
        anchorY: v.cy + (midY - rect.top - rect.height / 2) / v.scale,
      };
    }
  };
  const onPointerMove = (e) => {
    if (!pointersRef.current.has(e.pointerId)) return;
    pointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointersRef.current.size >= 2 && pinchRef.current) {
      const pts = [...pointersRef.current.values()].slice(0, 2);
      const midX = (pts[0].x + pts[1].x) / 2;
      const midY = (pts[0].y + pts[1].y) / 2;
      const dist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
      const ratio = dist / pinchRef.current.startDist;
      const newScale = Math.max(0.32, Math.min(2.4, pinchRef.current.startScale * ratio));
      const rect = stageRef.current.getBoundingClientRect();
      setView({
        cx: pinchRef.current.anchorX - (midX - rect.left - rect.width / 2) / newScale,
        cy: pinchRef.current.anchorY - (midY - rect.top - rect.height / 2) / newScale,
        scale: newScale,
      });
    } else if (pointersRef.current.size === 1 && draggingRef.current) {
      const d = draggingRef.current;
      if (Math.hypot(e.clientX - d.x, e.clientY - d.y) > 6) movedRef.current = true;
      const dx = (e.clientX - d.x) / d.view.scale;
      const dy = (e.clientY - d.y) / d.view.scale;
      setView({ ...d.view, cx: d.view.cx - dx, cy: d.view.cy - dy });
    }
  };
  const onPointerUp = (e) => {
    try { e.target.releasePointerCapture?.(e.pointerId); } catch (_) {}
    pointersRef.current.delete(e.pointerId);
    if (pointersRef.current.size < 2) pinchRef.current = null;
    if (pointersRef.current.size === 0) {
      draggingRef.current = null;
      stageRef.current?.classList.remove('dragging');
    } else if (pointersRef.current.size === 1) {
      const [remaining] = pointersRef.current.values();
      draggingRef.current = { x: remaining.x, y: remaining.y, view: viewRef.current };
    }
  };

  // Wheel zoom
  const onWheel = (e) => {
    e.preventDefault();
    const dir = e.deltaY < 0 ? 1 : -1;
    const factor = 1 + dir * 0.12;
    setView(v => {
      const newScale = Math.max(0.32, Math.min(2.4, v.scale * factor));
      // Zoom toward cursor
      const rect = stageRef.current.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;
      const sceneX = v.cx + (mx - rect.width / 2) / v.scale;
      const sceneY = v.cy + (my - rect.height / 2) / v.scale;
      const cx = sceneX - (mx - rect.width / 2) / newScale;
      const cy = sceneY - (my - rect.height / 2) / newScale;
      return { cx, cy, scale: newScale };
    });
  };

  // Pick handler — clicking a building selects it and pans to it
  const pick = (id) => {
    const e = window.ENTITIES[id];
    setSelected(id);
    if (e) {
      setView(v => {
        const targetScale = Math.max(0.7, v.scale);
        return { cx: e.pos.x, cy: e.pos.y + 20, scale: targetScale };
      });
    }
  };

  const jumpTo = (key) => setView(DISTRICT_VIEWS[key]);

  // Smooth jump (animated transition)
  React.useEffect(() => {
    // initial fly-in: start at full overview then zoom into local town
    let start = performance.now();
    const from = DISTRICT_VIEWS.full;
    const to = DISTRICT_VIEWS.local;
    let raf;
    const step = (now) => {
      const t = Math.min(1, (now - start) / 1400);
      const e = 1 - Math.pow(1 - t, 3);
      setView({
        cx: from.cx + (to.cx - from.cx) * e,
        cy: from.cy + (to.cy - from.cy) * e,
        scale: from.scale + (to.scale - from.scale) * e,
      });
      if (t < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, []);

  // Which entities are highlighted when a flow is selected
  const dimmedSet = React.useMemo(() => {
    if (activeTour) {
      const tour = window.TOURS[activeTour];
      const step = tour && tour.steps[tourStep];
      if (step && step.focus && step.focus.length) return new Set(step.focus);
    }
    if (!selectedFlow) return null;
    return new Set(window.FLOWS[selectedFlow].stops);
  }, [selectedFlow, activeTour, tourStep]);

  // Focus set: which entities have a tour halo
  const tourFocusSet = React.useMemo(() => {
    if (!activeTour) return null;
    const step = window.TOURS[activeTour].steps[tourStep];
    return step && step.focus ? new Set(step.focus) : null;
  }, [activeTour, tourStep]);

  /* ----- Tour progress animation (rAF) ----- */
  React.useEffect(() => {
    if (!activeTour || !tourPlaying) return;
    const step = window.TOURS[activeTour].steps[tourStep];
    if (!step) return;
    let rafId;
    let start = performance.now();
    const total = step.duration;
    const loop = (now) => {
      const t = Math.min(1, (now - start) / total);
      setTourProgress(t);
      if (t < 1) {
        rafId = requestAnimationFrame(loop);
      } else {
        // Advance or finish
        const tour = window.TOURS[activeTour];
        if (tourStep < tour.steps.length - 1) {
          setTourStep(s => s + 1);
          setTourProgress(0);
        } else {
          setTourPlaying(false);
        }
      }
    };
    rafId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafId);
  }, [activeTour, tourStep, tourPlaying]);

  /* ----- View animation: ease into each tour step's view ----- */
  React.useEffect(() => {
    if (!activeTour) return;
    const tour = window.TOURS[activeTour];
    const step = tour && tour.steps[tourStep];
    if (!step || !step.view) return;
    const target = step.view;
    const startView = { ...viewRef.current };
    let rafId;
    const start = performance.now();
    const dur = 1500;
    const loop = (now) => {
      const t = Math.min(1, (now - start) / dur);
      const e = 1 - Math.pow(1 - t, 3);
      setView({
        cx: startView.cx + (target.cx - startView.cx) * e,
        cy: startView.cy + (target.cy - startView.cy) * e,
        scale: startView.scale + (target.scale - startView.scale) * e,
      });
      if (t < 1) rafId = requestAnimationFrame(loop);
    };
    rafId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafId);
  }, [activeTour, tourStep]);

  const startTour = (id) => {
    setSelected(null);
    setSelectedFlow(null);
    setPickerOpen(false);
    setActiveTour(id);
    setTourStep(0);
    setTourProgress(0);
    setTourPlaying(true);
  };
  const exitTour = () => {
    setActiveTour(null);
    setTourStep(0);
    setTourProgress(0);
    setTourPlaying(false);
  };
  const stepTour = (dir) => {
    const tour = window.TOURS[activeTour];
    if (!tour) return;
    const next = Math.max(0, Math.min(tour.steps.length - 1, tourStep + dir));
    setTourStep(next);
    setTourProgress(0);
    setTourPlaying(false);
  };

  // Zoom buttons
  const zoom = (factor) => {
    setView(v => ({ ...v, scale: Math.max(0.32, Math.min(2.4, v.scale * factor)) }));
  };

  const currentTour = activeTour ? window.TOURS[activeTour] : null;
  const currentStep = currentTour ? currentTour.steps[tourStep] : null;

  /* When a tour is active, mark <body> so CSS can hide unrelated chrome */
  React.useEffect(() => {
    document.body.classList.toggle('tour-active', !!activeTour);
    return () => document.body.classList.remove('tour-active');
  }, [activeTour]);

  return (
    <>
      <div className="poster-shell">
        <div className="poster-mat">
          <div className="poster-rule">
            <div
              className={'busytown-stage' + (activeTour ? ' tour-active' : '')}
              ref={stageRef}
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              onPointerCancel={onPointerUp}
              onWheel={onWheel}
              onClickCapture={(e) => { if (movedRef.current) { e.stopPropagation(); e.preventDefault(); } }}
              onClick={() => { if (!movedRef.current) setSelected(null); }}
            >
              <svg
                className="scene-svg"
                viewBox={`${vbx} ${vby} ${visW} ${visH}`}
                xmlns="http://www.w3.org/2000/svg"
              >
                <SceneDefs />
                <SkyAndGround width={SCENE_W} groundY={GROUND_Y} />
                <Roads groundY={GROUND_Y} />
                <SceneFederal groundY={GROUND_Y}
                              selectedId={selected}
                              dimmedSet={dimmedSet}
                              onPick={pick}
                              onHover={setHoveredId}
                              onLeave={() => setHoveredId(null)}
                              showLabels={tweaks.showLabels}
                              showExtras={tweaks.showExtras} />
                <SceneState   groundY={GROUND_Y}
                              selectedId={selected}
                              dimmedSet={dimmedSet}
                              onPick={pick}
                              onHover={setHoveredId}
                              onLeave={() => setHoveredId(null)}
                              showLabels={tweaks.showLabels}
                              showExtras={tweaks.showExtras} />
                <SceneLocal   groundY={GROUND_Y}
                              selectedId={selected}
                              dimmedSet={dimmedSet}
                              onPick={pick}
                              onHover={setHoveredId}
                              onLeave={() => setHoveredId(null)}
                              showLabels={tweaks.showLabels}
                              showExtras={tweaks.showExtras} />
                {/* Regular flow layer hides during a tour so the tour sprite owns the stage */}
                {!activeTour && (
                  <FlowsLayer selectedFlow={selectedFlow}
                              animate={tweaks.animateVehicles}
                              dimmedSet={dimmedSet} />
                )}
                {/* Tour sprite layer */}
                {activeTour && (
                  <TourLayer
                    tour={currentTour}
                    step={tourStep}
                    progress={tourProgress}
                    focusSet={tourFocusSet} />
                )}
                {/* Paper-grain wash on top — gives the watercolor-on-paper feel */}
                <rect x={vbx} y={vby} width={visW} height={visH}
                      fill="url(#paper-grain)" style={{ pointerEvents: 'none' }} />
              </svg>
            </div>

            {/* Poster title cartouche — top center inside the frame */}
            <div className="poster-titlestrip">
              <div className="poster-title-ornament left">✦</div>
              <div className="poster-title-inner">
                <div className="poster-title">The Workforce Busytown</div>
                <div className="poster-sub">an illustrated map of the U.S. workforce investment system</div>
              </div>
              <div className="poster-title-ornament right">✦</div>
            </div>

            {/* Decorative corner flourishes */}
            <div className="poster-corner tl" aria-hidden="true">✦</div>
            <div className="poster-corner tr" aria-hidden="true">✦</div>
            <div className="poster-corner bl" aria-hidden="true">✦</div>
            <div className="poster-corner br" aria-hidden="true">✦</div>
          </div>
        </div>
      </div>

      {/* Top-left chrome (inside the poster frame) */}
      <div className="topbar">
        <button className="action-pill tour-cta" onClick={() => setPickerOpen(true)}>
          ▸ Take a guided tour <span className="arrow">→</span>
        </button>
        <div className="flow-controls">
          <div className="flow-label">Highlight one funding stream</div>
          <div className="flow-pills">
            <button
              className={'flow-pill' + (!selectedFlow ? ' active' : '')}
              onClick={() => setSelectedFlow(null)}>
              all
            </button>
            {FLOW_PILLS.map(p => {
              const f = window.FLOWS[p.id];
              return (
                <button key={p.id}
                        className={'flow-pill' + (selectedFlow === p.id ? ' active' : '')}
                        onClick={() => setSelectedFlow(p.id)}>
                  <span className="swatch" style={{ background: f.color }} />
                  {p.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* District jump bar */}
      <div className="district-jump">
        <button onClick={() => jumpTo('federal')}>↑ Federal Mall</button>
        <button onClick={() => jumpTo('state')}>State Capital</button>
        <button onClick={() => jumpTo('local')}>The Town</button>
        <button onClick={() => jumpTo('full')}>Whole map</button>
      </div>

      {/* Zoom controls */}
      <div className="zoom-controls">
        <button onClick={() => zoom(1.25)}>+</button>
        <button onClick={() => zoom(0.8)}>−</button>
        <button className="jump" onClick={() => jumpTo('full')}>fit</button>
      </div>

      {/* Mobile bottom action bar */}
      {!selected && !activeTour && (
        <div className="mobile-bar">
          <div className="mobile-bar-row districts">
            <button className="mb-pill" onClick={() => jumpTo('federal')}>Federal</button>
            <button className="mb-pill" onClick={() => jumpTo('state')}>State</button>
            <button className="mb-pill" onClick={() => jumpTo('local')}>Local</button>
            <button className="mb-pill" onClick={() => jumpTo('full')}>All</button>
          </div>
          <div className="mobile-bar-row actions">
            <button className="mb-action tour" onClick={() => setPickerOpen(true)}>
              ▸ Guided tour
            </button>
            <button className="mb-action funding" onClick={() => setFundingSheetOpen(true)}>
              ◆ Funding{selectedFlow ? ` · ${window.FLOWS[selectedFlow].label}` : ''}
            </button>
          </div>
        </div>
      )}

      {/* Mobile funding sheet */}
      {fundingSheetOpen && (
        <div className="mobile-sheet-backdrop" onClick={() => setFundingSheetOpen(false)}>
          <div className="mobile-sheet" onClick={(ev) => ev.stopPropagation()}>
            <div className="ms-handle" />
            <div className="ms-title">Highlight a funding stream</div>
            <div className="ms-flows">
              <button
                className={'flow-pill' + (!selectedFlow ? ' active' : '')}
                onClick={() => { setSelectedFlow(null); setFundingSheetOpen(false); }}>
                all streams
              </button>
              {FLOW_PILLS.map(p => {
                const f = window.FLOWS[p.id];
                return (
                  <button key={p.id}
                          className={'flow-pill' + (selectedFlow === p.id ? ' active' : '')}
                          onClick={() => { setSelectedFlow(p.id); setFundingSheetOpen(false); }}>
                    <span className="swatch" style={{ background: f.color }} />
                    {p.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Tweaks panel */}
      {window.TweaksPanel && (
        <TweaksPanel title="Tweaks">
          <TweakSection title="Display">
            <TweakToggle label="Labels on the map"
                         value={tweaks.showLabels}
                         onChange={v => setTweak('showLabels', v)}
                         help="When off, labels appear only on click. The four AJC doors stay labeled." />
            <TweakToggle label="Background extras"
                         value={tweaks.showExtras}
                         onChange={v => setTweak('showExtras', v)}
                         help="Strollers, dogs, balloons, hidden ladybugs." />
            <TweakToggle label="Animate vehicles"
                         value={tweaks.animateVehicles}
                         onChange={v => setTweak('animateVehicles', v)}
                         help="Money trucks and the job-seeker drive the routes." />
          </TweakSection>
          <TweakSection title="Try clicking">
            <div style={{ fontSize: 13, lineHeight: 1.5, color: 'var(--ink-soft)' }}>
              Click <strong>any building</strong> to see what it is, who lives there, and which programs fund it.
              Click a <strong>funding pill</strong> at the top-left to highlight one stream of money across the whole town.
            </div>
          </TweakSection>
        </TweaksPanel>
      )}

      {selected && !activeTour && (
        <DetailPanel
          entityId={selected}
          onClose={() => setSelected(null)}
          onPick={pick}
        />
      )}

      {/* Hover tooltip — small floating card with longName + acronym + one-liner */}
      {hoveredId && !activeTour && !selected && (() => {
        const e = window.ENTITIES[hoveredId];
        if (!e) return null;
        const lvl = window.LEVELS[e.level];
        // Tooltip-style funding chips for entities that participate in flows
        const flowsHere = Object.entries(window.FLOWS)
          .filter(([, f]) => f.stops.includes(hoveredId))
          .slice(0, 3);
        return (
          <div ref={tooltipRef} className="hover-tooltip"
               style={{ left: lastMouseRef.current.x + 18, top: lastMouseRef.current.y + 18 }}>
            <div className="tip-header">
              {lvl && (
                <span className={'tip-chip ' + lvl.chip}>{lvl.label}</span>
              )}
              {e.acronym && <span className="tip-acro">{e.acronym}</span>}
            </div>
            <div className="tip-name">{e.longName}</div>
            {e.scarry && <div className="tip-scarry">— {e.scarry}</div>}
            {e.role && <div className="tip-role">{e.role}</div>}
            {flowsHere.length > 0 && (
              <div className="tip-flows">
                {flowsHere.map(([id, f]) => (
                  <span key={id} className="tip-flow-chip"
                        style={{ borderColor: f.color }}>
                    <span className="tip-flow-swatch" style={{ background: f.color }} />
                    {f.label}
                  </span>
                ))}
              </div>
            )}
            <div className="tip-cta">click to open</div>
          </div>
        );
      })()}

      {/* Tour picker modal */}
      {pickerOpen && (
        <div className="tour-picker-backdrop" onClick={() => setPickerOpen(false)}>
          <div className="tour-picker" onClick={(ev) => ev.stopPropagation()}>
            <button className="picker-close" onClick={() => setPickerOpen(false)}>×</button>
            <h2>Take a guided tour</h2>
            <p className="picker-sub">Pick a worker's journey or a money flow. The map will walk you through it.</p>
            {window.TOUR_ORDER.map(([sectionTitle, ids]) => (
              <div className="tour-section" key={sectionTitle}>
                <div className="tour-section-title">{sectionTitle}</div>
                <div className="tour-grid">
                  {ids.map(tid => {
                    const t = window.TOURS[tid];
                    return (
                      <button key={tid} className="tour-card" onClick={() => startTour(tid)}>
                        <div className="card-color-bar" style={{ background: t.color }} />
                        <h3>{t.title}</h3>
                        <p>{t.sub}</p>
                        <div className="card-stops">{t.steps.length} stops · ~{Math.round(t.steps.reduce((s, st) => s + st.duration, 0) / 1000)}s</div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tour caption + controls (when running) */}
      {activeTour && currentTour && currentStep && (
        <>
          <div className="tour-caption">
            <div className="cap-header">
              <div className="cap-pip" style={{ background: currentTour.color }} />
              <div className="cap-title">{currentTour.title}</div>
              <div className="cap-step">step {tourStep + 1} / {currentTour.steps.length}</div>
            </div>
            <div className="cap-body">{currentStep.caption}</div>
            <div className="cap-progress"
                 style={{ width: `${tourProgress * 100}%`, background: currentTour.color }} />
          </div>
          <div className="tour-controls">
            <button onClick={() => stepTour(-1)} disabled={tourStep === 0} title="Previous step">◀</button>
            <button className="play" onClick={() => {
              if (!tourPlaying && tourStep === currentTour.steps.length - 1 && tourProgress >= 0.999) {
                // restart
                setTourStep(0);
                setTourProgress(0);
              }
              setTourPlaying(p => !p);
            }}>
              {tourPlaying ? '❚❚ Pause' : (tourStep === currentTour.steps.length - 1 && tourProgress >= 0.999 ? '↺ Replay' : '▶ Play')}
            </button>
            <button onClick={() => stepTour(1)}
                    disabled={tourStep >= currentTour.steps.length - 1}
                    title="Next step">▶</button>
            <div className="step-of">
              {currentTour.kind === 'persona' ? 'person' : 'money'}
            </div>
            <button className="exit" onClick={exitTour}>✕ Exit tour</button>
          </div>
        </>
      )}
    </>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
