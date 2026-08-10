import type { Metadata } from "next";
import { lato, playfairDisplay } from "@/lib/fonts";
import { pageMetadata } from "@/lib/metadata";

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
