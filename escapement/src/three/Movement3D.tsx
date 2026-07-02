/**
 * The movement in 3D — bespoke geometry per part, built to read like a real
 * calibre: a meshing gear chain on alternating planes, a hooked escape wheel, an
 * anchor-shaped pallet fork with ruby pallets, a balance with rim screws and a
 * live spiral hairspring, Geneva-striped bridges over a perlage mainplate, and a
 * printed dial under tapered hands.
 *
 * It is also where the game happens: the next part's socket glows on the plate —
 * click it (or the tray) and the part flies in, settles with a pulse and a thock.
 * Hovering any placed part names it.
 */

import { useMemo, useRef, useState, type ReactNode } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { useGameStore } from '../state/gameStore';
import { ASSEMBLY_ORDER, PART_BY_ID } from '../content/parts';
import { gearGeometry, discGeometry, escapeWheelGeometry } from './proceduralGear';
import { dialTexture, genevaStripesTexture, perlageTexture } from './finishes';
import { BENCH1_MESHES, BENCH1_NODES, pathReduction } from '../sim/gearTrain';
import { ESCAPE_ADVANCE_PER_BEAT } from '../sim/escapement';
import { placeSound } from '../audio/sound';
import type { PartId } from '../sim/types';

const RUBY = '#b3123e';
const STEEL_BLUE = '#2c4a7c';

/** Mesh count from a wheel back to the escape wheel — sets visual spin sign. */
const PARITY: Partial<Record<PartId, number>> = {
  escapeWheel: 0,
  fourthWheel: 1,
  thirdWheel: 2,
  centerWheel: 3,
  barrel: 4,
};

function ratioToEscape(id: PartId): number {
  if (id === 'escapeWheel') return 1;
  return 1 / pathReduction(BENCH1_NODES, BENCH1_MESHES, id, 'escapeWheel');
}

function metal(color: string, metalness = 0.9, roughness = 0.28): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({ color, metalness, roughness, envMapIntensity: 0.9 });
}

/* ------------------------------------------------------------------ */
/* Placement wrapper: settle animation, pulse ring, hover label        */
/* ------------------------------------------------------------------ */

const FADE_WITH_CUTAWAY: PartId[] = ['trainBridge', 'palletBridge', 'balanceCock', 'dial', 'barrelLid'];

function Placed({ id, children }: { id: PartId; children: ReactNode }) {
  const def = PART_BY_ID[id];
  const group = useRef<THREE.Group>(null);
  const ring = useRef<THREE.Mesh>(null);
  const born = useRef(performance.now());
  const [hover, setHover] = useState(false);
  const fades = FADE_WITH_CUTAWAY.includes(id);

  useFrame(() => {
    const age = (performance.now() - born.current) / 1000;
    if (group.current) {
      // Fly in from above with an ease-out settle.
      const t = Math.min(1, age / 0.45);
      const ease = 1 - Math.pow(1 - t, 3);
      group.current.position.set(def.pos[0], def.pos[1] + (1 - ease) * 1.8, def.pos[2]);
      group.current.scale.setScalar((0.9 + 0.1 * ease) * (hover ? 1.02 : 1));
      // Cutaway fade for the covering parts.
      if (fades) {
        const { cutaway } = useGameStore.getState();
        const opacity = 1 - cutaway * 0.92;
        group.current.traverse((obj) => {
          const mesh = obj as THREE.Mesh;
          const mat = mesh.material as THREE.MeshStandardMaterial | undefined;
          if (mat && 'opacity' in mat) {
            mat.transparent = true;
            mat.opacity = opacity;
            mat.depthWrite = opacity > 0.5;
          }
        });
      }
    }
    if (ring.current) {
      // A brief expanding pulse where the part landed.
      const t = (age - 0.35) / 0.5;
      const mat = ring.current.material as THREE.MeshBasicMaterial;
      if (t < 0 || t > 1) {
        ring.current.visible = t < 1.2;
        mat.opacity = 0;
      } else {
        ring.current.visible = true;
        ring.current.scale.setScalar(1 + t * 0.9);
        mat.opacity = 0.7 * (1 - t);
      }
    }
  });

  const pulseRadius = (def.radius ?? 0.5) + 0.12;
  return (
    <group
      ref={group}
      position={def.pos}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHover(true);
        document.body.style.cursor = 'pointer';
      }}
      onPointerOut={() => {
        setHover(false);
        document.body.style.cursor = '';
      }}
      onClick={(e) => {
        e.stopPropagation();
        useGameStore.getState().setInfoPart(id);
      }}
    >
      {children}
      <mesh
        ref={ring}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, (def.thickness ?? 0.3) / 2 + 0.08, 0]}
        visible={false}
      >
        <ringGeometry args={[pulseRadius, pulseRadius + 0.09, 48]} />
        <meshBasicMaterial color="#e8c876" transparent opacity={0} side={THREE.DoubleSide} />
      </mesh>
      {hover && (
        <Html center position={[0, (def.radius ?? 1) * 0.35 + 0.7, 0]} className="part-tip" style={{ pointerEvents: 'none' }}>
          {def.label}
        </Html>
      )}
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* Individual parts                                                     */
/* ------------------------------------------------------------------ */

