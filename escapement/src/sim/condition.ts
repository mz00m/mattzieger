/**
 * Physical condition of the movement — the Layer 4 consequences of rough handling
 * and neglect: dust contamination, pivot wear, a broken balance staff, a bent
 * hairspring, a scratched mainplate. These degrade or stop the watch in ways that
 * map to reality, and the player fixes them by cleaning, re-centering, or
 * reworking (replacing) the affected part.
 */

export interface ShockResult {
  brokePivot: boolean;
  bentHairspringDeg: number;
}

export class Condition {
  /** Airborne dust/old oil in the movement, 0..1. Adds friction. */
  contamination = 0;
  /** Accumulated pivot wear from running under-lubricated, 0..1. Permanent. */
  wear = 0;
  /** Balance staff pivot snapped — the watch cannot run until reworked. */
  balancePivotBroken = false;
  /** Hairspring distortion in degrees; shifts rate and beat error, costs amplitude. */
  hairspringBentDeg = 0;
  /** Cosmetic + tiny friction; a scratched plate marks a careless screwdriver slip. */
  mainplateScratched = false;

  /** Friction-side efficiency from contamination and wear, 0..1. */
  efficiency(): number {
    return (1 - this.contamination * 0.4) * (1 - this.wear * 0.5);
  }

  /** Running dry slowly wears the pivots. */
  accumulateWear(simSeconds: number, lubeEfficiency: number): void {
    if (lubeEfficiency < 0.85) {
      // Worse lubrication → faster wear. Scaled to be visible over minutes of
      // fast-forwarded time, not seconds of real time.
      const rate = (0.85 - lubeEfficiency) * 2e-5;
      this.wear = Math.min(1, this.wear + rate * simSeconds);
    }
  }

  /** Dust settles in over time when the movement is open and unserviced. */
  accumulateContamination(simSeconds: number, openAndDusty: boolean): void {
    if (openAndDusty) {
      this.contamination = Math.min(1, this.contamination + 4e-7 * simSeconds);
    }
  }

  /**
   * A shock (dropped on the bench, knocked while open). Severity 0..1. Higher
   * severity risks a broken pivot; lighter shocks bend the hairspring. `rng`
   * is injectable for deterministic tests.
   */
  shock(severity: number, rng: () => number = Math.random): ShockResult {
    const result: ShockResult = { brokePivot: false, bentHairspringDeg: 0 };
    if (severity <= 0) return result;
    // Probability of a broken pivot rises sharply with severity.
    if (rng() < severity * severity * 0.8) {
      this.balancePivotBroken = true;
      result.brokePivot = true;
    } else if (rng() < severity * 0.6) {
      const bend = severity * (4 + rng() * 8); // a few to a dozen degrees
      this.hairspringBentDeg += bend;
      result.bentHairspringDeg = bend;
    }
    return result;
  }

  /** Carefully re-center a bent hairspring. Rough work can overshoot. */
  recenterHairspring(skill = 0.85): void {
    // Skill 0..1: leaves a small residual, occasionally over-bends the other way.
    const residual = this.hairspringBentDeg * (1 - skill);
    this.hairspringBentDeg = residual;
  }

  /** Clean the movement: removes dust (not wear, not damage). */
  clean(): void {
    this.contamination = 0;
  }

  /** Full rework/service: new balance + clean + reset wear. Fixes everything. */
  service(): void {
    this.contamination = 0;
    this.wear = 0;
    this.balancePivotBroken = false;
    this.hairspringBentDeg = 0;
    this.mainplateScratched = false;
  }

  /** Extra beat error (ms) from a bent hairspring. */
  beatErrorContribution(): number {
    return Math.abs(this.hairspringBentDeg) * 0.45;
  }

  /** Rate shift (s/day) from a bent hairspring distorting the spring's geometry. */
  rateContribution(): number {
    return this.hairspringBentDeg * 1.3;
  }

  /** Amplitude multiplier from a bent hairspring fouling its coils. */
  amplitudeFactor(): number {
    return Math.max(0.4, 1 - Math.abs(this.hairspringBentDeg) * 0.012);
  }
}
