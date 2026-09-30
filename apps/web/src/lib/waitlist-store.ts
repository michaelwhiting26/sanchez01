import "server-only";
import type { WaitlistInput } from "./waitlist";

/**
 * Where waitlist sign-ups go. The prototype has no provider yet (business TODO #22: provider, double opt-in, consent wording, storage),
 * so the default adapter accepts and discards. Swap `getWaitlistStore()` for a real adapter (Resend, Mailchimp, a Payload collection, ...).
 * Real "Sign in with Google" or other OAuth logins also need provider setup and are not implemented here.
 */
export interface WaitlistStore {
  add(entry: WaitlistInput & { receivedAt: string }): Promise<void>;
}

const discardStore: WaitlistStore = {
  async add() {
    /* intentionally empty until a provider is chosen */
  },
};

export function getWaitlistStore(): WaitlistStore {
  return discardStore;
}
