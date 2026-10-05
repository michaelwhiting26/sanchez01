"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import { BufferAttribute, BufferGeometry, Color, Fog, PMREMGenerator, type Points } from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { CinematicCamera } from "./CinematicCamera";
import { Exterior } from "./Exterior";
import { Jesse } from "./Jesse";
import { LODController } from "./LODController";
import { ProductWall } from "./ProductWall";
import { Workshop } from "./Workshop";
import { useScene } from "./scene-store";
import type { WorldProps } from "./types";

/**
 * The one persistent WebGL canvas for Parts 1 to 4 (spec §0). It is mounted once and never rebuilt between stages.
 * Lighting is deliberately cheap: one environment, one key light and two warm room lights. GREY-BOX: lighting is not baked into the room yet.
 */
export default function World(props: WorldProps) {
  return (
    <Canvas dpr={[1, 1.5]} gl={{ antialias: true, powerPreference: "high-performance" }} camera={{ fov: 56, near: 0.1, far: 40, position: [0.15, 1.68, 4.2] }}>
      <Stage />
      <hemisphereLight args={["#ffe2bd", "#1a130d", 0.55]} />
      <directionalLight position={[2.5, 5, 3]} intensity={0.9} color="#ffe9cf" />
      <pointLight position={[-3.2, 2.5, -3]} intensity={18} distance={9} decay={2} color="#ffc98a" />
      <pointLight position={[3.2, 2.5, -3.4]} intensity={18} distance={9} decay={2} color="#ffc98a" />
      <pointLight position={[0, 2.6, -6]} intensity={14} distance={7} decay={2} color="#ffdcae" />
      <Exterior {...props} />
      <Workshop {...props} />
      <ProductWall {...props} />
      <Jesse {...props} />
      <Dust {...props} />
      <CinematicCamera {...props} />
      <LODController />
    </Canvas>
  );
}

/** Background, depth haze and reflections, set up once. */
function Stage() {
  const gl = useThree((s) => s.gl);
  const scene = useThree((s) => s.scene);
  useEffect(() => {
    const pmrem = new PMREMGenerator(gl);
    const env = pmrem.fromScene(new RoomEnvironment(), 0.04);
    scene.environment = env.texture;
    scene.environmentIntensity = 0.35;
    scene.background = new Color("#090705");
    scene.fog = new Fog("#090705", 9, 26);
    return () => {
      scene.environment = null;
      env.dispose();
      pmrem.dispose();
    };
  }, [gl, scene]);
  return null;
}

/** A little dust in the workshop light. Dropped on the reduced quality level and for visitors who ask for less motion. */
function Dust({ reducedMotion }: WorldProps) {
  const tier = useScene((s) => s.qualityTier);
  const ref = useRef<Points>(null);
  const geometry = useMemo(() => {
    const n = 140;
    const positions = new Float32Array(n * 3);
    // A fixed pseudo-random spread: the same dust on every visit, and nothing random during render.
    for (let i = 0; i < n; i++) {
      positions[i * 3] = ((i * 7919) % 1000) / 1000 * 11 - 5.5;
      positions[i * 3 + 1] = ((i * 6007) % 1000) / 1000 * 2.6 + 0.4;
      positions[i * 3 + 2] = -(((i * 4409) % 1000) / 1000) * 6.4 - 0.4;
    }
    const g = new BufferGeometry();
    g.setAttribute("position", new BufferAttribute(positions, 3));
    return g;
  }, []);
  useEffect(() => () => geometry.dispose(), [geometry]);
  useFrame(({ clock }) => {
    if (ref.current) ref.current.position.y = Math.sin(clock.elapsedTime * 0.12) * 0.08;
  });
  if (tier > 0 || reducedMotion) return null;
  return (
    <points ref={ref} geometry={geometry}>
      <pointsMaterial size={0.012} color="#ffdcae" transparent opacity={0.35} depthWrite={false} sizeAttenuation />
    </points>
  );
}
