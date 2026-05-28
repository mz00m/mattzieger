/**
 * Workforce World — Slice 1
 * Populates the 3D voxel world with the U.S. workforce system.
 * Entities (federal agencies, state boards, local orgs, employers, educators, CBOs)
 * are placed as buildings; flows (funding streams) are drawn as roads.
 *
 * Exported API: window.WORKFORCE with entityAt, entities, flows, ready flag.
 */

(function init() {
  // Poll until the Tiny World Builder app has booted.
  if (typeof setCell !== 'function' || typeof GRID !== 'number' || GRID <= 0) {
    return setTimeout(init, 100);
  }

  buildWorkforceWorld();
})();

function buildWorkforceWorld() {
  // Ensure required globals exist.
  if (!window.ENTITIES || !window.FLOWS) {
    console.error('WORKFORCE: ENTITIES or FLOWS not found');
    return;
  }

  const GRID_SIZE = 48;
  const entities3d = {};
  const placed = [];
  const skipped = [];

  /**
   * Translate 2D scene coordinates (3600 wide × 1100 tall) to 3D grid coords.
   * Federal mall: x 0–1100 → grid x 0–14
   * State capital: x 1100–2200 → grid x 14–29
   * Local town: x 2200–3600 → grid x 29–47
   * y 380–1080 → z 0–47
   */
  function to3D(x2d, y2d) {
    const x3d = Math.round((x2d * (GRID_SIZE - 1)) / 3600);
    const z3d = Math.round(((y2d - 380) * (GRID_SIZE - 1)) / 700);
    return {
      x: Math.max(0, Math.min(GRID_SIZE - 1, x3d)),
      z: Math.max(0, Math.min(GRID_SIZE - 1, z3d))
    };
  }

  /**
   * Assign floors (building height) based on organizational level and role.
   */
  function getFloors(entity) {
    const level = entity.level;
    const label = entity.label || '';

    // Cabinet departments and Congress
    if (label === 'congress') return 6;
    if (label === 'department of labor') return 5;
    if (label === 'department of education') return 5;
    if (label === 'health & human services') return 5;
    if (label === 'commerce & eda') return 5;

    // Federal sub-agencies
    if (level === 'federal') return 4;

    // State-level orgs
    if (level === 'state') return 4;

    // Local boards and AJC
    if (label === 'local workforce board') return 5;
    if (label === 'the jobs office') return 4;
    if (level === 'local') return 4;

    // Education (colleges, training)
    if (level === 'education') return 3;

    // Employers
    if (level === 'employer') return 3;

    // Funders and intermediaries
    if (level === 'funder') return 3;

    // People (flowers instead of houses, so no floors)
    if (level === 'people') return 0;

    return 2; // default
  }

  /**
   * Place entities as houses (or flowers for "people" level).
   */
  for (const [id, entity] of Object.entries(window.ENTITIES)) {
    // Skip grantees
    if (entity.level === 'grantee' || entity.grantee) {
      skipped.push(id);
      continue;
    }

    const pos = entity.pos;
    if (!pos) {
      skipped.push(id);
      continue;
    }

    const coords = to3D(pos.x, pos.y);
    const key = `${coords.x},${coords.z}`;

    // Check for collision; nudge if needed
    let finalCoords = { ...coords };
    let nudgeAttempts = 0;
    while (entities3d[`${finalCoords.x},${finalCoords.z}`] && nudgeAttempts < 4) {
      if (nudgeAttempts % 2 === 0) {
        finalCoords.x = Math.min(GRID_SIZE - 1, finalCoords.x + 1);
      } else {
        finalCoords.z = Math.min(GRID_SIZE - 1, finalCoords.z + 1);
      }
      nudgeAttempts++;
    }

    const coordKey = `${finalCoords.x},${finalCoords.z}`;
    entities3d[coordKey] = { id, ...entity, ...finalCoords };

    const floors = getFloors(entity);

    // Place house or flower
    if (entity.level === 'people') {
      // People: place a flower or tuft
      setCell(finalCoords.x, finalCoords.z, {
        terrain: 'grass',
        kind: 'flower',
        animate: false,
        impactDust: false
      });
    } else {
      // Organizations: place a house
      setCell(finalCoords.x, finalCoords.z, {
        terrain: 'grass',
        kind: 'house',
        floors: floors,
        animate: false,
        impactDust: false
      });
    }

    placed.push(id);
  }

  /**
   * Draw paths for funding flows.
   * For each flow, connect all stops with a Manhattan path.
   */
  const roads = [];
  for (const [flowId, flow] of Object.entries(window.FLOWS)) {
    if (!flow.stops || flow.stops.length < 2) continue;

    for (let i = 0; i < flow.stops.length - 1; i++) {
      const fromId = flow.stops[i];
      const toId = flow.stops[i + 1];

      const fromEntity = window.ENTITIES[fromId];
      const toEntity = window.ENTITIES[toId];

      if (!fromEntity || !toEntity || !fromEntity.pos || !toEntity.pos) continue;

      const fromCoords = to3D(fromEntity.pos.x, fromEntity.pos.y);
      const toCoords = to3D(toEntity.pos.x, toEntity.pos.y);

      // Manhattan path: move in x first, then in z
      let current = { ...fromCoords };
      while (current.x !== toCoords.x) {
        current.x += current.x < toCoords.x ? 1 : -1;
        setCell(current.x, current.z, {
          terrain: 'path',
          animate: false,
          impactDust: false
        });
        roads.push(`${current.x},${current.z}`);
      }

      while (current.z !== toCoords.z) {
        current.z += current.z < toCoords.z ? 1 : -1;
        setCell(current.x, current.z, {
          terrain: 'path',
          animate: false,
          impactDust: false
        });
        roads.push(`${current.x},${current.z}`);
      }
    }
  }

  // Remove duplicates
  const uniqueRoads = [...new Set(roads)];

  /**
   * Build entity lookup map for other agents.
   */
  const entitiesMap = {};
  for (const [id, entity] of Object.entries(entities3d)) {
    entitiesMap[entity.id] = {
      x: entity.x,
      z: entity.z,
      level: entity.level,
      label: entity.label
    };
  }

  /**
   * Expose window.WORKFORCE API for other agents to consume.
   */
  window.WORKFORCE = {
    GRID_SIZE: GRID_SIZE,

    /**
     * Get 3D coordinates for an entity ID.
     */
    entityAt(id) {
      return entitiesMap[id] ? { x: entitiesMap[id].x, z: entitiesMap[id].z } : null;
    },

    /**
     * Full entity map: id → { x, z, level, label }
     */
    entities: entitiesMap,

    /**
     * Direct reference to flows.
     */
    flows: window.FLOWS,

    /**
     * Ready flag for other agents.
     */
    ready: true
  };

  // Emit ready event for agents listening.
  window.dispatchEvent(new CustomEvent('workforce:ready'));

  // Log summary to console
  console.log(
    `WORKFORCE: placed ${placed.length} entities, ${uniqueRoads.length} roads at grid ${GRID_SIZE}`
  );
}
