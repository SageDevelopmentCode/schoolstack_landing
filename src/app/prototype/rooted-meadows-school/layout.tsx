import type { Metadata } from "next";
import { Cormorant_Garamond } from "next/font/google";
import { sourceSans3 } from "@/lib/fonts";
import { pageMetadata } from "@/lib/metadata";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-cormorant",
});

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
      className={`${cormorant.variable} ${sourceSans3.variable} [&_.font-heading]:font-[family-name:var(--font-cormorant)] [&_.font-secondary]:font-[family-name:var(--font-source-sans)]`}
    >
      {children}
    </div>
  );
}
