import { describe, expect, it } from 'vitest';
import { Balance, effectivePeriod, rateSecPerDay, beatErrorMs } from '../balance';
import { Escapement } from '../escapement';
import { BALANCE_FREQUENCY_HZ, BEATS_PER_SECOND, TARGET_AMPLITUDE_DEG } from '../constants';

const MICRO_DT = 1 / 4000;
const DEG = 180 / Math.PI;

/** Integrate a balance + escapement for `seconds`, reporting emergent metrics. */
function run(seconds: number, opts: { regulator?: number; studDeg?: number } = {}) {
  const balance = new Balance();
  const escapement = new Escapement();
  balance.setRegulator(opts.regulator ?? 0);
  balance.setEquilibriumDeg(opts.studDeg ?? 0);
  balance.setTorqueFraction(1);
  balance.nudge(3);

  const steps = Math.round(seconds / MICRO_DT);
  let peak = 0;
  const crossingTimes: number[] = [];
  for (let i = 0; i < steps; i++) {
    balance.step(MICRO_DT);
    const beat = escapement.update(balance, true);
    if (beat) crossingTimes.push(i * MICRO_DT);
    // Track peak amplitude only after it has had time to settle.
    if (i * MICRO_DT > seconds * 0.8) {
      const a = Math.abs(balance.theta - balance.thetaEq);
      if (a > peak) peak = a;
    }
  }
  return { beats: escapement.beats, peakDeg: peak * DEG, crossingTimes, seconds };
}

describe('balance oscillator', () => {
  it('oscillates at ~4 Hz (28,800 bph) under escapement impulses', () => {
    const { beats, seconds } = run(20);
    const beatsPerSec = beats / seconds;
    expect(beatsPerSec).toBeCloseTo(BEATS_PER_SECOND, 0); // ~8 beats/s
    expect(beatsPerSec / 2).toBeCloseTo(BALANCE_FREQUENCY_HZ, 0); // ~4 Hz
  });

  it('amplitude emerges near the target swing at full torque', () => {
    const { peakDeg } = run(120);
    // Converges toward ~275°; allow integration tolerance.
    expect(peakDeg).toBeGreaterThan(235);
    expect(peakDeg).toBeLessThan(305);
  });

  it('lower torque produces lower amplitude', () => {
    const full = new Balance();
    full.setTorqueFraction(1);
    const half = new Balance();
    half.setTorqueFraction(0.5);
    expect(half.impulseDv).toBeLessThan(full.impulseDv);
  });
});

describe('regulation model', () => {
  it('moving the regulator to + makes the watch run faster', () => {
    const slow = rateSecPerDay(-50, TARGET_AMPLITUDE_DEG, 0);
    const zero = rateSecPerDay(0, TARGET_AMPLITUDE_DEG, 0);
    const fast = rateSecPerDay(+50, TARGET_AMPLITUDE_DEG, 0);
    expect(slow).toBeLessThan(zero);
    expect(zero).toBeLessThan(fast);
    expect(zero).toBeCloseTo(0, 6);
  });

  it('shortening the hairspring (regulator +) shortens the period', () => {
    expect(effectivePeriod(+50)).toBeLessThan(effectivePeriod(0));
    expect(effectivePeriod(-50)).toBeGreaterThan(effectivePeriod(0));
  });

  it('beat error grows with residual stud offset and is zero when centered', () => {
    expect(beatErrorMs(0)).toBe(0);
    expect(beatErrorMs(5)).toBeGreaterThan(beatErrorMs(2));
  });

  it('beat error emerges as timing asymmetry when the stud is offset', () => {
    const centered = run(30, { studDeg: 0 });
    const offset = run(30, { studDeg: 8 });
    const asym = (c: number[]) => {
      // Compare adjacent half-periods near the end of the run.
      const n = c.length;
      const a = c[n - 1] - c[n - 2];
      const b = c[n - 2] - c[n - 3];
      return Math.abs(a - b);
    };
    expect(asym(offset.crossingTimes)).toBeGreaterThan(asym(centered.crossingTimes));
  });
});
