import { describe, expect, it } from 'vitest';
import {
  BENCH1_MESHES,
  BENCH1_NODES,
  barrelToFourthReduction,
  fourthToEscapeRatio,
  meshRatio,
  pathReduction,
} from '../gearTrain';

describe('going train ratios', () => {
  it('reduces barrel -> fourth (seconds) wheel by ~343:1', () => {
    const r = barrelToFourthReduction();
    // The seconds wheel turns ~343x faster than the barrel — the figure the
    // article cites for ~7 barrel turns becoming ~2400 seconds-hand turns.
    expect(r).toBeGreaterThan(338);
    expect(r).toBeLessThan(348);
    expect(Math.round(r)).toBe(343);
  });

  it('runs the escape wheel 16x faster than the seconds wheel (exact)', () => {
    expect(fourthToEscapeRatio()).toBeCloseTo(16, 10);
  });

  it('makes ~7 barrel turns become ~2400 seconds-wheel turns', () => {
    const barrelTurns = 7;
    const secondsTurns = barrelTurns * barrelToFourthReduction();
    expect(secondsTurns).toBeGreaterThan(2300);
    expect(secondsTurns).toBeLessThan(2500);
  });

  it('computes a single mesh ratio as wheel/pinion', () => {
    const ratio = meshRatio(BENCH1_NODES, BENCH1_MESHES[3]); // fourth -> escape
    expect(ratio).toBeCloseTo(96 / 6, 10);
  });

  it('throws when no path connects the requested nodes', () => {
    expect(() => pathReduction(BENCH1_NODES, BENCH1_MESHES, 'escapeWheel', 'barrel')).toThrow();
  });
});
