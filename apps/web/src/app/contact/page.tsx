import Link from "next/link";
import { PageShell } from "@/components/pages/PageShell";
import { SOCIALS } from "@/lib/site";

export const metadata = { title: "Contact | Sanchez Custom Boxing" };

/** Contact: Instagram is the live channel. No email or phone is shown until Jesse supplies them (evidence rule). */
export default function ContactPage() {
  return (
    <PageShell eyebrow="Get in touch" title="Contact">
      <p className="pg__lead">The quickest way to reach us is Instagram. A contact form and email address will go here once Jesse confirms them.</p>
      <ul className="pg__list">
        {SOCIALS.map((s) => (
          <li key={s.href}>
            <a href={s.href} target="_blank" rel="noopener noreferrer">
              {s.handle}
            </a>
          </li>
        ))}
      </ul>
      <div className="pg__actions">
        <Link className="pg__btn" href="/superseded#waitlist">
          Join the waitlist
        </Link>
      </div>
    </PageShell>
  );
}
