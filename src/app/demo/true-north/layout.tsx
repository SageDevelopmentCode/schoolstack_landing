import type { Metadata } from "next";
import { Montserrat, Playfair_Display } from "next/font/google";
import { pageMetadata } from "@/lib/metadata";

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
  variable: "--font-playfair",
});

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-montserrat",
});

export const metadata: Metadata = pageMetadata({
  title: "True North Website Demo",
  description:
    "A concept admissions landing page for True North — a Christian, biblically based parent partnership serving grades 1–12 in The Woodlands, TX.",
  path: "/demo/true-north",
  noIndex: true,
});

export default function TrueNorthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className={`${playfair.variable} ${montserrat.variable} [&_.font-heading]:font-[family-name:var(--font-playfair)] [&_.font-secondary]:font-[family-name:var(--font-montserrat)]`}
    >
      {children}
    </div>
  );
}