const JEWEL_SITES: [number, number][] = [
  [-0.86, 0.37],
  [0.58, 0.89],
  [1.85, 0.55],
  [2.87, 1.02],
  [2.72, 2.05],
  [2.55, 3.35],
];

function Mainplate() {
  const def = PART_BY_ID.mainplate;
  const mat = useMemo(() => {
    const m = metal(def.color, 0.75, 0.42);
    m.map = perlageTexture();
    return m;
  }, [def.color]);
  const geo = useMemo(() => discGeometry(def.radius!, def.thickness!), [def]);
  return (
    <Placed id="mainplate">
      <mesh geometry={geo} material={mat} receiveShadow castShadow />
      {/* Pressed-in ruby bearings for every pivot. */}
      {JEWEL_SITES.map(([x, z], i) => (
        <mesh key={i} position={[x, def.thickness! / 2 + 0.012, z]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.045, 0.1, 24]} />
          <meshStandardMaterial color={RUBY} metalness={0.3} roughness={0.15} emissive="#38000f" />
        </mesh>
      ))}
      {/* Rim screws. */}
      {[0.7, 2.6, 4.4].map((a, i) => (
        <Screw key={i} pos={[Math.cos(a) * 5.15, def.thickness! / 2 + 0.02, Math.sin(a) * 5.15]} />
      ))}
    </Placed>
  );
}

function Screw({ pos }: { pos: [number, number, number] }) {
  return (
    <group position={pos}>
      <mesh>
        <cylinderGeometry args={[0.08, 0.08, 0.05, 16]} />
        <meshStandardMaterial color={STEEL_BLUE} metalness={0.95} roughness={0.2} />
      </mesh>
      <mesh position={[0, 0.028, 0]}>
        <boxGeometry args={[0.12, 0.012, 0.028]} />
        <meshStandardMaterial color="#141c2c" metalness={0.9} roughness={0.3} />
      </mesh>
    </group>
  );
}

/** Archimedean spiral curve, used for the hairspring and the mainspring coil. */
class Spiral extends THREE.Curve<THREE.Vector3> {
  constructor(
    private r0: number,
    private r1: number,
    private turns: number,
  ) {
    super();
  }
  getPoint(t: number): THREE.Vector3 {
    const a = t * this.turns * Math.PI * 2;
    const r = this.r0 + (this.r1 - this.r0) * t;
    return new THREE.Vector3(Math.cos(a) * r, 0, Math.sin(a) * r);
  }
}

function MainspringPart() {
  const geo = useMemo(() => new THREE.TubeGeometry(new Spiral(0.22, 1.28, 6), 320, 0.045, 6, false), []);
  const mat = useMemo(() => metal('#c6ccd4', 0.95, 0.35), []);
  return (
    <Placed id="mainspring">
      <mesh geometry={geo} material={mat} castShadow />
      {/* Arbor at the spring's heart. */}
      <mesh>
        <cylinderGeometry args={[0.14, 0.14, 0.5, 20]} />
        <meshStandardMaterial color="#8d95a2" metalness={0.95} roughness={0.25} />
      </mesh>
    </Placed>
  );
}

