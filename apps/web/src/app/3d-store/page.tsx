import { StoreExperience } from "@/components/store/StoreExperience";
import { StoreFooter } from "@/components/store/StoreFooter";
import { getStoreBootstrap } from "@/lib/storefront/config";

export const metadata = { title: "3D store (parked) | Sanchez Custom Boxing" };

/**
 * The mobile 3D store, Parts 1 to 4, parked here whole (owner, 7 Oct 2026): it was the home page until the shop replaced it, and the owner means
 * to use it again. Nothing links to it. See docs/STORE-3D.md.
 */
export default function ParkedStorePage() {
  return (
    <>
      <main id="main">
        <StoreExperience bootstrap={getStoreBootstrap()} />
      </main>
      <StoreFooter />
    </>
  );
}
