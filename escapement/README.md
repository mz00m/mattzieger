# Escapement

A browser game where you apprentice as a watchmaker: assemble a real mechanical
movement part by part, make it run, then regulate it to time. The mechanism is
**simulated analytically** — constraint-coupled rotations for the gear train, a
finite-state machine for the escapement, and a damped, impulse-driven torsional
oscillator for the balance — not thrown at a generic physics engine. Every part,
name, and behaviour follows Bartosz Ciechanowski's _"Mechanical Watch"_ essay.

This is **Phases 0–2**: Bench 1, the time-only manual movement, playable through
all four layers — place → run → regulate → and now **master** (lubrication,
positional timing, wear, contamination, and handling damage), with interactive
explainers and a color-keyed glossary.

## Quick start

```bash
cd escapement
npm install
npm run dev      # opens the bench at http://localhost:5173
npm test         # runs the sim-core unit tests (Vitest)
npm run build    # production build into dist/
```

> The game lives in its own Vite app under `escapement/` so it stays fully
> decoupled from the parent Next.js site. The build is relative-pathed, so
> `dist/` can later be dropped into the site under `/escapement`.

## How to play (the new-player path)

1. **Place the parts.** Work down the tray (or hit _Place next_). The first time
   you meet a subsystem, a short explainer tells you how it works. Click any part
   name to read what it is.
2. **Wind it.** Once the train, escapement and balance are in, hit **Full wind**.
   The balance starts swinging and the seconds hand sweeps.
3. **Regulate it.** Open the **Timegrapher**. The watch arrives running fast and
   slightly out of beat. Slide the **regulator** to bring the rate to ~0 s/day and
   the **hairspring stud** to zero the beat error. Hit the target and it's marked
   regulated.
4. **Break it on purpose.** Use **Bench checks** to pop the click, reverse the
   pallet fork, or mis-mesh a wheel — then read how the **Diagnosis** panel traces
   the symptom back to the cause.
5. **Go to Layer 4.** Flip **Realism** (top bar). Now the watch needs the right
   oil in the right dose at each jewel, keeps different time in each of six
   positions (regulate across them), wears if you run it dry, collects dust, and
   can break a balance pivot or bend its hairspring if you knock the bench. The
   **Care & repair** panel holds the oiler, the position tester, and the
   clean / re-center / rework / service tools.

The first time you meet the **balance** or the **power** train, the explainer
includes a hands-on lab: tune a lone torsion spring's stiffness and inertia to
feel the period change, or wind a lone mainspring and watch its torque decay.

Use the **Cutaway** slider (top right) to fade the bridges and dial and see the
works underneath, and orbit/zoom with the mouse. **Time scale** (1×–3600×) lets
you watch a full day pass.

## Architecture

The repo is split so the simulation is independent of rendering and UI:

```
src/
  sim/        Headless MovementSim core — ZERO imports from React or Three.
    constants.ts     Real watch numbers (28,800 bph, 15-tooth escape, etc.)
    gearTrain.ts     Rotational state graph; exact mesh ratios
    mainspring.ts    Stored torque, decay, the click/ratchet lock
    escapement.ts    Lock → unlock → impulse → relock state machine
    balance.ts       Damped driven oscillator + analytic rate/amplitude/beat-error
    lubrication.ts   Oil types, doses, per-jewel friction efficiency (Layer 4)
    positions.ts     Positional amplitude + poise rate variation (Layer 4)
    condition.ts     Wear, contamination, shock damage, repair (Layer 4)
    diagnostics.ts   Causal-chain explanations of why it won't run / runs poorly
    movementSim.ts   Orchestrator; owns assembly health, regulation, the clock
  three/      react-three-fiber bench: procedural gears, the live movement
  ui/         React panels: timegrapher, assembly tray, diagnostics, glossary
  content/    Part catalogue, glossary, explainers (the article's vocabulary)
  state/      Zustand store wiring sim ↔ UI ↔ 3D
```

### The simulation, briefly

- **Gear train** is a graph of wheels (angular position/velocity) joined by edges
  carrying exact tooth-count ratios. Barrel → center → third → fourth reduces
  **~343:1** (so ~7 barrel turns become ~2400 seconds-wheel turns), and the
  fourth wheel turns exactly once per minute.
- **Escapement** advances the 15-tooth escape wheel by half a tooth per beat;
  two beats = one tooth, giving **16 rev/min** at 28,800 bph.
- **Balance** integrates `I·θ'' = -k(θ-θ_eq) - c·θ' + impulses`. The regulator
  changes `k` (rate); the stud offsets `θ_eq` (beat error); amplitude is the
  steady state where escapement impulse balances damping. Falling mainspring
  torque lowers amplitude, which nudges the rate — the real isochronism link.
- **Timekeeping** runs kinematically from the modelled rate, so it's exact and
  cheap at any time scale; the balance integrator drives the visible swing.

## Tests (Vitest, sim core only)

`npm test` runs **30 tests** proving the acceptance criteria:

Phase 1:
- barrel→seconds reduction is ~343:1 and fourth→escape is exactly 16:1;
- the balance oscillates at ~4 Hz (28,800 bph) and amplitude emerges near target;
- removing the click stops the watch and unwinds the spring;
- a mis-meshed gear halts power and is named in the diagnosis;
- the regulator moves the rate in the correct direction and the stud zeroes beat
  error;
- a full journey from loose parts to a regulated, running movement.

Phase 2 (Layer 4):
- lubrication: correct oil + ideal dose ≈ efficiency 1; dry / wrong-oil / flooded
  all degrade it; a dry train runs at lower amplitude and shorter reserve;
- positional variance: vertical positions lose amplitude and poise shows as a
  rate spread across positions; horizontals are unaffected;
- handling: a hard shock breaks the balance pivot (and stops the watch until
  reworked); a lighter shock bends the hairspring and adds beat error;
- a full service clears contamination, wear, and damage and re-oils correctly;
- realism off leaves all Phase-1 behaviour bit-for-bit unchanged.

## What's next (later phases)

The date complication (Bench 2), keyless works with the three-mode state machine
and hacking (Bench 3), automatic winding with the reverser (Bench 4), and the
repair-order master bench with the credit-card scale finale. The sim core is
structured to grow into each.
