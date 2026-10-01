import type { Metadata, Viewport } from "next";
import { Barlow, Barlow_Condensed } from "next/font/google";
import "lenis/dist/lenis.css";
import "../styles/base.css";
import "../styles/home/index.css";
import "../styles/share-sheet.css";
import "../styles/bag-buttons.css";
import "./globals.css";
import { SmoothScroll } from "@/components/SmoothScroll";

const display = Barlow_Condensed({ subsets: ["latin"], weight: ["500", "600", "700", "800"], display: "swap", variable: "--nf-display" });
const text = Barlow({ subsets: ["latin"], weight: ["400", "500", "600", "700"], display: "swap", variable: "--nf-text" });

export const metadata: Metadata = {
  title: "Sanchez Custom Boxing Equipment | Designed in Sydney. Handmade in Pattaya.",
  description: "Custom boxing bags and gym fit-outs, cut, stitched and printed by hand. Designed in Sydney. Handmade in Pattaya.",
  robots: { index: false, follow: false }, // prototype phase: stays out of search until launch (business TODO)
};

export const viewport: Viewport = { themeColor: "#0e0b09", viewportFit: "cover", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" dir="ltr" className={`${display.variable} ${text.variable}`}>
      <body>
        <SmoothScroll />
        {children}
      </body>
    </html>
  );
}
