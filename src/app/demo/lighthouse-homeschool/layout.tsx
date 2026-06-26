import type { Metadata } from "next";
import { Lato, Playfair_Display } from "next/font/google";
import { pageMetadata } from "@/lib/metadata";

const playfairDisplay = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  display: "swap",
  variable: "--font-playfair-display",
});

const lato = Lato({
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
  variable: "--font-lato",
});

export const metadata: Metadata = pageMetadata({
  title: "Lighthouse Homeschool Academy Website Demo",
  description:
    "A concept admissions landing page for Lighthouse Homeschool Academy — a Christ-centered hybrid homeschool program in Fairview Park, Ohio.",
  path: "/demo/lighthouse-homeschool",
  noIndex: true,
});

export default function LighthouseHomeschoolLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className={`${playfairDisplay.variable} ${lato.variable} [&_.font-heading]:font-[family-name:var(--font-playfair-display)] [&_.font-secondary]:font-[family-name:var(--font-lato)]`}
    >
      {children}
    </div>
  );
}