function Barrel() {
  const def = PART_BY_ID.barrel;
  const teethGeo = useMemo(
    () => gearGeometry({ teeth: def.teeth!, pitchRadius: def.radius!, thickness: 0.14, bore: def.radius! * 0.88 }),
    [def],
  );
  const mat = useMemo(() => metal(def.color, 0.88, 0.3), [def.color]);
  const spin = useRef<THREE.Group>(null);
  useFrame(() => {
    const { sim } = useGameStore.getState();
    if (spin.current) spin.current.rotation.y = sim.escapeAngle * ratioToEscape('barrel');
  });
  return (
    <Placed id="barrel">
      <group ref={spin}>
        {/* Drum wall (open top so the spring shows until the lid goes on). */}
        <mesh castShadow>
          <cylinderGeometry args={[def.radius! * 0.94, def.radius! * 0.94, def.thickness!, 64, 1, true]} />
          <meshStandardMaterial color={def.color} metalness={0.88} roughness={0.3} side={THREE.DoubleSide} envMapIntensity={0.9} />
        </mesh>
        {/* Drum floor. */}
        <mesh position={[0, -def.thickness! / 2 + 0.02, 0]}>
          <cylinderGeometry args={[def.radius! * 0.94, def.radius! * 0.94, 0.04, 64]} />
          <meshStandardMaterial color="#a5854a" metalness={0.85} roughness={0.35} />
        </mesh>
        {/* Toothed rim near the base, where it drives the center pinion. */}
        <mesh geometry={teethGeo} material={mat} position={[0, -def.thickness! / 2 + 0.1, 0]} castShadow />
      </group>
    </Placed>
  );
}

function BarrelLid() {
  const def = PART_BY_ID.barrelLid;
  const mat = useMemo(() => metal(def.color, 0.9, 0.22), [def.color]);
  return (
    <Placed id="barrelLid">
      <mesh geometry={useMemo(() => discGeometry(def.radius!, def.thickness!), [def])} material={mat} castShadow />
      <mesh position={[0, def.thickness!, 0]}>
        <cylinderGeometry args={[0.16, 0.16, 0.14, 20]} />
        <meshStandardMaterial color="#8d95a2" metalness={0.95} roughness={0.25} />
      </mesh>
    </Placed>
  );
}

function RatchetWheel() {
  const def = PART_BY_ID.ratchetWheel;
  const geo = useMemo(
    () => gearGeometry({ teeth: def.teeth!, pitchRadius: def.radius!, thickness: def.thickness!, lightening: false }),
    [def],
  );
  const mat = useMemo(() => metal(def.color, 0.9, 0.24), [def.color]);
  const spin = useRef<THREE.Mesh>(null);
  useFrame(() => {
    const { snapshot } = useGameStore.getState();
    if (spin.current) spin.current.rotation.y = snapshot.wind * Math.PI * 6;
  });
  return (
    <Placed id="ratchetWheel">
      <mesh ref={spin} geometry={geo} material={mat} castShadow />
      <Screw pos={[0, def.thickness! / 2 + 0.03, 0]} />
    </Placed>
  );
}

function Click() {
  const def = PART_BY_ID.click;
  const lever = useRef<THREE.Group>(null);
  useFrame(() => {
    const { clickEngaged } = useGameStore.getState();
    if (lever.current) {
      const target = clickEngaged ? 0 : 0.55;
      lever.current.rotation.y += (target - lever.current.rotation.y) * 0.15;
    }
  });
  // Aim the pawl at the ratchet wheel centre.
  const aim = Math.atan2(0.9 - def.pos[2], -2.5 - def.pos[0]);
  return (
    <Placed id="click">
      <group rotation={[0, -aim, 0]}>
        <group ref={lever}>
          <mesh position={[0.32, 0, 0]} castShadow>
            <boxGeometry args={[0.72, 0.09, 0.16]} />
            <meshStandardMaterial color={def.color} metalness={0.9} roughness={0.3} />
          </mesh>
          <mesh position={[0.72, 0, 0]} rotation={[0, 0.5, 0]}>
            <boxGeometry args={[0.24, 0.09, 0.12]} />
            <meshStandardMaterial color={def.color} metalness={0.9} roughness={0.3} />
          </mesh>
        </group>
        <Screw pos={[0, 0.07, 0]} />
      </group>
    </Placed>
  );
}

