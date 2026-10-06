import { describe, expect, it } from "vitest";
import { createActor } from "xstate";
import { clampIndex, storeMachine } from "./store-machine";

const start = () => createActor(storeMachine, { input: { productCount: 5 } }).start();

describe("store machine", () => {
  it("walks the visitor from the street to the builder in order", () => {
    const a = start();
    expect(a.getSnapshot().value).toBe("boot");
    a.send({ type: "READY" });
    a.send({ type: "ENTER" });
    expect(a.getSnapshot().value).toBe("entering");
    a.send({ type: "CAMERA_COMPLETE" });
    a.send({ type: "GREETING_COMPLETE" });
    expect(a.getSnapshot().value).toBe("browsing");
    a.send({ type: "SELECT_PRODUCT", productId: "heavy-bag", index: 1 });
    expect(a.getSnapshot().context.selectedProductId).toBe("heavy-bag");
    a.send({ type: "OPEN_BUILDER" });
    expect(a.getSnapshot().value).toBe("builderLoading");
  });

  it("ignores events that do not belong to the current stage", () => {
    const a = start();
    a.send({ type: "ENTER" }); // still booting
    a.send({ type: "NEXT_PRODUCT" });
    expect(a.getSnapshot().value).toBe("boot");
    expect(a.getSnapshot().context.currentProductIndex).toBe(0);
  });

  it("lets the visitor answer the greeting by naming a product, or by looking around", () => {
    const a = start();
    for (const type of ["READY", "ENTER", "CAMERA_COMPLETE"] as const) a.send({ type });
    a.send({ type: "CHOOSE_PRODUCT", index: 1 });
    expect(a.getSnapshot().value).toBe("browsing");
    expect(a.getSnapshot().context.currentProductIndex).toBe(1);

    const b = start();
    for (const type of ["READY", "ENTER", "CAMERA_COMPLETE"] as const) b.send({ type });
    b.send({ type: "LOOK_AROUND" });
    expect(b.getSnapshot().value).toBe("lookingAround");
    b.send({ type: "SELECT_PRODUCT", productId: "gloves", index: 0 }); // nothing to buy while looking at the wall
    expect(b.getSnapshot().value).toBe("lookingAround");
    b.send({ type: "BACK" });
    expect(b.getSnapshot().value).toBe("browsing");
    b.send({ type: "LOOK_AROUND" }); // and it can be reached again from the products
    expect(b.getSnapshot().value).toBe("lookingAround");
  });

  it("stops at the first and last product", () => {
    const a = start();
    for (const type of ["READY", "ENTER", "CAMERA_COMPLETE", "GREETING_COMPLETE"] as const) a.send({ type });
    a.send({ type: "PREV_PRODUCT" });
    expect(a.getSnapshot().context.currentProductIndex).toBe(0);
    for (let i = 0; i < 9; i++) a.send({ type: "NEXT_PRODUCT" });
    expect(a.getSnapshot().context.currentProductIndex).toBe(4);
    a.send({ type: "GO_TO_PRODUCT", index: 2 });
    expect(a.getSnapshot().context.currentProductIndex).toBe(2);
  });

  it("goes back from a selected product to browsing and clears the choice", () => {
    const a = start();
    for (const type of ["READY", "ENTER", "CAMERA_COMPLETE", "GREETING_COMPLETE"] as const) a.send({ type });
    a.send({ type: "SELECT_PRODUCT", productId: "gloves", index: 0 });
    a.send({ type: "BACK" });
    expect(a.getSnapshot().value).toBe("browsing");
    expect(a.getSnapshot().context.selectedProductId).toBeNull();
  });

  it("remembers a returning customer", () => {
    const a = start();
    a.send({ type: "READY", returningCustomer: true });
    expect(a.getSnapshot().context.returningCustomer).toBe(true);
  });

  it("clamps indexes", () => {
    expect(clampIndex(-3, 5)).toBe(0);
    expect(clampIndex(9, 5)).toBe(4);
    expect(clampIndex(2, 0)).toBe(0);
  });
});
