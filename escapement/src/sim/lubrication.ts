/**
 * Lubrication — a Layer 4 mechanic.
 *
 * Every pivot bearing and the escapement contact surfaces need the *right* oil in
 * the *right* dose. Correct lubrication keeps friction low, so the balance reaches
 * full amplitude and the spring lasts toward ~40 hours. Run a jewel dry and
 * friction climbs, amplitude falls, and the pivot wears. Flood it and the oil
 * spreads off the jewel over time, so the gain is unstable and slowly lost.
 *
 * The article's lesson: jewels are oiled bearings, and oiling is a craft of type
 * and quantity, not just "add oil".
 */

/** Watch oils, simplified to the families a watchmaker actually reaches for. */
export type OilType =
  | 'none'
  | 'light' // 9010 — fast, lightly loaded pivots (escape, balance)
  | 'heavy' // HP-1300 — slower, heavily loaded train pivots, barrel arbor
  | 'grease' // Molykote — sliding surfaces (keyless, cannon-pinion clutch)
  | 'escapement'; // 9415 — pallet stones / escape teeth

export const OIL_LABELS: Record<OilType, string> = {
  none: 'dry',
  light: '9010 (light)',
  heavy: 'HP-1300 (heavy)',
  grease: 'Molykote (grease)',
  escapement: '9415 (escapement)',
};

export interface LubeSite {
  id: string;
  label: string;
  correctOil: OilType;
  /** Weight in the overall friction budget (escapement/balance dominate). */
  weight: number;
}

/** The Bench 1 oiling sites, jewel by jewel. */
export const LUBE_SITES: LubeSite[] = [
  { id: 'barrelArbor', label: 'Barrel arbor', correctOil: 'heavy', weight: 1 },
  { id: 'centerJewel', label: 'Center wheel jewels', correctOil: 'heavy', weight: 1 },
  { id: 'thirdJewel', label: 'Third wheel jewels', correctOil: 'heavy', weight: 1 },
  { id: 'fourthJewel', label: 'Fourth wheel jewels', correctOil: 'light', weight: 1.2 },
  { id: 'escapeJewel', label: 'Escape wheel jewels', correctOil: 'light', weight: 1.6 },
  { id: 'palletStones', label: 'Pallet stones', correctOil: 'escapement', weight: 2.2 },
  { id: 'balanceJewels', label: 'Balance jewels', correctOil: 'light', weight: 2.4 },
];

/** What the player has applied at one site. dose: 0 (dry) .. ~1.6 (flooded). */
export interface LubeApplication {
  oil: OilType;
  dose: number;
}

export type LubeFault = 'dry' | 'wrong-oil' | 'starved' | 'flooded' | 'ok';

const IDEAL_DOSE = 1.0;
const STARVED_BELOW = 0.55;
const FLOODED_ABOVE = 1.35;

/** Classify one site's lubrication. */
export function classify(app: LubeApplication | undefined): LubeFault {
  if (!app || app.oil === 'none' || app.dose <= 0.01) return 'dry';
  return classifyApplied(app);
}

function classifyApplied(app: LubeApplication): LubeFault {
  if (app.dose < STARVED_BELOW) return 'starved';
  if (app.dose > FLOODED_ABOVE) return 'flooded';
  return 'ok';
}

/**
 * Friction efficiency at one site, 0..1 (1 = ideal, frictionless-ish). Wrong oil
 * caps the achievable efficiency; dose shapes it around the ideal.
 */
export function siteEfficiency(site: LubeSite, app: LubeApplication | undefined): number {
  const fault = classify(app);
  if (fault === 'dry') return 0.6;
  // app is defined past here.
  const a = app as LubeApplication;
  const wrong = a.oil !== site.correctOil;
  const ceiling = wrong ? 0.82 : 1.0;

  let doseFactor: number;
  if (a.dose < STARVED_BELOW) {
    // Linear from dry-ish up to ideal.
    doseFactor = 0.72 + (0.28 * a.dose) / STARVED_BELOW;
  } else if (a.dose > FLOODED_ABOVE) {
    // Flooded: still oiled but degraded and unstable.
    doseFactor = Math.max(0.8, 1 - (a.dose - FLOODED_ABOVE) * 0.5);
  } else {
    // In-band: peak at the ideal dose.
    doseFactor = 1 - Math.abs(a.dose - IDEAL_DOSE) * 0.15;
  }
  return Math.min(ceiling, ceiling * doseFactor);
}

/** Weighted-average efficiency of the whole train, 0..1. */
export function trainEfficiency(apps: Record<string, LubeApplication | undefined>): number {
  let num = 0;
  let den = 0;
  for (const site of LUBE_SITES) {
    num += site.weight * siteEfficiency(site, apps[site.id]);
    den += site.weight;
  }
  return den > 0 ? num / den : 1;
}
