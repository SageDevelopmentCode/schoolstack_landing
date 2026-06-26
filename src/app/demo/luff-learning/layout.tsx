import type { Metadata } from "next";
import { DM_Serif_Display, Open_Sans } from "next/font/google";
import { pageMetadata } from "@/lib/metadata";

const dmSerifDisplay = DM_Serif_Display({
  subsets: ["latin"],
  weight: ["400"],
  display: "swap",
  variable: "--font-dm-serif-display",
});

const openSans = Open_Sans({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  display: "swap",
  variable: "--font-open-sans",
});

export const metadata: Metadata = pageMetadata({
  title: "Luff Learning Website Demo",
  description:
    "A concept admissions landing page for Luff Learning Fine Arts Academy — a secular fine arts academy and virtual microschool in Spring, Texas.",
  path: "/demo/luff-learning",
  noIndex: true,
});

export default function LuffLearningLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className={`${dmSerifDisplay.variable} ${openSans.variable} [&_.font-heading]:font-[family-name:var(--font-dm-serif-display)] [&_.font-secondary]:font-[family-name:var(--font-open-sans)]`}
    >
      {children}
    </div>
  );
}