/** A going-train wheel with its pinion and arbor, spinning by exact ratio. */
function TrainWheel({ id }: { id: PartId }) {
  const def = PART_BY_ID[id];
  const wheelGeo = useMemo(
    () => gearGeometry({ teeth: def.teeth!, pitchRadius: def.radius!, thickness: def.thickness!, lightening: true }),
    [def],
  );
  const pinionGeo = useMemo(
    () =>
      def.pinion
        ? gearGeometry({ teeth: def.pinion.teeth, pitchRadius: def.pinion.radius, thickness: 0.16, bore: def.pinion.radius * 0.35 })
        : null,
    [def],
  );
  const mat = useMemo(() => metal(def.color, 0.92, 0.22), [def.color]);
  const steel = useMemo(() => metal('#9ba4b0', 0.95, 0.3), []);
  const spin = useRef<THREE.Group>(null);
  const ratio = useMemo(() => ratioToEscape(id), [id]);
  const sign = (PARITY[id] ?? 0) % 2 === 0 ? 1 : -1;

  useFrame(() => {
    const { sim } = useGameStore.getState();
    if (spin.current) spin.current.rotation.y = sim.escapeAngle * ratio * sign;
  });

  const pinionDy = def.pinion ? def.pinion.y - def.pos[1] : 0;
  return (
    <Placed id={id}>
      <group ref={spin}>
        <mesh geometry={wheelGeo} material={mat} castShadow />
        {pinionGeo && <mesh geometry={pinionGeo} material={steel} position={[0, pinionDy, 0]} castShadow />}
        {/* Arbor running plate → bridge. */}
        <mesh position={[0, (0.3 + 1.42) / 2 - def.pos[1], 0]}>
          <cylinderGeometry args={[0.042, 0.042, 1.16, 12]} />
          <meshStandardMaterial color="#c4cad4" metalness={0.95} roughness={0.2} />
        </mesh>
      </group>
    </Placed>
  );
}

function EscapeWheel() {
  const def = PART_BY_ID.escapeWheel;
  const geo = useMemo(() => escapeWheelGeometry(def.radius!, def.thickness!), [def]);
  const pinionGeo = useMemo(
    () => gearGeometry({ teeth: def.pinion!.teeth, pitchRadius: def.pinion!.radius, thickness: 0.14, bore: 0.04 }),
    [def],
  );
  const mat = useMemo(() => metal(def.color, 0.95, 0.18), [def.color]);
  const spin = useRef<THREE.Group>(null);
  useFrame(() => {
    const { sim } = useGameStore.getState();
    // The escape wheel advances in discrete half-tooth steps — show the jerk.
    const stepped = Math.floor(sim.escapeAngle / ESCAPE_ADVANCE_PER_BEAT) * ESCAPE_ADVANCE_PER_BEAT;
    if (spin.current) spin.current.rotation.y = stepped;
  });
  return (
    <Placed id="escapeWheel">
      <group ref={spin}>
        <mesh geometry={geo} material={mat} castShadow />
        <mesh geometry={pinionGeo} material={mat} position={[0, def.pinion!.y - def.pos[1], 0]} />
        <mesh position={[0, (0.3 + 1.42) / 2 - def.pos[1], 0]}>
          <cylinderGeometry args={[0.038, 0.038, 1.16, 12]} />
          <meshStandardMaterial color="#c4cad4" metalness={0.95} roughness={0.2} />
        </mesh>
      </group>
    </Placed>
  );
}

function PalletFork() {
  const def = PART_BY_ID.palletFork;
  // Anchor shape: pivot at origin, two arms reaching toward the escape wheel
  // (-z side, since the wheel sits at lower z), fork horns toward the balance.
  const bodyGeo = useMemo(() => {
    const s = new THREE.Shape();
    s.moveTo(-0.09, 0.55); // fork slot left horn
    s.lineTo(-0.16, 0.55);
    s.lineTo(-0.07, 0.1);
    s.lineTo(-0.5, -0.72); // entry arm
    s.lineTo(-0.32, -0.82);
    s.lineTo(-0.02, -0.2);
    s.lineTo(0.02, -0.2);
    s.lineTo(0.32, -0.82); // exit arm
    s.lineTo(0.5, -0.72);
    s.lineTo(0.07, 0.1);
    s.lineTo(0.16, 0.55);
    s.lineTo(0.09, 0.55);
    s.lineTo(0.045, 0.34);
    s.lineTo(-0.045, 0.34);
    s.closePath();
    const g = new THREE.ExtrudeGeometry(s, { depth: 0.09, bevelEnabled: true, bevelThickness: 0.015, bevelSize: 0.01, bevelSegments: 1 });
    // Lay flat with the fork horns (+y in the shape) toward the balance at +z,
    // and the pallet arms toward the escape wheel at −z.
    g.rotateX(Math.PI / 2);
    g.translate(0, 0.06, 0);
    return g;
  }, []);
  const mat = useMemo(() => metal(def.color, 0.95, 0.2), [def.color]);
  const rock = useRef<THREE.Group>(null);
  useFrame(() => {
    const { sim } = useGameStore.getState();
    if (rock.current) {
      const target = Math.tanh(sim.balance.omega * 0.06) * 0.22;
      rock.current.rotation.y += (target - rock.current.rotation.y) * 0.5;
    }
  });
  return (
    <Placed id="palletFork">
      <group ref={rock}>
        <mesh geometry={bodyGeo} material={mat} castShadow />
        {/* Ruby pallet stones at the arm tips, on the escape-wheel side. */}
        <mesh position={[-0.4, 0.06, -0.76]} rotation={[0, 0.5, 0]}>
          <boxGeometry args={[0.09, 0.11, 0.2]} />
          <meshStandardMaterial color={RUBY} metalness={0.3} roughness={0.12} emissive="#400012" />
        </mesh>
        <mesh position={[0.4, 0.06, -0.76]} rotation={[0, -0.5, 0]}>
          <boxGeometry args={[0.09, 0.11, 0.2]} />
          <meshStandardMaterial color={RUBY} metalness={0.3} roughness={0.12} emissive="#400012" />
        </mesh>
        {/* Pivot staff. */}
        <mesh>
          <cylinderGeometry args={[0.035, 0.035, 0.55, 10]} />
          <meshStandardMaterial color="#c4cad4" metalness={0.95} roughness={0.2} />
        </mesh>
      </group>
    </Placed>
  );
}

