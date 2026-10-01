import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type * as Frame from "./frame";

// lib/frame.ts keeps module state (one clock per page), so every test loads a fresh copy against a fake rAF and a fake window.
type FrameModule = typeof Frame;
let rafQueue: ((t: number) => void)[] = [];
let page = { scrollY: 0, scrollHeight: 2000, innerHeight: 1000 };

function tick(t: number): void {
  const q = rafQueue;
  rafQueue = [];
  for (const cb of q) cb(t);
}

async function load(): Promise<FrameModule> {
  vi.resetModules();
  return import("./frame");
}

beforeEach(() => {
  rafQueue = [];
  page = { scrollY: 0, scrollHeight: 2000, innerHeight: 1000 };
  vi.stubGlobal("requestAnimationFrame", (cb: (t: number) => void) => {
    rafQueue.push(cb);
    return rafQueue.length;
  });
  vi.stubGlobal("cancelAnimationFrame", () => {
    rafQueue = [];
  });
  vi.stubGlobal("window", {
    get scrollY() {
      return page.scrollY;
    },
    get innerHeight() {
      return page.innerHeight;
    },
  });
  vi.stubGlobal("document", { documentElement: { get scrollHeight() { return page.scrollHeight; } } });
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("frame clock", () => {
  it("runs the phases in order in one frame: scroll, read, write, render", async () => {
    const f = await load();
    const order: string[] = [];
    for (const p of ["render", "write", "read", "scroll"] as const) f.subscribe(p, () => order.push(p));
    tick(16);
    expect(order).toEqual(["scroll", "read", "write", "render"]);
  });

  it("gives every subscriber the same scroll snapshot within a frame", async () => {
    const f = await load();
    page.scrollY = 300;
    const seen: number[] = [];
    f.subscribe("read", (_t, _dt, s) => {
      seen.push(s.y);
      page.scrollY = 999; // the page moving mid-frame must not change what later phases see
    });
    f.subscribe("render", (_t, _dt, s) => seen.push(s.y));
    tick(16);
    expect(seen).toEqual([300, 300]);
  });

  it("computes progress, direction, velocity and changed; progress is 0 when the page cannot scroll", async () => {
    const f = await load();
    let last = f.getScroll();
    f.subscribe("read", (_t, _dt, s) => (last = { ...s }));
    page.scrollY = 500;
    tick(0);
    expect(last.progress).toBeCloseTo(0.5);
    expect(last.changed).toBe(true);
    page.scrollY = 400;
    tick(1000 / 60);
    expect(last.direction).toBe(-1);
    expect(last.velocity).toBeCloseTo(-100);
    tick(2000 / 60);
    expect(last.changed).toBe(false);
    expect(last.direction).toBe(0);
    page.scrollHeight = 1000; // limit 0
    tick(3000 / 60);
    expect(last.limit).toBe(0);
    expect(last.progress).toBe(0);
  });

  it("clamps dt after a long gap and uses a normal dt on the first frame", async () => {
    const f = await load();
    const dts: number[] = [];
    f.subscribe("write", (_t, dt) => dts.push(dt));
    tick(1000);
    tick(6000);
    expect(dts[0]).toBeCloseTo(1000 / 60);
    expect(dts[1]).toBe(100);
  });

  it("unsubscribing during a frame does not disturb that frame, and stops the next", async () => {
    const f = await load();
    const calls: string[] = [];
    let offB: () => void = () => undefined;
    f.subscribe("write", () => {
      calls.push("a");
      offB();
    });
    offB = f.subscribe("write", () => calls.push("b"));
    tick(16);
    tick(32);
    expect(calls).toEqual(["a", "b", "a"]);
  });

  it("requestFrame runs once, a re-request lands in the next frame, cancelFrame prevents it", async () => {
    const f = await load();
    const calls: number[] = [];
    const loop = (t: number): void => {
      calls.push(t);
      if (calls.length < 3) f.requestFrame("render", loop);
    };
    f.requestFrame("render", loop);
    tick(10);
    expect(calls).toEqual([10]);
    tick(20);
    tick(30);
    tick(40);
    expect(calls).toEqual([10, 20, 30]);
    const id = f.requestFrame("write", () => calls.push(-1));
    f.cancelFrame(id);
    f.cancelFrame(0);
    tick(50);
    expect(calls).toEqual([10, 20, 30]);
  });

  it("a request made in the read phase can write in the same frame", async () => {
    const f = await load();
    const order: string[] = [];
    f.requestFrame("read", () => {
      order.push("read");
      f.requestFrame("write", () => order.push("write"));
    });
    tick(16);
    expect(order).toEqual(["read", "write"]);
  });

  it("a throwing callback is reported once and never stops the others", async () => {
    const f = await load();
    const err = vi.spyOn(console, "error").mockImplementation(() => undefined);
    let ok = 0;
    f.subscribe("write", () => {
      throw new Error("boom");
    });
    f.subscribe("write", () => ok++);
    tick(16);
    tick(32);
    expect(ok).toBe(2);
    expect(err).toHaveBeenCalledTimes(1);
    err.mockRestore();
  });

  it("idles when nothing is subscribed or requested, and wakes again on demand", async () => {
    const f = await load();
    const off = f.subscribe("write", () => undefined);
    tick(16);
    expect(rafQueue.length).toBe(1);
    off();
    tick(32);
    expect(rafQueue.length).toBe(0); // the frame ended with nothing left: no next frame was kept
    f.requestFrame("write", () => undefined);
    expect(rafQueue.length).toBe(1);
  });

  it("runNow sees the page's position now, and leaves the clock's state alone (the next frame still sees the move)", async () => {
    const f = await load();
    vi.stubGlobal("performance", { now: () => 5 });
    let changedInFrame = false;
    f.subscribe("read", (_t, _dt, s) => (changedInFrame = s.changed));
    tick(16);
    page.scrollY = 700;
    let seen = -1;
    f.runNow((_t, _dt, s) => (seen = s.y));
    expect(seen).toBe(700);
    tick(32);
    expect(changedInFrame, "the frame after runNow still reports the scroll as a change").toBe(true);
  });

  it("uses an installed scroll provider (Lenis) and restores native reading when it is removed", async () => {
    const f = await load();
    const advanced: number[] = [];
    const restore = f.setScrollProvider({
      advance: (t) => advanced.push(t),
      read(out) {
        out.y = 123.5;
        out.limit = 1000;
      },
    });
    let y = 0;
    f.subscribe("read", (_t, _dt, s) => (y = s.y));
    tick(16);
    expect(advanced).toEqual([16]);
    expect(y).toBe(123.5);
    restore();
    page.scrollY = 42;
    tick(32);
    expect(y).toBe(42);
  });
});
