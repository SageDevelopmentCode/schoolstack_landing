import type { Metadata } from "next";
import { cormorantGaramond, inter } from "@/lib/fonts";
import { pageMetadata } from "@/lib/metadata";

export const metadata: Metadata = pageMetadata({
  title: "Family Lyceum Website Demo",
  description:
    "A concept admissions landing page for Family Lyceum — a hybrid private school in Clearfield, Utah with small classes, family-centered learning, and programs from FIREFLY through TORCH.",
  path: "/demo/family-lyceum",
  noIndex: true,
});

export default function FamilyLyceumLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className={`${cormorantGaramond.variable} ${inter.variable} [&_.font-heading]:font-[family-name:var(--font-cormorant)] [&_.font-secondary]:font-[family-name:var(--font-inter)]`}
    >
      {children}
    </div>
  );
}
