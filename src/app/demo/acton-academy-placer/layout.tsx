import type { Metadata } from "next";
import { dmSans, fraunces } from "@/lib/fonts";
import { pageMetadata } from "@/lib/metadata";

export const metadata: Metadata = pageMetadata({
  title: "Acton Academy Placer Website Demo",
  description:
    "A concept admissions landing page for Acton Academy Placer — a learner-driven school in the Sacramento–Placer region with campuses in Roseville, Sacramento, and Rocklin.",
  path: "/demo/acton-academy-placer",
  noIndex: true,
});

export default function ActonAcademyPlacerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className={`${fraunces.variable} ${dmSans.variable} [&_.font-heading]:font-[family-name:var(--font-fraunces)] [&_.font-secondary]:font-[family-name:var(--font-dm-sans)]`}
    >
      {children}
    </div>
  );
}