function BalanceAssembly() {
  const def = PART_BY_ID.balance;
  const r = def.radius!;
  const rimMat = useMemo(() => metal(def.color, 0.92, 0.24), [def.color]);
  const springGeo = useMemo(() => new THREE.TubeGeometry(new Spiral(0.14, r * 0.62, 5.5), 400, 0.016, 5, false), [r]);
  const spin = useRef<THREE.Group>(null);
  const breathe = useRef<THREE.Mesh>(null);
  useFrame(() => {
    const { sim } = useGameStore.getState();
    if (spin.current) spin.current.rotation.y = sim.balance.theta;
    if (breathe.current) {
      // The hairspring breathes with the swing.
      const s = 1 + Math.sin(sim.balance.theta) * 0.055;
      breathe.current.scale.set(s, 1, s);
      breathe.current.rotation.y = sim.balance.theta * 0.12;
    }
  });
  const screws = 6;
  return (
    <Placed id="balance">
      <group ref={spin}>
        {/* Rim with timing screws. */}
        <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
          <torusGeometry args={[r, 0.095, 14, 72]} />
          <primitive object={rimMat} attach="material" />
        </mesh>
        {Array.from({ length: screws }, (_, i) => {
          const a = (i / screws) * Math.PI * 2;
          return (
            <mesh key={i} position={[Math.cos(a) * (r + 0.1), 0, Math.sin(a) * (r + 0.1)]} rotation={[0, -a, Math.PI / 2]}>
              <cylinderGeometry args={[0.05, 0.05, 0.12, 10]} />
              <meshStandardMaterial color="#e2c274" metalness={0.95} roughness={0.2} />
            </mesh>
          );
        })}
        {/* Two crossing spokes + hub. */}
        <mesh castShadow>
          <boxGeometry args={[r * 2, 0.055, 0.13]} />
          <meshStandardMaterial color="#7c5a34" metalness={0.85} roughness={0.35} />
        </mesh>
        <mesh rotation={[0, Math.PI / 2, 0]} castShadow>
          <boxGeometry args={[r * 2, 0.055, 0.13]} />
          <meshStandardMaterial color="#7c5a34" metalness={0.85} roughness={0.35} />
        </mesh>
        <mesh>
          <cylinderGeometry args={[0.11, 0.11, 0.34, 16]} />
          <meshStandardMaterial color="#c4cad4" metalness={0.95} roughness={0.2} />
        </mesh>
        {/* Roller + impulse jewel below, where the fork engages. */}
        <mesh position={[0, -0.24, 0]}>
          <cylinderGeometry args={[0.17, 0.17, 0.08, 20]} />
          <meshStandardMaterial color="#9ba4b0" metalness={0.95} roughness={0.25} />
        </mesh>
        <mesh position={[0.13, -0.24, 0]}>
          <cylinderGeometry args={[0.035, 0.035, 0.12, 8]} />
          <meshStandardMaterial color={RUBY} metalness={0.3} roughness={0.12} emissive="#400012" />
        </mesh>
      </group>
      {/* Hairspring above the wheel (does not spin with it — it breathes). */}
      <mesh ref={breathe} geometry={springGeo} position={[0, 0.28, 0]}>
        <meshStandardMaterial color="#96a9bd" metalness={0.9} roughness={0.35} />
      </mesh>
      {/* Stud pinning the outer coil. */}
      <mesh position={[r * 0.62, 0.34, 0]}>
        <cylinderGeometry args={[0.045, 0.045, 0.2, 10]} />
        <meshStandardMaterial color="#8d95a2" metalness={0.9} roughness={0.3} />
      </mesh>
    </Placed>
  );
}

