/** Shared, evidence-grounded site data. Nothing here may be invented: origin wording is fixed, client names are placeholders until consented. */
export const ORIGIN_LINE = "Designed in Sydney. Handmade in Pattaya." as const;
export const LOGO_SRC = "/assets/site/images/3d2aa4_57957db32ff34fe8ac950b275e2e774b~mv2.webp" as const;

export const CITIES = ["London", "Dubai", "Thailand", "Sydney"] as const;

export const SOCIALS = [
  { handle: "@sanchezproducts", href: "https://www.instagram.com/sanchezproducts/" },
  { handle: "@jessesanchezlgboxing", href: "https://www.instagram.com/jessesanchezlgboxing/" },
] as const;

export const LEGAL_LINKS = [
  { href: "/legal/terms", label: "Terms" },
  { href: "/legal/privacy", label: "Privacy" },
  { href: "/legal/cookies", label: "Cookies" },
] as const;

export const CONTACT_HREF = "/contact" as const;
