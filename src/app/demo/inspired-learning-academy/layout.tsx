import type { Metadata } from "next";
import { inter } from "@/lib/fonts";
import { pageMetadata } from "@/lib/metadata";

export const metadata: Metadata = pageMetadata({
  title: "Inspired Learning Academy | Hybrid Microschool in Allen, TX",
  description:
    "Unofficial concept preview. A hybrid microschool for grades 6–12 in Allen, TX. Three campus days, two remote days, and mentorship that supports ownership, confidence, and growth.",
  path: "/demo/inspired-learning-academy",
  noIndex: true,
});

export default function InspiredLearningAcademyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className={`${inter.variable} [&_.font-heading]:font-[family-name:var(--font-inter)] [&_.font-secondary]:font-[family-name:var(--font-inter)]`}
    >
      {children}
    </div>
  );
}
