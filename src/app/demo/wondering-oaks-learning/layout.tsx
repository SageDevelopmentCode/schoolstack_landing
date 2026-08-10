import type { Metadata } from "next";
import { cormorantGaramond, dmSans } from "@/lib/fonts";
import { pageMetadata } from "@/lib/metadata";

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
      className={`${cormorantGaramond.variable} ${dmSans.variable} [&_.font-heading]:font-[family-name:var(--font-cormorant)] [&_.font-secondary]:font-[family-name:var(--font-dm-sans)]`}
    >
      {children}
    </div>
  );
}
