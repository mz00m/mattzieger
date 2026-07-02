/**
 * Part catalogue for Bench 1: identity, colour, where each piece sits, and the
 * teaching blurb that introduces it.
 *
 * The layout is *computed to mesh*: every wheel's pitch circle is tangent to the
 * pinion it drives (centre distance = wheel radius + pinion radius), and arbors
 * alternate between two working planes the way a real train stacks, so the gear
 * chain reads as a genuine mechanism rather than parts floating near each other.
 */

import type { PartId } from '../sim/types';

export type PartGroup = 'plate' | 'power' | 'train' | 'escapement' | 'balance' | 'bridges' | 'motion' | 'dial';

export interface PartDef {
  id: PartId;
  label: string;
  group: PartGroup;
  color: string;
  /** Snap position on the bench, [x, y, z] in mm-ish bench units. */
  pos: [number, number, number];
  /** For wheels: tooth count and pitch radius, so gears are drawn honestly. */
  teeth?: number;
  radius?: number;
  /** Pinion on the same arbor (rendered so the mesh contact is visible). */
  pinion?: { teeth: number; radius: number; y: number };
  /** Height/thickness for the 3D piece. */
  thickness?: number;
  /** One-line description shown on hover and in the tray. */
  blurb: string;
}

/** Group colours — one visual family per subsystem, kept tasteful and metallic. */
export const GROUP_COLORS: Record<PartGroup, string> = {
  plate: '#9aa2ad',
  power: '#c9a45b', // brass
  train: '#d9b96a', // gilt wheels
  escapement: '#a9c0da', // polished steel, ruby jewels drawn separately
  balance: '#c9803f', // warm gilded balance — the beating heart
  bridges: '#b7bec9', // rhodium bridges with Geneva stripes
  motion: '#8fbf8a',
  dial: '#2a3038',
};

/*
 * Meshing geometry (per-mesh module m, pitch radius = m·teeth/2):
 *   barrel(96)→center pinion(12):  m .032 → 1.536 + 0.192 = 1.728 apart
 *   center(90)→third pinion(12):   m .030 → 1.350 + 0.180 = 1.530 apart
 *   third(80)→fourth pinion(14):   m .028 → 1.120 + 0.196 = 1.316 apart
 *   fourth(96)→escape pinion(6):   m .022 → 1.056 + 0.066 = 1.122 apart
 * Two working planes so wheel and pinion heights line up across each mesh:
 *   plane A = 0.62, plane B = 0.95.
 */
export const PLANE_A = 0.62;
export const PLANE_B = 0.95;

