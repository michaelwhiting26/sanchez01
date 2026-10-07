import Link from "next/link";
import { PageShell } from "@/components/pages/PageShell";
import { JESSE_QUOTE_TITLE } from "@/lib/shop/catalogue";
import { SOCIALS } from "@/lib/site";

export const metadata = { title: "Contact | Sanchez Custom Boxing" };

/** Contact: Instagram is the live channel. No email or phone is shown until Jesse supplies them (evidence rule). */
export default function ContactPage() {
  return (
    <PageShell eyebrow="Get a Quote" title={JESSE_QUOTE_TITLE}>
      <p className="pg__lead">The quickest way to reach Jesse is Instagram. The quote form and an email address will go here once he confirms where requests should be sent.</p>
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
