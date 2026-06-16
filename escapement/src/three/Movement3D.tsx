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
import { gearGeometry, discGeometry } from './proceduralGear';
import {
  BENCH1_MESHES,
  BENCH1_NODES,
  pathReduction,
} from '../sim/gearTrain';
import type { PartId } from '../sim/types';

const TRANSPARENT_PARTS: PartId[] = ['trainBridge', 'palletBridge', 'balanceCock', 'dial', 'barrelLid'];
const TRAIN_NODE_IDS: PartId[] = ['barrel', 'centerWheel', 'thirdWheel', 'fourthWheel', 'escapeWheel'];

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
  const matRef = useRef<THREE.MeshStandardMaterial>(null);
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
    if (def.radius) {
      return discGeometry(def.radius, def.thickness ?? 0.2);
    }
    return new THREE.BoxGeometry(0.5, 0.2, 0.5);
  }, [def, id]);

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

    // Cutaway transparency.
    if (matRef.current) {
      const isClear = TRANSPARENT_PARTS.includes(id);
      const target = isClear ? 1 - cutaway * 0.92 : 1;
      matRef.current.opacity = target;
      matRef.current.transparent = target < 0.99;
    }
  });

  const metalness = def.group === 'train' || def.group === 'power' ? 0.85 : 0.5;
  const roughness = def.group === 'balance' ? 0.4 : 0.3;

  return (
    <group ref={ref} position={[def.pos[0], def.pos[1], def.pos[2]]}>
      <mesh ref={spinRef} geometry={geometry} castShadow receiveShadow>
        <meshStandardMaterial
          ref={matRef}
          color={def.color}
          metalness={metalness}
          roughness={roughness}
        />
      </mesh>

      {/* Ruby jewels on the escapement parts, drawn as small red gems. */}
      {id === 'palletFork' && (
        <>
          <mesh position={[0.55, 0.12, 0.2]}>
            <octahedronGeometry args={[0.12]} />
            <meshStandardMaterial color="#c0143c" emissive="#3a0010" metalness={0.2} roughness={0.1} />
          </mesh>
          <mesh position={[-0.55, 0.12, 0.2]}>
            <octahedronGeometry args={[0.12]} />
            <meshStandardMaterial color="#c0143c" emissive="#3a0010" metalness={0.2} roughness={0.1} />
          </mesh>
        </>
      )}

      {/* Hairspring suggestion: a thin coiled ring above the balance. */}
      {id === 'balance' && (
        <mesh position={[0, 0.25, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <torusGeometry args={[def.radius! * 0.5, 0.03, 8, 48]} />
          <meshStandardMaterial color="#9fb7c9" metalness={0.7} roughness={0.3} />
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
