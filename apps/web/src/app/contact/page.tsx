import { PageShell } from "@/components/pages/PageShell";
import { QuoteForm } from "@/components/shop/QuoteForm";
import { JESSE_QUOTE_TITLE } from "@/lib/shop/catalogue";
import { SOCIALS } from "@/lib/site";

export const metadata = { title: "Get a Quote | Sanchez Custom Boxing" };

/** Get a Quote: the request form, with Instagram as the other way in. No email or phone is shown until Jesse supplies them (evidence rule). */
export default function ContactPage() {
  return (
    <PageShell eyebrow="Get a Quote" title={JESSE_QUOTE_TITLE}>
      <p className="pg__lead">Tell Jesse what you want made and how to reach you.</p>
      <QuoteForm />
      <p className="pg__note">Or message him on Instagram</p>
      <ul className="pg__list">
        {SOCIALS.map((s) => (
          <li key={s.href}>
            <a href={s.href} target="_blank" rel="noopener noreferrer">
              {s.handle}
            </a>
          </li>
        ))}
      </ul>
    </PageShell>
  );
}
