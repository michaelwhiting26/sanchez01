import { describe, expect, it } from "vitest";
import { SWIPE_DISTANCE, SWIPE_VELOCITY, resolveSwipe } from "./SwipeController";

describe("resolveSwipe", () => {
  it("goes next on a long enough leftward drag", () => expect(resolveSwipe(SWIPE_DISTANCE + 1, 0.05)).toBe("next"));
  it("goes next on a short but fast flick", () => expect(resolveSwipe(20, SWIPE_VELOCITY + 0.01)).toBe("next"));
  it("goes previous on a rightward drag or flick", () => {
    expect(resolveSwipe(-SWIPE_DISTANCE - 1, -0.05)).toBe("previous");
    expect(resolveSwipe(-20, -SWIPE_VELOCITY - 0.01)).toBe("previous");
  });
  it("does nothing for a small slow movement", () => expect(resolveSwipe(30, 0.1)).toBe("none"));
  it("leaves vertical drags to the page scroll", () => expect(resolveSwipe(60, 0.5, 140)).toBe("none"));
});
