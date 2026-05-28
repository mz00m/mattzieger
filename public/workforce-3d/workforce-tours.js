/**
 * workforce-tours.js
 * 3D Tour system for Tiny World Builder
 * Ports 6 worker-journey personas from the 2D workforce site to 3D.
 * Requires: window.WORKFORCE (from Slice 1), window.TOURS (from tours.jsx)
 */

(function() {
  'use strict';

  // ========== HELPER: nearestRoadCell ==========
  function nearestRoadCell(coord, maxRadius = 5) {
    if (!coord) return null;
    const { x, z } = coord;
    for (let r = 0; r <= maxRadius; r++) {
      for (let dx = -r; dx <= r; dx++) {
        for (let dz = -r; dz <= r; dz++) {
          if (Math.abs(dx) !== r && Math.abs(dz) !== r) continue;
          const nx = x + dx, nz = z + dz;
          if (window.world?.[nx]?.[nz]?.terrain === 'path') {
            return { x: nx, z: nz };
          }
        }
      }
    }
    return null;
  }

  // ========== TOUR STATE ==========
  let activeTour = null;
  let stepIndex = 0;
  let isPaused = false;
  let stepTimer = null;
  let progressInterval = null;
  let stepStartTime = 0;

  // ========== UI ELEMENTS ==========
  let tourOverlay = null;
  let tourPickerModal = null;
  let tourHUD = null;

  // ========== TOUR DATA PREPARATION ==========
  // Only persona tours, no grantees, no flows
  const PERSONA_TOURS = ['machinist', 'returning-mom', 'young-apprentice', 'veteran', 'vr-client', 'returnee'];

  function getTourMetadata(tourId) {
    const tour = window.TOURS?.[tourId];
    if (!tour) return null;
    return {
      id: tourId,
      title: tour.title,
      sub: tour.sub,
      color: tour.color,
      stepCount: tour.steps?.length || 0,
    };
  }

  // ========== TOUR EXECUTION ==========

  function resolveTourTarget(tourId, stepIdx) {
    const tour = window.TOURS?.[tourId];
    if (!tour || !tour.steps?.[stepIdx]) return null;

    const step = tour.steps[stepIdx];
    const focusId = step.focus?.[0];

    if (!focusId) {
      console.warn(`[WORKFORCE-TOURS] Step ${stepIdx} of ${tourId} has no focus entity.`);
      return null;
    }

    const entityCoord = window.WORKFORCE?.entityAt(focusId);
    if (!entityCoord) {
      console.warn(`[WORKFORCE-TOURS] Entity "${focusId}" not found for ${tourId} step ${stepIdx}.`);
      return null;
    }

    const roadCell = nearestRoadCell(entityCoord);
    if (!roadCell) {
      console.warn(`[WORKFORCE-TOURS] No nearby road cell for entity "${focusId}" (${entityCoord.x},${entityCoord.z}).`);
      return null;
    }

    return roadCell;
  }

  function startTour(tourId) {
    // Validate
    if (!window.WORKFORCE?.ready) {
      console.warn('[WORKFORCE-TOURS] WORKFORCE not ready yet.');
      return;
    }

    if (!PERSONA_TOURS.includes(tourId)) {
      console.warn(`[WORKFORCE-TOURS] Unknown tour: ${tourId}`);
      return;
    }

    const tour = window.TOURS?.[tourId];
    if (!tour || !tour.steps || tour.steps.length === 0) {
      console.warn(`[WORKFORCE-TOURS] Invalid tour: ${tourId}`);
      return;
    }

    // Validate first step has a road
    const firstTarget = resolveTourTarget(tourId, 0);
    if (!firstTarget) {
      console.warn(`[WORKFORCE-TOURS] Cannot start tour ${tourId}: first step has no nearby road.`);
      return;
    }

    // Stop any existing tour
    if (activeTour) {
      stopTour();
    }

    activeTour = { id: tourId, tour };
    stepIndex = 0;
    isPaused = false;
    showTourHUD();
    advanceToStep(0);
  }

  function advanceToStep(newStepIdx) {
    const tour = activeTour?.tour;
    if (!tour || newStepIdx < 0 || newStepIdx >= tour.steps.length) {
      return;
    }

    stepIndex = newStepIdx;
    const step = tour.steps[stepIndex];

    // Resolve target
    const target = resolveTourTarget(activeTour.id, stepIndex);
    if (!target) {
      // Skip this step and try the next
      console.warn(`[WORKFORCE-TOURS] Skipping step ${stepIndex}; advancing...`);
      if (stepIndex + 1 < tour.steps.length) {
        advanceToStep(stepIndex + 1);
      } else {
        finishTour();
      }
      return;
    }

    // Spawn or update vehicle
    if (stepIndex === 0) {
      spawnVehicle({
        x: target.x,
        z: target.z,
        goalX: target.x,
        goalZ: target.z,
        mode: 'auto',
        id: 'tour-active',
        visualScale: 0.9,
      });
    } else {
      updateVehicleGoal('tour-active', target.x, target.z);
    }

    // Update HUD
    updateTourHUD(step, stepIndex, tour.steps.length);

    // Schedule next step
    const duration = step.duration || 7000;
    stepStartTime = Date.now();
    clearTourTimer();

    if (!isPaused) {
      startStepTimer(duration);
    }
  }

  function startStepTimer(duration) {
    clearTourTimer();

    stepTimer = setTimeout(() => {
      if (stepIndex + 1 < activeTour.tour.steps.length) {
        advanceToStep(stepIndex + 1);
      } else {
        finishTour();
      }
    }, duration);

    // Progress bar animation
    updateProgressBar(duration);
  }

  function clearTourTimer() {
    if (stepTimer) clearTimeout(stepTimer);
    if (progressInterval) clearInterval(progressInterval);
  }

  function stopTour() {
    clearTourTimer();
    removeVehicle('tour-active');
    hideTourHUD();
    activeTour = null;
    stepIndex = 0;
  }

  function finishTour() {
    // Hold briefly then clean up
    setTimeout(() => {
      stopTour();
    }, 1500);
  }

  function pauseTour() {
    isPaused = true;
    clearTourTimer();
    const progressBar = tourHUD?.querySelector('.tour-progress-bar');
    if (progressBar) progressBar.style.animationPlayState = 'paused';
  }

  function resumeTour() {
    if (!isPaused) return;
    isPaused = false;

    const step = activeTour?.tour.steps?.[stepIndex];
    if (!step) return;

    const elapsed = Date.now() - stepStartTime;
    const duration = step.duration || 7000;
    const remaining = Math.max(0, duration - elapsed);

    const progressBar = tourHUD?.querySelector('.tour-progress-bar');
    if (progressBar) progressBar.style.animationPlayState = 'running';

    if (remaining > 0) {
      startStepTimer(remaining);
    } else {
      advanceToStep(stepIndex + 1);
    }
  }

  function prevStep() {
    if (!activeTour) return;
    if (stepIndex > 0) {
      advanceToStep(stepIndex - 1);
    }
  }

  function nextStep() {
    if (!activeTour) return;
    if (stepIndex + 1 < activeTour.tour.steps.length) {
      advanceToStep(stepIndex + 1);
    } else {
      finishTour();
    }
  }

  // ========== PROGRESS BAR ==========

  function updateProgressBar(duration) {
    const progressBar = tourHUD?.querySelector('.tour-progress-bar');
    if (!progressBar) return;

    progressBar.style.animation = 'none';
    progressBar.offsetHeight; // Trigger reflow
    progressBar.style.animation = `tour-progress ${duration}ms linear forwards`;
  }

  // ========== UI: TOUR HUD ==========

  function showTourHUD() {
    if (tourHUD) return;

    tourHUD = document.createElement('div');
    tourHUD.className = 'tour-hud';
    tourHUD.innerHTML = `
      <div class="tour-caption"></div>
      <div class="tour-progress-bar"></div>
      <div class="tour-controls">
        <button class="tour-btn tour-exit">Exit</button>
        <button class="tour-btn tour-prev">Prev</button>
        <button class="tour-btn tour-play-pause">Pause</button>
        <button class="tour-btn tour-next">Next</button>
      </div>
    `;

    tourHUD.querySelector('.tour-exit').addEventListener('click', stopTour);
    tourHUD.querySelector('.tour-prev').addEventListener('click', prevStep);
    tourHUD.querySelector('.tour-next').addEventListener('click', nextStep);

    const playPauseBtn = tourHUD.querySelector('.tour-play-pause');
    playPauseBtn.addEventListener('click', () => {
      if (isPaused) {
        resumeTour();
        playPauseBtn.textContent = 'Pause';
      } else {
        pauseTour();
        playPauseBtn.textContent = 'Resume';
      }
    });

    document.body.appendChild(tourHUD);
  }

  function hideTourHUD() {
    if (tourHUD) {
      tourHUD.remove();
      tourHUD = null;
    }
  }

  function updateTourHUD(step, idx, total) {
    if (!tourHUD) return;

    const captionEl = tourHUD.querySelector('.tour-caption');
    if (captionEl) {
      captionEl.textContent = step.caption || '';
    }

    // Reset progress bar for new step
    const progressBar = tourHUD.querySelector('.tour-progress-bar');
    if (progressBar) {
      progressBar.style.animation = 'none';
      progressBar.offsetHeight;
    }
  }

  // ========== UI: TOUR PICKER ==========

  function showTourPicker() {
    if (tourPickerModal) return;

    tourPickerModal = document.createElement('div');
    tourPickerModal.className = 'tour-picker-modal';

    let html = '<div class="tour-picker-inner"><div class="tour-picker-header"><h2>Choose a Tour</h2><button class="tour-picker-close">×</button></div><div class="tour-picker-grid">';

    PERSONA_TOURS.forEach(tourId => {
      const meta = getTourMetadata(tourId);
      if (meta) {
        html += `
          <div class="tour-card" data-tour="${tourId}" style="border-color: ${meta.color}">
            <div class="tour-card-title">${meta.title}</div>
            <div class="tour-card-sub">${meta.sub}</div>
            <div class="tour-card-steps">${meta.stepCount} steps</div>
          </div>
        `;
      }
    });

    html += '</div></div>';
    tourPickerModal.innerHTML = html;

    tourPickerModal.querySelector('.tour-picker-close').addEventListener('click', () => {
      tourPickerModal.remove();
      tourPickerModal = null;
    });

    tourPickerModal.querySelectorAll('.tour-card').forEach(card => {
      card.addEventListener('click', () => {
        const tourId = card.dataset.tour;
        tourPickerModal.remove();
        tourPickerModal = null;
        startTour(tourId);
      });
    });

    document.body.appendChild(tourPickerModal);
  }

  // ========== INIT ==========

  function init() {
    // Wait for WORKFORCE to be ready
    if (window.WORKFORCE?.ready) {
      onWorkforceReady();
    } else {
      window.addEventListener('workforce:ready', onWorkforceReady);
    }
  }

  function onWorkforceReady() {
    if (!window.TOURS) {
      console.warn('[WORKFORCE-TOURS] window.TOURS not found.');
      return;
    }

    // Inject styles
    injectStyles();

    // Create tour picker in top-left
    const tourPickerBtn = document.createElement('button');
    tourPickerBtn.className = 'tour-picker-btn';
    tourPickerBtn.textContent = 'Tours';
    tourPickerBtn.addEventListener('click', showTourPicker);
    document.body.appendChild(tourPickerBtn);

    // Register debug API
    window.WORKFORCE_TOURS = {
      start: startTour,
      stop: stopTour,
      step: (direction = 1) => {
        if (direction > 0) nextStep();
        else prevStep();
      },
      get active() {
        return activeTour ? { tourId: activeTour.id, stepIdx: stepIndex } : null;
      },
    };

    console.log(`[WORKFORCE-TOURS] registered ${PERSONA_TOURS.length} persona tours`);
  }

  // ========== STYLES ==========

  function injectStyles() {
    const style = document.createElement('style');
    style.textContent = `
      /* Tour Picker Button (top-left) */
      .tour-picker-btn {
        position: fixed;
        top: 24px;
        left: 24px;
        z-index: 1000;
        padding: 8px 14px;
        background: rgba(255, 255, 255, 0.85);
        border: 1px solid rgba(255, 255, 255, 0.7);
        border-radius: 6px;
        font-family: 'Inter', system-ui, -apple-system, sans-serif;
        font-size: 13px;
        font-weight: 500;
        color: #2a2722;
        cursor: pointer;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        backdrop-filter: blur(10px);
        transition: all 0.2s;
      }
      .tour-picker-btn:hover {
        background: rgba(255, 255, 255, 0.95);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      }
      .tour-picker-btn:active {
        transform: translateY(1px);
      }

      /* Tour Picker Modal */
      .tour-picker-modal {
        position: fixed;
        inset: 0;
        z-index: 2000;
        background: rgba(31, 26, 20, 0.7);
        backdrop-filter: blur(8px);
        display: flex;
        align-items: center;
        justify-content: center;
        animation: fadeIn 0.2s ease;
      }
      @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

      .tour-picker-inner {
        background: #faf3e3;
        border-radius: 12px;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        max-width: 600px;
        max-height: 80vh;
        overflow-y: auto;
        padding: 0;
        animation: slideUp 0.3s ease;
      }
      @keyframes slideUp {
        from { transform: translateY(20px); opacity: 0; }
        to { transform: translateY(0); opacity: 1; }
      }

      .tour-picker-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 24px;
        border-bottom: 1px solid #e4d6ae;
      }
      .tour-picker-header h2 {
        margin: 0;
        font-family: 'Fraunces', Georgia, serif;
        font-size: 24px;
        color: #1f1a14;
      }
      .tour-picker-close {
        background: transparent;
        border: none;
        font-size: 28px;
        color: #7a6e58;
        cursor: pointer;
        padding: 0;
        line-height: 1;
      }
      .tour-picker-close:hover { color: #1f1a14; }

      .tour-picker-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
        gap: 12px;
        padding: 24px;
      }

      .tour-card {
        padding: 16px;
        border: 2px solid;
        border-radius: 8px;
        background: rgba(255, 255, 255, 0.5);
        cursor: pointer;
        transition: all 0.2s;
      }
      .tour-card:hover {
        background: rgba(255, 255, 255, 0.9);
        transform: translateY(-2px);
        box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
      }

      .tour-card-title {
        font-family: 'Fraunces', Georgia, serif;
        font-size: 14px;
        font-weight: 600;
        color: #1f1a14;
        margin-bottom: 4px;
      }
      .tour-card-sub {
        font-size: 11px;
        color: #4a4136;
        margin-bottom: 8px;
        line-height: 1.3;
      }
      .tour-card-steps {
        font-size: 10px;
        color: #7a6e58;
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }

      /* Tour HUD (bottom) */
      .tour-hud {
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        z-index: 1500;
        background: linear-gradient(to top, rgba(31, 26, 20, 0.95), rgba(31, 26, 20, 0.85));
        backdrop-filter: blur(10px);
        padding: 16px 24px 24px;
        border-top: 1px solid rgba(255, 255, 255, 0.1);
      }

      .tour-caption {
        color: #faf3e3;
        font-family: 'Fraunces', Georgia, serif;
        font-size: 16px;
        line-height: 1.5;
        margin-bottom: 12px;
        max-width: 70%;
      }

      .tour-progress-bar {
        position: absolute;
        bottom: 0;
        left: 0;
        height: 3px;
        background: #e5722a;
        width: 0;
        animation: tour-progress 7000ms linear forwards;
      }
      @keyframes tour-progress {
        from { width: 0; }
        to { width: 100%; }
      }

      .tour-controls {
        display: flex;
        gap: 8px;
        margin-top: 12px;
      }

      .tour-btn {
        padding: 8px 14px;
        background: rgba(255, 255, 255, 0.15);
        border: 1px solid rgba(255, 255, 255, 0.3);
        border-radius: 4px;
        color: #faf3e3;
        font-family: 'Inter', system-ui, -apple-system, sans-serif;
        font-size: 12px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s;
      }
      .tour-btn:hover {
        background: rgba(255, 255, 255, 0.25);
        border-color: rgba(255, 255, 255, 0.5);
      }
      .tour-btn:active {
        transform: translateY(1px);
      }
    `;
    document.head.appendChild(style);
  }

  // Start on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
