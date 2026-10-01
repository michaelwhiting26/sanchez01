/**
 * The homepage's one animation clock. Every scroll-linked or continuously animated thing on the page runs from this single requestAnimationFrame loop,
 * so all of it sees the same scroll position in the same frame (no layer lags another by a frame).
 *
 * Each frame, in order:
 *   1. "scroll": the scroll engine advances (Lenis, registered by SmoothScroll.tsx; native scroll when there is none),
 *   2. the scroll state is snapshotted ONCE,
 *   3. "read":   layout measurements only,
 *   4. "write":  DOM presentation only (transform, opacity, CSS custom properties, classes),
 *   5. "render": canvas / WebGL drawing.
 * No layout reads in "write" or "render": that is what keeps a frame free of read/write/read thrash.
 *
 * Time: `t` is the rAF timestamp (ms), `dt` the clamped delta (ms). Under Playwright's fake clock rAF and performance.now are controlled by the test, so this
 * loop (and Lenis, which takes its time from here) is deterministic there with no special mode.
 * The loop runs only while something is subscribed; requestAnimationFrame itself stops in a hidden tab, and the first frame back gets a normal dt.
 */
export type Phase = "scroll" | "read" | "write" | "render";

export interface ScrollState {
  /** Scroll position (px) this frame. */
  y: number;
  /** Change since the previous frame, in px per 16.67 ms (so it means the same at 60 and 120 Hz). */
  velocity: number;
  /** 1 down, -1 up, 0 still. */
  direction: 1 | -1 | 0;
  /** y / limit, clamped to [0, 1] (0 when the page cannot scroll). */
  progress: number;
  /** Maximum scroll (px). */
  limit: number;
  /** The scroll position differs from the previous frame's. Lets a subscriber skip work while nothing moves. */
  changed: boolean;
}

export type FrameFn = (t: number, dt: number, scroll: Readonly<ScrollState>) => void;

/** What drives "scroll": SmoothScroll.tsx installs Lenis here; without it the browser's own scroll is read. */
export interface ScrollProvider {
  advance(t: number): void;
  read(out: { y: number; limit: number }): void;
}

const PHASES: readonly Phase[] = ["scroll", "read", "write", "render"];
const DT_MAX = 100; // a long gap (tab switch, breakpoint) must not fling time-based motion
const DT_DEFAULT = 1000 / 60;

const nativeProvider: ScrollProvider = {
  advance: () => undefined,
  read(out) {
    out.y = window.scrollY;
    out.limit = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
  },
};

// Copy-on-write subscriber lists: (un)subscribing during a frame never disturbs the iteration in progress.
const subs: Record<Phase, readonly FrameFn[]> = { scroll: [], read: [], write: [], render: [] };
const failed = new WeakSet<FrameFn>();
const state: ScrollState = { y: 0, velocity: 0, direction: 0, progress: 0, limit: 0, changed: true };
const raw = { y: 0, limit: 0 };
let provider: ScrollProvider = nativeProvider;
let raf = 0;
let last = -1;
let count = 0;
// One-shot callbacks (requestFrame): double-buffered per phase, so a callback that re-requests itself lands in the NEXT frame, never this one.
interface Once { id: number; fn: FrameFn }
const onceQ: Record<Phase, Once[]> = { scroll: [], read: [], write: [], render: [] };
const onceSpare: Record<Phase, Once[]> = { scroll: [], read: [], write: [], render: [] };
const cancelled = new Set<number>();
let onceCount = 0;
let nextId = 1;
let force = true; // the next snapshot reports `changed` even if y did not move (first frame, new provider, restart)

function call(fn: FrameFn, phase: Phase, t: number, dt: number): void {
  try {
    fn(t, dt, state);
  } catch (err) {
    if (!failed.has(fn)) {
      failed.add(fn);
      console.error(`[frame] ${phase} callback threw`, err);
    }
  }
}

