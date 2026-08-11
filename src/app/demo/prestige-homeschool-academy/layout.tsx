import type { Metadata } from "next";
import { playfairDisplay, sourceSans3 } from "@/lib/fonts";
import { pageMetadata } from "@/lib/metadata";

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
      className={`${playfairDisplay.variable} ${sourceSans3.variable} [&_.font-heading]:font-[family-name:var(--font-playfair-display)] [&_.font-secondary]:font-[family-name:var(--font-source-sans)]`}
    >
      {children}
    </div>
  );
}
