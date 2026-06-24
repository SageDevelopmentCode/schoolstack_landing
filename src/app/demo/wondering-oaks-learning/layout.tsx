import type { Metadata } from "next";
import { Cormorant_Garamond, DM_Sans } from "next/font/google";
import { pageMetadata } from "@/lib/metadata";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-cormorant",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-dm-sans",
});

export const metadata: Metadata = pageMetadata({
  title: "Wondering Oaks Learning Website Demo",
  description:
    "A concept admissions landing page for Wondering Oaks Learning — a secular homeschool-away-from-home microschool in Conroe, Texas for ages 5–8.",
  path: "/demo/wondering-oaks-learning",
  noIndex: true,
});

export default function WonderingOaksLearningLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className={`${cormorant.variable} ${dmSans.variable} [&_.font-heading]:font-[family-name:var(--font-cormorant)] [&_.font-secondary]:font-[family-name:var(--font-dm-sans)]`}
    >
      {children}
    </div>
  );
}
