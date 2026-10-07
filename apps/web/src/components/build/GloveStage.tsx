"use client";

import { Canvas, useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState, type RefObject } from "react";
import {
  CanvasTexture, Color, DirectionalLight, Group, Mesh, MeshPhysicalMaterial, NoColorSpace, Object3D, PMREMGenerator, RepeatWrapping, SRGBColorSpace,
  Spherical, TextureLoader, Vector2, Vector3, type BufferGeometry, type Intersection, type PerspectiveCamera, type Texture,
} from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { z } from "zod";
import { hitsMark, pictureSize, placeMark, SAFE_MARGIN, type Placed } from "@/lib/gloves/decal";
import {
  ART_PANELS, CLOTH_PANELS, FINISH_RECIPE, FIXED_NODES, GLOVE_ASSETS, GLOVE_FONTS, PANELS, isArtPanel, isPanel,
  type ArtPanelId, type GloveArt, type GlovePanels, type PanelId,
} from "@/lib/gloves/schema";
import { useGltf } from "@/three/use-gltf";

/**
 * The glove on screen. How it works, in plain terms:
 *  - The glove is one file holding a separate piece for every panel. Each piece has its own material, so a colour or finish changes one panel only.
 *  - A baked shading picture (creases, seams, the gap by the thumb) darkens whatever colour is chosen, and a fine grain picture gives the leather its surface.
 *  - Logos and words are not stuck on in 3D. Each art panel has a hidden flat picture the same shape as the leather; marks are drawn on it and it is
 *    wrapped onto the panel. Tapping the glove reports where on that picture the finger landed, which is how a mark lands under the finger.
 *  - The glove never moves. Choosing a panel flies the camera round to face it; dragging orbits the camera.
 */
const vec3 = z.tuple([z.number(), z.number(), z.number()]);
const MetaSchema = z.object({
  bounds: z.object({ min: vec3, max: vec3 }),
  atlasTilesPerUnit: z.number().positive(),
  panels: z.record(z.string(), z.object({ centroid: vec3, normal: vec3, uvWidthM: z.number().positive().optional(), uvHeightM: z.number().positive().optional() })),
});
type GloveMeta = z.infer<typeof MetaSchema>;

export type StageMode = "colour" | "art";
export interface GloveStageHandle {
  /** Four pictures of the finished glove from fixed angles, as JPEG data URLs. */
  capture: () => string[];
}
export interface GloveStageProps {
  panels: GlovePanels;
  art: readonly GloveArt[];
  /** Uploaded pictures by art id. `imagesVersion` changes whenever one is added or removed. */
  images: ReadonlyMap<string, HTMLImageElement>;
  imagesVersion: number;
  mode: StageMode;
  /** The panel the camera should face. */
  focus: PanelId;
  selectedArt: string | null;
  /** The cockpit root, where the site's fonts are defined. */
  fontRoot: RefObject<HTMLElement | null>;
  onPickPanel: (panel: PanelId) => void;
  onPlace: (panel: ArtPanelId, u: number, v: number) => void;
  onSelectArt: (id: string) => void;
  onReady?: () => void;
}

/** Which way to look for the parts that are not one flat panel. */
const FACE_AS: Partial<Record<PanelId, PanelId>> = { PIPING: "HAND_BACK", STITCHING: "HAND_BACK", LACES: "CUFF_PALM", BINDING: "CUFF_BACK", THUMB_STRIP: "THUMB_IN" };
const REVIEW_VIEWS: readonly PanelId[] = ["HAND_BACK", "THUMB_OUT", "PALM", "CUFF_BACK"];
const FOV = 30;
const FLY_SECONDS = 0.9;
const TAP_SLOP = 7;
const LINING = "#0c0c0d";
const BRASS = new Color("#c8954d");

export const GloveStage = forwardRef<GloveStageHandle, GloveStageProps>(function GloveStage(props, ref) {
  return (
    <Canvas className="gb__canvas" dpr={[1, 2]} gl={{ antialias: true, alpha: true }} camera={{ fov: FOV, near: 0.02, far: 10, position: [0, 0.16, 0.8] }}>
      <Glove {...props} handle={ref} />
    </Canvas>
  );
});

interface Built {
  readonly root: Group;
  readonly materials: Map<string, MeshPhysicalMaterial>;
  readonly pictures: Map<ArtPanelId, { canvas: HTMLCanvasElement; ctx: CanvasRenderingContext2D; texture: CanvasTexture }>;
  dispose: () => void;
}

