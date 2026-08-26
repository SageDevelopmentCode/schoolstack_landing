import type { Metadata } from "next";
import { dmSans, fraunces } from "@/lib/fonts";
import { pageMetadata } from "@/lib/metadata";

export const metadata: Metadata = pageMetadata({
  title: "Kat's Community Microschool Website Demo",
  description:
    "A concept admissions landing page for Kat's Community Microschool — a small, student-driven microschool in Phoenix for grades 3–6 with AZ ESA enrollment support.",
  path: "/demo/kats-community-microschool",
  noIndex: true,
});

export default function KatsCommunityMicroschoolLayout({
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
