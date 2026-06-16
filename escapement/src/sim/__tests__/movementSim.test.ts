import { describe, expect, it } from 'vitest';
import { MovementSim } from '../movementSim';
import { REQUIRED_FOR_RUN } from '../diagnostics';

function tickFor(sim: MovementSim, seconds: number, step = 0.1) {
  let t = 0;
  while (t < seconds) {
    sim.tick(step);
    t += step;
  }
}

describe('MovementSim — running the clock', () => {
  it('advances the seconds hand exactly one turn per 60s when regulated', () => {
    const sim = new MovementSim({ startAssembled: true });
    sim.wind(7); // full wind
    tickFor(sim, 60);
    const snap = sim.snapshot();
    // Fourth wheel carries the seconds hand: one revolution (2π) per minute.
    expect(snap.secondsAngle).toBeCloseTo(2 * Math.PI, 2);
  });

  it('runs only when fully assembled, wound, and fault-free', () => {
    const sim = new MovementSim({ startAssembled: true });
    sim.wind(7);
    expect(sim.canRun()).toBe(true);
    expect(sim.snapshot().diagnostics).toHaveLength(0);
  });

  it('reports an incomplete movement instead of running', () => {
    const sim = new MovementSim(); // nothing placed
    expect(sim.canRun()).toBe(false);
    const diag = sim.snapshot().diagnostics;
    expect(diag[0].code).toBe('INCOMPLETE_TRAIN');
    expect(sim.snapshot().running).toBe(false);
  });
});

describe('MovementSim — the click and ratchet', () => {
  it('stops the watch and unwinds the spring when the click is removed', () => {
    const sim = new MovementSim({ startAssembled: true });
    sim.wind(7);
    expect(sim.canRun()).toBe(true);

    sim.setClickEngaged(false);
    expect(sim.canRun()).toBe(false);
    expect(sim.snapshot().diagnostics.some((d) => d.code === 'CLICK_DISENGAGED')).toBe(true);

    const before = sim.snapshot().secondsAngle;
    tickFor(sim, 5);
    const after = sim.snapshot().secondsAngle;
    expect(after).toBe(before); // hands frozen
    expect(sim.snapshot().wind).toBeLessThan(1); // spring has unwound
  });
});

describe('MovementSim — a mis-meshed gear', () => {
  it('halts power and names the offending wheel', () => {
    const sim = new MovementSim({ startAssembled: true });
    sim.wind(7);
    sim.setMisMeshed(['thirdWheel']);

    expect(sim.canRun()).toBe(false);
    const diag = sim.snapshot().diagnostics;
    const mismesh = diag.find((d) => d.code === 'MISMESH');
    expect(mismesh).toBeDefined();
    expect(mismesh!.parts).toContain('thirdWheel');

    const before = sim.snapshot().secondsAngle;
    tickFor(sim, 5);
    expect(sim.snapshot().secondsAngle).toBe(before);
  });
});

describe('MovementSim — the timegrapher', () => {
  it('exposes rate, amplitude, and beat error', () => {
    const sim = new MovementSim({ startAssembled: true, factoryRateOffset: 40 });
    sim.wind(7);
    const snap = sim.snapshot();
    expect(snap.amplitudeDeg).toBeGreaterThan(0);
    expect(snap.rateSecPerDay).toBeGreaterThan(0);
    expect(typeof snap.beatErrorMs).toBe('number');
  });

  it('regulating toward minus corrects a fast factory rate', () => {
    const sim = new MovementSim({ startAssembled: true, factoryRateOffset: 40 });
    sim.wind(7);
    const fast = sim.snapshot().rateSecPerDay;
    expect(fast).toBeGreaterThan(30);

    sim.setRegulator(-40);
    const corrected = sim.snapshot().rateSecPerDay;
    expect(Math.abs(corrected)).toBeLessThan(Math.abs(fast));
  });

  it('the stud control zeroes a factory beat error', () => {
    const sim = new MovementSim({ startAssembled: true, factoryStudOffset: 4 });
    sim.wind(7);
    const before = sim.snapshot().beatErrorMs;
    expect(before).toBeGreaterThan(0);
    sim.setStud(-4);
    expect(sim.snapshot().beatErrorMs).toBeCloseTo(0, 6);
  });
});

describe('MovementSim — the full apprentice journey (loose parts -> regulated)', () => {
  it('assembles from nothing, runs, and regulates to within target', () => {
    const sim = new MovementSim({ factoryRateOffset: 48, factoryStudOffset: 5 });

    // 1. Loose parts: nothing runs, and the cause is reported.
    expect(sim.canRun()).toBe(false);
    expect(sim.snapshot().diagnostics[0].code).toBe('INCOMPLETE_TRAIN');

    // 2. Place each required part, one at a time.
    for (const part of REQUIRED_FOR_RUN) sim.placePart(part);

    // 3. It still won't run until wound — and says so.
    expect(sim.canRun()).toBe(false);
    expect(sim.snapshot().diagnostics[0].code).toBe('RUN_DOWN');

    // 4. Wind it: now it runs.
    sim.wind(7);
    expect(sim.canRun()).toBe(true);

    // 5. It arrives running fast and out of beat.
    expect(sim.snapshot().rateSecPerDay).toBeGreaterThan(40);
    expect(sim.snapshot().beatErrorMs).toBeGreaterThan(2);

    // 6. Regulate: dial the rate to ~0 and center the beat.
    sim.setStud(-5); // cancel the factory stud offset
    // Find a regulator setting that zeroes the rate (the player does this by feel).
    let lo = -100;
    let hi = 0;
    for (let i = 0; i < 40; i++) {
      const mid = (lo + hi) / 2;
      sim.setRegulator(mid);
      if (sim.snapshot().rateSecPerDay > 0) hi = mid;
      else lo = mid;
    }

    const snap = sim.snapshot();
    expect(Math.abs(snap.rateSecPerDay)).toBeLessThanOrEqual(15);
    expect(snap.beatErrorMs).toBeLessThanOrEqual(0.8);
    expect(snap.running).toBe(true);
  });
});
