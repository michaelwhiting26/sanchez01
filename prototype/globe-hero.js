/* Home landing hero: the office globe with SANCHEZ in chrome letters wrapped round it.
   The Earth is lifted unchanged from the Billz office (src/features/office/suites.ts earthGlobe): NASA Blue Marble day map with
   its own cloud shell, tilted 23.4 degrees, turning at 0.15 rad/s (clouds 0.18), same materials.
   The lettering is bevelled chrome, set on an arc so the outer letters curve away round the sphere. Original artwork: it borrows the
   idea of a wordmark orbiting a globe, not any studio's typeface or logo. */
import * as THREE from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";

const BASE = new URL(".", import.meta.url).href + "assets/globe/";
const root = document.querySelector("[data-globe-hero]");
const host = root && root.querySelector("[data-globe-view]");
if (root && host) start();

function start() {
  const reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const webgl = (() => { try { const c = document.createElement("canvas"); return !!(c.getContext("webgl2") || c.getContext("webgl")); } catch (e) { return false; } })();
  if (!webgl) { root.classList.add("is-fallback"); return; }

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(Math.max(window.devicePixelRatio || 1, 1.5), 2.5));   /* supersampled: crisp even on 1x screens */
  renderer.setClearColor(0x000000, 0);
  renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.05;
  const el = renderer.domElement; el.style.cssText = "display:block;inline-size:100%;block-size:100%";
  el.setAttribute("aria-hidden", "true");
  host.appendChild(el);

  const scene = new THREE.Scene();
  const cam = new THREE.PerspectiveCamera(28, 1, 0.1, 200);

  /* ---- soft studio reflections for the metal and the ocean ---- */
  const pm = new THREE.PMREMGenerator(renderer);
  scene.environment = pm.fromScene(new RoomEnvironment(), 0.03).texture;
  scene.environmentIntensity = 1.15;
  const softEnv = pm.fromScene(new RoomEnvironment(), 0.5).texture;   /* heavily blurred: gives the ocean a soft sheen, no boxy light reflection */

  /* ---- the Earth (as in the office) ---- */
  const R = 1;
  const tilt = new THREE.Group(); tilt.rotation.z = (23.4 * Math.PI) / 180; scene.add(tilt);
  const load = (u, srgb) => { const t = new THREE.TextureLoader().load(BASE + u, () => root.classList.add("is-ready")); t.colorSpace = srgb ? THREE.SRGBColorSpace : THREE.NoColorSpace; t.anisotropy = renderer.capabilities.getMaxAnisotropy(); return t; };
  const day = load("earth-day-5400.jpg", true); day.anisotropy = Math.min(16, renderer.capabilities.getMaxAnisotropy());
  const rough = load("earth-rough.png", false);
  const earth = new THREE.Mesh(new THREE.SphereGeometry(R, 192, 144),
    new THREE.MeshPhysicalMaterial({ map: day, roughness: 1, roughnessMap: rough, metalness: 0.02, emissive: 0xffffff, emissiveMap: day, emissiveIntensity: 0.7, clearcoat: 0, envMap: softEnv, envMapIntensity: 0.9 }));
  const clouds = new THREE.Mesh(new THREE.SphereGeometry(R * 1.008, 192, 144),
    new THREE.MeshStandardMaterial({ color: 0xffffff, alphaMap: load("earth-clouds.jpg", false), transparent: true, opacity: 0.7, depthWrite: false, roughness: 1 }));
  tilt.add(earth, clouds);
  earth.rotation.y = 2.35; clouds.rotation.y = 2.4;       /* opens on the Atlantic and Africa */

  scene.add(new THREE.AmbientLight(0x8fb2ff, 0.5));
  const sun = new THREE.DirectionalLight(0xfff4e0, 2.6); sun.position.set(-4.5, 2.2, 6); scene.add(sun);
  const glint = new THREE.PointLight(0xfff1cf, 0, 12, 2); scene.add(glint);   /* off: it left bright spots on the globe */

  /* ---- stars ---- */
  const N = 2600, sp = new Float32Array(N * 3), sc = new Float32Array(N * 3);
  let seed = 7; const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  for (let i = 0; i < N; i++) {
    const u = rnd() * 2 - 1, a = rnd() * Math.PI * 2, r = 60 + rnd() * 30, s = Math.sqrt(1 - u * u);
    sp.set([r * s * Math.cos(a), r * u, r * s * Math.sin(a)], i * 3);
    const t = rnd(), b = 0.35 + rnd() * 0.65; sc.set([b * (0.8 + 0.2 * t), b * (0.85 + 0.15 * t), b], i * 3);
  }
  const sg = new THREE.BufferGeometry(); sg.setAttribute("position", new THREE.BufferAttribute(sp, 3)); sg.setAttribute("color", new THREE.BufferAttribute(sc, 3));
  const stars = new THREE.Points(sg, new THREE.PointsMaterial({ size: 0.34, sizeAttenuation: true, vertexColors: true, transparent: true, opacity: 0.9, depthWrite: false }));
  scene.add(stars);

  /* ---- the SANCHEZ wordmark (black letters, white pipe, bowed top and bottom), big, in front of the globe ---- */
  const WM = new URLSearchParams(location.search).get("wm") || "wrap";        /* wrap = curved round the globe, flat = straight plane */
  const WW = 3.13 * R, WH = WW * (1188 / 3072), FLAT = 0.3 * R, RR = 1.22 * R, Z0 = 1.22 * R, OPACITY = 0.65;
  const wmTex = load("wordmark-pipe.png", true); wmTex.anisotropy = 16; wmTex.generateMipmaps = true; wmTex.minFilter = THREE.LinearMipmapLinearFilter;
  const shTex = load("wordmark-shadow.png", true);
  const uni = { uTex: { value: wmTex }, uReveal: { value: reduce ? 1 : 0 }, uSheen: { value: -0.4 }, uAlpha: { value: OPACITY } };
  const wmMat = new THREE.ShaderMaterial({ transparent: true, depthWrite: false, side: THREE.DoubleSide, uniforms: uni, side: THREE.DoubleSide,
    vertexShader: "attribute float aTheta; varying vec2 vUv; varying float vT; void main(){ vUv = uv; vT = aTheta; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.); }",
    fragmentShader: "uniform sampler2D uTex; uniform float uReveal; uniform float uSheen; uniform float uAlpha; varying vec2 vUv; varying float vT; void main(){ vec4 c = texture2D(uTex, vUv); if (c.a < .01) discard; float pipe = smoothstep(.45, .7, c.r);"
      + " float vis = smoothstep(uReveal * 1.08, uReveal * 1.08 - .07, vUv.y); float band = exp(-pow((vUv.x - uSheen) * 6., 2.)); vec3 col = c.rgb;"
      + " col = mix(col, vec3(1., .82, .5), band * pipe * .8); col += (1. - pipe) * band * .13; col += pipe * vec3(.02, .02, .03); col *= mix(1., .66, clamp(vT / .95, 0., 1.));"
      + " gl_FragColor = vec4(col, c.a * vis * uAlpha); }" });
  /* flat in the middle, wrapping strongly round the globe at both ends (S, A, left of N; right of H, E, Z) */
  const geom = (w, h) => {
    const g = new THREE.PlaneGeometry(w, h, 240, 1), p = g.attributes.position, th = new Float32Array(p.count);
    if (WM !== "flat") for (let i = 0; i < p.count; i++) {
      const sx = p.getX(i), a = Math.abs(sx);
      if (a > FLAT) { const t = (a - FLAT) / RR; p.setX(i, Math.sign(sx) * (FLAT + RR * Math.sin(t))); p.setZ(i, -RR * (1 - Math.cos(t))); th[i] = t; }
    }
    g.setAttribute("aTheta", new THREE.BufferAttribute(th, 1)); return g;
  };
  const sway = new THREE.Group(), orbit = new THREE.Group(), word = new THREE.Group(); scene.add(sway); sway.add(orbit); orbit.add(word);
  const wm = new THREE.Mesh(geom(WW, WH), wmMat); wm.renderOrder = 3;
  const wmShadow = new THREE.Mesh(geom(WW * 1.32, WH * 1.6), new THREE.MeshBasicMaterial({ map: shTex, transparent: true, depthWrite: false, opacity: 0, side: THREE.DoubleSide })); wmShadow.renderOrder = 2;
  wm.position.z = Z0; wmShadow.position.set(0, -0.05, Z0 - 0.02);
  word.add(wmShadow, wm); root.classList.add("has-word");

  /* ---- camera + loop ---- */
  const tmax = WM === "flat" ? 0 : (WW / 2 - FLAT) / RR, EXT = WM === "flat" ? WW / 2 : FLAT + RR * Math.sin(tmax);
  const axis = new THREE.Vector3(), dq = new THREE.Quaternion(), A45 = new THREE.Vector3(Math.SQRT1_2, Math.SQRT1_2, 0);
  const ptr = { x: 0, y: 0 }; addEventListener("pointermove", (e) => { ptr.x = (e.clientX / innerWidth) * 2 - 1; ptr.y = (e.clientY / innerHeight) * 2 - 1; }, { passive: true });
  let w = 1, h = 1, dist = 6, t0 = performance.now(), last = t0, running = true, visible = true;
  const fit = () => {
    w = host.clientWidth || 1; h = host.clientHeight || 1; renderer.setSize(w, h, false);
    cam.aspect = w / h; cam.updateProjectionMatrix();
    const f = THREE.MathUtils.degToRad(cam.fov), a = cam.aspect;
    dist = Math.max((R / 0.8) / Math.tan(f / 2), (R * 1.32) / (Math.tan(f / 2) * a));   /* the globe fills ~80% of the height (~76% of the width on a phone) */
    if (reduce) place(1);
  };
  const ease = (x) => 1 - Math.pow(1 - x, 3);
  const place = (k, time = 0) => {
    const d = dist * (1 + 0.14 * (1 - k)), el = 0.22 * (1 - k) + 0.02 * Math.sin(time * 0.25), az = -0.28 * (1 - k) + 0.05 * Math.sin(time * 0.2);
    cam.position.set(Math.sin(az) * Math.cos(el) * d, Math.sin(el) * d + 0.05, Math.cos(az) * Math.cos(el) * d); cam.lookAt(0, -0.03, 0);
  };
  new ResizeObserver(fit).observe(host); fit();

  const frame = (now) => {
    if (!running) return; requestAnimationFrame(frame);
    if (!visible || document.hidden) { last = now; return; }
    const dt = Math.min((now - last) / 1000, 0.05), t = (now - t0) / 1000; last = now;
    if (!reduce) {
      earth.rotation.y += dt * 0.15; clouds.rotation.y += dt * 0.18; stars.rotation.y -= dt * 0.004;
      place(ease(Math.min(1, t / 7)), t);
      glint.position.set(Math.sin(t * 0.5) * 3.2, 0.9 + Math.cos(t * 0.4) * 0.6, 3.4);
      const x = Math.min(1, Math.max(0, (t - 0.9) / 1.7)), ex = x === 0 ? 0 : x === 1 ? 1 : x < 0.5 ? Math.pow(2, 20 * x - 10) / 2 : (2 - Math.pow(2, -20 * x + 10)) / 2;   /* expo in-out, the same family as cubic-bezier(.65,.05,0,1) */
      uni.uReveal.value = ex; wmShadow.material.opacity = ex * OPACITY;
      uni.uSheen.value = t > 3.2 ? -0.4 + (((t - 3.2) % 6.5) / 6.5) * 1.9 : -0.4;
      sway.rotation.y += (ptr.x * 0.05 - sway.rotation.y) * Math.min(1, dt * 3); sway.rotation.x += (-ptr.y * 0.03 - sway.rotation.x) * Math.min(1, dt * 3);
      /* free glide round the world: first along a 45 degree great circle, then the axis wanders on its own slow, smooth random course */
      if (t > 2.6) {
        const blend = Math.exp(-(t - 2.6) / 7), ramp = Math.min(1, (t - 2.6) / 3), sm = ramp * ramp * (3 - 2 * ramp);
        axis.set(A45.x * blend + Math.sin(0.23 * t + 1.3) * (1 - blend), A45.y * blend + Math.sin(0.31 * t + 0.4) * (1 - blend), A45.z * blend + 0.8 * Math.sin(0.19 * t + 2.1) * (1 - blend)).normalize();
        dq.setFromAxisAngle(axis, sm * (0.5 + 0.14 * Math.sin(0.37 * t)) * dt); orbit.quaternion.premultiply(dq);
      }
    }
    renderer.render(scene, cam);
  };
  requestAnimationFrame(frame);
  new IntersectionObserver((e) => { visible = e[0].isIntersecting; }, { threshold: 0.02 }).observe(root);
  window.__globeHero = { scene, cam, earth, clouds, word, orbit, stop() { running = false; renderer.dispose(); } };
}
