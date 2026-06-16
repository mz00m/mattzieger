/**
 * The 3D bench: camera, lighting, orbit controls, the watchmaker's worktop, and
 * the movement itself. A hidden SimDriver advances the simulation each frame.
 */

import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, ContactShadows } from '@react-three/drei';
import { Movement3D } from './Movement3D';
import { useGameStore } from '../state/gameStore';

/** Pumps real frame time into the sim. Lives inside the Canvas for useFrame. */
function SimDriver() {
  const tick = useGameStore((s) => s.tickRealDt);
  useFrame((_, delta) => {
    // Clamp delta so a paused/background tab can't jump the watch forward wildly.
    tick(Math.min(delta, 0.05));
  });
  return null;
}

export function Bench() {
  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      camera={{ position: [6, 8, 11], fov: 42 }}
      gl={{ antialias: true }}
    >
      <color attach="background" args={['#11151c']} />
      <fog attach="fog" args={['#11151c', 22, 40]} />

      {/* Lighting only — no remote HDR, so the bench works fully offline. */}
      <hemisphereLight args={['#dfe8f5', '#1a1f27', 0.7]} />
      <ambientLight intensity={0.35} />
      <directionalLight
        position={[8, 14, 6]}
        intensity={1.8}
        castShadow
        shadow-mapSize={[2048, 2048]}
      />
      <directionalLight position={[-8, 6, -4]} intensity={0.55} color="#9fc6ff" />
      <pointLight position={[0, 6, 4]} intensity={0.4} />

      {/* Worktop */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.4, 0]} receiveShadow>
        <circleGeometry args={[16, 64]} />
        <meshStandardMaterial color="#1b212b" roughness={0.9} metalness={0.1} />
      </mesh>

      {/* Movement holder ring */}
      <mesh position={[0, -0.35, 0]}>
        <torusGeometry args={[6.6, 0.4, 16, 64]} />
        <meshStandardMaterial color="#2a3441" roughness={0.6} metalness={0.4} />
      </mesh>

      <Movement3D />

      <ContactShadows position={[0, -0.34, 0]} opacity={0.5} scale={26} blur={2.2} far={10} />

      <OrbitControls
        enablePan={false}
        minDistance={6}
        maxDistance={26}
        maxPolarAngle={Math.PI / 2.05}
        target={[0, 0.8, 1]}
      />

      <SimDriver />
    </Canvas>
  );
}
