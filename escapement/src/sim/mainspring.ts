/**
 * The power source: mainspring, barrel and arbor, with the click/ratchet that
 * keeps it wound.
 *
 * The mainspring stores energy as winding turns. Its delivered torque decays
 * roughly linearly as it unwinds — the real cause of the "isochronism" problem,
 * since falling torque lowers balance amplitude which in turn shifts the rate.
 * The click is a one-way lock: with it engaged the barrel can only be wound; with
 * it removed or broken the spring unwinds freely and the watch stops.
 */

import { FULL_WIND_TURNS } from './constants';

/** Torque (N·mm) at the barrel when fully wound. */
export const MAX_BARREL_TORQUE = 50;

/**
 * Fraction of max torque still delivered when the spring is nearly run down.
 * A real spring keeps some torque to the end; it does not fall to zero linearly.
 */
const MIN_TORQUE_FRACTION = 0.55;

export class Mainspring {
  /** Wind state of charge, 0 (run down) .. 1 (fully wound). */
  wind = 0;
  /** True if the click is engaged, locking the ratchet against unwinding. */
  clickEngaged = true;

  /** Wind the spring by `turns` barrel turns. Honors the slipping safety. */
  windTurns(turns: number): void {
    this.wind = clamp01(this.wind + turns / FULL_WIND_TURNS);
  }

  /** Set wind directly (0..1). */
  setWind(w: number): void {
    this.wind = clamp01(w);
  }

  /**
   * Torque currently delivered to the going train, N·mm. Falls with unwind.
   * Zero when fully run down past the floor (no charge left).
   */
  torque(): number {
    if (this.wind <= 0) return 0;
    const frac = MIN_TORQUE_FRACTION + (1 - MIN_TORQUE_FRACTION) * this.wind;
    return MAX_BARREL_TORQUE * frac;
  }

  /**
   * Advance the spring's unwind by the barrel having turned `barrelTurns`.
   * If the click is not engaged the spring would unwind explosively; the caller
   * detects that condition separately (it stops the watch). Here we just drain
   * charge proportional to barrel rotation under normal running.
   */
  drainByBarrelTurns(barrelTurns: number): void {
    this.wind = clamp01(this.wind - barrelTurns / FULL_WIND_TURNS);
  }
}

function clamp01(x: number): number {
  return x < 0 ? 0 : x > 1 ? 1 : x;
}
