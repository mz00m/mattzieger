import { describe, expect, it } from 'vitest';
import { MovementSim } from '../movementSim';
import {
  LUBE_SITES,
  siteEfficiency,
  trainEfficiency,
  classify,
} from '../lubrication';

/** Build an rng that returns a fixed sequence (then repeats the last value). */
function seqRng(values: number[]): () => number {
  let i = 0;
  return () => values[Math.min(i++, values.length - 1)];
}

describe('lubrication model', () => {
  it('rewards the correct oil at the ideal dose and penalises dry / wrong / flooded', () => {
    const site = LUBE_SITES.find((s) => s.id === 'balanceJewels')!;
    const ideal = siteEfficiency(site, { oil: site.correctOil, dose: 1 });
    const dry = siteEfficiency(site, undefined);
    const wrong = siteEfficiency(site, { oil: 'heavy', dose: 1 });
    const flooded = siteEfficiency(site, { oil: site.correctOil, dose: 1.8 });

    expect(ideal).toBeGreaterThan(0.95);
    expect(dry).toBeLessThan(ideal);
    expect(wrong).toBeLessThan(ideal);
    expect(flooded).toBeLessThan(ideal);
  });

  it('classifies dose bands', () => {
    expect(classify(undefined)).toBe('dry');
    expect(classify({ oil: 'light', dose: 0.3 })).toBe('starved');
    expect(classify({ oil: 'light', dose: 1 })).toBe('ok');
    expect(classify({ oil: 'light', dose: 1.7 })).toBe('flooded');
  });

  it('a fully, correctly oiled train approaches efficiency 1', () => {
    const apps = Object.fromEntries(
      LUBE_SITES.map((s) => [s.id, { oil: s.correctOil, dose: 1 }]),
    );
    expect(trainEfficiency(apps)).toBeGreaterThan(0.97);
    expect(trainEfficiency({})).toBeLessThan(0.65); // all dry
  });
});

describe('Layer 4 — lubrication affects the running watch', () => {
  it('a dry train runs at lower amplitude and shorter reserve than an oiled one', () => {
    const dry = new MovementSim({ startAssembled: true, realism: true });
    dry.wind(7);
    const oiled = new MovementSim({ startAssembled: true, realism: true });
    oiled.oilAllCorrectly();
    oiled.wind(7);

    expect(oiled.snapshot().amplitudeDeg).toBeGreaterThan(dry.snapshot().amplitudeDeg);
    expect(oiled.snapshot().powerReserveHours).toBeGreaterThan(dry.snapshot().powerReserveHours);
    expect(dry.snapshot().diagnostics.some((d) => d.code.startsWith('LUBE_DRY'))).toBe(true);
  });

  it('realism off leaves Phase-1 behaviour untouched (efficiency 1)', () => {
    const sim = new MovementSim({ startAssembled: true });
    sim.wind(7);
    expect(sim.snapshot().trainEfficiency).toBe(1);
    expect(sim.snapshot().realism).toBe(false);
  });
});

describe('Layer 4 — positional variance', () => {
  it('vertical positions lose amplitude and the rate varies across positions', () => {
    const sim = new MovementSim({ startAssembled: true, realism: true, factoryPoise: 12 });
    sim.oilAllCorrectly();
    sim.wind(7);

    sim.setPosition('dialUp');
    const ampFlat = sim.snapshot().amplitudeDeg;
    sim.setPosition('crownDown');
    const ampVert = sim.snapshot().amplitudeDeg;
    expect(ampVert).toBeLessThan(ampFlat);

    const verticals = ['crownUp', 'crownDown', 'crownLeft', 'crownRight'] as const;
    const rates = verticals.map((p) => sim.positionRate(p));
    const spread = Math.max(...rates) - Math.min(...rates);
    expect(spread).toBeGreaterThan(8); // poise shows as cross-position rate spread

    // Horizontal positions are unaffected by poise.
    expect(sim.positionRate('dialUp')).toBeCloseTo(sim.positionRate('dialDown'), 6);
  });
});

describe('Layer 4 — handling damage and repair', () => {
  it('a hard shock breaks the balance pivot and stops the watch until reworked', () => {
    const sim = new MovementSim({ startAssembled: true, realism: true });
    sim.oilAllCorrectly();
    sim.wind(7);
    expect(sim.canRun()).toBe(true);

    sim.shock(0.7, seqRng([0])); // 0 < 0.7^2*0.8 -> pivot breaks
    expect(sim.snapshot().balancePivotBroken).toBe(true);
    expect(sim.canRun()).toBe(false);
    expect(sim.snapshot().diagnostics.some((d) => d.code === 'PIVOT_BROKEN')).toBe(true);

    sim.reworkBalance();
    expect(sim.canRun()).toBe(true);
  });

  it('a lighter shock bends the hairspring, adding beat error; re-centering helps', () => {
    const sim = new MovementSim({ startAssembled: true, realism: true });
    sim.oilAllCorrectly();
    sim.wind(7);
    const beat0 = sim.snapshot().beatErrorMs;

    // First rng avoids the pivot break, second triggers the bend branch.
    sim.shock(0.4, seqRng([0.9, 0.0, 0.5]));
    expect(sim.snapshot().hairspringBentDeg).toBeGreaterThan(0);
    expect(sim.snapshot().beatErrorMs).toBeGreaterThan(beat0);

    const bent = sim.snapshot().hairspringBentDeg;
    sim.recenterHairspring(0.9);
    expect(sim.snapshot().hairspringBentDeg).toBeLessThan(bent);
  });

  it('a full service clears contamination, wear, and damage', () => {
    const sim = new MovementSim({ startAssembled: true, realism: true });
    sim.condition.contamination = 0.7;
    sim.condition.wear = 0.6;
    sim.condition.hairspringBentDeg = 9;
    sim.service();
    const s = sim.snapshot();
    expect(s.contamination).toBe(0);
    expect(s.wear).toBe(0);
    expect(s.hairspringBentDeg).toBe(0);
    expect(s.trainEfficiency).toBeGreaterThan(0.97); // service re-oils correctly
  });
});
