/**
 * Procedural gear and wheel geometry. Wheels are generated from their actual
 * tooth count and pitch radius, so the gears you see are the gears the sim runs
 * on — the ratios are visibly honest. Stylized, not involute-perfect.
 */

import * as THREE from 'three';

export interface GearOptions {
  teeth: number;
  pitchRadius: number;
  thickness: number;
  /** Add lightening holes like a real wheel (skip for tiny pinions). */
  lightening?: boolean;
  /** Bore radius for the arbor. */
  bore?: number;
}

/** Build a flat-topped toothed wheel as an extruded shape. */
export function gearGeometry(opts: GearOptions): THREE.ExtrudeGeometry {
  const { teeth, pitchRadius, thickness } = opts;
  const bore = opts.bore ?? pitchRadius * 0.16;

  const addendum = pitchRadius * 0.08; // tooth height above pitch
  const rOuter = pitchRadius + addendum;
  const rRoot = pitchRadius - addendum;

  const shape = new THREE.Shape();
  const step = (Math.PI * 2) / teeth;
  // Each tooth: rise to outer over the first ~40% of the step, fall to root.
  const toothFrac = 0.42;
  for (let i = 0; i < teeth; i++) {
    const a0 = i * step;
    const a1 = a0 + step * toothFrac;
    const a2 = a0 + step;
    if (i === 0) shape.moveTo(Math.cos(a0) * rRoot, Math.sin(a0) * rRoot);
    shape.lineTo(Math.cos(a0) * rOuter, Math.sin(a0) * rOuter);
    shape.lineTo(Math.cos(a1) * rOuter, Math.sin(a1) * rOuter);
    shape.lineTo(Math.cos(a1) * rRoot, Math.sin(a1) * rRoot);
    shape.lineTo(Math.cos(a2) * rRoot, Math.sin(a2) * rRoot);
  }

  // Center bore.
  const hole = new THREE.Path();
  hole.absarc(0, 0, bore, 0, Math.PI * 2, true);
  shape.holes.push(hole);

  // Lightening holes for larger wheels.
  if (opts.lightening && pitchRadius > 0.8) {
    const spokeCount = 5;
    const ringR = pitchRadius * 0.55;
    const holeR = pitchRadius * 0.16;
    for (let i = 0; i < spokeCount; i++) {
      const a = (i / spokeCount) * Math.PI * 2;
      const h = new THREE.Path();
      h.absarc(Math.cos(a) * ringR, Math.sin(a) * ringR, holeR, 0, Math.PI * 2, true);
      shape.holes.push(h);
    }
  }

  const geo = new THREE.ExtrudeGeometry(shape, {
    depth: thickness,
    bevelEnabled: true,
    bevelThickness: thickness * 0.12,
    bevelSize: addendum * 0.15,
    bevelSegments: 1,
    curveSegments: 8,
  });
  geo.rotateX(-Math.PI / 2); // lay flat in the XZ plane
  geo.center();
  return geo;
}

/** A plain disc (mainplate, dial, barrel lid). */
export function discGeometry(radius: number, thickness: number): THREE.CylinderGeometry {
  return new THREE.CylinderGeometry(radius, radius, thickness, 48);
}

/**
 * The mainspring as a coiled steel ribbon — an Archimedean spiral band that
 * stands on edge, so you read it as a wound ribbon with gaps between coils,
 * not a flat disc. innerRadius hugs the arbor; outerRadius hugs the barrel wall.
 */
export function mainspringGeometry(opts: {
  innerRadius: number;
  outerRadius: number;
  turns: number;
  ribbon: number; // radial steel thickness of the ribbon
  height: number; // axial height (the visible "thickness")
}): THREE.ExtrudeGeometry {
  const { innerRadius, outerRadius, turns, ribbon, height } = opts;
  const totalAngle = turns * Math.PI * 2;
  const segs = Math.max(24, Math.floor(turns * 64));
  const rAt = (t: number) => innerRadius + (outerRadius - innerRadius) * t;

  const shape = new THREE.Shape();
  // Out along the inner edge of the ribbon…
  for (let i = 0; i <= segs; i++) {
    const t = i / segs;
    const a = t * totalAngle;
    const r = rAt(t);
    const x = Math.cos(a) * r;
    const y = Math.sin(a) * r;
    if (i === 0) shape.moveTo(x, y);
    else shape.lineTo(x, y);
  }
  // …and back along the outer edge, closing a thin spiral strip.
  for (let i = segs; i >= 0; i--) {
    const t = i / segs;
    const a = t * totalAngle;
    const r = rAt(t) + ribbon;
    shape.lineTo(Math.cos(a) * r, Math.sin(a) * r);
  }

  const geo = new THREE.ExtrudeGeometry(shape, {
    depth: height,
    bevelEnabled: false,
    curveSegments: 1,
  });
  geo.rotateX(-Math.PI / 2);
  geo.center();
  return geo;
}

