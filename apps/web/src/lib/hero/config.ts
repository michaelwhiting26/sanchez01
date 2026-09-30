/**
 * Hero field: every tunable in one place. Values are the art direction as approved in the prototype; change them here, not inline.
 * Units: "cells" are the dot grid's own units (one cell per pixel of the ring map), "px" are CSS pixels.
 */
export type Rgb = readonly [number, number, number];

/** The tan of the pattern, the SANCHEZ outline and the ridges (#D6B588). */
export const TAN: Rgb = [214, 181, 136];

/**
 * The Australian flag, from the official artwork (public/assets/flag/flag-3840.png): navy #012169, red #E4002B, white.
 * The navy is lifted so it reads on black. Order is the palette index used everywhere else.
 */
export const FLAG_PALETTE: readonly Rgb[] = [
  [26, 66, 176],
  [228, 0, 43],
  [250, 250, 250],
];
/** The un-lifted artwork colours, used to quantise the raster into palette indices. */
export const FLAG_SOURCE: readonly Rgb[] = [
  [1, 33, 105],
  [228, 0, 43],
  [255, 255, 255],
];
export const FLAG_MAP = { width: 480, height: 240, src: "/assets/flag/flag-3840.png" } as const;

export const RING_MAP = { land: "/assets/globe/rings-map-land.png", port: "/assets/globe/rings-map-port.png" } as const;

export const RIDGES = {
  stitch: 8,
  gap: 3,
  period: 6.5,
  width: 1.9,
  floor: 0.26,
  /** Share of stitches left out (the flaw that makes it a print). */
  missing: 0.07,
  /** Slow outward drift of the ridge phase, cells per second. */
  drift: 0.9,
  /** Levels of brightness and grades of warmth in the colour buckets. */
  levels: 20,
  /** Brightness of the ridge lines and clouds against the paint and outline (1 = full tan). */
  gain: 0.74,
  warms: 6,
} as const;

export const INTERACTION = {
  cursorRadius: 100,
  cursorForce: 40,
  rippleSpeed: 225,
  rippleWidth: 37,
  rippleForce: 20,
  rippleDurationMs: 675,
  lerp: 0.12,
} as const;

export const SPRAY = {
  /** Time for the first left-to-right pass. */
  durationMs: 5200,
  /** A beat of plain hero before the spray starts. */
  leadInMs: 700,
  /** Slope of the spray front (cells of x per row). */
  slope: 0.35,
  /** Minimum share of the letters that is always sprayed once painted. */
  coverage: 0.84,
  /** The second coat trails the first by this many cells. */
  secondCoatLag: 34,
  /** Paint is drawn slightly softer than the ridges. */
  paintAlpha: 0.72,
  dimCoat: 0.55,
  /** The clouds melt away over this long once the first pass has finished. */
  cloudFadeMs: 1300,
  /**
   * Paint stays in the lettering: over the outline and outside it only in tiny places.
   * `outlineCoat` is the share of outline dots that get a second coat (was 0.5+), `haloReach` how far past the outline stray paint goes (cells), `haloShare` how likely.
   */
  outlineCoat: 0.06,
  haloReach: 3.4,
  haloShare: 0.07,

  // ---- the writer's hand. The paint is deposited from the runner's nozzle in a soft cone (a fixed-step simulation, see engine.advanceSpray), not from a slanted line.
  // The runner's own x (and so the nozzle's) still follows the old front curve, so his timing is untouched; the "human" pace lives in stroke tempo and dose.
  /** Fixed simulation step (ms). Smaller is smoother but replays cost more when the spray is scrubbed. */
  stepMs: 16,
  /** Cone radius as a share of the letter height (minimum `coneMinCells`), and the share of it that is full-strength core. */
  coneR: 0.3,
  coneMinCells: 4,
  coneCore: 0.4,
  /** Paint dose per step at the cone core (1 = a cell is fully covered after ~1/doseRate steps). Edge dose falls to `edgeDose` of the core. */
  doseRate: 0.3,
  edgeDose: 0.1,
  /** A cell shows once its paint reaches a per-cell threshold in [thrMin, thrMin+thrSpan]: edges (little paint) only speckle in, overlaps fill them. */
  thrMin: 0.1,
  thrSpan: 0.85,
  /** Vertical arm strokes: rate (Hz), peak-to-peak swing as a share of letter height, and random variation of swing and rate (0..1). */
  strokeHz: 2.6,
  strokeAmp: 0.6,
  strokeNoise: 0.35,
  /** Pace per letter: dose across the gap between letters, extra dose on thick strokes, and stroke-rate multiplier in gaps (quick hops). */
  gapDose: 0.15,
  thickBoost: 0.9,
  gapRate: 1.5,
  /** Hesitation at the start of a letter: share of the letter width, dose multiplier and swing multiplier while it lasts. */
  hesitateShare: 0.07,
  hesitateDose: 1.5,
  hesitateAmp: 0.35,
  /** Ease-in over the first share of the pass, and the flourish over the last share (bigger, quicker strokes, more paint). */
  easeInShare: 0.04,
  flourishShare: 0.07,
  flourishAmp: 1.25,
  flourishRate: 1.4,
  /** Overspray: chance per step of a spatter fleck in the ring between 1x and `spatterReach` x the cone radius. */
  spatterReach: 2,
  spatterShare: 0.03,
  /** Touch-up safety net: cells this far behind the nozzle (cells) are guaranteed painted; the lag shrinks to 0 from `catchFrom` of the pass so the end state is complete. */
  catchLag: 60,
  catchFrom: 0.8,
  /** Second coat over the outline / halo needs this much paint (plus a share of the per-cell threshold), so it only lands where the hand came back over. */
  touchUpBase: 0.55,
  touchUpSpan: 0.8,
  /** Drips: a few lit trickles run down inside the lower half of the letters after the pass. Count, length range (cells), start (share of the pass), slide time and hold time (ms). */
  dripCount: 3,
  dripMin: 3,
  dripMax: 6,
  dripStart: 0.6,
  dripMs: 3600,
  dripHoldMs: 1400,
  /** Mist round the nozzle: fleck count per frame, and the glow alpha. */
  mistFlecks: 110,
  mistGlow: 0.1,
} as const;

