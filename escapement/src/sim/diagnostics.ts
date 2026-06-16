/**
 * Diagnostics: explain *why* a movement will not run as a causal chain, the way
 * a watchmaker reasons backward from "the balance isn't swinging" to the root
 * cause. This is the teaching engine for Layer 2 — never a bare pass/fail.
 */

import type { Diagnostic, PartId } from './types';
import { classify, LUBE_SITES, OIL_LABELS, type LubeApplication } from './lubrication';
import type { Condition } from './condition';

/** Parts that must be present (and correct) for the movement to run. */
export const REQUIRED_FOR_RUN: PartId[] = [
  'mainplate',
  'mainspring',
  'barrel',
  'ratchetWheel',
  'click',
  'centerWheel',
  'thirdWheel',
  'fourthWheel',
  'escapeWheel',
  'palletFork',
  'balance',
  'trainBridge',
  'palletBridge',
  'balanceCock',
];

const PART_LABELS: Record<PartId, string> = {
  mainplate: 'mainplate',
  mainspring: 'mainspring',
  barrel: 'barrel',
  barrelLid: 'barrel lid',
  click: 'click',
  ratchetWheel: 'ratchet wheel',
  centerWheel: 'center wheel',
  thirdWheel: 'third wheel',
  fourthWheel: 'fourth wheel',
  escapeWheel: 'escape wheel',
  palletFork: 'pallet fork',
  balance: 'balance',
  trainBridge: 'train bridge',
  palletBridge: 'pallet bridge',
  balanceCock: 'balance cock',
  cannonPinion: 'cannon pinion',
  minuteWheel: 'minute wheel',
  hourWheel: 'hour wheel',
  dial: 'dial',
  handsSet: 'hands',
};

/** Everything the diagnostics pass needs to know about the build's health. */
export interface AssemblyHealth {
  placed: Set<PartId>;
  /** Click engaged so the ratchet locks the mainspring. */
  clickEngaged: boolean;
  /** Pallet fork oriented so its jewels can lock the escape wheel. */
  palletOriented: boolean;
  /** Any train wheel currently not meshing with its neighbor. */
  misMeshed: PartId[];
  /** Mainspring state of charge 0..1. */
  wind: number;
}

/**
 * Build the ordered diagnostic chain. Earlier entries are nearer the root cause;
 * the UI shows the first error prominently. Returns an empty array when healthy.
 */
export function diagnose(h: AssemblyHealth): Diagnostic[] {
  const out: Diagnostic[] = [];

  // 1. Missing structural/train parts — nothing else matters until present.
  const missing = REQUIRED_FOR_RUN.filter((p) => !h.placed.has(p));
  if (missing.length > 0) {
    out.push({
      code: 'INCOMPLETE_TRAIN',
      message:
        `The movement is incomplete, so power cannot reach the escape wheel. ` +
        `Place: ${missing.map((p) => PART_LABELS[p]).join(', ')}.`,
      parts: missing,
      severity: 'error',
    });
    return out; // can't reason further until the train exists
  }

  // 2. A mis-meshed wheel breaks the power path at a specific gap.
  if (h.misMeshed.length > 0) {
    for (const p of h.misMeshed) {
      out.push({
        code: 'MISMESH',
        message:
          `The ${PART_LABELS[p]} is not meshing with its neighbour, so torque ` +
          `cannot cross that point in the train. Reseat it until the teeth engage.`,
        parts: [p],
        severity: 'error',
      });
    }
  }

  // 3. The click must lock the ratchet, or the spring just unwinds.
  if (!h.clickEngaged) {
    out.push({
      code: 'CLICK_DISENGAGED',
      message:
        `The click isn't locking the ratchet wheel, so the mainspring unwinds ` +
        `as fast as you wind it. With no stored torque the train has no power ` +
        `and the balance stops. Seat the click against the ratchet teeth.`,
      parts: ['click', 'ratchetWheel'],
      severity: 'error',
    });
  }

  // 4. A reversed pallet fork can't lock the escape wheel — no impulse.
  if (!h.palletOriented) {
    out.push({
      code: 'PALLET_REVERSED',
      message:
        `The pallet fork is reversed: its locking jewels face the wrong way, so ` +
        `the escape wheel slips past instead of giving the balance an impulse. ` +
        `The balance receives no energy and winds down. Flip the fork.`,
      parts: ['palletFork'],
      severity: 'error',
    });
  }

  // 5. Run-down spring (only meaningful once everything else is correct).
  if (out.length === 0 && h.wind <= 0) {
    out.push({
      code: 'RUN_DOWN',
      message: `The mainspring is fully run down. Wind the crown to store energy.`,
      parts: ['mainspring'],
      severity: 'warning',
    });
  }

  return out;
}

