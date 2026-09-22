import type { Metadata } from "next";
import { inter, manrope } from "@/lib/fonts";
import { pageMetadata } from "@/lib/metadata";

export const metadata: Metadata = pageMetadata({
  title: "Freedom Prep Academy Website Demo",
  description:
    "A concept admissions landing page for Freedom Prep Academy — an Arizona K–12 charter school with online, learning center, and microschool pathways.",
  path: "/demo/freedom-prep-academy",
  noIndex: true,
});

export default function FreedomPrepAcademyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className={`${manrope.variable} ${inter.variable} [&_.font-heading]:font-[family-name:var(--font-manrope)] [&_.font-secondary]:font-[family-name:var(--font-inter)]`}
    >
      {children}
    </div>
  );
}
