import type { Metadata } from "next";
import { BagLetters } from "@/components/BagLetters";

export const metadata: Metadata = { title: "SANCHEZ in bags", robots: { index: false } };

export default function BagLettersPage() {
  return <BagLetters />;
}
