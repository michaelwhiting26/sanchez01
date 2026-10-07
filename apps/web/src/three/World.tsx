"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import { BufferAttribute, BufferGeometry, Color, Fog, MathUtils, Mesh, Object3D, PMREMGenerator, type DirectionalLight, type Material, type Texture, type WebGLRenderer, type HemisphereLight, type Points, type PointLight, type SpotLight } from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { assetManager } from "@/experience/asset-manager";
import { loadLightMap } from "@/experience/light-map";
import { CinematicCamera } from "./CinematicCamera";
import { Exterior } from "./Exterior";
import { Jesse } from "./Jesse";
import { LODController } from "./LODController";
import { ProductWall } from "./ProductWall";
import { WallSpots } from "./WallSpots";
import { Workshop } from "./Workshop";
import { useScene } from "./scene-store";
import { useGltf } from "./use-gltf";
import type { WorldProps } from "./types";

/**
 * The one persistent WebGL canvas for Parts 1 to 4 (spec §0). It is mounted once and never rebuilt between stages.
 * The workshop's light and shadow are baked (specs/09): ray-traced once in Blender and read from a picture, see Workshop.tsx. What is worked out live
 * is only what moves or shines: faint lights at the fixtures for highlights on brass, steel and leather, the light on the product in view with its
 * one real shadow, and a little fill for Jesse and the products. The street is still lit live.
 *
 * Nothing is drawn until the street and the room have been prepared on the graphics card (see WarmUp). A phone takes seconds to do that, and
 * drawing while it happens is what used to leave a black screen behind the interface; a still of the shop front covers the wait instead.
 */
export default function World(props: WorldProps) {
  const [warm, setWarm] = useState(false);
  return (
    <Canvas shadows frameloop={warm ? "always" : "never"} dpr={[1, 1.5]} gl={{ antialias: true, powerPreference: "high-performance" }} camera={{ fov: 50, near: 0.1, far: 40, position: [0.45, 1.62, 7.65] }}>
      <Stage />
      <WarmUp {...props} warm={warm} onWarm={() => setWarm(true)} />
      <WarmAhead {...props} />
      <Ambience {...props} />
      <RoomLights {...props} />
      <ProductKeyLight {...props} />
      <Exterior {...props} />
      <Workshop {...props} />
      <ProductWall {...props} />
      <Jesse {...props} />
      <WallSpots {...props} />
      <Dust {...props} />
      <CinematicCamera {...props} />
      <LODController />
    </Canvas>
  );
}

// `env` is how strongly surfaces mirror the studio-style reflection map: kept low on the street, where it would put a grey sheen on black paint.
const STREET = { sky: 0.1, key: 0.16, keyColor: new Color("#8fa6cf"), env: 0.1 } as const;
// Inside, the room is lit by its baked light. Sky and key are only a little fill for the things that move (products, Jesse), kept low so they
// do not lift the baked shadows back to flat.
const ROOM = { sky: 0.07, key: 0.05, keyColor: new Color("#ffe9cf"), env: 0.3 } as const;

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

/**
 * One faint point light under each working pendant (tools/store/build_store.py places the fixtures). The pendants' real light and shadow are in the
 * baked picture; these are a fraction of that strength and exist only so brass, steel and leather catch a highlight as the camera moves.
 */
const HIGHLIGHT = 0.16;
const PENDANTS: ReadonlyArray<{ position: [number, number, number]; intensity: number }> = [
  { position: [-3.65, 1.95, -2.6], intensity: 9 },
  { position: [2.9, 2.4, -3.6], intensity: 10 },
  { position: [0, 2.4, -3.0], intensity: 13 },
  { position: [5.3, 2.2, -3.5], intensity: 9 }, // the wall behind Jesse's sewing table: gloves, frames, banner
];

/** Highlights from the pendants. When a product is chosen they drop back a little so the product holds the eye. */
function RoomLights({ stage }: WorldProps) {
  const lights = useRef<Array<PointLight | null>>([]);
  useFrame((_, dt) => {
    const k = HIGHLIGHT * (stage === "productSelected" || stage === "builderLoading" ? 0.6 : 1);
    for (const [i, light] of lights.current.entries()) if (light) light.intensity = MathUtils.damp(light.intensity, k * (PENDANTS[i]?.intensity ?? 0), 4, dt);
  });
  return (
    <>
      {PENDANTS.map((l, i) => (
        <pointLight key={i} ref={(el) => void (lights.current[i] = el)} position={l.position} intensity={l.intensity * HIGHLIGHT} distance={8} decay={2} color="#ffc58a" />
      ))}
    </>
  );
}