/**
 * The load sequence, in ms from the start of the engine. Cloud bank holds then melts; seven bag silhouettes spin in and settle into the letters;
 * one runner arrives at the spray front and sprays the word (the SPRAY timeline below is unchanged, it just starts later), runs off right,
 * then runs back left past "Custom", sprays it in, and runs off.
 */
export const INTRO = {
  cloudHoldMs: 300,
  cloudFadeMs: 1500,
  bagsStartMs: 700,
  bagStaggerMs: 70,
  bagDurMs: 950,
  settleStartMs: 1900,
  settleMs: 380,
  sprayStartMs: 2500,
  runnerEnterMs: 800,
  runOffMs: 900,
  returnStartMs: 8500,
  returnArriveMs: 9900,
  customPassMs: 3400,
  returnExitMs: 800,
  /** Runner height as a share of the letter height, and the row (share of the letter height) it sprays at. */
  runnerScale: 1.1,
  /** On tall (phone) canvases the runner is at least this share of the canvas height (frame size), so he reads. */
  runnerMinShare: 0.36,
  /** The single runner sprays at this share of the letter height. */
  row: 0.5,
  assets: { runner: "/assets/runner/runner.webp", runnerMeta: "/assets/runner/meta.json", bag: "/assets/bag3d/bag_spin.webp", bagMeta: "/assets/bag3d/bag_spin.json" },
} as const;

export const WAVES = {
  count: 7,
  bins: 480,
  width: 8.5,
  /** Envelope of a set: the middle waves are strongest. */
  envelope: [0.42, 0.68, 0.92, 1.0, 0.8, 0.58, 0.36] as const,
  /** One independent set per quarter of the field: own period (s), offset (s), speed (cells/s), spacing (cells), strength. */
  quarters: [
    { period: 16, offset: 0, speed: 20, gap: 17, strength: 1.0 },
    { period: 19, offset: 5.3, speed: 17, gap: 15, strength: 0.9 },
    { period: 14.5, offset: 9.1, speed: 23, gap: 19, strength: 1.1 },
    { period: 21, offset: 2.4, speed: 19, gap: 16, strength: 0.95 },
  ] as const,
} as const;

export const FLOW = {
  /** Cell size of the coarse noise grid. */
  gridStep: 8,
  /** Amplitude of the smooth flow in cells. */
  amplitude: 1.7,
} as const;

export const ORBIT = {
  /** Cells per second and cells per pixel of scroll for the shared flow while the workshop gallery is on screen. */
  flowSpeed: 2.6,
  flowScroll: 0.022,
  /** The long axis of the oval, radians (top-left to bottom-right). */
  axis: 0.62,
  /** Extra ridge width (cells) added far from the swirl while the orbit is on, so the whole gallery backdrop is dense. */
  denseBoost: 5.6,
} as const;

export const CLOUDS = {
  /** Cloud cells never start closer than this to the outline. */
  innerCells: 2.6,
  outerCells: 72,
} as const;

export const FIELD = {
  background: "#050403",
  dotScale: 0.72,
} as const;