/** Rounded capsule outline for bridge shapes. */
function capsuleShape(halfLen: number, radius: number): THREE.Shape {
  const s = new THREE.Shape();
  s.absarc(-halfLen, 0, radius, Math.PI / 2, -Math.PI / 2, false);
  s.absarc(halfLen, 0, radius, -Math.PI / 2, Math.PI / 2, false);
  s.closePath();
  return s;
}

function bridgeMaterial(): THREE.MeshStandardMaterial {
  const m = metal('#b7bec9', 0.85, 0.3);
  m.map = genevaStripesTexture();
  return m;
}

function TrainBridge() {
  const def = PART_BY_ID.trainBridge;
  const angle = Math.atan2(1.02 - 0.37, 2.87 - -0.86); // center wheel → escape wheel
  const geo = useMemo(() => {
    const g = new THREE.ExtrudeGeometry(capsuleShape(2.35, 0.92), { depth: def.thickness!, bevelEnabled: true, bevelThickness: 0.03, bevelSize: 0.05, bevelSegments: 2 });
    g.rotateX(-Math.PI / 2);
    return g;
  }, [def]);
  const mat = useMemo(() => bridgeMaterial(), []);
  // Jewels above each covered arbor (offsets relative to the bridge centre).
  const arbors: [number, number][] = [
    [-0.86 - def.pos[0], 0.37 - def.pos[2]],
    [0.58 - def.pos[0], 0.89 - def.pos[2]],
    [1.85 - def.pos[0], 0.55 - def.pos[2]],
    [2.87 - def.pos[0], 1.02 - def.pos[2]],
  ];
  return (
    <Placed id="trainBridge">
      <group rotation={[0, -angle, 0]}>
        <mesh geometry={geo} material={mat} castShadow />
      </group>
      {arbors.map(([x, z], i) => (
        <mesh key={i} position={[x, def.thickness! + 0.02, z]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.04, 0.1, 24]} />
          <meshStandardMaterial color={RUBY} metalness={0.3} roughness={0.15} emissive="#38000f" />
        </mesh>
      ))}
      <Screw pos={[-2.1, def.thickness! + 0.02, -0.35]} />
      <Screw pos={[2.1, def.thickness! + 0.02, 0.4]} />
    </Placed>
  );
}

function PalletBridge() {
  const def = PART_BY_ID.palletBridge;
  const geo = useMemo(() => {
    const g = new THREE.ExtrudeGeometry(capsuleShape(0.45, 0.4), { depth: def.thickness!, bevelEnabled: true, bevelThickness: 0.02, bevelSize: 0.04, bevelSegments: 2 });
    g.rotateX(-Math.PI / 2);
    return g;
  }, [def]);
  const mat = useMemo(() => bridgeMaterial(), []);
  return (
    <Placed id="palletBridge">
      <mesh geometry={geo} material={mat} castShadow />
      <mesh position={[0, def.thickness! + 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.035, 0.09, 24]} />
        <meshStandardMaterial color={RUBY} metalness={0.3} roughness={0.15} emissive="#38000f" />
      </mesh>
      <Screw pos={[0.62, def.thickness! + 0.02, 0]} />
    </Placed>
  );
}

function BalanceCock() {
  const def = PART_BY_ID.balanceCock;
  const outward = Math.atan2(def.pos[2], def.pos[0]); // neck points away from the movement centre
  const geo = useMemo(() => {
    const s = new THREE.Shape();
    s.absarc(0, 0, 1.02, 0, Math.PI * 2, false);
    const g1 = new THREE.ExtrudeGeometry(s, { depth: def.thickness!, bevelEnabled: true, bevelThickness: 0.02, bevelSize: 0.04, bevelSegments: 2 });
    g1.rotateX(-Math.PI / 2);
    return g1;
  }, [def]);
  const neckGeo = useMemo(() => {
    const g = new THREE.ExtrudeGeometry(capsuleShape(0.75, 0.34), { depth: def.thickness!, bevelEnabled: true, bevelThickness: 0.02, bevelSize: 0.04, bevelSegments: 2 });
    g.rotateX(-Math.PI / 2);
    return g;
  }, [def]);
  const mat = useMemo(() => bridgeMaterial(), []);
  const regArm = useRef<THREE.Group>(null);
  useFrame(() => {
    const { regulator } = useGameStore.getState();
    if (regArm.current) regArm.current.rotation.y = -regulator * 0.004;
  });
  return (
    <Placed id="balanceCock">
      <mesh geometry={geo} material={mat} castShadow />
      <group rotation={[0, -outward, 0]}>
        <mesh geometry={neckGeo} material={mat} position={[1.45, 0, 0]} castShadow />
        <Screw pos={[2.0, def.thickness! + 0.02, 0]} />
      </group>
      {/* End-stone in its gold chaton over the balance pivot. */}
      <mesh position={[0, def.thickness! + 0.03, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.1, 0.18, 28]} />
        <meshStandardMaterial color="#e2c274" metalness={0.95} roughness={0.2} />
      </mesh>
      <mesh position={[0, def.thickness! + 0.035, 0]}>
        <sphereGeometry args={[0.085, 16, 12]} />
        <meshStandardMaterial color={RUBY} metalness={0.3} roughness={0.1} emissive="#400012" />
      </mesh>
      {/* Live regulator arm — it moves when you slide the regulator. */}
      <group ref={regArm} position={[0, def.thickness! + 0.02, 0]}>
        <mesh position={[0.55, 0, 0]}>
          <boxGeometry args={[0.85, 0.035, 0.09]} />
          <meshStandardMaterial color="#4a5462" metalness={0.9} roughness={0.3} />
        </mesh>
      </group>
    </Placed>
  );
}

