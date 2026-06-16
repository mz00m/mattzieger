/**
 * Short teaching beats, one per subsystem, shown the first time the player meets
 * that group of parts. Concise and causal — they explain how the mechanism works
 * so the player can predict what each part does before placing it.
 */

import type { PartGroup } from './parts';

export interface Explainer {
  group: PartGroup;
  title: string;
  body: string[];
  /** A one-line "try this" pointing at the live bench. */
  tryIt: string;
}

export const EXPLAINERS: Partial<Record<PartGroup, Explainer>> = {
  plate: {
    group: 'plate',
    title: 'The mainplate',
    body: [
      'Everything starts here. The mainplate is the brass body the whole movement is built on.',
      'Its drilled holes hold synthetic-ruby jewels — glass-hard, low-friction bearings the steel pivots spin in. Good jewels are why a watch can run ~40 hours on one wind without wearing out.',
    ],
    tryIt: 'Use the cutaway slider to see through the plate and bridges as you build.',
  },
  power: {
    group: 'power',
    title: 'Power: mainspring, barrel, click',
    body: [
      'Winding coils the mainspring tight inside the barrel. As it relaxes it pushes the barrel’s teeth, driving the whole train.',
      'Torque is highest at full wind and falls as the spring unwinds — that falling torque is what later makes amplitude (and rate) drift, the classic isochronism problem.',
      'The click is a one-way lock: it drops between ratchet-wheel teeth so you can wind but the spring can’t kick back. No click, no stored power.',
    ],
    tryIt: 'Wind the crown and watch the torque gauge climb; remove the click and watch it bleed away.',
  },
  train: {
    group: 'train',
    title: 'The going train',
    body: [
      'Four wheels in series — barrel, center, third, fourth — each large wheel driving the next small pinion.',
      'Speed multiplies at every mesh. Overall the seconds (fourth) wheel turns about 343× faster than the barrel, so ~7 barrel turns become ~2400 turns of the seconds hand.',
      'The fourth wheel is geared to turn exactly once per minute. The holes in the wheels lighten them, lowering inertia.',
    ],
    tryIt: 'Open the Train panel to see each mesh ratio multiply out to 343:1.',
  },
  escapement: {
    group: 'escapement',
    title: 'The escapement',
    body: [
      'The escape wheel wants to spin under mainspring torque, but the pallet fork’s two ruby jewels block it — locked.',
      'Each time the balance swings through center it nudges the fork, unlocking one tooth. The escaping tooth shoves the fork, which passes a tiny impulse back to the balance — then the next tooth locks on the other jewel.',
      'Two beats release one tooth, so a 15-tooth wheel turns at 16 rev/min. Flip the fork the wrong way and it can’t lock: no impulse, and the balance dies out.',
    ],
    tryIt: 'Toggle the pallet-fork orientation and read the diagnosis when impulse stops.',
  },
  balance: {
    group: 'balance',
    title: 'The balance & hairspring',
    body: [
      'A weighted wheel on a fine spiral hairspring. The spring always pulls it back to center, so it swings at a steady frequency — here 4 times a second.',
      'Each unlock gives it a small push, keeping it swinging; how far it swings (amplitude) depends on how much torque is arriving.',
      'Shorten the hairspring with the regulator and it swings faster (runs fast); lengthen it and it runs slow. Offset its rest point and the tick and tock fall unevenly — beat error.',
    ],
    tryIt: 'On the timegrapher, slide the regulator and watch the rate move with it.',
  },
  bridges: {
    group: 'bridges',
    title: 'Bridges & cocks',
    body: [
      'Pivots need a bearing top and bottom. The bridges and cocks cap the upper pivots, trapping each arbor between two jewels so the wheels run true.',
      'The balance cock also carries the regulator and the stud that anchors the hairspring — your two regulation controls.',
    ],
    tryIt: 'Fit the bridges last over each sub-assembly; the cutaway slider helps you line up the pivots.',
  },
  motion: {
    group: 'motion',
    title: 'Motion works',
    body: [
      'Under the dial, the cannon pinion taps off the center arbor to drive the minute hand, then gears down 12:1 through the minute and hour wheels to the hour hand.',
      'The cannon pinion grips by friction, not teeth — that clutch lets you turn the hands to set the time without forcing the running train.',
    ],
    tryIt: 'Once running, watch the minute and hour hands creep while the seconds sweep.',
  },
  dial: {
    group: 'dial',
    title: 'Dial & hands',
    body: [
      'The dial caps the works; the three hands press onto the seconds, minute, and hour arbors.',
      'With the hands fitted you can finally read the time the movement is keeping — and judge your regulation against the clock.',
    ],
    tryIt: 'Fit the hands, then speed up time to watch a full day pass.',
  },
};
