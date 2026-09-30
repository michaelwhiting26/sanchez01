import Link from "next/link";
import { PageShell } from "@/components/pages/PageShell";

export const metadata = { title: "Gym fit-outs | Sanchez Custom Boxing" };

/** Gym fit-outs: not part of the bag launch path. A holding page that sends people back to the bag. */
export default function GymFitOutsPage() {
  return (
    <PageShell eyebrow="Coming later" title="Gym fit-outs">
      <p className="pg__lead">Gym fit-outs are not open yet. The bag comes first.</p>
      <div className="pg__actions">
        <Link className="pg__btn" href="/product">
          See the bag
        </Link>
      </div>
    </PageShell>
  );
}
