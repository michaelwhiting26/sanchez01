import { BagPunch } from "@/components/home/BagPunch";
import { CurvedLoop } from "@/components/home/CurvedLoop";
import { DnaCore } from "@/components/home/DnaCore";
import { BagHit } from "@/components/home/BagHit";
import { FooterMin } from "@/components/home/FooterMin";
import { Hero } from "@/components/home/Hero";
import { Marquee } from "@/components/home/Marquee";
import { RisePanel } from "@/components/home/RisePanel";
import { Waitlist } from "@/components/home/Waitlist";
import { WorkshopGallery } from "@/components/home/WorkshopGallery";

/**
 * Home. Order matches the approved prototype: hero, curved loop, pinned workshop gallery, marquee, 3D bag, then the rise panel
 * (which is the footer: logo, "Build your identity", waitlist, minimal footer). The hero field and the helix are fixed canvases behind everything.
 */
export default function HomePage() {
  return (
    <div data-page-home="">
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <main id="main" tabIndex={-1}>
        <Hero />
        <DnaCore />
        <CurvedLoop text="SANCHEZ • CUSTOM ✦ " />
        <WorkshopGallery />
        <div className="sz-transit" aria-hidden="true" data-transit="" />
        <Marquee />
        <BagPunch />
        <RisePanel>
          <Waitlist />
          <div className="globe-slot" data-globe-slot="">
            <BagHit />
          </div>
          <FooterMin />
        </RisePanel>
      </main>
    </div>
  );
}
