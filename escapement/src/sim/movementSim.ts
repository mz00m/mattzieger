/**
 * MovementSim — the headless heart of Bench 1.
 *
 * Ties the subsystems together: the mainspring stores torque, the going train
 * couples rotations by exact ratios, the escapement gates the escape wheel, and
 * the balance keeps time. It owns assembly health, regulation, and the running
 * clock, and exposes a single immutable snapshot for the renderer and UI.
 *
 * No imports from React or Three — this module is pure and unit-testable.
 */

import {
  BALANCE_PERIOD_S,
  BEATS_PER_SECOND,
  ESCAPE_WHEEL_TEETH,
  SECONDS_PER_DAY,
} from './constants';
import { Mainspring, MAX_BARREL_TORQUE } from './mainspring';
import { Balance, beatErrorMs, rateSecPerDay, steadyStateAmplitudeDeg } from './balance';
import { Escapement, ESCAPE_ADVANCE_PER_BEAT } from './escapement';
import {
  BENCH1_MESHES,
  BENCH1_NODES,
  barrelToFourthReduction,
  fourthToEscapeRatio,
} from './gearTrain';
import { diagnose, REQUIRED_FOR_RUN, type AssemblyHealth } from './diagnostics';
import type { Diagnostic, PartId, SimSnapshot } from './types';

export interface MovementOptions {
  /** Manufacturing rate error the watch arrives with, s/day (default 0). */
  factoryRateOffset?: number;
  /** Manufacturing stud offset the watch arrives with, degrees (default 0). */
  factoryStudOffset?: number;
  /** Start with every part correctly placed (handy for tests). */
  startAssembled?: boolean;
}

export class MovementSim {
  private readonly factoryRateOffset: number;
  private readonly factoryStudOffset: number;

  readonly mainspring = new Mainspring();
  readonly balance = new Balance();
  readonly escapement = new Escapement();

  // ---- assembly health ----
  private placed = new Set<PartId>();
  clickEngaged = true;
  palletOriented = true;
  private misMeshed: PartId[] = [];

  // ---- regulation ----
  regulator = 0; // -100..+100
  studOffsetDeg = 0; // player adjustment

  // ---- running clock ----
  elapsed = 0; // simulated seconds since start
  /** Accumulated escape-wheel angle used to drive all train wheels + hands. */
  private escapeTheta = 0;

  // ---- balance animation budget (visual only) ----
  private static readonly MICRO_DT = 1 / 2000; // 0.5 ms integration step
  private static readonly ANIM_BUDGET = 0.04; // sim seconds of swing per tick

  constructor(opts: MovementOptions = {}) {
    this.factoryRateOffset = opts.factoryRateOffset ?? 0;
    this.factoryStudOffset = opts.factoryStudOffset ?? 0;
    if (opts.startAssembled) {
      for (const p of REQUIRED_FOR_RUN) this.placed.add(p);
      for (const p of ['cannonPinion', 'minuteWheel', 'hourWheel', 'dial', 'handsSet'] as PartId[]) {
        this.placed.add(p);
      }
    }
    this.balance.nudge(2); // give it somewhere to start swinging
  }

  // -------------------- assembly API --------------------

  placePart(id: PartId): void {
    this.placed.add(id);
  }
  removePart(id: PartId): void {
    this.placed.delete(id);
  }
  isPlaced(id: PartId): boolean {
    return this.placed.has(id);
  }
  setClickEngaged(v: boolean): void {
    this.clickEngaged = v;
  }
  setPalletOriented(v: boolean): void {
    this.palletOriented = v;
  }
  setMisMeshed(parts: PartId[]): void {
    this.misMeshed = [...parts];
  }

  // -------------------- regulation API --------------------

  setRegulator(v: number): void {
    this.regulator = clamp(v, -100, 100);
  }
  setStud(deg: number): void {
    this.studOffsetDeg = clamp(deg, -45, 45);
  }
  wind(turns: number): void {
    if (this.clickEngaged) this.mainspring.windTurns(turns);
  }

  // -------------------- derived state --------------------

  private health(): AssemblyHealth {
    return {
      placed: this.placed,
      clickEngaged: this.clickEngaged,
      palletOriented: this.palletOriented,
      misMeshed: this.misMeshed,
      wind: this.mainspring.wind,
    };
  }

  diagnostics(): Diagnostic[] {
    return diagnose(this.health());
  }

