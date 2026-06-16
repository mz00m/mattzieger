/**
 * The escapement as a finite state machine, driven by the balance.
 *
 * The pallet fork rests against an escape-wheel tooth (locked) until the balance,
 * swinging through center, knocks it free (unlock). The wheel then delivers a
 * brief push back to the balance (impulse) and advances by half a tooth before
 * the next tooth is caught on the opposite pallet (relock). Two beats — one off
 * each pallet — advance the wheel exactly one tooth, which is why a 15-tooth
 * wheel at 28,800 bph turns at 16 rev/min.
 *
 * The wheel only ever moves during impulse, and only if the going train can
 * actually deliver torque. With no power (run-down spring, or a broken click
 * letting it unwind) there is nothing to unlock against and the watch stops.
 */

import { BEATS_PER_ESCAPE_TOOTH, ESCAPE_WHEEL_TEETH } from './constants';
import type { Balance } from './balance';
import type { EscapementState } from './types';

/** Radians the escape wheel advances per beat (half a tooth). */
export const ESCAPE_ADVANCE_PER_BEAT =
  (2 * Math.PI) / ESCAPE_WHEEL_TEETH / BEATS_PER_ESCAPE_TOOTH;

export class Escapement {
  state: EscapementState = 'lockedEntry';
  /** Absolute escape-wheel angle, radians. Drives the whole going train. */
  escapeTheta = 0;
  /** Sign of the balance angle on the previous step, for crossing detection. */
  private prevSign = 0;
  /** Count of beats (unlocks) since reset — useful for tests. */
  beats = 0;

  reset(): void {
    this.state = 'lockedEntry';
    this.escapeTheta = 0;
    this.prevSign = 0;
    this.beats = 0;
  }

  /**
   * Called after each balance integration step. If the balance crossed center
   * and the train has power, unlock: kick the balance, advance the wheel, and
   * relock on the opposite pallet. Returns true if a beat (tick/tock) occurred.
   */
  update(balance: Balance, hasPower: boolean): boolean {
    const sign = balance.theta > 0 ? 1 : balance.theta < 0 ? -1 : 0;
    let beat = false;

    if (sign !== 0 && this.prevSign !== 0 && sign !== this.prevSign && hasPower) {
      // Balance has passed through the escapement's center: unlock + impulse.
      balance.applyImpulse();
      this.escapeTheta += ESCAPE_ADVANCE_PER_BEAT;
      this.state = this.state === 'lockedEntry' ? 'lockedExit' : 'lockedEntry';
      this.beats += 1;
      beat = true;
    }

    if (sign !== 0) this.prevSign = sign;
    return beat;
  }
}
