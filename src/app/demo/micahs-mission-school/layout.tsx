import type { Metadata } from "next";
import { Lato, Playfair_Display } from "next/font/google";
import { pageMetadata } from "@/lib/metadata";

const playfairDisplay = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
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
  title: "Micah's Mission School Website Demo",
  description:
    "A concept admissions landing page for Micah's Mission School, Inc. — a faith-based K–12 hybrid learning and resource center in Vicksburg, Mississippi.",
  path: "/demo/micahs-mission-school",
  noIndex: true,
});

export default function MicahsMissionSchoolLayout({
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