function Glove({ panels, art, images, imagesVersion, mode, focus, selectedArt, fontRoot, onPickPanel, onPlace, onSelectArt, onReady, handle }: GloveStageProps & { handle: React.ForwardedRef<GloveStageHandle> }) {
  const { gl, scene, camera } = useThree();
  const gltf = useGltf(GLOVE_ASSETS.model);
  const meta = useMeta();
  const shading = useTexture(GLOVE_ASSETS.shading);
  const grain = useTexture(GLOVE_ASSETS.grain);
  const [built, setBuilt] = useState<Built | null>(null);
  const controls = useRef<OrbitControls | null>(null);
  const fly = useRef<{ from: Spherical; to: Spherical; t: number } | null>(null);
  const pulse = useRef<{ panel: PanelId; t: number } | null>(null);
  const placed = useRef(new Map<string, Placed>());
  const reduced = useMemo(() => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches, []);

  const centre = useMemo(() => (meta ? new Vector3().fromArray(meta.bounds.min).add(new Vector3().fromArray(meta.bounds.max)).multiplyScalar(0.5) : new Vector3(0, 0.15, 0)), [meta]);
  const height = meta ? meta.bounds.max[1] - meta.bounds.min[1] : 0.3;

  // Studio light: a soft room reflected in the leather, and one key light that travels with the camera so the glove is lit the same from every side.
  useEffect(() => {
    const pmrem = new PMREMGenerator(gl);
    const room = new RoomEnvironment();
    const env = pmrem.fromScene(room, 0.04).texture;
    scene.environment = env;
    scene.environmentIntensity = 0.42;
    const key = new DirectionalLight(0xfff1dc, 1.15);
    key.position.set(0.5, 0.7, 0.3);
    const aim = new Object3D();
    aim.position.set(0, 0, -1);
    key.target = aim;
    camera.add(key, aim);
    scene.add(camera);
    return () => {
      camera.remove(key, aim);
      scene.remove(camera);
      scene.environment = null;
      env.dispose();
      room.dispose();
      pmrem.dispose();
      key.dispose();
    };
  }, [gl, scene, camera]);

  // Drag to orbit. No panning; zoom within sensible limits; never from straight above or below.
  useEffect(() => {
    const c = new OrbitControls(camera, gl.domElement);
    c.enablePan = false;
    c.enableDamping = true;
    c.dampingFactor = 0.12;
    c.rotateSpeed = 0.9;
    c.minPolarAngle = (25 * Math.PI) / 180;
    c.maxPolarAngle = (150 * Math.PI) / 180;
    const cancel = (): void => {
      fly.current = null;
    };
    c.addEventListener("start", cancel);
    controls.current = c;
    return () => {
      c.removeEventListener("start", cancel);
      c.dispose();
      controls.current = null;
    };
  }, [camera, gl]);

  // The distance that fits the whole glove in the stage, whatever its shape (a phone is tall, a desktop is wide).
  const size = useThree((s) => s.size);
  const distance = useMemo(() => {
    const half = Math.tan((FOV * Math.PI) / 360);
    const aspect = size.width / Math.max(1, size.height);
    const tall = (height * 0.8) / half;
    const wide = (height * 0.44) / (half * aspect);
    return Math.max(tall, wide);
  }, [size.width, size.height, height]);
  useEffect(() => {
    const c = controls.current;
    if (!c) return;
    c.target.copy(centre);
    c.minDistance = distance * 0.5;
    c.maxDistance = distance * 1.25;
  }, [centre, distance]);

  // Build the glove: one mesh per panel with its own material, and a clear skin over each art panel that carries the logos and words.
  useEffect(() => {
    if (!gltf || !meta || !shading || !grain) return;
    shading.flipY = false;
    shading.channel = 1;
    shading.colorSpace = NoColorSpace;
    grain.channel = 1;
    grain.colorSpace = NoColorSpace;
    grain.wrapS = grain.wrapT = RepeatWrapping;
    grain.repeat.set(meta.atlasTilesPerUnit, meta.atlasTilesPerUnit);
    grain.anisotropy = gl.capabilities.getMaxAnisotropy();
    const root = new Group();
    const materials = new Map<string, MeshPhysicalMaterial>();
    const pictures: Built["pictures"] = new Map();
    const owned: Array<{ dispose(): void }> = [];
    for (const name of [...PANELS, ...FIXED_NODES]) {
      const source = gltf.scene.getObjectByName(name);
      if (!(source instanceof Mesh)) throw new Error(`glove model: the part "${name}" is missing from ${GLOVE_ASSETS.model}`);
      const geometry = source.geometry as BufferGeometry;
      const cloth = isPanel(name) && CLOTH_PANELS.includes(name);
      const material = new MeshPhysicalMaterial({ aoMap: shading, aoMapIntensity: 1, ...(cloth || name === "LINING" ? {} : { normalMap: grain, normalScale: new Vector2(0.45, 0.45) }) });
      if (name === "LINING") {
        material.color.set(LINING);
        material.roughness = 0.95;
      }
      const mesh = new Mesh(geometry, material);
      mesh.name = name;
      mesh.matrixAutoUpdate = false;
      source.updateWorldMatrix(true, false);
      mesh.matrix.copy(source.matrixWorld);
      root.add(mesh);
      materials.set(name, material);
      owned.push(material);
      if (isArtPanel(name)) {
        const info = meta.panels[name];
        if (!info?.uvWidthM || !info.uvHeightM) throw new Error(`glove model: no size recorded for the art panel "${name}" in ${GLOVE_ASSETS.meta}`);
        const { W, H } = pictureSize(info.uvWidthM, info.uvHeightM);
        const canvas = document.createElement("canvas");
        canvas.width = W;
        canvas.height = H;
        const ctx = canvas.getContext("2d");
        if (!ctx) throw new Error("glove builder: this browser cannot draw the logo pictures");
        const texture = new CanvasTexture(canvas);
        texture.flipY = false;
        texture.colorSpace = SRGBColorSpace;
        texture.anisotropy = gl.capabilities.getMaxAnisotropy();
        const skin = new MeshPhysicalMaterial({ map: texture, transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -4, polygonOffsetUnits: -4, roughness: 0.62, aoMap: shading });
        const over = new Mesh(geometry, skin);
        over.name = `${name}__art`;
        over.matrixAutoUpdate = false;
        over.matrix.copy(mesh.matrix);
        over.raycast = () => undefined; // taps go to the leather underneath, which reports the same place
        over.renderOrder = 2;
        root.add(over);
        pictures.set(name, { canvas, ctx, texture });
        owned.push(skin, texture);
      }
    }
    const next: Built = { root, materials, pictures, dispose: () => owned.forEach((o) => o.dispose()) };
    setBuilt(next);
    onReady?.();
    return () => {
      next.dispose();
      setBuilt(null);
    };
    // onReady is a notification, not an input: the glove is not rebuilt when the parent re-renders
  }, [gltf, meta, shading, grain, gl]);

  // Colour and finish: a handful of numbers on one panel's material.
  useEffect(() => {
    if (!built) return;
    for (const p of PANELS) {
      const m = built.materials.get(p);
      if (!m) continue;
      m.color.set(panels[p].hex);
      if (CLOTH_PANELS.includes(p)) {
        m.roughness = 0.9;
        m.metalness = 0;
        m.clearcoat = 0;
      } else {
        const r = FINISH_RECIPE[panels[p].finish];
        m.roughness = r.roughness;
        m.metalness = r.metalness;
        m.clearcoat = r.clearcoat;
        m.clearcoatRoughness = r.clearcoatRoughness;
      }
    }
  }, [built, panels]);

  // Logos and words: redraw each panel's flat picture and tell the 3D that it changed.
  const paint = useMemo(() => {
    return (guides: boolean): void => {
      if (!built) return;
      const style = fontRoot.current ? getComputedStyle(fontRoot.current) : null;
      placed.current.clear();
      for (const panel of ART_PANELS) {
        const pic = built.pictures.get(panel);
        if (!pic) continue;
        const { ctx, canvas } = pic;
        const W = canvas.width;
        const H = canvas.height;
        ctx.clearRect(0, 0, W, H);
        const mine = art.filter((a) => a.panel === panel);
        for (const a of mine) {
          let aspect: number;
          let font = "";
          if (a.kind === "text") {
            const f = GLOVE_FONTS.find((x) => x.id === a.font) ?? GLOVE_FONTS[0];
            const family = style?.getPropertyValue(f.cssVar).trim() || f.fallback;
            font = `${f.weight} 100px ${family}`;
            ctx.font = font;
            aspect = Math.max(0.2, ctx.measureText(a.text.toUpperCase()).width / 100);
          } else {
            aspect = a.aspect;
          }
          const p = placeMark(W, H, { u: a.u, v: a.v, size: a.size, turn: a.turn, aspect });
          placed.current.set(a.id, p);
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate((a.turn * Math.PI) / 180);
          if (a.kind === "text") {
            ctx.font = font.replace("100px", `${p.h}px`);
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillStyle = a.hex;
            ctx.fillText(a.text.toUpperCase(), 0, p.h * 0.04);
          } else {
            const img = images.get(a.id);
            if (img) ctx.drawImage(img, -p.w / 2, -p.h / 2, p.w, p.h);
          }
          if (guides && a.id === selectedArt) {
            ctx.setLineDash([W / 60, W / 90]);
            ctx.lineWidth = Math.max(2, W / 300);
            ctx.strokeStyle = "#e8a85a";
            ctx.strokeRect(-p.w / 2 - 6, -p.h / 2 - 6, p.w + 12, p.h + 12);
          }
          ctx.restore();
        }
        if (guides && mine.some((a) => a.id === selectedArt)) {
          ctx.save();
          ctx.setLineDash([W / 40, W / 40]);
          ctx.lineWidth = Math.max(1.5, W / 500);
          ctx.strokeStyle = "rgb(243 234 220 / .55)";
          ctx.strokeRect(W * SAFE_MARGIN, H * SAFE_MARGIN, W * (1 - 2 * SAFE_MARGIN), H * (1 - 2 * SAFE_MARGIN));
          ctx.restore();
        }
        pic.texture.needsUpdate = true;
      }
    };
  }, [built, art, images, selectedArt, fontRoot]);
  useEffect(() => {
    paint(true);
    // fonts arrive after first paint on a cold load: draw the words again once they are in
    let live = true;
    void document.fonts.ready.then(() => {
      if (live) paint(true);
    });
    return () => {
      live = false;
    };
  }, [paint, imagesVersion]);

  // Where the camera stands to face a panel.
  const viewOf = useMemo(() => {
    return (panel: PanelId): Spherical => {
      const n = meta?.panels[FACE_AS[panel] ?? panel]?.normal ?? [0, 0, 1];
      const s = new Spherical().setFromVector3(new Vector3(n[0], n[1], n[2]).normalize());
      s.phi = Math.min((100 * Math.PI) / 180, Math.max((62 * Math.PI) / 180, s.phi));
      s.radius = distance;
      return s;
    };
  }, [meta, distance]);

  useEffect(() => {
    if (!built) return;
    const to = viewOf(focus);
    pulse.current = { panel: focus, t: 0 };
    if (reduced) {
      camera.position.setFromSpherical(to).add(centre);
      camera.lookAt(centre);
      return;
    }
    const from = new Spherical().setFromVector3(camera.position.clone().sub(centre));
    // go the short way round
    while (to.theta - from.theta > Math.PI) to.theta -= Math.PI * 2;
    while (to.theta - from.theta < -Math.PI) to.theta += Math.PI * 2;
    fly.current = { from, to, t: 0 };
  }, [built, focus, viewOf, reduced, camera, centre]);

  useFrame((_, dt) => {
    const f = fly.current;
    if (f) {
      f.t = Math.min(1, f.t + dt / FLY_SECONDS);
      const e = f.t < 0.5 ? 4 * f.t ** 3 : 1 - (-2 * f.t + 2) ** 3 / 2; // soft start, soft stop
      const s = new Spherical(f.from.radius + (f.to.radius - f.from.radius) * e, f.from.phi + (f.to.phi - f.from.phi) * e, f.from.theta + (f.to.theta - f.from.theta) * e);
      camera.position.setFromSpherical(s).add(centre);
      if (f.t >= 1) fly.current = null;
    }
    controls.current?.update();
    // a brief brass glow on the panel just chosen, so the visitor sees which leather they are colouring
    const p = pulse.current;
    if (p && built) {
      p.t += dt;
      const m = built.materials.get(p.panel);
      const k = mode === "colour" ? Math.max(0, 1 - p.t / 0.6) : 0;
      if (m) {
        m.emissive.copy(BRASS);
        m.emissiveIntensity = 0.28 * k;
      }
      if (k === 0) pulse.current = null;
    }
  });

  useImperativeHandle(handle, () => ({
    capture(): string[] {
      if (!built) return [];
      const cam = camera as PerspectiveCamera;
      const keep = cam.position.clone();
      for (const m of built.materials.values()) m.emissiveIntensity = 0;
      paint(false);
      const out = document.createElement("canvas");
      out.width = out.height = 900;
      const ctx = out.getContext("2d");
      if (!ctx) throw new Error("glove builder: this browser cannot make the review pictures");
      const src = gl.domElement;
      const side = Math.min(src.width, src.height);
      const shots = REVIEW_VIEWS.map((panel) => {
        const s = viewOf(panel);
        s.radius = distance * (src.width < src.height ? 0.92 : 1);
        cam.position.setFromSpherical(s).add(centre);
        cam.lookAt(centre);
        cam.updateMatrixWorld();
        gl.render(scene, cam);
        ctx.fillStyle = "#0a0b0d";
        ctx.fillRect(0, 0, 900, 900);
        ctx.drawImage(src, (src.width - side) / 2, (src.height - side) / 2, side, side, 0, 0, 900, 900);
        return out.toDataURL("image/jpeg", 0.92);
      });
      cam.position.copy(keep);
      cam.lookAt(centre);
      paint(true);
      return shots;
    },
  }), [built, camera, gl, scene, paint, viewOf, distance, centre]);

  /* ---- taps and drags on the glove ---- */
  const down = useRef<{ x: number; y: number; dragging: string | null } | null>(null);
  const artHit = (hits: readonly Intersection[]): { panel: ArtPanelId; u: number; v: number } | null => {
    for (const h of hits) if (isArtPanel(h.object.name) && h.uv) return { panel: h.object.name, u: h.uv.x, v: h.uv.y };
    return null;
  };
  const onDown = (e: ThreeEvent<PointerEvent>): void => {
    e.stopPropagation();
    down.current = { x: e.nativeEvent.clientX, y: e.nativeEvent.clientY, dragging: null };
    if (mode !== "art") return;
    const hit = artHit(e.intersections);
    if (!hit || !built) return;
    const pic = built.pictures.get(hit.panel);
    if (!pic) return;
    // pick up whichever mark is under the finger: the selected one first, then the others on this panel, topmost first
    const here = art.filter((a) => a.panel === hit.panel);
    const order = [...here.filter((a) => a.id === selectedArt), ...here.filter((a) => a.id !== selectedArt).reverse()];
    const grabbed = order.find((a) => {
      const p = placed.current.get(a.id);
      return p ? hitsMark(p, a.turn, hit.u * pic.canvas.width, hit.v * pic.canvas.height) : false;
    });
    if (!grabbed) return;
    if (grabbed.id !== selectedArt) onSelectArt(grabbed.id);
    down.current.dragging = grabbed.id;
    if (controls.current) controls.current.enabled = false;
    fly.current = null;
  };
  const onMove = (e: ThreeEvent<PointerEvent>): void => {
    const d = down.current;
    if (!d?.dragging) return;
    e.stopPropagation();
    const hit = artHit(e.intersections);
    if (hit) onPlace(hit.panel, hit.u, hit.v);
  };
  const onUp = (e: ThreeEvent<PointerEvent>): void => {
    const d = down.current;
    down.current = null;
    if (controls.current) controls.current.enabled = true;
    if (!d || d.dragging) return;
    if (Math.hypot(e.nativeEvent.clientX - d.x, e.nativeEvent.clientY - d.y) > TAP_SLOP) return; // that was an orbit, not a tap
    e.stopPropagation();
    if (mode === "art") {
      const hit = artHit(e.intersections);
      if (hit && selectedArt) onPlace(hit.panel, hit.u, hit.v);
      return;
    }
    const name = e.intersections[0]?.object.name ?? "";
    if (isPanel(name)) onPickPanel(name);
  };
  // a drag that ends off the glove still has to hand the camera back
  useEffect(() => {
    const release = (): void => {
      if (down.current?.dragging) down.current = null;
      if (controls.current) controls.current.enabled = true;
    };
    window.addEventListener("pointerup", release);
    window.addEventListener("pointercancel", release);
    return () => {
      window.removeEventListener("pointerup", release);
      window.removeEventListener("pointercancel", release);
    };
  }, []);

  if (!built) return null;
  return <primitive object={built.root} onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} />;
}

function useMeta(): GloveMeta | null {
  const [meta, setMeta] = useState<GloveMeta | null>(null);
  useEffect(() => {
    let live = true;
    fetch(GLOVE_ASSETS.meta)
      .then((r) => {
        if (!r.ok) throw new Error(`glove model: ${GLOVE_ASSETS.meta} answered ${r.status}`);
        return r.json() as Promise<unknown>;
      })
      .then((raw) => {
        if (live) setMeta(MetaSchema.parse(raw));
      })
      .catch((err: unknown) => {
        console.error(err);
      });
    return () => {
      live = false;
    };
  }, []);
  return meta;
}

function useTexture(url: string): Texture | null {
  const [texture, setTexture] = useState<Texture | null>(null);
  useEffect(() => {
    let live = true;
    let made: Texture | null = null;
    new TextureLoader().loadAsync(url).then(
      (t) => {
        made = t;
        if (live) setTexture(t);
        else t.dispose();
      },
      (err: unknown) => console.error(`glove model: could not load ${url}`, err),
    );
    return () => {
      live = false;
      made?.dispose();
    };
  }, [url]);
  return texture;
}