/**
 * One presentation light for whichever product is in view. It travels along the wall with the visitor, so the product they are looking at is
 * the brightest thing in the frame and its neighbours sit a stop or two darker. One moving light costs a phone far less than five fixed ones.
 * It is also the only light in the store that casts a live shadow: the product turns, so its shadow on the counter cannot be baked. The shadow is
 * drawn only on the full quality level and only while a product is on show.
 */
function ProductKeyLight({ bootstrap, stage, index }: WorldProps) {
  const anchors = useScene((s) => s.anchors);
  const tier = useScene((s) => s.qualityTier);
  const light = useRef<SpotLight>(null);
  const target = useMemo(() => new Object3D(), []);
  const product = bootstrap.products[index];
  const mark = product ? anchors.get(`PRODUCT_${product.cameraAnchor}`) : undefined;
  useFrame((_, dt) => {
    const l = light.current;
    if (!l || !mark || !product) return;
    const browsing = stage === "browsing" || stage === "productSelected" || stage === "builderLoading";
    // Hanging products are lit from in front and above their middle. Shelf products are lit from nearly overhead and a little to one side: steep
    // enough that the shadow pools at the foot of the product, where the camera can see it, not behind it.
    const aimY = product.hangs ? mark.y - product.displayHeight / 2 : mark.y + product.displayHeight / 2;
    const k = 1 - Math.exp(-dt * 7);
    l.position.x += (mark.x + (product.hangs ? 0.55 : 0.32) - l.position.x) * k;
    l.position.y += ((product.hangs ? 3.0 : 2.9) - l.position.y) * k;
    l.position.z += (mark.z + (product.hangs ? 2.2 : 0.55) - l.position.z) * k;
    target.position.x += (mark.x - target.position.x) * k;
    target.position.y += (aimY - target.position.y) * k;
    target.position.z += (mark.z - target.position.z) * k;
    target.updateMatrixWorld();
    l.intensity = MathUtils.damp(l.intensity, browsing ? (stage === "browsing" ? 26 : 36) : 0, 5, dt);
    l.shadow.autoUpdate = browsing; // no product on show, no shadow to redraw
    // The shadow's own picture must exist before anything that reads it is drawn. It is only made by drawing the shadow once, and with updates
    // switched off (above) that would never happen if the room was ready before the first frame. Every surface that receives this shadow then
    // fails to draw on a strict graphics chip: the room stayed black until the visitor reached the products. Ask for one draw until it exists.
    if (l.castShadow && !l.shadow.map) l.shadow.needsUpdate = true;
  });
  return (
    <>
      <primitive object={target} />
      <spotLight
        ref={light}
        target={target}
        position={[0, 2.5, -5]}
        intensity={0}
        angle={0.33}
        penumbra={0.9}
        distance={7}
        decay={2}
        color="#fff0dc"
        castShadow={tier === 0}
        shadow-mapSize={[1024, 1024]}
        shadow-camera-near={0.4}
        shadow-camera-far={6}
        shadow-bias={-0.0004}
        shadow-normalBias={0.02}
        shadow-radius={3}
      />
    </>
  );
}

const nextFrame = (): Promise<void> => new Promise((resolve) => requestAnimationFrame(() => resolve()));
const frames = async (n: number): Promise<void> => {
  for (let i = 0; i < n; i++) await nextFrame();
};

/** Every picture the materials under `root` use. */
function texturesOf(root: Object3D): Texture[] {
  const found = new Set<Texture>();
  root.traverse((o) => {
    if (!(o instanceof Mesh)) return;
    const materials: Material[] = Array.isArray(o.material) ? (o.material as Material[]) : [o.material as Material];
    for (const m of materials) for (const value of Object.values(m)) if (isTexture(value)) found.add(value);
  });
  return [...found];
}
const isTexture = (v: unknown): v is Texture => typeof v === "object" && v !== null && (v as { isTexture?: boolean }).isTexture === true;

