/**
 * The movement in 3D. Renders every placed part at its snap position and animates
 * the live ones — the balance swings under the sim's own angle, the going-train
 * wheels spin by their exact ratios, and the hands track the kept time. The
 * cutaway slider fades the bridges and dial so you can see the works beneath.
 */

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from '../state/gameStore';
import { BENCH1_PARTS, PART_BY_ID } from '../content/parts';
import {
  gearGeometry,
  discGeometry,
  mainspringGeometry,
  bridgeGeometry,
  bridgeScrewOffsets,
  palletForkGeometry,
  palletJewelSeats,
} from './proceduralGear';
import {
  BENCH1_MESHES,
  BENCH1_NODES,
  pathReduction,
} from '../sim/gearTrain';
import type { PartId } from '../sim/types';

const TRANSPARENT_PARTS: PartId[] = ['trainBridge', 'palletBridge', 'balanceCock', 'dial', 'barrelLid'];
const TRAIN_NODE_IDS: PartId[] = ['barrel', 'centerWheel', 'thirdWheel', 'fourthWheel', 'escapeWheel'];
const BRIDGE_PARTS: PartId[] = ['trainBridge', 'palletBridge', 'balanceCock'];

/** A blued-steel screw with a slotted head, set proud of a bridge surface. */
function Screw({
  position,
  r,
  register,
}: {
  position: [number, number, number];
  r: number;
  register: (m: THREE.Material | null) => void;
}) {
  return (
    <group position={position}>
      <mesh castShadow>
        <cylinderGeometry args={[r, r, r * 0.5, 18]} />
        <meshStandardMaterial ref={register} color="#aab3c2" metalness={0.95} roughness={0.2} />
      </mesh>
      <mesh position={[0, r * 0.26, 0]}>
        <boxGeometry args={[r * 1.9, r * 0.14, r * 0.34]} />
        <meshStandardMaterial ref={register} color="#2b3038" metalness={0.5} roughness={0.5} />
      </mesh>
    </group>
  );
}

/** Mesh count from a wheel back to the escape wheel — sets visual spin sign. */
const MESHES_FROM_ESCAPE: Partial<Record<PartId, number>> = {
  escapeWheel: 0,
  fourthWheel: 1,
  thirdWheel: 2,
  centerWheel: 3,
  barrel: 4,
};

