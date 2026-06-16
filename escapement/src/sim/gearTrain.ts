/**
 * The going train as a rotational state graph.
 *
 * Wheels are nodes carrying angular position/velocity; meshes are edges carrying
 * an exact gear ratio. Power flows barrel -> center -> third -> fourth -> escape,
 * each large wheel driving the next small pinion so speed increases toward the
 * escapement. Ratios are computed from honest tooth counts so the reductions the
 * player is taught are literally the ones the sim runs on.
 */

import type { TrainMesh, TrainNode } from './types';

/** Tooth/leaf counts for the Bench 1 going train. */
export const BENCH1_NODES: TrainNode[] = [
  // The barrel's outer wheel drives the train. Its arbor is wound by the crown.
  { id: 'barrel', label: 'Barrel', wheelTeeth: 96, pinionTeeth: 0, theta: 0, omega: 0 },
  // Center / second wheel.
  { id: 'centerWheel', label: 'Center wheel', wheelTeeth: 90, pinionTeeth: 12, theta: 0, omega: 0 },
  { id: 'thirdWheel', label: 'Third wheel', wheelTeeth: 80, pinionTeeth: 12, theta: 0, omega: 0 },
  // Fourth wheel carries the seconds hand: it turns once per minute.
  { id: 'fourthWheel', label: 'Fourth wheel', wheelTeeth: 96, pinionTeeth: 14, theta: 0, omega: 0 },
  // Escape wheel: 15 teeth, gated by the pallet fork.
  { id: 'escapeWheel', label: 'Escape wheel', wheelTeeth: 15, pinionTeeth: 6, theta: 0, omega: 0 },
];

/** Meshes: `from` wheel drives `to` pinion. */
export const BENCH1_MESHES: TrainMesh[] = [
  { from: 'barrel', to: 'centerWheel' },
  { from: 'centerWheel', to: 'thirdWheel' },
  { from: 'thirdWheel', to: 'fourthWheel' },
  { from: 'fourthWheel', to: 'escapeWheel' },
];

const byId = (nodes: TrainNode[], id: string): TrainNode => {
  const n = nodes.find((x) => x.id === id);
  if (!n) throw new Error(`Unknown train node: ${id}`);
  return n;
};

/**
 * Speed ratio across a single mesh = driver wheel teeth / driven pinion teeth.
 * omega(driven) = omega(driver) * meshRatio. (A reduction > 1 means the driven
 * pinion spins faster than the driving wheel.)
 */
export function meshRatio(nodes: TrainNode[], mesh: TrainMesh): number {
  const from = byId(nodes, mesh.from);
  const to = byId(nodes, mesh.to);
  return from.wheelTeeth / to.pinionTeeth;
}

/**
 * Product of mesh ratios along the chain fromId -> ... -> toId, following the
 * declared meshes. Returns omega(to) / omega(from).
 */
export function pathReduction(
  nodes: TrainNode[],
  meshes: TrainMesh[],
  fromId: string,
  toId: string,
): number {
  let current = fromId;
  let ratio = 1;
  const guard = meshes.length + 1;
  for (let i = 0; i < guard; i++) {
    if (current === toId) return ratio;
    const mesh = meshes.find((m) => m.from === current);
    if (!mesh) break;
    ratio *= meshRatio(nodes, mesh);
    current = mesh.to;
  }
  if (current !== toId) throw new Error(`No path ${fromId} -> ${toId}`);
  return ratio;
}

/** How much faster the seconds (fourth) wheel turns than the barrel. */
export function barrelToFourthReduction(nodes = BENCH1_NODES, meshes = BENCH1_MESHES): number {
  return pathReduction(nodes, meshes, 'barrel', 'fourthWheel');
}

/** Escape wheel speed relative to the fourth (seconds) wheel. */
export function fourthToEscapeRatio(nodes = BENCH1_NODES, meshes = BENCH1_MESHES): number {
  return pathReduction(nodes, meshes, 'fourthWheel', 'escapeWheel');
}

/**
 * Given the escape wheel's angular position, set every upstream wheel's theta by
 * the exact ratios. Used by the renderer so the visible train is always coherent
 * with the escapement. Direction alternates each mesh (meshing wheels counter-
 * rotate), which the renderer can use for visual correctness.
 */
export function propagateFromEscape(
  nodes: TrainNode[],
  meshes: TrainMesh[],
  escapeTheta: number,
  escapeOmega: number,
): void {
  const escape = byId(nodes, 'escapeWheel');
  escape.theta = escapeTheta;
  escape.omega = escapeOmega;

  // Walk backwards up the chain dividing out each mesh ratio. Meshing wheels
  // counter-rotate; the renderer applies that visually. Here we only scale the
  // magnitude of theta/omega by the exact ratio so the train stays coherent.
  const order = ['fourthWheel', 'thirdWheel', 'centerWheel', 'barrel'];
  let downstream = 'escapeWheel';
  for (const id of order) {
    const mesh = meshes.find((m) => m.from === id && m.to === downstream);
    if (!mesh) continue;
    const r = meshRatio(nodes, mesh);
    const node = byId(nodes, id);
    const dn = byId(nodes, downstream);
    node.theta = dn.theta / r;
    node.omega = dn.omega / r;
    downstream = id;
  }
}