/** Sends pictures to the graphics card one per frame, so no single frame carries the whole load. */
async function upload(gl: WebGLRenderer, textures: readonly Texture[], live: () => boolean): Promise<void> {
  for (const t of textures) {
    if (!live()) return;
    if (t.image) gl.initTexture(t);
    await nextFrame();
  }
}

/**
 * Prepares the street and the room before the first frame is drawn. A 3D file that has downloaded is not yet drawable: the phone still has to
 * build a shader for every kind of surface and copy every picture to its graphics card, and it does that the first time each thing is drawn.
 * Left alone, that work lands in the first frames and in the walk through the door, where the visitor sees it as a black or frozen screen.
 * Here it is done up front, off the visitor's clock: shaders are built in the background where the phone supports it (`compileAsync`),
 * pictures go up one per frame, and only then does drawing start. `onDrawn` fires after real frames are on screen.
 */
function WarmUp({ bootstrap, warm, onWarm, onDrawn }: WorldProps & { warm: boolean; onWarm: () => void }) {
  const gl = useThree((s) => s.gl);
  const scene = useThree((s) => s.scene);
  const camera = useThree((s) => s.camera);
  // asked for only until the warm-up is done: afterwards the street is released when the visitor walks in, and must not be fetched back
  const exterior = useGltf(warm ? null : bootstrap.scene.exterior);
  const workshop = useGltf(warm ? null : bootstrap.scene.workshop);
  const marked = useScene((s) => s.workshopReady);
  const [lit, setLit] = useState(false);
  const callbacks = useRef({ onWarm, onDrawn });
  callbacks.current = { onWarm, onDrawn };

  useEffect(() => {
    let live = true;
    void loadLightMap(bootstrap.scene.workshopLight)
      .then(() => live && setLit(true))
      .catch(() => undefined); // a failed download is handled where the files are fetched (StoreExperience falls back)
    return () => {
      live = false;
    };
  }, [bootstrap.scene.workshopLight]);

  useEffect(() => {
    if (warm || !exterior || !workshop || !marked || !lit) return;
    let live = true;
    void (async () => {
      await frames(2); // both files are in the scene and the baked light is on its surfaces
      await gl.compileAsync(scene, camera);
      await upload(gl, texturesOf(scene), () => live);
    })()
      .catch((error: unknown) => console.error("Store: the scene could not be prepared ahead of drawing; it will be prepared as it is drawn instead.", error))
      .then(async () => {
        if (!live) return;
        callbacks.current.onWarm(); // from here this effect is torn down (warm has changed), so nothing below may depend on `live`
        await frames(3); // drawing has started: these are real frames
        callbacks.current.onDrawn();
      });
    return () => {
      live = false;
    };
  }, [warm, exterior, workshop, marked, lit, gl, scene, camera]);
  return null;
}

/**
 * While the visitor stands on the street, gets Jesse and every product ready for the room: downloaded, shaders built, pictures uploaded.
 * They used to start downloading only when the door was tapped, so the greeting could begin before he had arrived.
 */
function WarmAhead({ bootstrap, stage }: WorldProps) {
  const gl = useThree((s) => s.gl);
  const scene = useThree((s) => s.scene);
  const camera = useThree((s) => s.camera);
  const started = useRef(false);
  useEffect(() => {
    if (stage === "boot" || started.current) return;
    started.current = true;
    let live = true;
    void (async () => {
      for (const url of [bootstrap.scene.jesse, ...bootstrap.products.map((p) => p.modelAsset)]) {
        try {
          const gltf = await assetManager.load(url);
          if (!live) return;
          await gl.compileAsync(gltf.scene, camera, scene);
          await upload(gl, texturesOf(gltf.scene), () => live);
        } catch (error) {
          console.warn(`Store: ${url} could not be prepared ahead of time; it will be prepared when it is first drawn.`, error);
        }
      }
    })();
    return () => {
      live = false;
    };
  }, [stage, bootstrap, gl, scene, camera]);
  return null;
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
    // Development only: lets a test script (or the browser console) inspect the live scene. Never present in a production build.
    if (process.env.NODE_ENV !== "production") Object.assign(window, { __sanchezScene: { gl, scene } });
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
