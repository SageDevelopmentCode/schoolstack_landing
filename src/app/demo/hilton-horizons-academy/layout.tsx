import type { Metadata } from "next";
import { nunito, sourceSans3 } from "@/lib/fonts";
import { pageMetadata } from "@/lib/metadata";

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
      className={`${nunito.variable} ${sourceSans3.variable} [&_.font-heading]:font-[family-name:var(--font-nunito)] [&_.font-secondary]:font-[family-name:var(--font-source-sans)]`}
    >
      {children}
    </div>
  );
}
