/**
 * Workforce Flows — 3D Vehicle Animation
 * Spawns and animates a driving vehicle for each WIOA funding stream.
 * Vehicles loop continuously through their source-to-destination stops.
 */

/** Helper: Find nearest road cell within maxRadius from a coordinate. */
function nearestRoadCell(coord, maxRadius = 5) {
  if (!coord) return null;
  const { x, z } = coord;
  for (let r = 0; r <= maxRadius; r++) {
    for (let dx = -r; dx <= r; dx++) {
      for (let dz = -r; dz <= r; dz++) {
        // Only check the perimeter of the square
        if (Math.abs(dx) !== r && Math.abs(dz) !== r) continue;
        const nx = x + dx, nz = z + dz;
        if (window.world?.[nx]?.[nz]?.terrain === 'path') return { x: nx, z: nz };
      }
    }
  }
  return null;
}

/** Helper: Resolve CSS custom property to hex color. */
function resolveCssVar(varName) {
  const val = getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
  if (!val) return '#888';
  // If val is already hex, return it
  if (val.startsWith('#')) return val;
  // If it's rgb/rgba, convert to hex
  const match = val.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (match) {
    const r = parseInt(match[1]).toString(16).padStart(2, '0');
    const g = parseInt(match[2]).toString(16).padStart(2, '0');
    const b = parseInt(match[3]).toString(16).padStart(2, '0');
    return `#${r}${g}${b}`;
  }
  return '#888';
}

/** Helper: Tint vehicle mesh to match flow color. */
function tintVehicle(state, hexColor) {
  if (!state?.mesh) return;
  const c = new THREE.Color(hexColor);
  state.mesh.traverse(child => {
    if (child.isMesh && child.material) {
      const mat = child.material;
      if (mat.name && /body|hood|cab/i.test(mat.name)) {
        mat.color.copy(c);
      }
    }
  });
}

/**
 * Create a flow controller for one funding stream.
 * Spawns a vehicle at the first stop, makes it loop through all stops.
 */
function createFlowController(flowId) {
  const flow = window.WORKFORCE.flows[flowId];
  if (!flow) {
    console.warn(`flow ${flowId}: not found in WORKFORCE.flows`);
    return null;
  }

  const stops = flow.stops;
  if (!stops || stops.length < 2) {
    console.warn(`flow ${flowId}: fewer than 2 stops`);
    return null;
  }

  // Check that all entities exist
  for (const stopId of stops) {
    if (!window.WORKFORCE.entityAt(stopId)) {
      console.warn(`flow ${flowId}: entity "${stopId}" not placed`);
      return null;
    }
  }

  // Find start and first destination
  const start = nearestRoadCell(window.WORKFORCE.entityAt(stops[0]));
  if (!start) {
    console.warn(`flow ${flowId}: no road cell near start (${stops[0]})`);
    return null;
  }

  const next = nearestRoadCell(window.WORKFORCE.entityAt(stops[1]));
  if (!next) {
    console.warn(`flow ${flowId}: no road cell near stop 1 (${stops[1]})`);
    return null;
  }

  // Spawn vehicle
  const vehicleId = `flow-${flowId}`;
  const vehicle = window.spawnVehicle?.({
    x: start.x,
    z: start.z,
    goalX: next.x,
    goalZ: next.z,
    mode: 'auto',
    id: vehicleId,
    visualScale: 0.8,
  });

  if (!vehicle) {
    console.warn(`flow ${flowId}: spawnVehicle returned null`);
    return null;
  }

  // Tint to flow color
  const colorVar = flow.color; // e.g., 'var(--flow-title1)'
  const varMatch = colorVar.match(/var\(([^)]+)\)/);
  if (varMatch) {
    const hexColor = resolveCssVar(varMatch[1]);
    tintVehicle(vehicle, hexColor);
  }

  // Start looping
  let cursor = 1; // We're heading to stops[1], so next cursor is 1
  const pollInterval = 1500; // Check for goal reach every 1.5s

  const intervalId = setInterval(() => {
    const snap = window.__getVehicleRuntimeSnapshot?.()?.vehicles?.find(s => s.id === vehicleId);
    if (!snap) return; // Vehicle removed

    const reachedGoal = !snap.path || snap.pathIndex >= snap.path.length - 1;
    if (reachedGoal) {
      cursor = (cursor + 1) % stops.length;
      const destCoord = window.WORKFORCE.entityAt(stops[cursor]);
      const destRoad = nearestRoadCell(destCoord);
      if (destRoad) {
        window.updateVehicleGoal?.(vehicleId, destRoad.x, destRoad.z);
      }
    }
  }, pollInterval);

  return { vehicleId, intervalId, flow };
}

/**
 * Initialize all flow vehicles after workforce:ready.
 */
function initWorkforceFlows() {
  if (!window.WORKFORCE) {
    console.warn('WORKFORCE-FLOWS: WORKFORCE not available');
    return;
  }

  if (!window.WORKFORCE.flows) {
    console.warn('WORKFORCE-FLOWS: WORKFORCE.flows not available');
    return;
  }

  const flowIds = Object.keys(window.WORKFORCE.flows);
  const controllers = [];

  for (const flowId of flowIds) {
    const controller = createFlowController(flowId);
    if (controller) {
      controllers.push(controller);
    }
  }

  console.log(`WORKFORCE-FLOWS: spawned ${controllers.length} flow vehicles`);
  return controllers;
}

/**
 * Wait for workforce:ready, then start flows.
 */
function setupWorkforceFlows() {
  // Check if already ready (race condition)
  if (window.WORKFORCE?.ready) {
    initWorkforceFlows();
    return;
  }

  // Otherwise, wait for the event
  window.addEventListener('workforce:ready', () => {
    initWorkforceFlows();
  });
}

// Start as soon as the script loads
setupWorkforceFlows();
