/**
 * Physical and design constants for the Bench 1 time-only movement.
 *
 * Numbers are chosen to match a real Swiss-lever, 28,800 bph movement as
 * described in Bartosz Ciechanowski's "Mechanical Watch". Where a value only
 * affects feel (inertia, damping) it is tuned for a stable, teachable sim; where
 * a value is load-bearing for timekeeping (frequency, gear ratios) it is exact.
 */

/** Beats per hour. A "beat" is one swing of the balance (a tick OR a tock). */
export const BEATS_PER_HOUR = 28_800;

/** Beats per second = 28800 / 3600 = 8. */
export const BEATS_PER_SECOND = BEATS_PER_HOUR / 3600;

/**
 * Oscillation frequency of the balance in Hz. Two beats make one full
 * oscillation (out and back), so 8 beats/s = 4 Hz.
 */
export const BALANCE_FREQUENCY_HZ = BEATS_PER_SECOND / 2; // 4 Hz

/** Nominal full oscillation period of the balance, in seconds. */
export const BALANCE_PERIOD_S = 1 / BALANCE_FREQUENCY_HZ; // 0.25 s

/** Natural angular frequency of the balance oscillator, rad/s. */
export const BALANCE_OMEGA0 = 2 * Math.PI * BALANCE_FREQUENCY_HZ; // 8π

/**
 * Balance wheel moment of inertia, kg·m². A real balance is ~1e-9 to 1e-8.
 * The absolute value is arbitrary for timekeeping (it cancels against the
 * hairspring stiffness) but anchors the torque/amplitude relationship.
 */
export const BALANCE_INERTIA = 1.2e-8;

/** Escape wheel tooth count. 15 is the classic Swiss-lever count. */
export const ESCAPE_WHEEL_TEETH = 15;

/**
 * Each escape wheel tooth is released in two stages — one lock per pallet — so
 * the wheel advances one tooth per two beats (one full oscillation).
 */
export const BEATS_PER_ESCAPE_TOOTH = 2;

/** A healthy mechanical watch swings to roughly 270° of amplitude, dial up. */
export const TARGET_AMPLITUDE_DEG = 275;

/** Full power reserve when fully wound, in hours. */
export const POWER_RESERVE_HOURS = 40;

/** Turns of the barrel needed for a full wind (≈ 40 h reserve at this train). */
export const FULL_WIND_TURNS = 7.0;

/** Seconds in a day, for rate conversions. */
export const SECONDS_PER_DAY = 86_400;
