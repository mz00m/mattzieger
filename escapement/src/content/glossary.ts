/**
 * Glossary, color-keyed to part groups, populated from the vocabulary of
 * Ciechanowski's "Mechanical Watch". Always one tap away in the UI.
 */

import type { PartGroup } from './parts';

export interface GlossaryEntry {
  term: string;
  group: PartGroup | 'concept';
  definition: string;
}

export const GLOSSARY: GlossaryEntry[] = [
  {
    term: 'Mainspring',
    group: 'power',
    definition:
      'A long ribbon of spring steel coiled inside the barrel. Winding tightens it; as it relaxes it delivers torque to the going train. Its torque falls as it unwinds.',
  },
  {
    term: 'Barrel',
    group: 'power',
    definition:
      'The toothed drum that houses the mainspring. Its outer teeth drive the first wheel of the going train.',
  },
  {
    term: 'Going train',
    group: 'train',
    definition:
      'The gear chain barrel → center → third → fourth wheel that carries power to the escapement, stepping speed up about 343-fold so the barrel’s ~7 turns become ~2400 turns of the seconds wheel.',
  },
  {
    term: 'Pinion',
    group: 'train',
    definition:
      'The small gear on a wheel’s arbor. A large wheel drives the next wheel’s small pinion, which is how a gear train multiplies speed.',
  },
  {
    term: 'Escapement',
    group: 'escapement',
    definition:
      'Escape wheel plus pallet fork. It locks the going train, releases it one tooth at a time, and hands a small impulse to the balance on each release.',
  },
  {
    term: 'Pallet fork',
    group: 'escapement',
    definition:
      'A lever with two ruby jewels (entry and exit pallets) that alternately lock and release the escape wheel, transmitting impulse to the balance.',
  },
  {
    term: 'Balance wheel',
    group: 'balance',
    definition:
      'A weighted wheel on a hairspring that swings back and forth at a fixed frequency — the watch’s timekeeper. Here it runs at 4 Hz (28,800 beats/hour).',
  },
  {
    term: 'Hairspring',
    group: 'balance',
    definition:
      'A fine spiral spring (Nivarox, chosen for temperature stability) that returns the balance to center. Its effective length sets the rate; the regulator changes that length.',
  },
  {
    term: 'Beat / bph',
    group: 'concept',
    definition:
      'One swing of the balance is a beat. 28,800 beats per hour = 8 beats per second = a 4 Hz oscillation (two beats per full swing).',
  },
  {
    term: 'Amplitude',
    group: 'concept',
    definition:
      'How far the balance swings from center, in degrees. A healthy movement reaches ~270°. It rises with mainspring torque and falls as the watch winds down.',
  },
  {
    term: 'Beat error',
    group: 'concept',
    definition:
      'The timing asymmetry between the tick and the tock, in milliseconds. Caused by the balance resting off-center; corrected by rotating the hairspring stud/collet.',
  },
  {
    term: 'Rate',
    group: 'concept',
    definition:
      'How many seconds per day the watch gains (+) or loses (−). Adjusted with the regulator; influenced slightly by amplitude (isochronism).',
  },
  {
    term: 'Click & ratchet',
    group: 'power',
    definition:
      'A one-way lock: the click drops between ratchet-wheel teeth so the mainspring can be wound but cannot unwind. Remove it and the watch will not hold power.',
  },
  {
    term: 'Motion works',
    group: 'motion',
    definition:
      'The gearing under the dial — cannon pinion, minute wheel, hour wheel — that drives the minute and hour hands (60:1, then 12:1). The cannon pinion’s friction fit lets you set the time.',
  },
  {
    term: 'Mainplate & jewels',
    group: 'plate',
    definition:
      'The mainplate is the body everything mounts to. Synthetic-ruby jewels are low-friction bearings for the pivots, extending the power reserve toward ~40 hours and reducing wear.',
  },
];
