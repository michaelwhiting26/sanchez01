import { assign, setup } from "xstate";

/**
 * The store's one source of truth for where the visitor is (spec §1). Camera, Jesse, audio and UI all read this; none of them navigates on its own.
 * Stage names follow the spec: BOOT, ARRIVE, ENTERING, GREETING, BROWSING, PRODUCT_SELECTED, BUILDER_LOADING.
 */
export type StoreStage = "boot" | "arrive" | "entering" | "greeting" | "browsing" | "productSelected" | "builderLoading";

export interface StoreContext {
  selectedProductId: string | null;
  currentProductIndex: number;
  productCount: number;
  audioEnabled: boolean;
  returningCustomer: boolean;
}

export type StoreEventObject =
  | { type: "READY"; returningCustomer?: boolean }
  | { type: "ENTER" }
  | { type: "CAMERA_COMPLETE" }
  | { type: "GREETING_COMPLETE" }
  | { type: "NEXT_PRODUCT" }
  | { type: "PREV_PRODUCT" }
  | { type: "GO_TO_PRODUCT"; index: number }
  | { type: "SELECT_PRODUCT"; productId: string; index: number }
  | { type: "OPEN_BUILDER" }
  | { type: "BACK" }
  | { type: "SET_AUDIO"; enabled: boolean };

export const clampIndex = (index: number, count: number): number => Math.min(Math.max(index, 0), Math.max(count - 1, 0));

export const storeMachine = setup({
  types: { context: {} as StoreContext, events: {} as StoreEventObject, input: {} as { productCount: number } },
  actions: {
    next: assign({ currentProductIndex: ({ context }) => clampIndex(context.currentProductIndex + 1, context.productCount) }),
    prev: assign({ currentProductIndex: ({ context }) => clampIndex(context.currentProductIndex - 1, context.productCount) }),
    goTo: assign({ currentProductIndex: ({ context, event }) => (event.type === "GO_TO_PRODUCT" ? clampIndex(event.index, context.productCount) : context.currentProductIndex) }),
    select: assign(({ context, event }) =>
      event.type === "SELECT_PRODUCT" ? { selectedProductId: event.productId, currentProductIndex: clampIndex(event.index, context.productCount) } : {},
    ),
    clearSelection: assign({ selectedProductId: null }),
    setReturning: assign({ returningCustomer: ({ event }) => event.type === "READY" && event.returningCustomer === true }),
    setAudio: assign({ audioEnabled: ({ context, event }) => (event.type === "SET_AUDIO" ? event.enabled : context.audioEnabled) }),
  },
}).createMachine({
  id: "sanchez-store",
  initial: "boot",
  context: ({ input }) => ({ selectedProductId: null, currentProductIndex: 0, productCount: input.productCount, audioEnabled: false, returningCustomer: false }),
  on: { SET_AUDIO: { actions: "setAudio" } },
  states: {
    boot: { on: { READY: { target: "arrive", actions: "setReturning" } } },
    arrive: { on: { ENTER: "entering" } },
    entering: { on: { CAMERA_COMPLETE: "greeting" } },
    greeting: { on: { GREETING_COMPLETE: "browsing" } },
    browsing: {
      on: {
        NEXT_PRODUCT: { actions: "next" },
        PREV_PRODUCT: { actions: "prev" },
        GO_TO_PRODUCT: { actions: "goTo" },
        SELECT_PRODUCT: { target: "productSelected", actions: "select" },
      },
    },
    productSelected: { on: { OPEN_BUILDER: "builderLoading", BACK: { target: "browsing", actions: "clearSelection" } } },
    builderLoading: {},
  },
});
