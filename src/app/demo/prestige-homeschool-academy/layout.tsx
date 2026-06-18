import type { Metadata } from "next";
import { Playfair_Display, Source_Sans_3 } from "next/font/google";
import { pageMetadata } from "@/lib/metadata";

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
  variable: "--font-playfair-display",
});

const sourceSans = Source_Sans_3({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-source-sans",
});

export const metadata: Metadata = pageMetadata({
  title: "Prestige Homeschool Academy Website Demo",
  description:
    "A concept admissions landing page for Prestige Homeschool Academy — project-based homeschool education with small-group learning in Niceville, Florida.",
  path: "/demo/prestige-homeschool-academy",
  noIndex: true,
});

export default function PrestigeHomeschoolAcademyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className={`${playfair.variable} ${sourceSans.variable} [&_.font-heading]:font-[family-name:var(--font-playfair-display)] [&_.font-secondary]:font-[family-name:var(--font-source-sans)]`}
    >
      {children}
    </div>
  );
}
