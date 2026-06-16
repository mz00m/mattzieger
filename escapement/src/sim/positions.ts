/**
 * Positional variance — a Layer 4 mechanic.
 *
 * A real watch keeps slightly different time dial-up versus hanging crown-down.
 * Horizontal positions (dial up/down) give the highest amplitude because the
 * balance pivot rides on its flat end; vertical positions lose amplitude to side
 * friction, and any imbalance in the balance wheel ("poise error") shows up as a
 * rate that varies around the vertical positions. The end-game task is to
 * regulate so the watch keeps time *across* positions, not just one.
 */

export type WatchPosition =
  | 'dialUp'
  | 'dialDown'
  | 'crownUp'
  | 'crownDown'
  | 'crownLeft'
  | 'crownRight';

export const POSITIONS: { id: WatchPosition; label: string; vertical: boolean }[] = [
  { id: 'dialUp', label: 'Dial up', vertical: false },
  { id: 'dialDown', label: 'Dial down', vertical: false },
  { id: 'crownUp', label: 'Crown up', vertical: true },
  { id: 'crownDown', label: 'Crown down', vertical: true },
  { id: 'crownLeft', label: 'Crown left', vertical: true },
  { id: 'crownRight', label: 'Crown right', vertical: true },
];

/** Clock angle (deg) of each vertical position, for the poise projection. */
const POSITION_ANGLE: Record<WatchPosition, number | null> = {
  dialUp: null,
  dialDown: null,
  crownUp: 0,
  crownRight: 90,
  crownDown: 180,
  crownLeft: 270,
};

/** Amplitude multiplier: vertical positions sit ~12% lower than horizontal. */
export function positionAmplitudeFactor(pos: WatchPosition): number {
  return POSITION_ANGLE[pos] === null ? 1.0 : 0.88;
}

/**
 * Rate offset (s/day) this position contributes, from poise error. Horizontal
 * positions are ~unaffected; vertical positions vary as cos(angle − phase),
 * so the spread across the four verticals is about 2×magnitude.
 */
export function positionRateOffset(
  pos: WatchPosition,
  poiseMagnitude: number,
  poisePhaseDeg: number,
): number {
  const angle = POSITION_ANGLE[pos];
  if (angle === null) return 0;
  const rad = ((angle - poisePhaseDeg) * Math.PI) / 180;
  return poiseMagnitude * Math.cos(rad);
}