export const BENCH1_PARTS: PartDef[] = [
  {
    id: 'mainplate',
    label: 'Mainplate',
    group: 'plate',
    color: GROUP_COLORS.plate,
    pos: [0, 0, 0],
    radius: 5.6,
    thickness: 0.5,
    blurb: 'The foundation. Every wheel, bridge and jewel locates to it.',
  },
  {
    id: 'mainspring',
    label: 'Mainspring',
    group: 'power',
    color: '#c6ccd4',
    pos: [-2.5, PLANE_A, 0.9],
    radius: 1.35,
    thickness: 0.45,
    blurb: 'A coiled ribbon of steel. Winding it stores the energy that runs the watch.',
  },
  {
    id: 'barrel',
    label: 'Barrel',
    group: 'power',
    color: GROUP_COLORS.power,
    pos: [-2.5, PLANE_A, 0.9],
    teeth: 96,
    radius: 1.536,
    thickness: 0.6,
    blurb: 'Houses the mainspring; its toothed rim drives the whole going train.',
  },
  {
    id: 'barrelLid',
    label: 'Barrel lid',
    group: 'power',
    color: '#d4b06a',
    pos: [-2.5, 1.02, 0.9],
    radius: 1.42,
    thickness: 0.08,
    blurb: 'Caps the barrel, keeping the mainspring contained around the arbor.',
  },
  {
    id: 'centerWheel',
    label: 'Center wheel',
    group: 'train',
    color: GROUP_COLORS.train,
    pos: [-0.86, PLANE_B, 0.37],
    teeth: 90,
    radius: 1.35,
    pinion: { teeth: 12, radius: 0.21, y: PLANE_A },
    thickness: 0.09,
    blurb: 'First wheel of the going train, driven by the barrel.',
  },
  {
    id: 'thirdWheel',
    label: 'Third wheel',
    group: 'train',
    color: '#d3ae57',
    pos: [0.58, PLANE_A, 0.89],
    teeth: 80,
    radius: 1.12,
    pinion: { teeth: 12, radius: 0.2, y: PLANE_B },
    thickness: 0.09,
    blurb: 'Carries power onward, stepping up the speed toward the escapement.',
  },
  {
    id: 'fourthWheel',
    label: 'Fourth wheel',
    group: 'train',
    color: '#e2c274',
    pos: [1.85, PLANE_B, 0.55],
    teeth: 96,
    radius: 1.056,
    pinion: { teeth: 14, radius: 0.22, y: PLANE_A },
    thickness: 0.08,
    blurb: 'Turns once a minute — it carries the seconds hand.',
  },
  {
    id: 'escapeWheel',
    label: 'Escape wheel',
    group: 'escapement',
    color: GROUP_COLORS.escapement,
    pos: [2.87, PLANE_A, 1.02],
    teeth: 15,
    radius: 0.6,
    pinion: { teeth: 6, radius: 0.13, y: PLANE_B },
    thickness: 0.07,
    blurb: 'Fifteen hooked teeth, released one at a time by the pallet fork.',
  },
  {
    id: 'palletFork',
    label: 'Pallet fork',
    group: 'escapement',
    color: '#8fa9c6',
    pos: [2.72, 0.78, 2.05],
    radius: 0.9,
    thickness: 0.1,
    blurb: 'Two ruby jewels lock and release the escape wheel, passing impulse to the balance.',
  },
  {
    id: 'balance',
    label: 'Balance & hairspring',
    group: 'balance',
    color: GROUP_COLORS.balance,
    pos: [2.55, 1.18, 3.35],
    radius: 1.32,
    thickness: 0.1,
    blurb: 'The timekeeper: a wheel on a hairspring, swinging 4 times a second.',
  },
  {
    id: 'trainBridge',
    label: 'Train bridge',
    group: 'bridges',
    color: GROUP_COLORS.bridges,
    pos: [1.0, 1.38, 0.7],
    radius: 2.3,
    thickness: 0.16,
    blurb: 'Caps the going-train pivots, holding the wheels true between two jewels.',
  },
  {
    id: 'palletBridge',
    label: 'Pallet bridge',
    group: 'bridges',
    color: '#adb4c0',
    pos: [2.72, 1.3, 2.05],
    radius: 0.62,
    thickness: 0.14,
    blurb: 'A small cock that holds the upper pallet-fork pivot.',
  },
  {
    id: 'balanceCock',
    label: 'Balance cock',
    group: 'bridges',
    color: '#bcc3ce',
    pos: [2.55, 1.62, 3.35],
    radius: 1.05,
    thickness: 0.14,
    blurb: 'Carries the upper balance jewel and the regulator that tunes the rate.',
  },
  {
    id: 'ratchetWheel',
    label: 'Ratchet wheel',
    group: 'power',
    color: '#cfa961',
    pos: [-2.5, 1.16, 0.9],
    teeth: 36,
    radius: 0.95,
    thickness: 0.1,
    blurb: 'Sits on the barrel arbor; the crown turns it to wind the mainspring.',
  },
  {
    id: 'click',
    label: 'Click',
    group: 'power',
    color: '#a8874c',
    pos: [-1.15, 1.16, 1.85],
    radius: 0.42,
    thickness: 0.1,
    blurb: 'A sprung pawl that drops between ratchet teeth so the spring can only wind, never unwind.',
  },
  {
    id: 'cannonPinion',
    label: 'Cannon pinion',
    group: 'motion',
    color: GROUP_COLORS.motion,
    pos: [-0.86, 1.55, 0.37],
    teeth: 12,
    radius: 0.28,
    thickness: 0.5,
    blurb: 'Friction-fit clutch on the center arbor; drives the minute hand and lets you set the time.',
  },
  {
    id: 'minuteWheel',
    label: 'Minute wheel',
    group: 'motion',
    color: '#7cb271',
    pos: [-1.95, 1.55, -0.35],
    teeth: 30,
    radius: 0.62,
    thickness: 0.09,
    blurb: 'Reduces the cannon pinion 60:1 on its way to the hour hand.',
  },
  {
    id: 'hourWheel',
    label: 'Hour wheel',
    group: 'motion',
    color: '#93c688',
    pos: [-0.86, 1.72, 0.37],
    teeth: 36,
    radius: 0.82,
    thickness: 0.09,
    blurb: 'Turns once every 12 hours, carrying the hour hand.',
  },
  {
    id: 'dial',
    label: 'Dial',
    group: 'dial',
    color: GROUP_COLORS.dial,
    pos: [0, 2.02, 0],
    radius: 5.35,
    thickness: 0.1,
    blurb: 'The face. Hides the works and marks the hours.',
  },
  {
    id: 'handsSet',
    label: 'Hands',
    group: 'dial',
    color: '#e8ecf2',
    pos: [0, 2.14, 0],
    radius: 0.2,
    thickness: 0.05,
    blurb: 'Hour, minute and seconds hands, fitted last.',
  },
];

export const PART_BY_ID: Record<PartId, PartDef> = Object.fromEntries(
  BENCH1_PARTS.map((p) => [p.id, p]),
) as Record<PartId, PartDef>;

/** Canonical assembly order (used for Layer-2 order enforcement). */
export const ASSEMBLY_ORDER: PartId[] = BENCH1_PARTS.map((p) => p.id);
