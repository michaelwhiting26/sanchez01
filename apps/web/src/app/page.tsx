import { StoreExperience } from "@/components/store/StoreExperience";
import { StoreFooter } from "@/components/store/StoreFooter";
import { getStoreBootstrap } from "@/lib/storefront/config";

/**
 * Home: the mobile 3D store, Parts 1 to 4 (arrive, walk in, Jesse greets you, swipe through products). See docs/STORE-3D.md.
 * The previous scroll site is kept whole at /superseded and linked from the footer (owner, 5 Oct 2026).
 */
export default function StorePage() {
  return (
    <>
      <main id="main">
        <StoreExperience bootstrap={getStoreBootstrap()} />
      </main>
      <StoreFooter />
    </>
  );
}
