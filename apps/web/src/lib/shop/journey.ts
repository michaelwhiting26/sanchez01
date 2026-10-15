import type { QuoteProduct } from "@/lib/quote";

/**
 * How a visitor gets a piece made (owner, 15 Oct 2026, from the competitor research in Dropbox
 * 15. sanchezboxing/research_notes/2026-10-15 Competitor research). Three ways in, not one: buy what Jesse has made,
 * ask for "this, but different" or describe your own, or design it in 3D. Every route ends in a quote from Jesse.
 * No price, lead time, deposit size or returns promise appears here until Jesse confirms them (evidence rule).
 */
export const DOORS = [
  {
    n: "01",
    title: "Pick one of Jesse's",
    text: "Choose a piece Jesse has made and have one made for you, just as it is, or with your changes.",
    action: "See Jesse's builds",
    href: "#builds",
  },
  {
    n: "02",
    title: "Tell Jesse what you want",
    text: "Describe it in your own words. Got photos or a logo? Send them with your request. Jesse comes back with a quote.",
    action: "Tell Jesse",
    href: "/contact?start=new",
  },
  {
    n: "03",
    title: "Design it in 3D",
    text: "Colour every panel, add your name or logo and turn it round before it is made.",
    action: "Open the 3D builder",
    href: "/shop",
  },
] as const;

/** What happens after a request is sent. Process steps only: no times, percentages or guarantees until Jesse sets them. */
export const ORDER_STEPS = [
  { n: "1", title: "Send your request", text: "From one of Jesse's builds, your own idea or the 3D builder." },
  { n: "2", title: "Jesse quotes", text: "He replies with a price for your piece." },
  { n: "3", title: "Deposit", text: "A deposit starts your order." },
  { n: "4", title: "Approve the design", text: "You see your design and say yes before anything is cut." },
  { n: "5", title: "Handmade in Pattaya", text: "Cut, stitched and finished by hand, one piece at a time." },
  { n: "6", title: "Checked and sent", text: "Your piece is checked, packed and sent to you." },
] as const;

/** Jesse's own story is his to tell: the section holds the place for his film and makes no claim about his past. */
export const STORY = {
  title: "Jesse's story",
  tag: "Film coming soon",
  text: "Where it started, the gyms and fighters he makes for today, and where it goes next. Jesse is telling it himself, on film.",
  action: "Follow Jesse on Instagram",
  href: "https://www.instagram.com/jessesanchezlgboxing/",
} as const;

/** The quote form's product value for each shop product. */
export const QUOTE_FOR: Readonly<Record<string, QuoteProduct>> = {
  gloves: "gloves",
  "heavy-bag": "heavy-bag",
  "focus-mitts": "focus-mitts",
  "head-guard": "head-guard",
  "groin-guard": "groin-guard",
};

/** Where Jesse takes requests when the form cannot deliver one (his business Instagram, already public on the site). */
export const DIRECT_MESSAGE_HREF = "https://ig.me/m/sanchezproducts" as const;

/** Text the quote form starts with, so nobody faces a blank box. Prompts only; the visitor writes the content. */
export function startText(start: string | null, piece: string | null): string {
  const name = piece ? piece.slice(0, 80) : "this piece";
  if (start === "this") return `I'd like this one, as shown: ${name}.\n\nSize or weight:\nName or logo on it:\nNeeded by (fight date?):\nAnything else:`;
  if (start === "change") return `I'd like this, but different: ${name}.\n\nWhat I'd change:\nSize or weight:\nName or logo on it:\nNeeded by (fight date?):`;
  if (start === "new") return `Here's what I want made:\n\nColours:\nName or logo on it:\nSize or weight:\nNeeded by (fight date?):\n\nI have photos or a logo to send: yes / no`;
  return "";
}
