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
  return new THREE.CylinderGeometry(radius, radius, thickness, 64);
}

/**
 * The escape wheel's distinctive hooked (club-tooth) profile: a slim rim with
 * fifteen forward-leaning teeth, unmistakably different from a train wheel.
 */
export function escapeWheelGeometry(radius: number, thickness: number): THREE.ExtrudeGeometry {
  const teeth = 15;
  const rTip = radius;
  const rRim = radius * 0.72;
  const step = (Math.PI * 2) / teeth;

  const shape = new THREE.Shape();
  for (let i = 0; i < teeth; i++) {
    const a0 = i * step;
    const front = a0 + step * 0.06; // steep locking face
    const back = a0 + step * 0.5; // long sloped back
    const px = (r: number, a: number) => Math.cos(a) * r;
    const py = (r: number, a: number) => Math.sin(a) * r;
    if (i === 0) shape.moveTo(px(rRim, a0), py(rRim, a0));
    else shape.lineTo(px(rRim, a0), py(rRim, a0));
    shape.lineTo(px(rTip, front), py(rTip, front));
    shape.lineTo(px(rTip, front + step * 0.1), py(rTip, front + step * 0.1));
    shape.lineTo(px(rRim, back), py(rRim, back));
    shape.lineTo(px(rRim, a0 + step), py(rRim, a0 + step));
  }
  // Lightening ring + bore, like the article's wheel.
  const bore = new THREE.Path();
  bore.absarc(0, 0, radius * 0.12, 0, Math.PI * 2, true);
  shape.holes.push(bore);
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2 + 0.4;
    const h = new THREE.Path();
    h.absarc(Math.cos(a) * radius * 0.42, Math.sin(a) * radius * 0.42, radius * 0.17, 0, Math.PI * 2, true);
    shape.holes.push(h);
  }

  const geo = new THREE.ExtrudeGeometry(shape, {
    depth: thickness,
    bevelEnabled: true,
    bevelThickness: thickness * 0.15,
    bevelSize: 0.008,
    bevelSegments: 1,
    curveSegments: 6,
  });
  geo.rotateX(-Math.PI / 2);
  geo.center();
  return geo;
}
