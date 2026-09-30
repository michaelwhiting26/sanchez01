import { notFound } from "next/navigation";
import { PageShell } from "@/components/pages/PageShell";

const PAGES: Record<string, string> = { terms: "Terms", privacy: "Privacy", cookies: "Cookies" };

export function generateStaticParams(): Array<{ slug: string }> {
  return Object.keys(PAGES).map((slug) => ({ slug }));
}

/** The legal pages. The text is PLACEHOLDER until it is written and checked (no invented legal claims). */
export default async function LegalPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const title = PAGES[slug];
  if (!title) notFound();
  return (
    <PageShell eyebrow="Legal" title={title}>
      <p className="pg__note">PLACEHOLDER: the {title.toLowerCase()} text is to be supplied and legally checked before launch.</p>
    </PageShell>
  );
}
