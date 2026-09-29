/* Footer globe: a small, live 3D Earth. Same look as the home globe (NASA Blue Marble day map with its own cloud shell, tilted 23.4
   degrees, turning at 0.15 rad/s with the clouds a touch faster), plus a thin atmosphere glow. Drag it to spin it.
   Loaded on demand by app.js when the footer scrolls near the screen, so it costs nothing until then. It draws only while visible,
   and reduced motion gets one still frame. It has no import map dependency, so it works on every page. */
import * as THREE from "./assets/vendor/three/three.module.js";

const host = document.querySelector("[data-footer-globe]");
if (host) start(host);

function start(host) {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  let renderer;
  try { renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "low-power" }); } catch (e) { return; }
  renderer.setPixelRatio(Math.min(Math.max(devicePixelRatio || 1, 2), 3));   /* small canvas, so it can afford to be supersampled: crisp coastlines */
  renderer.setClearColor(0x000000, 0);
  renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.05;
  const el = renderer.domElement; el.style.cssText = "display:block;inline-size:100%;block-size:100%;cursor:grab;touch-action:pan-y";
  el.setAttribute("aria-label", "Earth. Drag to spin."); el.setAttribute("role", "img");
  host.appendChild(el);

  const scene = new THREE.Scene(), cam = new THREE.PerspectiveCamera(28, 1, 0.1, 50);
  const BASE = new URL("./assets/globe/", import.meta.url).href;
  const load = (f, srgb) => { const t = new THREE.TextureLoader().load(BASE + f, () => { loaded++; if (loaded === 3) { host.classList.add("is-ready"); if (reduce) draw(); } }); t.colorSpace = srgb ? THREE.SRGBColorSpace : THREE.NoColorSpace; t.anisotropy = Math.min(16, renderer.capabilities.getMaxAnisotropy()); return t; };
  let loaded = 0;
  const day = load("earth-day.jpg", true), rough = load("earth-rough.png", false), cloud = load("earth-clouds.jpg", false);

  const tilt = new THREE.Group(); tilt.rotation.z = (23.4 * Math.PI) / 180; scene.add(tilt);
  const earth = new THREE.Mesh(new THREE.SphereGeometry(1, 128, 96),
    new THREE.MeshPhysicalMaterial({ map: day, roughness: 1, roughnessMap: rough, metalness: 0.02, specularIntensity: 0.12, emissive: 0xffffff, emissiveMap: day, emissiveIntensity: 0.7 }));   /* low specular: no glare spot on the ocean */
  const clouds = new THREE.Mesh(new THREE.SphereGeometry(1.008, 128, 96),
    new THREE.MeshStandardMaterial({ color: 0xffffff, alphaMap: cloud, transparent: true, opacity: 0.7, depthWrite: false, roughness: 1 }));
  tilt.add(earth, clouds); earth.rotation.y = 2.35; clouds.rotation.y = 2.4;   /* opens on the Atlantic and Africa */

  /* atmosphere: a soft blue rim, brightest at the edge and toward the sun */
  const atmo = new THREE.Mesh(new THREE.SphereGeometry(1.09, 96, 64), new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, side: THREE.BackSide, blending: THREE.AdditiveBlending,
    vertexShader: "varying vec3 vN; varying vec3 vV; void main(){ vec4 mv = modelViewMatrix * vec4(position,1.); vN = normalize(normalMatrix * normal); vV = normalize(-mv.xyz); gl_Position = projectionMatrix * mv; }",
    fragmentShader: "varying vec3 vN; varying vec3 vV; void main(){ float f = pow(clamp(0.72 - dot(-vN, vV), 0., 1.), 2.0); gl_FragColor = vec4(vec3(.34, .62, 1.) * f * 2.8, f); }" }));
  scene.add(atmo);

  scene.add(new THREE.AmbientLight(0x8fb2ff, 0.6));
  const sun = new THREE.DirectionalLight(0xfff4e0, 2.6); sun.position.set(-4.5, 2.2, 6); scene.add(sun);

  const fit = () => {
    const w = host.clientWidth || 1, h = host.clientHeight || 1; renderer.setSize(w, h, false); cam.aspect = w / h; cam.updateProjectionMatrix();
    const f = THREE.MathUtils.degToRad(cam.fov); cam.position.set(0, 0, Math.max(1.28 / Math.tan(f / 2), 1.28 / (Math.tan(f / 2) * cam.aspect)));   /* the glow just fits the frame */
    if (reduce || !running) draw();
  };
  const draw = () => renderer.render(scene, cam);

  /* drag to spin, with a little momentum */
  let spinVel = 0, down = null;
  el.addEventListener("pointerdown", (e) => { down = { x: e.clientX, id: e.pointerId, moved: false }; spinVel = 0; });
  el.addEventListener("pointermove", (e) => {
    if (!down || e.pointerId !== down.id) return;
    if (!down.moved && Math.abs(e.clientX - down.x) > 4) { down.moved = true; el.style.cursor = "grabbing"; try { el.setPointerCapture(e.pointerId); } catch (_) {} }
    if (!down.moved) return; const dx = e.clientX - down.x; down.x = e.clientX;
    earth.rotation.y += dx * 0.012; clouds.rotation.y += dx * 0.012; spinVel = dx * 0.012; if (reduce) draw();
  });
  const up = () => { down = null; el.style.cursor = "grab"; };
  el.addEventListener("pointerup", up); el.addEventListener("pointercancel", up);

  let running = !reduce, visible = true, last = performance.now();
  new ResizeObserver(fit).observe(host);
  new IntersectionObserver((e) => { visible = e[0].isIntersecting; }, { rootMargin: "80px" }).observe(host);
  const frame = (now) => {
    if (!running) return; requestAnimationFrame(frame);
    if (!visible || document.hidden) { last = now; return; }
    const dt = Math.min((now - last) / 1000, 0.05); last = now;
    if (!down) {
      spinVel *= 0.94; if (Math.abs(spinVel) < 0.0003) spinVel = 0;
      earth.rotation.y += dt * 0.15 + spinVel; clouds.rotation.y += dt * 0.18 + spinVel;
    }
    draw();
  };
  fit(); if (running) requestAnimationFrame(frame);
}