function run(phase: Phase, t: number, dt: number): void {
  const q = onceQ[phase];
  if (q.length) {
    onceQ[phase] = onceSpare[phase];
    onceSpare[phase] = q;
    for (const o of q) {
      onceCount--;
      if (cancelled.delete(o.id)) continue;
      call(o.fn, phase, t, dt);
    }
    q.length = 0;
  }
  for (const fn of subs[phase]) call(fn, phase, t, dt); // a throwing callback is reported once and never stops the page's only clock
}

function snapshot(dt: number): void {
  const prev = state.y;
  provider.read(raw);
  state.limit = raw.limit;
  state.y = raw.y;
  const d = state.y - prev;
  state.changed = d !== 0 || force;
  force = false;
  state.velocity = dt > 0 ? (d * DT_DEFAULT) / dt : 0;
  state.direction = d > 0 ? 1 : d < 0 ? -1 : 0;
  state.progress = state.limit > 0 ? Math.min(1, Math.max(0, state.y / state.limit)) : 0;
}

function loop(t: number): void {
  raf = requestAnimationFrame(loop);
  const dt = last < 0 ? DT_DEFAULT : Math.min(DT_MAX, Math.max(0, t - last));
  last = t;
  run("scroll", t, dt);
  provider.advance(t);
  snapshot(dt);
  run("read", t, dt);
  run("write", t, dt);
  run("render", t, dt);
  if (count === 0 && onceCount === 0) stop(); // nothing left to run: the page's clock idles
}

function start(): void {
  if (raf || typeof window === "undefined") return;
  last = -1;
  force = true;
  raf = requestAnimationFrame(loop);
}

function stop(): void {
  if (!raf) return;
  cancelAnimationFrame(raf);
  raf = 0;
}

/** Run `fn` every frame in `phase` until the returned function is called. Safe to call during a frame (takes effect next frame). */
export function subscribe(phase: Phase, fn: FrameFn): () => void {
  subs[phase] = [...subs[phase], fn];
  count++;
  start();
  let live = true;
  return () => {
    if (!live) return;
    live = false;
    subs[phase] = subs[phase].filter((f) => f !== fn);
    count--; // the loop idles itself at the end of a frame once nothing is subscribed or requested
  };
}

/**
 * Run `fn` once, in `phase` of the next frame of the page's one clock: the drop-in replacement for requestAnimationFrame in self-scheduling loops
 * (a loop that re-requests itself every frame keeps running; one that stops requesting goes idle). Returns an id for cancelFrame (never 0).
 */
export function requestFrame(phase: Phase, fn: FrameFn): number {
  const id = nextId++;
  onceQ[phase].push({ id, fn });
  onceCount++;
  start();
  return id;
}

/** Cancel a pending requestFrame. Safe with 0, unknown or already-run ids. */
export function cancelFrame(id: number): void {
  if (!id) return;
  for (const p of PHASES) if (onceQ[p].some((o) => o.id === id)) cancelled.add(id);
}

/** Install the scroll engine (Lenis). Returns a function that restores native scroll reading. */
export function setScrollProvider(p: ScrollProvider): () => void {
  provider = p;
  force = true;
  return () => {
    if (provider === p) provider = nativeProvider;
  };
}

/** The current frame's scroll state (read-only). Outside a frame it is the last frame's. */
export function getScroll(): Readonly<ScrollState> {
  return state;
}

/**
 * Run `fn` now, synchronously, with a fresh scroll snapshot: for test hooks and one-off redraws (e.g. an e2e `drawAt()`), never from inside a frame.
 */
export function runNow(fn: FrameFn): void {
  // its own snapshot: writing the clock's state here would make the next real frame see "no change" and skip every redraw-on-scroll subscriber
  const y = window.scrollY; // the browser's own position: a caller outside a frame (a test right after window.scrollTo) must see where the page IS
  const limit = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
  const d = y - state.y;
  const s: ScrollState = { y, limit, velocity: 0, direction: d > 0 ? 1 : d < 0 ? -1 : 0, progress: limit > 0 ? Math.min(1, Math.max(0, y / limit)) : 0, changed: d !== 0 };
  fn(performance.now(), 0, s);
}

/** Subscriber phases in execution order (for docs and tests). */
export const FRAME_PHASES = PHASES;
