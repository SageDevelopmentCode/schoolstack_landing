import type { Metadata } from "next";
import { inter, libreBaskerville } from "@/lib/fonts";
import { pageMetadata } from "@/lib/metadata";

export const metadata: Metadata = pageMetadata({
  title: "Brazos Valley Honor Academy Website Demo",
  description:
    "A concept admissions landing page for Brazos Valley Honor Academy — a Christian homeschool hybrid in Navasota, Texas serving K–7 students.",
  path: "/demo/brazos-valley-honor-academy",
  noIndex: true,
});

export default function BrazosValleyHonorAcademyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className={`${libreBaskerville.variable} ${inter.variable} [&_.font-heading]:font-[family-name:var(--font-libre-baskerville)] [&_.font-secondary]:font-[family-name:var(--font-inter)]`}
    >
      {children}
    </div>
  );
}
