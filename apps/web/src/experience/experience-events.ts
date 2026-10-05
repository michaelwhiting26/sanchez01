import type { StoreEvent } from "@/lib/storefront/types";

/**
 * The store's funnel events (spec: Analytics). First-party and anonymous: a random id kept for the tab only, no cookie, no personal data.
 * Events are batched and sent when the tab goes to the background or every few seconds, so they never compete with a frame.
 */
type Props = Record<string, string | number | boolean | null>;
interface Queued {
  readonly name: StoreEvent;
  readonly properties: Props;
  readonly at: string;
}

const queue: Queued[] = [];
let timer: ReturnType<typeof setTimeout> | null = null;
let wired = false;

function sessionId(): string {
  try {
    let id = sessionStorage.getItem("sz_store_session");
    if (!id) {
      id = crypto.randomUUID();
      sessionStorage.setItem("sz_store_session", id);
    }
    return id;
  } catch {
    return "00000000-0000-4000-8000-000000000000"; // private mode: events still count, sessions do not
  }
}

function flush(): void {
  if (timer) clearTimeout(timer);
  timer = null;
  if (queue.length === 0) return;
  const body = JSON.stringify({ sessionId: sessionId(), events: queue.splice(0, queue.length) });
  const sent = typeof navigator.sendBeacon === "function" && navigator.sendBeacon("/api/storefront/events", new Blob([body], { type: "application/json" }));
  if (!sent) void fetch("/api/storefront/events", { method: "POST", headers: { "content-type": "application/json" }, body, keepalive: true }).catch(() => undefined);
}

export function track(name: StoreEvent, properties: Props = {}): void {
  if (typeof window === "undefined") return;
  if (!wired) {
    wired = true;
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "hidden") flush();
    });
    window.addEventListener("pagehide", flush);
  }
  queue.push({ name, properties, at: new Date().toISOString() });
  timer ??= setTimeout(flush, 4000);
}

export const flushEvents = flush;
