import type { Metadata } from "next";
import { dmSans, fraunces } from "@/lib/fonts";
import { pageMetadata } from "@/lib/metadata";

export const metadata: Metadata = pageMetadata({
  title: "Acton Academy Pittsburgh Website Demo",
  description:
    "A concept admissions landing page for Acton Academy Pittsburgh — a learner-driven private school in Wexford, Pennsylvania.",
  path: "/demo/acton-academy-pittsburgh",
  noIndex: true,
});

export default function ActonAcademyPittsburghLayout({
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