/** Layer-4 lubrication problems. Warnings: they degrade, they don't stop. */
export function lubricationDiagnostics(
  apps: Record<string, LubeApplication | undefined>,
): Diagnostic[] {
  const out: Diagnostic[] = [];
  for (const site of LUBE_SITES) {
    const app = apps[site.id];
    const fault = classify(app);
    if (fault === 'ok') continue;
    if (fault === 'dry') {
      out.push({
        code: `LUBE_DRY_${site.id}`,
        message: `${site.label} are running dry. Friction is high there, so amplitude sags and the pivot wears. Oil with ${OIL_LABELS[site.correctOil]}.`,
        parts: ['mainplate'],
        severity: 'warning',
      });
    } else if (fault === 'starved') {
      out.push({
        code: `LUBE_STARVED_${site.id}`,
        message: `${site.label} are under-oiled — not enough to fill the bearing. Add a touch more ${OIL_LABELS[site.correctOil]}.`,
        parts: ['mainplate'],
        severity: 'warning',
      });
    } else if (fault === 'flooded') {
      out.push({
        code: `LUBE_FLOODED_${site.id}`,
        message: `${site.label} are over-oiled. Excess oil spreads off the jewel and the gain is unstable. Wick away the surplus.`,
        parts: ['mainplate'],
        severity: 'warning',
      });
    } else if (fault === 'wrong-oil') {
      out.push({
        code: `LUBE_WRONG_${site.id}`,
        message: `${site.label} have the wrong oil. They want ${OIL_LABELS[site.correctOil]}; friction is higher than it should be.`,
        parts: ['mainplate'],
        severity: 'warning',
      });
    }
  }
  return out;
}

/** Layer-4 handling/condition problems. A broken pivot is a hard stop. */
export function conditionDiagnostics(c: Condition): Diagnostic[] {
  const out: Diagnostic[] = [];
  if (c.balancePivotBroken) {
    out.push({
      code: 'PIVOT_BROKEN',
      message:
        'The balance staff pivot is broken — the balance can no longer turn in its jewels, so the watch is dead. Rework the balance (fit a new staff).',
      parts: ['balance'],
      severity: 'error',
    });
  }
  if (c.hairspringBentDeg > 2) {
    out.push({
      code: 'HAIRSPRING_BENT',
      message: `The hairspring is distorted (${c.hairspringBentDeg.toFixed(0)}°). Its coils aren't breathing evenly, so the beat is off and the rate drifts between positions. Re-center it on the bench.`,
      parts: ['balance'],
      severity: 'warning',
    });
  }
  if (c.contamination > 0.4) {
    out.push({
      code: 'CONTAMINATED',
      message:
        'Dust and old oil are dragging on the pivots. Amplitude is down across the board — clean the movement and re-oil.',
      parts: ['mainplate'],
      severity: 'warning',
    });
  }
  if (c.wear > 0.4) {
    out.push({
      code: 'WORN',
      message:
        'The pivots are worn from running under-lubricated. A full service is due to restore amplitude and reserve.',
      parts: ['mainplate'],
      severity: 'warning',
    });
  }
  return out;
}