/**
 * A bridge or cock: an organic, elongated plate with beveled (anglage) edges, a
 * jewel hole at the center and screw holes near each end — so it reads as a
 * finished, fitted bridge rather than a featureless disc. `screwOffsets` returns
 * the matching screw-seat positions so detail meshes line up with the holes.
 */
export function bridgeGeometry(opts: {
  radius: number;
  thickness: number;
  elongation?: number; // how stretched along the long (x) axis
  jewelBore?: number; // central jewel hole radius
}): THREE.ExtrudeGeometry {
  const { radius, thickness } = opts;
  const elong = opts.elongation ?? 0.4;
  const jewelBore = opts.jewelBore ?? radius * 0.16;

  const shape = new THREE.Shape();
  const N = 140;
  // A lobed outline: stretched along x with a slight asymmetric waist.
  const rAng = (a: number) =>
    (radius * (1 + elong * Math.cos(2 * a) + 0.07 * Math.cos(a))) / (1 + elong);
  for (let i = 0; i <= N; i++) {
    const a = (i / N) * Math.PI * 2;
    const r = rAng(a);
    const x = Math.cos(a) * r;
    const y = Math.sin(a) * r;
    if (i === 0) shape.moveTo(x, y);
    else shape.lineTo(x, y);
  }

  // Central jewel hole.
  const jewel = new THREE.Path();
  jewel.absarc(0, 0, jewelBore, 0, Math.PI * 2, true);
  shape.holes.push(jewel);

  // Screw holes near each long end.
  for (const sx of bridgeScrewOffsets(radius)) {
    const h = new THREE.Path();
    h.absarc(sx, 0, radius * 0.07, 0, Math.PI * 2, true);
    shape.holes.push(h);
  }

  const geo = new THREE.ExtrudeGeometry(shape, {
    depth: thickness,
    bevelEnabled: true,
    bevelThickness: thickness * 0.35,
    bevelSize: radius * 0.045,
    bevelSegments: 2,
    curveSegments: 6,
  });
  geo.rotateX(-Math.PI / 2);
  geo.center();
  return geo;
}

/** X positions of a bridge's screw seats (also where the holes are bored). */
export function bridgeScrewOffsets(radius: number): number[] {
  const d = radius * 0.74;
  return [-d, d];
}

/**
 * The pallet fork (lever escapement anchor) as a flat steel lever: two splayed
 * pallet arms reaching toward the escape wheel (-z) and a notched fork/horn on
 * the balance side (+z). Built as one extruded shape with the pivot at the
 * origin so it rocks about its true pivot.
 */
export function palletForkGeometry(opts: {
  scale: number;
  thickness: number;
}): THREE.ExtrudeGeometry {
  const s = opts.scale;
  // Outline in shape-space; after rotateX(-90), +Y maps to world -Z (toward the
  // escape wheel), so the arms sit at +Y and the fork/horn at -Y.
  const pts: [number, number][] = [
    [0.18, 0.06], // hub right
    [0.62, 0.42], // right arm outer
    [0.5, 0.62], // right pallet seat
    [0.3, 0.42], // right arm inner
    [0.1, 0.18], // inner valley
    [-0.1, 0.18],
    [-0.3, 0.42], // left arm inner
    [-0.5, 0.62], // left pallet seat
    [-0.62, 0.42], // left arm outer
    [-0.18, 0.06], // hub left
    [-0.16, -0.58], // tail left
    [-0.07, -0.58], // fork slot left
    [-0.07, -0.3], // slot bottom left
    [0.07, -0.3], // slot bottom right
    [0.07, -0.58], // fork slot right
    [0.16, -0.58], // tail right
  ];
  const shape = new THREE.Shape();
  pts.forEach(([x, y], i) => {
    if (i === 0) shape.moveTo(x * s, y * s);
    else shape.lineTo(x * s, y * s);
  });

  // Pivot bore.
  const bore = new THREE.Path();
  bore.absarc(0, 0, s * 0.08, 0, Math.PI * 2, true);
  shape.holes.push(bore);

  const geo = new THREE.ExtrudeGeometry(shape, {
    depth: opts.thickness,
    bevelEnabled: true,
    bevelThickness: opts.thickness * 0.3,
    bevelSize: s * 0.03,
    bevelSegments: 1,
    curveSegments: 4,
  });
  geo.rotateX(-Math.PI / 2);
  // Keep the pivot at the origin (don't recenter) so rocking pivots correctly.
  geo.translate(0, opts.thickness / 2, 0);
  return geo;
}

/** World positions of the two pallet-stone seats, matching palletForkGeometry. */
export function palletJewelSeats(scale: number): [number, number, number][] {
  // Shape (±0.5, 0.62) → world (±0.5s, _, -0.62s).
  return [
    [0.5 * scale, 0, -0.62 * scale],
    [-0.5 * scale, 0, -0.62 * scale],
  ];
}