  /** A movement runs only with power and no blocking (error) faults. */
  canRun(): boolean {
    if (this.mainspring.torque() <= 0) return false;
    return !this.diagnostics().some((d) => d.severity === 'error');
  }

  private torqueFraction(): number {
    return this.mainspring.torque() / MAX_BARREL_TORQUE;
  }

  private residualStudOffset(): number {
    return this.factoryStudOffset + this.studOffsetDeg;
  }

  private currentAmplitudeDeg(): number {
    return this.canRun() ? steadyStateAmplitudeDeg(this.torqueFraction()) : 0;
  }

  private currentRate(): number {
    if (!this.canRun()) return 0;
    return rateSecPerDay(this.regulator, this.currentAmplitudeDeg(), this.factoryRateOffset);
  }

  // -------------------- simulation step --------------------

  /**
   * Advance the simulation by `simSeconds` of watch time. The caller scales real
   * frame time by the chosen time multiplier before calling. The going train and
   * hands advance kinematically from the modeled rate (exact and cheap at any
   * time scale); the balance integrator runs a small budget so the wheel visibly
   * swings under the real forces.
   */
  tick(simSeconds: number): void {
    if (simSeconds <= 0) return;

    const running = this.canRun();
    this.balance.setRegulator(this.regulator);
    this.balance.setEquilibriumDeg(this.residualStudOffset());
    this.balance.setTorqueFraction(running ? this.torqueFraction() : 0);

    // Visible balance swing — bounded work regardless of time scale.
    const animSeconds = Math.min(simSeconds, MovementSim.ANIM_BUDGET);
    const steps = Math.max(1, Math.round(animSeconds / MovementSim.MICRO_DT));
    for (let i = 0; i < steps; i++) {
      this.balance.step(MovementSim.MICRO_DT);
      this.escapement.update(this.balance, running);
    }

    // With the click disengaged the ratchet can't hold the spring: it unwinds
    // on its own and any stored power bleeds away, so the watch stops.
    if (!this.clickEngaged && this.mainspring.wind > 0) {
      this.mainspring.setWind(this.mainspring.wind - simSeconds * 0.5);
    }

    if (!running) return;

    this.elapsed += simSeconds;

    // Kinematic timekeeping: beats/sec scaled by the modeled rate.
    const ratio = 1 + this.currentRate() / SECONDS_PER_DAY;
    const beats = BEATS_PER_SECOND * ratio * simSeconds;
    const escapeAdvance = beats * ESCAPE_ADVANCE_PER_BEAT;
    this.escapeTheta += escapeAdvance;

    // Drain the mainspring by however much the barrel turned this tick.
    const fourthTurns = escapeAdvance / (2 * Math.PI) / fourthToEscapeRatio();
    const barrelTurns = fourthTurns / barrelToFourthReduction();
    this.mainspring.drainByBarrelTurns(barrelTurns);
  }

  // -------------------- snapshot --------------------

  snapshot(): SimSnapshot {
    const fourthTheta = this.escapeTheta / fourthToEscapeRatio();
    return {
      elapsed: this.elapsed,
      running: this.canRun(),
      wind: this.mainspring.wind,
      mainspringTorque: this.mainspring.torque(),
      amplitudeDeg: this.currentAmplitudeDeg(),
      beatErrorMs: this.canRun() ? beatErrorMs(this.residualStudOffset()) : 0,
      rateSecPerDay: this.currentRate(),
      balanceAngle: this.balance.theta,
      escapementState: this.escapement.state,
      secondsAngle: fourthTheta, // fourth wheel = 1 rev / 60 s
      minutesAngle: fourthTheta / 60,
      hoursAngle: fourthTheta / 720,
      diagnostics: this.diagnostics(),
    };
  }

  /** Absolute escape-wheel angle (radians) — the renderer drives wheels from it. */
  get escapeAngle(): number {
    return this.escapeTheta;
  }

  // -------------------- exposed train facts (for UI/teaching) --------------------

  get reductions() {
    return {
      barrelToFourth: barrelToFourthReduction(),
      fourthToEscape: fourthToEscapeRatio(),
      escapeWheelTeeth: ESCAPE_WHEEL_TEETH,
      nominalPeriod: BALANCE_PERIOD_S,
      nodes: BENCH1_NODES,
      meshes: BENCH1_MESHES,
    };
  }
}

function clamp(x: number, lo: number, hi: number): number {
  return x < lo ? lo : x > hi ? hi : x;
}