function MotionWheel({ id }: { id: PartId }) {
  const def = PART_BY_ID[id];
  const geo = useMemo(
    () => gearGeometry({ teeth: def.teeth!, pitchRadius: def.radius!, thickness: def.thickness ?? 0.09, lightening: false }),
    [def],
  );
  const mat = useMemo(() => metal(def.color, 0.85, 0.3), [def.color]);
  const spin = useRef<THREE.Mesh>(null);
  useFrame(() => {
    const { snapshot } = useGameStore.getState();
    if (!spin.current) return;
    if (id === 'cannonPinion') spin.current.rotation.y = -snapshot.minutesAngle;
    else if (id === 'hourWheel') spin.current.rotation.y = -snapshot.hoursAngle;
    else spin.current.rotation.y = snapshot.minutesAngle * 0.4;
  });
  return (
    <Placed id={id}>
      <mesh ref={spin} geometry={geo} material={mat} castShadow />
      {id === 'cannonPinion' && (
        <mesh position={[0, 0.35, 0]}>
          <cylinderGeometry args={[0.09, 0.09, 0.75, 14]} />
          <meshStandardMaterial color={def.color} metalness={0.85} roughness={0.3} />
        </mesh>
      )}
    </Placed>
  );
}

function Dial() {
  const def = PART_BY_ID.dial;
  const mat = useMemo(() => {
    const m = new THREE.MeshStandardMaterial({ metalness: 0.35, roughness: 0.5, envMapIntensity: 0.5 });
    m.map = dialTexture();
    return m;
  }, []);
  const geo = useMemo(() => discGeometry(def.radius!, def.thickness!), [def]);
  return (
    <Placed id="dial">
      <mesh geometry={geo} material={mat} castShadow receiveShadow />
    </Placed>
  );
}

/** Tapered dauphine hand, tip along −Z, pivot at the origin. */
function handGeometry(len: number, halfW: number, tail: number): THREE.ExtrudeGeometry {
  const s = new THREE.Shape();
  s.moveTo(0, -tail);
  s.lineTo(halfW, len * 0.28);
  s.lineTo(0, len);
  s.lineTo(-halfW, len * 0.28);
  s.closePath();
  const g = new THREE.ExtrudeGeometry(s, { depth: 0.035, bevelEnabled: true, bevelThickness: 0.012, bevelSize: 0.012, bevelSegments: 1 });
  g.rotateX(Math.PI / 2); // shape +y → world −z, extrusion up
  return g;
}

const SECONDS_STEP = (Math.PI * 2) / (60 * 8); // 8 sub-steps per second, like the real thing

