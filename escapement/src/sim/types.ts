/** Shared types for the headless movement simulation. */

/** Every distinct part the player can place on Bench 1. */
export type PartId =
  | 'mainplate'
  | 'mainspring'
  | 'barrel'
  | 'barrelLid'
  | 'click'
  | 'ratchetWheel'
  | 'centerWheel'
  | 'thirdWheel'
  | 'fourthWheel'
  | 'escapeWheel'
  | 'palletFork'
  | 'balance'
  | 'trainBridge'
  | 'palletBridge'
  | 'balanceCock'
  | 'cannonPinion'
  | 'minuteWheel'
  | 'hourWheel'
  | 'dial'
  | 'handsSet';

/** A node in the rotational state graph (a wheel or pinion arbor). */
export interface TrainNode {
  id: string;
  label: string;
  /** Teeth on the large wheel (0 if this arbor has only a pinion). */
  wheelTeeth: number;
  /** Leaves on the pinion (0 if this arbor has only a wheel). */
  pinionTeeth: number;
  /** Current absolute angular position, radians. */
  theta: number;
  /** Angular velocity, rad/s. */
  omega: number;
}

/** A mesh between two arbors: the `from` wheel drives the `to` pinion. */
export interface TrainMesh {
  from: string; // node id whose WHEEL drives
  to: string; // node id whose PINION is driven
}

/** Escapement finite-state-machine phases. */
export type EscapementState =
  | 'lockedEntry' // resting on the entry (left) pallet
  | 'lockedExit' // resting on the exit (right) pallet
  | 'impulseEntry' // delivering impulse off the entry pallet
  | 'impulseExit'; // delivering impulse off the exit pallet

/** Why a movement will not run — drives the diagnostics panel. */
export interface Diagnostic {
  code: string;
  /** Plain-language explanation of the causal chain. */
  message: string;
  /** Part(s) the player should look at. */
  parts: PartId[];
  severity: 'error' | 'warning';
}

/** Snapshot the renderer and UI read each frame. The sim owns all of this. */
export interface SimSnapshot {
  /** Simulated seconds elapsed since the movement started running. */
  elapsed: number;
  running: boolean;
  /** Mainspring state of charge, 0..1. */
  wind: number;
  /** Torque currently delivered by the mainspring, N·mm. */
  mainspringTorque: number;
  /** Balance amplitude (peak swing from center), degrees. */
  amplitudeDeg: number;
  /** Beat error, milliseconds (asymmetry between tick and tock). */
  beatErrorMs: number;
  /** Rate, seconds per day. Positive = fast. */
  rateSecPerDay: number;
  /** Current angle of the balance, radians. */
  balanceAngle: number;
  escapementState: EscapementState;
  /** Hand angles in radians (clockwise positive), for the dial. */
  secondsAngle: number;
  minutesAngle: number;
  hoursAngle: number;
  /** Live diagnostics. Empty means the movement is healthy. */
  diagnostics: Diagnostic[];
}

/** Player-adjustable regulation inputs. */
export interface RegulationState {
  /**
   * Regulator index position, -100..+100. Negative ("slow"/"-") lengthens the
   * effective hairspring, positive ("fast"/"+") shortens it.
   */
  regulator: number;
  /**
   * Hairspring stud/collet rotation, degrees. Offsets the balance rest position
   * and therefore the beat error. 0 = perfectly in beat.
   */
  studOffsetDeg: number;
}
