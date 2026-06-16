/**
 * The balance: a damped, impulse-driven torsional oscillator.
 *
 *   I·θ'' = -k·(θ - θ_eq) - c·θ'  + (impulse kicks from the escapement)
 *
 * The hairspring supplies the restoring torque k; the regulator changes the
 * spring's effective length and therefore k (and so the rate). The stud/collet
 * offsets the rest position θ_eq, which makes the two half-swings unequal — the
 * physical origin of beat error. Amplitude is the steady state where the energy
 * injected by the escapement each beat balances the energy lost to damping.
 *
 * Two views of the same physics live here:
 *  - analytic steady-state helpers (amplitude, period, rate, beat error) used by
 *    the live snapshot — cheap, deterministic, and exact at the fixed point;
 *  - a numerical integrator used for the visible swing animation and to *verify*
 *    (in tests) that the analytic amplitude is the integrator's true steady state.
 */

import {
  BALANCE_INERTIA,
  BALANCE_OMEGA0,
  BALANCE_PERIOD_S,
  SECONDS_PER_DAY,
  TARGET_AMPLITUDE_DEG,
} from './constants';

const DEG = Math.PI / 180;

/** Nominal hairspring stiffness, N·m/rad. k = I·ω₀². */
export const K_NOMINAL = BALANCE_INERTIA * BALANCE_OMEGA0 * BALANCE_OMEGA0;

/** Damping ratio. High Q (~300) like a real, well-finished balance. */
export const DAMPING_ZETA = 0.0016;

/** Viscous damping coefficient c = 2·ζ·√(I·k) = 2·ζ·I·ω₀. */
export const DAMPING_C = 2 * DAMPING_ZETA * BALANCE_INERTIA * BALANCE_OMEGA0;

/**
 * Velocity kick (rad/s) delivered by the escapement each beat at full mainspring
 * torque. Chosen so the steady-state amplitude at full wind equals the target.
 * From A = Δv / (π·ζ·ω₀): Δv = A·π·ζ·ω₀.
 */
export const IMPULSE_DV_FULL =
  TARGET_AMPLITUDE_DEG * DEG * Math.PI * DAMPING_ZETA * BALANCE_OMEGA0;

/**
 * How strongly the regulator changes stiffness. Tuned so the full ±100 travel
 * covers roughly ±100 s/day — enough to correct a factory error and fine-tune.
 */
export const REGULATOR_SENSITIVITY = 2.3e-5;

/** Rate change per degree of amplitude away from target (isochronism error). */
export const ISOCHRONISM_COEFF = 0.03; // s/day per degree

/** Beat error produced per degree of (residual) stud offset. */
export const BEAT_ERROR_PER_DEG = 0.8; // ms per degree

/** Steady-state amplitude (degrees) as a function of torque fraction 0..1. */
export function steadyStateAmplitudeDeg(torqueFraction: number): number {
  return TARGET_AMPLITUDE_DEG * clamp01(torqueFraction);
}

/** Effective stiffness given the regulator index (-100..+100). */
export function effectiveStiffness(regulator: number): number {
  return K_NOMINAL * (1 + regulator * REGULATOR_SENSITIVITY);
}

/** Effective full-oscillation period (seconds) for a regulator setting. */
export function effectivePeriod(regulator: number): number {
  return 2 * Math.PI * Math.sqrt(BALANCE_INERTIA / effectiveStiffness(regulator));
}

/**
 * Rate in seconds/day. Positive = running fast. Combines:
 *  - the regulator (shorter spring → faster),
 *  - a fixed manufacturing offset the watch arrives with,
 *  - a small amplitude-dependent isochronism term.
 */
export function rateSecPerDay(
  regulator: number,
  amplitudeDeg: number,
  baseOffset: number,
): number {
  const fromRegulator =
    (BALANCE_PERIOD_S / effectivePeriod(regulator) - 1) * SECONDS_PER_DAY;
  const fromAmplitude = ISOCHRONISM_COEFF * (amplitudeDeg - TARGET_AMPLITUDE_DEG);
  return fromRegulator + baseOffset + fromAmplitude;
}

/** Beat error (ms) from the residual stud offset (player + factory). */
export function beatErrorMs(residualStudOffsetDeg: number): number {
  return Math.abs(residualStudOffsetDeg) * BEAT_ERROR_PER_DEG;
}

/**
 * Numerical balance for the live swing animation. It integrates the ODE with
 * RK4 and lets the escapement inject impulses, so the on-screen wheel really
 * swings under the modeled forces. Reported amplitude/rate/beat-error come from
 * the analytic helpers above; this provides motion and a verification target.
 */
export class Balance {
  theta = 0;
  omega = 0;
  /** Effective stiffness, set from the regulator. */
  k = K_NOMINAL;
  /** Equilibrium angle (rad), set from the residual stud offset. */
  thetaEq = 0;
  /** Per-beat velocity kick, scaled by torque. */
  impulseDv = IMPULSE_DV_FULL;

  setRegulator(regulator: number): void {
    this.k = effectiveStiffness(regulator);
  }

  setEquilibriumDeg(deg: number): void {
    this.thetaEq = deg * DEG;
  }

  setTorqueFraction(frac: number): void {
    this.impulseDv = IMPULSE_DV_FULL * clamp01(frac);
  }

  /** Give the balance a small starting push so it has somewhere to go. */
  nudge(omega: number): void {
    this.omega = omega;
  }

  private accel(theta: number, omega: number): number {
    return (-this.k * (theta - this.thetaEq) - DAMPING_C * omega) / BALANCE_INERTIA;
  }

  /** Advance one RK4 step of `dt` seconds (no impulse here). */
  step(dt: number): void {
    const a1 = this.accel(this.theta, this.omega);
    const k1x = this.omega;
    const k1v = a1;

    const k2x = this.omega + 0.5 * dt * k1v;
    const k2v = this.accel(this.theta + 0.5 * dt * k1x, this.omega + 0.5 * dt * k1v);

    const k3x = this.omega + 0.5 * dt * k2v;
    const k3v = this.accel(this.theta + 0.5 * dt * k2x, this.omega + 0.5 * dt * k2v);

    const k4x = this.omega + dt * k3v;
    const k4v = this.accel(this.theta + dt * k3x, this.omega + dt * k3v);

    this.theta += (dt / 6) * (k1x + 2 * k2x + 2 * k3x + k4x);
    this.omega += (dt / 6) * (k1v + 2 * k2v + 2 * k3v + k4v);
  }

  /** Apply an escapement impulse in the current direction of travel. */
  applyImpulse(): void {
    const dir = this.omega >= 0 ? 1 : -1;
    this.omega += dir * this.impulseDv;
  }
}

function clamp01(x: number): number {
  return x < 0 ? 0 : x > 1 ? 1 : x;
}
