import Link from "next/link";
import "../../styles/store.css";
import { BagPunch } from "@/components/home/BagPunch";
import { CurvedLoop } from "@/components/home/CurvedLoop";
import { DnaCore } from "@/components/home/DnaCore";
import { DnaDive } from "@/components/home/DnaDive";
import { BagHit } from "@/components/home/BagHit";
import { FooterMin } from "@/components/home/FooterMin";
import { Hero } from "@/components/home/Hero";
import { Marquee } from "@/components/home/Marquee";
import { OrbitSubmit } from "@/components/home/OrbitSubmit";
import { RisePanel } from "@/components/home/RisePanel";
import { TransitJesse } from "@/components/home/TransitJesse";
import { Waitlist } from "@/components/home/Waitlist";
import { WorkshopGallery } from "@/components/home/WorkshopGallery";

/**
 * SUPERSEDED (owner, 5 Oct 2026): this scroll site was the home page until the 3D store replaced it at "/". Kept whole and reachable from the store footer.
 * Was Home. Order matches the approved prototype: hero, curved loop, pinned workshop gallery, marquee, 3D bag, then the rise panel
 * (which is the footer: logo, "Build your identity", waitlist, minimal footer). The hero field and the helix are fixed canvases behind everything.
 */
export default function SupersededHomePage() {
  return (
    <div data-page-home="">
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <nav className="superseded-bar" aria-label="Superseded site">
        <span>Superseded site</span>
        <Link href="/">Back to the store</Link>
        <Link href="/configure">Build</Link>
        <Link href="/product">Product</Link>
        <Link href="/gym-fit-outs">Gym fit-outs</Link>
        <Link href="/contact">Contact</Link>
      </nav>
      <main id="main" tabIndex={-1}>
        <Hero />
        <DnaCore />
        <CurvedLoop text="SANCHEZ • CUSTOM ✦ " />
        <WorkshopGallery />
        <div className="sz-transit" aria-hidden="true" data-transit="" />
        <TransitJesse />
        <Marquee />
        <DnaDive />
        <BagPunch />
        <RisePanel>
          <Waitlist />
          <div className="globe-slot" data-globe-slot="">
            <OrbitSubmit label="Submit" />
            <BagHit />
          </div>
          <FooterMin />
        </RisePanel>
      </main>
    </div>
  );
}
