"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import { BufferAttribute, BufferGeometry, Color, Fog, MathUtils, Object3D, PMREMGenerator, type DirectionalLight, type HemisphereLight, type Points, type PointLight, type SpotLight } from "three";
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
 * Lighting is deliberately cheap: one environment, a sky and key light that change between street and room, the lantern light outside and three warm room lights.
 * Nothing is baked into the surfaces yet, and nothing casts a shadow.
 */
export default function World(props: WorldProps) {
  return (
    <Canvas dpr={[1, 1.5]} gl={{ antialias: true, powerPreference: "high-performance" }} camera={{ fov: 50, near: 0.1, far: 40, position: [0.45, 1.62, 7.65] }}>
      <Stage />
      <Ambience {...props} />
      <RoomLights {...props} />
      <ProductKeyLight {...props} />
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

// `env` is how strongly surfaces mirror the studio-style reflection map: kept low on the street, where it would put a grey sheen on black paint.
const STREET = { sky: 0.1, key: 0.16, keyColor: new Color("#8fa6cf"), env: 0.1 } as const;
const ROOM = { sky: 0.26, key: 0.22, keyColor: new Color("#ffe9cf"), env: 0.3 } as const;

/**
 * The light that changes with where the visitor is. On the street it is night: a faint cool sky, and warm pools from the two lanterns and over the sign.
 * Walking in, the street light fades and the room's own level comes up over about a second, the way eyes adjust.
 * Every light stays mounted the whole time (only its strength moves), so crossing the threshold never makes the phone rebuild its shaders.
 */
function Ambience({ stage }: WorldProps) {
  const sky = useRef<HemisphereLight>(null);
  const key = useRef<DirectionalLight>(null);
  const lanterns = useRef<Array<PointLight | null>>([]);
  const level = useRef(stage === "boot" || stage === "arrive" ? 0 : 1); // 0 = street, 1 = room
  useFrame(({ scene }, dt) => {
    const street = stage === "boot" || stage === "arrive";
    level.current = MathUtils.damp(level.current, street ? 0 : 1, 2.2, dt);
    const t = level.current;
    scene.environmentIntensity = MathUtils.lerp(STREET.env, ROOM.env, t);
    if (sky.current) sky.current.intensity = MathUtils.lerp(STREET.sky, ROOM.sky, t);
    if (key.current) {
      key.current.intensity = MathUtils.lerp(STREET.key, ROOM.key, t);
      key.current.color.copy(STREET.keyColor).lerp(ROOM.keyColor, t);
    }
    // The lanterns belong to the street scene, which is dropped once the visitor is inside.
    const on = stage === "boot" || stage === "arrive" || stage === "entering" ? 1 : 0;
    for (const [i, light] of lanterns.current.entries()) if (light) light.intensity = MathUtils.damp(light.intensity, on * (LANTERNS[i]?.intensity ?? 0), 6, dt);
  });
  return (
    <>
      <hemisphereLight ref={sky} args={["#ffe2bd", "#1a130d", STREET.sky]} />
      <directionalLight ref={key} position={[2.5, 5, 3]} intensity={STREET.key} color={STREET.keyColor} />
      {LANTERNS.map((l, i) => (
        <pointLight key={i} ref={(el) => void (lanterns.current[i] = el)} position={l.position} intensity={l.intensity} distance={l.distance} decay={2} color={l.color} />
      ))}
    </>
  );
}

/** Where the street's warm light comes from: the two wall lanterns beside the door (tools/store/shop_front.py) and a wash over the sign. */
const LANTERNS: ReadonlyArray<{ position: [number, number, number]; intensity: number; distance: number; color: string }> = [
  { position: [-1.1, 1.98, 0.75], intensity: 5, distance: 6, color: "#ffb866" },
  { position: [1.1, 1.98, 0.75], intensity: 5, distance: 6, color: "#ffb866" },
  { position: [0, 2.9, 2.0], intensity: 2.2, distance: 5, color: "#ffd9a8" },
];

/** The room's own light: one point light under each working pendant (tools/store/build_store.py places the fixtures). */
const PENDANTS: ReadonlyArray<{ position: [number, number, number]; intensity: number }> = [
  { position: [-3.65, 1.95, -2.6], intensity: 9 },
  { position: [2.9, 1.95, -3.6], intensity: 10 },
  { position: [0, 2.4, -3.0], intensity: 13 },
  { position: [5.3, 2.2, -3.5], intensity: 9 }, // the wall behind Jesse's sewing table: gloves, frames, banner
];

/** Warm pools under the pendants. When a product is chosen the room drops back a little so the product holds the eye. */
function RoomLights({ stage }: WorldProps) {
  const lights = useRef<Array<PointLight | null>>([]);
  useFrame((_, dt) => {
    const k = stage === "productSelected" || stage === "builderLoading" ? 0.6 : 1;
    for (const [i, light] of lights.current.entries()) if (light) light.intensity = MathUtils.damp(light.intensity, k * (PENDANTS[i]?.intensity ?? 0), 4, dt);
  });
  return (
    <>
      {PENDANTS.map((l, i) => (
        <pointLight key={i} ref={(el) => void (lights.current[i] = el)} position={l.position} intensity={l.intensity} distance={8} decay={2} color="#ffc58a" />
      ))}
    </>
  );
}

/**
 * One presentation light for whichever product is in view. It travels along the wall with the visitor, so the product they are looking at is
 * the brightest thing in the frame and its neighbours sit a stop or two darker. One moving light costs a phone far less than five fixed ones.
 */
function ProductKeyLight({ bootstrap, stage, index }: WorldProps) {
  const anchors = useScene((s) => s.anchors);
  const light = useRef<SpotLight>(null);
  const target = useMemo(() => new Object3D(), []);
  const product = bootstrap.products[index];
  const mark = product ? anchors.get(`PRODUCT_${product.cameraAnchor}`) : undefined;
  useFrame((_, dt) => {
    const l = light.current;
    if (!l || !mark || !product) return;
    const browsing = stage === "browsing" || stage === "productSelected" || stage === "builderLoading";
    // Hanging products are lit from in front and above their middle; shelf products from above and a little to one side, so leather shows its shape.
    const aimY = product.hangs ? mark.y - product.displayHeight / 2 : mark.y + product.displayHeight / 2;
    const k = 1 - Math.exp(-dt * 7);
    l.position.x += (mark.x + 0.55 - l.position.x) * k;
    l.position.y += ((product.hangs ? 3.0 : 2.7) - l.position.y) * k;
    l.position.z += (mark.z + (product.hangs ? 2.2 : 1.05) - l.position.z) * k;
    target.position.x += (mark.x - target.position.x) * k;
    target.position.y += (aimY - target.position.y) * k;
    target.position.z += (mark.z - target.position.z) * k;
    target.updateMatrixWorld();
    l.intensity = MathUtils.damp(l.intensity, browsing ? (stage === "browsing" ? 26 : 36) : 0, 5, dt);
  });
  return (
    <>
      <primitive object={target} />
      <spotLight ref={light} target={target} position={[0, 2.5, -5]} intensity={0} angle={0.33} penumbra={0.9} distance={7} decay={2} color="#fff0dc" />
    </>
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
