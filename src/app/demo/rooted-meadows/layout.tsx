import type { Metadata } from "next";
import { cormorantGaramond, sourceSans3 } from "@/lib/fonts";
import { pageMetadata } from "@/lib/metadata";

export const metadata: Metadata = pageMetadata({
  title: "Rooted Meadows Website Demo",
  description:
    "A concept admissions landing page for Rooted Meadows Waldorf School — a Waldorf-guided micro-school serving grades K–8 in the Greater Idaho Falls area.",
  path: "/demo/rooted-meadows",
  noIndex: true,
});

export default function RootedMeadowsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className={`${cormorantGaramond.variable} ${sourceSans3.variable} [&_.font-heading]:font-[family-name:var(--font-cormorant)] [&_.font-secondary]:font-[family-name:var(--font-source-sans)]`}
    >
      {children}
    </div>
  );
}
