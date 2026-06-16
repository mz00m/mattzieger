/**
 * Game state. Wraps a single MovementSim instance (kept as a stable, non-reactive
 * field) and mirrors its snapshot into reactive state each frame for the UI. The
 * 3D layer reads the live sim directly via getState() to avoid re-render churn.
 */

import { create } from 'zustand';
import { MovementSim } from '../sim/movementSim';
import type { PartId, SimSnapshot } from '../sim/types';
import { ASSEMBLY_ORDER, BENCH1_PARTS, PART_BY_ID } from '../content/parts';
import type { PartGroup } from '../content/parts';

const STORAGE_KEY = 'escapement.bench1.v1';

/** Regulation target for Bench 1, Layer 3. */
export const RATE_TARGET = 15; // ±s/day
export const BEAT_TARGET = 0.8; // ms

export type Layer = 1 | 2 | 3;

interface Persisted {
  seenExplainers: PartGroup[];
  regulatedDone: boolean;
}

function loadPersisted(): Persisted {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as Persisted;
  } catch {
    /* ignore */
  }
  return { seenExplainers: [], regulatedDone: false };
}

function savePersisted(p: Persisted): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(p));
  } catch {
    /* ignore */
  }
}

function makeSim(): MovementSim {
  // The watch arrives from the "factory" running fast and slightly out of beat,
  // so regulation is a real task in Layer 3.
  return new MovementSim({ factoryRateOffset: 48, factoryStudOffset: 5 });
}

interface GameState {
  sim: MovementSim;
  snapshot: SimSnapshot;

  placed: PartId[];
  layer: Layer;

  regulator: number;
  stud: number;
  timeScale: number;
  running: boolean; // master run toggle (auto-on once assembled)

  clickEngaged: boolean;
  palletOriented: boolean;
  misMeshed: PartId[];

  cutaway: number; // 0 = solid, 1 = fully transparent bridges
  explainerGroup: PartGroup | null;
  seenExplainers: PartGroup[];
  glossaryOpen: boolean;
  infoPart: PartId | null;
  regulatedDone: boolean;

  // actions
  placePart: (id: PartId) => void;
  removePart: (id: PartId) => void;
  placeNext: () => void;
  resetBench: () => void;
  wind: (turns: number) => void;
  setRegulator: (v: number) => void;
  setStud: (v: number) => void;
  setTimeScale: (v: number) => void;
  setClickEngaged: (v: boolean) => void;
  setPalletOriented: (v: boolean) => void;
  setMisMeshed: (parts: PartId[]) => void;
  setCutaway: (v: number) => void;
  openExplainer: (g: PartGroup) => void;
  closeExplainer: () => void;
  toggleGlossary: () => void;
  setInfoPart: (id: PartId | null) => void;
  tickRealDt: (dt: number) => void;
  refresh: () => void;
}

const REQUIRED_TO_RUN = BENCH1_PARTS.filter(
  (p) => !['cannonPinion', 'minuteWheel', 'hourWheel', 'dial', 'handsSet'].includes(p.id),
).map((p) => p.id);

function deriveLayer(placed: PartId[], snapshot: SimSnapshot): Layer {
  const allRunParts = REQUIRED_TO_RUN.every((p) => placed.includes(p));
  if (!allRunParts) return 1;
  if (!snapshot.running) return 2;
  return 3;
}

export const useGameStore = create<GameState>((set, get) => {
  const sim = makeSim();
  const persisted = loadPersisted();

  return {
    sim,
    snapshot: sim.snapshot(),
    placed: [],
    layer: 1,
    regulator: 0,
    stud: 0,
    timeScale: 1,
    running: false,
    clickEngaged: true,
    palletOriented: true,
    misMeshed: [],
    cutaway: 0,
    explainerGroup: null,
    seenExplainers: persisted.seenExplainers,
    glossaryOpen: false,
    infoPart: null,
    regulatedDone: persisted.regulatedDone,

    refresh: () => {
      const s = get();
      const snapshot = s.sim.snapshot();
      const layer = deriveLayer(s.placed, snapshot);
      const regulatedDone =
        s.regulatedDone ||
        (snapshot.running &&
          Math.abs(snapshot.rateSecPerDay) <= RATE_TARGET &&
          snapshot.beatErrorMs <= BEAT_TARGET);
      if (regulatedDone && !s.regulatedDone) {
        savePersisted({ seenExplainers: s.seenExplainers, regulatedDone: true });
      }
      set({ snapshot, layer, running: snapshot.running, regulatedDone });
    },

    placePart: (id) => {
      const s = get();
      if (s.placed.includes(id)) return;
      s.sim.placePart(id);
      const placed = [...s.placed, id];
      set({ placed });
      // First time we touch a group, surface its explainer.
      const group = PART_BY_ID[id].group;
      if (!s.seenExplainers.includes(group)) {
        const seen = [...s.seenExplainers, group];
        savePersisted({ seenExplainers: seen, regulatedDone: s.regulatedDone });
        set({ seenExplainers: seen, explainerGroup: group });
      }
      get().refresh();
    },

    removePart: (id) => {
      const s = get();
      s.sim.removePart(id);
      set({ placed: s.placed.filter((p) => p !== id) });
      get().refresh();
    },

    placeNext: () => {
      const s = get();
      const next = ASSEMBLY_ORDER.find((p) => !s.placed.includes(p));
      if (next) s.placePart(next);
    },

    resetBench: () => {
      const sim2 = makeSim();
      set({
        sim: sim2,
        placed: [],
        regulator: 0,
        stud: 0,
        timeScale: 1,
        clickEngaged: true,
        palletOriented: true,
        misMeshed: [],
        snapshot: sim2.snapshot(),
        layer: 1,
        running: false,
      });
    },

    wind: (turns) => {
      get().sim.wind(turns);
      get().refresh();
    },

    setRegulator: (v) => {
      get().sim.setRegulator(v);
      set({ regulator: v });
      get().refresh();
    },
    setStud: (v) => {
      get().sim.setStud(v);
      set({ stud: v });
      get().refresh();
    },
    setTimeScale: (v) => set({ timeScale: v }),

    setClickEngaged: (v) => {
      get().sim.setClickEngaged(v);
      set({ clickEngaged: v });
      get().refresh();
    },
    setPalletOriented: (v) => {
      get().sim.setPalletOriented(v);
      set({ palletOriented: v });
      get().refresh();
    },
    setMisMeshed: (parts) => {
      get().sim.setMisMeshed(parts);
      set({ misMeshed: parts });
      get().refresh();
    },

    setCutaway: (v) => set({ cutaway: v }),
    openExplainer: (g) => set({ explainerGroup: g }),
    closeExplainer: () => set({ explainerGroup: null }),
    toggleGlossary: () => set((s) => ({ glossaryOpen: !s.glossaryOpen })),
    setInfoPart: (id) => set({ infoPart: id }),

    tickRealDt: (dt) => {
      const s = get();
      const simSeconds = dt * s.timeScale;
      s.sim.tick(simSeconds);
      s.refresh();
    },
  };
});
