import type { Metadata } from "next";
import { cormorantGaramond, sourceSans3 } from "@/lib/fonts";
import { pageMetadata } from "@/lib/metadata";

export const metadata: Metadata = pageMetadata({
  title: "Rooted Meadows Platform Prototype",
  description:
    "A platform walkthrough for Rooted Meadows Waldorf School — admin admissions, parent enrollment and billing, and teacher attendance without the website demo.",
  path: "/prototype/rooted-meadows-school",
  noIndex: true,
});

export default function RootedMeadowsPrototypeLayout({
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
