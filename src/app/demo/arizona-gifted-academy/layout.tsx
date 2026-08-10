import type { Metadata } from "next";
import { playfairDisplay, sourceSans3 } from "@/lib/fonts";
import { pageMetadata } from "@/lib/metadata";

export const metadata: Metadata = pageMetadata({
  title: "Arizona Gifted Academy Website Demo",
  description:
    "A concept admissions landing page for Arizona Gifted Academy — a boutique gifted microschool in Scottsdale, Arizona for PK–5 learners.",
  path: "/demo/arizona-gifted-academy",
  noIndex: true,
});

export default function ArizonaGiftedAcademyLayout({
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
