import type { Metadata } from "next";
import { Lato, Nunito } from "next/font/google";
import { pageMetadata } from "@/lib/metadata";

const nunito = Nunito({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  display: "swap",
  variable: "--font-nunito",
});

const lato = Lato({
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
  variable: "--font-lato",
});

export const metadata: Metadata = pageMetadata({
  title: "Wild Hearts Adventure Co. Website Demo",
  description:
    "A concept admissions landing page for Wild Hearts Adventure Co. — a project-based, nature-centered learning community in Visalia, California.",
  path: "/demo/wild-hearts-adventure",
  noIndex: true,
});

export default function WildHeartsAdventureLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className={`${nunito.variable} ${lato.variable} [&_.font-heading]:font-[family-name:var(--font-nunito)] [&_.font-secondary]:font-[family-name:var(--font-lato)]`}
    >
      {children}
    </div>
  );
}
