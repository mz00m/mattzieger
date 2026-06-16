/**
 * Diagnostics: explain *why* a movement will not run as a causal chain, the way
 * a watchmaker reasons backward from "the balance isn't swinging" to the root
 * cause. This is the teaching engine for Layer 2 — never a bare pass/fail.
 */

import type { Diagnostic, PartId } from './types';

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
