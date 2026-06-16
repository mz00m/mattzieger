/**
 * Part catalogue for Bench 1: identity, colour, where each piece snaps on the
 * mainplate, and the teaching beat that introduces it. Colours follow the spirit
 * of the source article — each functional group reads as a distinct family.
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
  /** For wheels: pitch radius and tooth count, so gears are drawn honestly. */
  teeth?: number;
  radius?: number;
  /** Height/thickness for the 3D piece. */
  thickness?: number;
  /** One-line description shown on hover and in the tray. */
  blurb: string;
}

/** Group colours — colourblind-aware, high-contrast families. */
export const GROUP_COLORS: Record<PartGroup, string> = {
  plate: '#8b8f96',
  power: '#d98a3d', // brass/amber
  train: '#e0c558', // gilt wheels
  escapement: '#5fb0d4', // steel-blue, ruby jewels drawn separately
  balance: '#c0463b', // the beating heart, warm red
  bridges: '#9aa0a8',
  motion: '#7bbd6f',
  dial: '#e8e6df',
};

export const BENCH1_PARTS: PartDef[] = [
  {
    id: 'mainplate',
    label: 'Mainplate',
    group: 'plate',
    color: GROUP_COLORS.plate,
    pos: [0, 0, 0],
    radius: 6,
    thickness: 0.6,
    blurb: 'The foundation. Every wheel, bridge and jewel locates to it.',
  },
  {
    id: 'mainspring',
    label: 'Mainspring',
    group: 'power',
    color: '#b5b5b5',
    pos: [-3.2, 0.5, 1.6],
    radius: 1.5,
    thickness: 0.5,
    blurb: 'A coiled ribbon of steel. Winding it stores the energy that runs the watch.',
  },
  {
    id: 'barrel',
    label: 'Barrel',
    group: 'power',
    color: GROUP_COLORS.power,
    pos: [-3.2, 0.6, 1.6],
    teeth: 96,
    radius: 1.7,
    thickness: 0.7,
    blurb: 'Houses the mainspring; its toothed rim drives the whole going train.',
  },
  {
    id: 'barrelLid',
    label: 'Barrel lid',
    group: 'power',
    color: '#c79a5a',
    pos: [-3.2, 0.95, 1.6],
    radius: 1.7,
    thickness: 0.15,
    blurb: 'Caps the barrel, keeping the mainspring contained around the arbor.',
  },
  {
    id: 'centerWheel',
    label: 'Center wheel',
    group: 'train',
    color: GROUP_COLORS.train,
    pos: [-0.8, 0.7, 0.6],
    teeth: 90,
    radius: 1.3,
    thickness: 0.25,
    blurb: 'First wheel of the going train, driven by the barrel.',
  },
  {
    id: 'thirdWheel',
    label: 'Third wheel',
    group: 'train',
    color: '#d4b94a',
    pos: [1.0, 0.7, 1.4],
    teeth: 80,
    radius: 1.1,
    thickness: 0.25,
    blurb: 'Carries power onward, stepping up the speed toward the escapement.',
  },
  {
    id: 'fourthWheel',
    label: 'Fourth wheel',
    group: 'train',
    color: '#e6cd66',
    pos: [2.4, 0.7, 0.2],
    teeth: 96,
    radius: 1.2,
    thickness: 0.25,
    blurb: 'Turns once a minute — it carries the seconds hand.',
  },
  {
    id: 'escapeWheel',
    label: 'Escape wheel',
    group: 'escapement',
    color: GROUP_COLORS.escapement,
    pos: [3.4, 0.7, 1.5],
    teeth: 15,
    radius: 0.7,
    thickness: 0.18,
    blurb: 'Fifteen pointed teeth, released one at a time by the pallet fork.',
  },
  {
    id: 'palletFork',
    label: 'Pallet fork',
    group: 'escapement',
    color: '#7fc3e0',
    pos: [3.0, 0.9, 2.7],
    radius: 0.9,
    thickness: 0.15,
    blurb: 'Two ruby jewels lock and release the escape wheel, passing impulse to the balance.',
  },
  {
    id: 'balance',
    label: 'Balance & hairspring',
    group: 'balance',
    color: GROUP_COLORS.balance,
    pos: [3.0, 1.1, 4.0],
    radius: 1.8,
    thickness: 0.2,
    blurb: 'The timekeeper: a wheel on a hairspring, swinging 4 times a second.',
  },
  {
    id: 'trainBridge',
    label: 'Train bridge',
    group: 'bridges',
    color: GROUP_COLORS.bridges,
    pos: [0.8, 1.4, 0.9],
    radius: 3.4,
    thickness: 0.3,
    blurb: 'Caps the going-train pivots, holding the wheels true between two jewels.',
  },
  {
    id: 'palletBridge',
    label: 'Pallet bridge',
    group: 'bridges',
    color: '#aab0b8',
    pos: [3.0, 1.4, 2.7],
    radius: 0.9,
    thickness: 0.25,
    blurb: 'A small cock that holds the upper pallet-fork pivot.',
  },
  {
    id: 'balanceCock',
    label: 'Balance cock',
    group: 'bridges',
    color: '#b8bec6',
    pos: [3.0, 1.7, 4.0],
    radius: 1.9,
    thickness: 0.25,
    blurb: 'Carries the upper balance jewel and the regulator that tunes the rate.',
  },
  {
    id: 'ratchetWheel',
    label: 'Ratchet wheel',
    group: 'power',
    color: '#caa05f',
    pos: [-3.2, 1.1, 1.6],
    teeth: 36,
    radius: 1.2,
    thickness: 0.2,
    blurb: 'Sits on the barrel arbor; the crown turns it to wind the mainspring.',
  },
  {
    id: 'click',
    label: 'Click',
    group: 'power',
    color: '#9a7b3f',
    pos: [-1.8, 1.1, 2.6],
    radius: 0.6,
    thickness: 0.2,
    blurb: 'A sprung pawl that drops between ratchet teeth so the spring can only wind, never unwind.',
  },
  {
    id: 'cannonPinion',
    label: 'Cannon pinion',
    group: 'motion',
    color: GROUP_COLORS.motion,
    pos: [-0.8, 1.7, 0.6],
    teeth: 12,
    radius: 0.5,
    thickness: 0.5,
    blurb: 'Friction-fit clutch on the center arbor; drives the minute hand and lets you set the time.',
  },
  {
    id: 'minuteWheel',
    label: 'Minute wheel',
    group: 'motion',
    color: '#6fb463',
    pos: [-2.0, 1.7, -0.4],
    teeth: 30,
    radius: 0.8,
    thickness: 0.2,
    blurb: 'Reduces the cannon pinion 60:1 on its way to the hour hand.',
  },
  {
    id: 'hourWheel',
    label: 'Hour wheel',
    group: 'motion',
    color: '#86c97a',
    pos: [-0.8, 1.85, 0.6],
    teeth: 36,
    radius: 0.9,
    thickness: 0.2,
    blurb: 'Turns once every 12 hours, carrying the hour hand.',
  },
  {
    id: 'dial',
    label: 'Dial',
    group: 'dial',
    color: GROUP_COLORS.dial,
    pos: [0, 2.2, 0],
    radius: 5.6,
    thickness: 0.15,
    blurb: 'The face. Hides the works and marks the hours.',
  },
  {
    id: 'handsSet',
    label: 'Hands',
    group: 'dial',
    color: '#222831',
    pos: [0, 2.5, 0],
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