function PartMesh({ id }: { id: PartId }) {
  const def = PART_BY_ID[id];
  const ref = useRef<THREE.Group>(null);
  const spinRef = useRef<THREE.Mesh>(null);
  // Every material this part owns (body + screws + jewels), so the cutaway fades
  // them together. A Set dedupes across re-renders of the ref callbacks.
  const fadeMats = useRef<Set<THREE.Material>>(new Set());
  const register = (m: THREE.Material | null) => {
    if (m) fadeMats.current.add(m);
  };
  const placedAt = useRef<number>(performance.now());

  const geometry = useMemo(() => {
    if (def.teeth && def.radius) {
      return gearGeometry({
        teeth: def.teeth,
        pitchRadius: def.radius,
        thickness: def.thickness ?? 0.25,
        lightening: ['centerWheel', 'thirdWheel', 'fourthWheel', 'barrel'].includes(id),
      });
    }
    if (id === 'mainspring' && def.radius) {
      return mainspringGeometry({
        innerRadius: def.radius * 0.22,
        outerRadius: def.radius * 0.94,
        turns: 5,
        ribbon: def.radius * 0.07,
        height: def.thickness ?? 0.5,
      });
    }
    if (BRIDGE_PARTS.includes(id) && def.radius) {
      return bridgeGeometry({
        radius: def.radius,
        thickness: def.thickness ?? 0.25,
        elongation: id === 'balanceCock' ? 0.55 : 0.4,
      });
    }
    if (id === 'palletFork' && def.radius) {
      return palletForkGeometry({ scale: def.radius, thickness: def.thickness ?? 0.15 });
    }
    if (def.radius) {
      return discGeometry(def.radius, def.thickness ?? 0.2);
    }
    return new THREE.BoxGeometry(0.5, 0.2, 0.5);
  }, [def, id]);

  // The hairspring as a real flat Archimedean spiral coiled above the balance.
  const hairspringGeo = useMemo(
    () =>
      id === 'balance'
        ? mainspringGeometry({
            innerRadius: def.radius! * 0.08,
            outerRadius: def.radius! * 0.52,
            turns: 9,
            ribbon: 0.02,
            height: 0.04,
          })
        : null,
    [id, def],
  );

  // Ratio of this wheel's angle to the escape wheel angle (for spin).
  const ratioToEscape = useMemo(() => {
    if (!TRAIN_NODE_IDS.includes(id)) return 0;
    if (id === 'escapeWheel') return 1;
    return 1 / pathReduction(BENCH1_NODES, BENCH1_MESHES, id, 'escapeWheel');
  }, [id]);

  useFrame(() => {
    const { sim, cutaway, snapshot } = useGameStore.getState();

    // Settle-in animation: gentle drop + scale when freshly placed.
    if (ref.current) {
      const age = (performance.now() - placedAt.current) / 1000;
      const t = Math.min(1, age / 0.4);
      const ease = 1 - Math.pow(1 - t, 3);
      ref.current.position.y = def.pos[1] + (1 - ease) * 1.4;
      const s = 0.85 + 0.15 * ease;
      ref.current.scale.setScalar(s);
    }

    // Live motion.
    if (spinRef.current) {
      if (TRAIN_NODE_IDS.includes(id) && ratioToEscape !== 0) {
        const sign = (MESHES_FROM_ESCAPE[id] ?? 0) % 2 === 0 ? 1 : -1;
        spinRef.current.rotation.y = sim.escapeAngle * ratioToEscape * sign;
      } else if (id === 'balance') {
        spinRef.current.rotation.y = sim.balance.theta;
      } else if (id === 'palletFork') {
        // Rock the fork a few degrees with the balance's direction.
        const dir = Math.tanh(sim.balance.omega * 0.05);
        spinRef.current.rotation.y = dir * 0.18;
      } else if (id === 'cannonPinion') {
        spinRef.current.rotation.y = -snapshot.minutesAngle;
      } else if (id === 'hourWheel') {
        spinRef.current.rotation.y = -snapshot.hoursAngle;
      }
    }

    // Cutaway transparency — fade the body and all its detail meshes together.
    const isClear = TRANSPARENT_PARTS.includes(id);
    const target = isClear ? 1 - cutaway * 0.92 : 1;
    fadeMats.current.forEach((m) => {
      m.opacity = target;
      m.transparent = target < 0.99;
    });
  });

  const metalness = def.group === 'train' || def.group === 'power' ? 0.85 : 0.5;
  const roughness = def.group === 'balance' ? 0.4 : 0.3;

  return (
    <group ref={ref} position={[def.pos[0], def.pos[1], def.pos[2]]}>
      <mesh ref={spinRef} geometry={geometry} castShadow receiveShadow>
        <meshStandardMaterial
          ref={register}
          color={def.color}
          metalness={metalness}
          roughness={roughness}
        />
      </mesh>

      {/* Ruby pallet stones, seated on the fork arms where they meet the escape wheel. */}
      {id === 'palletFork' &&
        palletJewelSeats(def.radius!).map(([x, , z], i) => (
          <mesh key={i} position={[x, (def.thickness ?? 0.15) + 0.04, z]} rotation={[0, Math.PI / 4, 0]}>
            <boxGeometry args={[0.16, 0.1, 0.16]} />
            <meshStandardMaterial ref={register} color="#c0143c" emissive="#3a0010" metalness={0.2} roughness={0.1} />
          </mesh>
        ))}

      {/* Bridges: a central jewel and two anchoring screws, so the plate reads as fitted. */}
      {BRIDGE_PARTS.includes(id) && (
        <>
          <mesh position={[0, (def.thickness ?? 0.25) * 0.5, 0]}>
            <cylinderGeometry args={[def.radius! * 0.15, def.radius! * 0.15, (def.thickness ?? 0.25) * 0.7, 16]} />
            <meshStandardMaterial ref={register} color="#c0143c" emissive="#3a0010" metalness={0.2} roughness={0.12} />
          </mesh>
          {bridgeScrewOffsets(def.radius!).map((sx, i) => (
            <Screw key={i} position={[sx, (def.thickness ?? 0.25) * 0.5, 0]} r={def.radius! * 0.1} register={register} />
          ))}
        </>
      )}

      {/* Hairspring: a flat Archimedean coil sitting just above the balance wheel. */}
      {id === 'balance' && hairspringGeo && (
        <mesh position={[0, 0.25, 0]} geometry={hairspringGeo}>
          <meshStandardMaterial ref={register} color="#9fb7c9" metalness={0.7} roughness={0.3} />
        </mesh>
      )}
    </group>
  );
}

/** The three hands, fitted once 'handsSet' is placed. */
function Hands() {
  const sRef = useRef<THREE.Mesh>(null);
  const mRef = useRef<THREE.Mesh>(null);
  const hRef = useRef<THREE.Mesh>(null);

  useFrame(() => {
    const { snapshot } = useGameStore.getState();
    if (sRef.current) sRef.current.rotation.y = -snapshot.secondsAngle;
    if (mRef.current) mRef.current.rotation.y = -snapshot.minutesAngle;
    if (hRef.current) hRef.current.rotation.y = -snapshot.hoursAngle;
  });

  return (
    <group position={[0, 2.55, 0]}>
      <mesh ref={hRef}>
        <boxGeometry args={[0.12, 0.04, 2.4]} />
        <meshStandardMaterial color="#1a1f27" metalness={0.6} roughness={0.3} />
      </mesh>
      <mesh ref={mRef} position={[0, 0.08, 0]}>
        <boxGeometry args={[0.09, 0.04, 3.6]} />
        <meshStandardMaterial color="#1a1f27" metalness={0.6} roughness={0.3} />
      </mesh>
      <mesh ref={sRef} position={[0, 0.16, 0]}>
        <boxGeometry args={[0.04, 0.03, 4.2]} />
        <meshStandardMaterial color="#c0463b" metalness={0.4} roughness={0.3} />
      </mesh>
    </group>
  );
}

export function Movement3D() {
  const placed = useGameStore((s) => s.placed);

  return (
    <group>
      {BENCH1_PARTS.filter((p) => placed.includes(p.id)).map((p) => (
        <PartMesh key={p.id} id={p.id} />
      ))}
      {placed.includes('handsSet') && <Hands />}
    </group>
  );
}
