import type { Metadata } from "next";
import { Nunito, Source_Sans_3 } from "next/font/google";
import { pageMetadata } from "@/lib/metadata";

const nunito = Nunito({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-nunito",
});

const sourceSans = Source_Sans_3({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-source-sans",
});

export const metadata: Metadata = pageMetadata({
  title: "Hilton Horizons Academy Website Demo",
  description:
    "A concept admissions landing page for Hilton Horizons Academy — project-based K–12 education across Category III private school and hybrid microschool pathways in the Tri-Cities.",
  path: "/demo/hilton-horizons-academy",
  noIndex: true,
});

export default function HiltonHorizonsAcademyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className={`${nunito.variable} ${sourceSans.variable} [&_.font-heading]:font-[family-name:var(--font-nunito)] [&_.font-secondary]:font-[family-name:var(--font-source-sans)]`}
    >
      {children}
    </div>
  );
}