function Hands() {
  const hour = useRef<THREE.Group>(null);
  const minute = useRef<THREE.Group>(null);
  const seconds = useRef<THREE.Group>(null);
  const hourGeo = useMemo(() => handGeometry(2.35, 0.2, 0.45), []);
  const minGeo = useMemo(() => handGeometry(3.55, 0.15, 0.5), []);
  const silver = useMemo(() => metal('#e8ecf2', 0.95, 0.15), []);
  const gold = useMemo(() => metal('#d4a94e', 0.95, 0.2), []);

  useFrame(() => {
    const { snapshot } = useGameStore.getState();
    if (hour.current) hour.current.rotation.y = -snapshot.hoursAngle;
    if (minute.current) minute.current.rotation.y = -snapshot.minutesAngle;
    if (seconds.current) {
      // The seconds hand ticks in 8 tiny steps per second.
      seconds.current.rotation.y = -Math.floor(snapshot.secondsAngle / SECONDS_STEP) * SECONDS_STEP;
    }
  });

  return (
    <Placed id="handsSet">
      <group ref={hour}>
        <mesh geometry={hourGeo} material={silver} castShadow />
      </group>
      <group ref={minute} position={[0, 0.07, 0]}>
        <mesh geometry={minGeo} material={silver} castShadow />
      </group>
      <group ref={seconds} position={[0, 0.14, 0]}>
        <mesh position={[0, 0, -1.55]} material={gold} castShadow>
          <boxGeometry args={[0.045, 0.03, 4.35]} />
        </mesh>
        <mesh position={[0, 0, 0.85]} material={gold}>
          <torusGeometry args={[0.16, 0.045, 8, 24]} />
        </mesh>
      </group>
      <mesh position={[0, 0.1, 0]} material={gold}>
        <cylinderGeometry args={[0.16, 0.18, 0.24, 24]} />
      </mesh>
    </Placed>
  );
}

/* ------------------------------------------------------------------ */
/* The glowing socket for the next part                                 */
/* ------------------------------------------------------------------ */

function GhostSocket() {
  const placed = useGameStore((s) => s.placed);
  const placePart = useGameStore((s) => s.placePart);
  const next = ASSEMBLY_ORDER.find((p) => !placed.includes(p));
  const ring = useRef<THREE.Mesh>(null);
  const halo = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    const pulse = (Math.sin(clock.elapsedTime * 3.2) + 1) / 2;
    if (ring.current) (ring.current.material as THREE.MeshBasicMaterial).opacity = 0.35 + pulse * 0.45;
    if (halo.current) {
      halo.current.scale.setScalar(1 + pulse * 0.12);
      (halo.current.material as THREE.MeshBasicMaterial).opacity = 0.1 + pulse * 0.12;
    }
  });

  if (!next) return null;
  const def = PART_BY_ID[next];
  const r = Math.max(0.45, (def.radius ?? 0.5) * 0.9);

  return (
    <group position={def.pos}>
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        onClick={(e) => {
          e.stopPropagation();
          placePart(next);
          placeSound();
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={() => {
          document.body.style.cursor = '';
        }}
      >
        <circleGeometry args={[r + 0.25, 40]} />
        <meshBasicMaterial color="#e8c876" transparent opacity={0.06} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
      <mesh ref={ring} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[r, r + 0.07, 48]} />
        <meshBasicMaterial color="#f0cd7e" transparent opacity={0.6} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
      <mesh ref={halo} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[r + 0.14, r + 0.3, 48]} />
        <meshBasicMaterial color="#f0cd7e" transparent opacity={0.15} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
      <Html center position={[0, 0.85, 0]} className="ghost-label" style={{ pointerEvents: 'none' }}>
        place {def.label.toLowerCase()}
      </Html>
    </group>
  );
}

/* ------------------------------------------------------------------ */

const RENDERERS: Partial<Record<PartId, () => ReactNode>> = {
  mainplate: () => <Mainplate />,
  mainspring: () => <MainspringPart />,
  barrel: () => <Barrel />,
  barrelLid: () => <BarrelLid />,
  ratchetWheel: () => <RatchetWheel />,
  click: () => <Click />,
  centerWheel: () => <TrainWheel id="centerWheel" />,
  thirdWheel: () => <TrainWheel id="thirdWheel" />,
  fourthWheel: () => <TrainWheel id="fourthWheel" />,
  escapeWheel: () => <EscapeWheel />,
  palletFork: () => <PalletFork />,
  balance: () => <BalanceAssembly />,
  trainBridge: () => <TrainBridge />,
  palletBridge: () => <PalletBridge />,
  balanceCock: () => <BalanceCock />,
  cannonPinion: () => <MotionWheel id="cannonPinion" />,
  minuteWheel: () => <MotionWheel id="minuteWheel" />,
  hourWheel: () => <MotionWheel id="hourWheel" />,
  dial: () => <Dial />,
  handsSet: () => <Hands />,
};

export function Movement3D() {
  const placed = useGameStore((s) => s.placed);
  return (
    <group>
      {placed.map((id) => {
        const render = RENDERERS[id];
        return render ? <group key={id}>{render()}</group> : null;
      })}
      <GhostSocket />
    </group>
  );
}
