/**
 * The 3D bench: camera, studio lighting with generated environment reflections
 * (RoomEnvironment — bundled with three, so no network fetch), the leather
 * worktop and movement holder, and the movement itself. SimDriver advances the
 * simulation each frame and plays the escapement's tick in time with the beats.
 */

import { useEffect, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { Movement3D } from './Movement3D';
import { leatherTexture } from './finishes';
import { useGameStore } from '../state/gameStore';
import { tickSound } from '../audio/sound';

/** Pumps real frame time into the sim; chirps a tick on each escapement beat. */
function SimDriver() {
  const lastBeats = useRef(0);
  const lastTickAt = useRef(0);
  useFrame((_, delta) => {
    const state = useGameStore.getState();
    // Clamp delta so a backgrounded tab can't jump the watch forward wildly.
    state.tickRealDt(Math.min(delta, 0.05));
    const beats = state.sim.escapement.beats;
    if (state.soundOn && beats > lastBeats.current) {
      const now = performance.now();
      if (now - lastTickAt.current > 90) {
        tickSound();
        lastTickAt.current = now;
      }
    }
    lastBeats.current = beats;
  });
  return null;
}

/** Generated studio reflections so the metals actually gleam. */
function StudioEnvironment() {
  const { gl, scene } = useThree();
  useEffect(() => {
    const pmrem = new THREE.PMREMGenerator(gl);
    const env = pmrem.fromScene(new RoomEnvironment(), 0.06).texture;
    scene.environment = env;
    return () => {
      scene.environment = null;
      env.dispose();
      pmrem.dispose();
    };
  }, [gl, scene]);
  return null;
}

function Worktop() {
  return (
    <group>
      {/* Leather bench mat. */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.42, 0]} receiveShadow>
        <circleGeometry args={[15, 64]} />
        <meshStandardMaterial map={leatherTexture()} roughness={0.92} metalness={0.05} />
      </mesh>
      {/* Brushed-steel movement holder. */}
      <mesh position={[0, -0.28, 0]} receiveShadow>
        <torusGeometry args={[6.15, 0.32, 20, 96]} />
        <meshStandardMaterial color="#5b6470" roughness={0.42} metalness={0.85} envMapIntensity={0.7} />
      </mesh>
      <mesh position={[0, -0.34, 0]}>
        <cylinderGeometry args={[6.15, 6.45, 0.14, 96]} />
        <meshStandardMaterial color="#3a414c" roughness={0.5} metalness={0.8} />
      </mesh>
    </group>
  );
}

export function Bench() {
  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      camera={{ position: [5.2, 8.2, 10.8], fov: 40 }}
      gl={{ antialias: true, alpha: true }}
    >
      <StudioEnvironment />

      <ambientLight intensity={0.25} />
      {/* Key light, warm, like a bench lamp. */}
      <directionalLight
        position={[6, 12, 5]}
        intensity={1.6}
        color="#fff2dd"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0002}
      />
      {/* Cool fill from the window side. */}
      <directionalLight position={[-9, 7, -5]} intensity={0.45} color="#a9c2e8" />
      <spotLight position={[0, 11, 2]} angle={0.55} penumbra={0.9} intensity={0.6} color="#ffe9c4" />

      <Worktop />
      <Movement3D />

      <ContactShadows position={[0, -0.4, 0]} opacity={0.55} scale={26} blur={2.4} far={9} />

      <OrbitControls
        enablePan={false}
        enableDamping
        dampingFactor={0.08}
        minDistance={4.5}
        maxDistance={24}
        maxPolarAngle={Math.PI / 2.08}
        target={[0.4, 0.7, 1.2]}
      />

      <SimDriver />
    </Canvas>
  );
}
