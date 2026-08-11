import type { Metadata } from "next";
import { dmSerifDisplay, openSans } from "@/lib/fonts";
import { pageMetadata } from "@/lib/metadata";

export const metadata: Metadata = pageMetadata({
  title: "Luff Learning Website Demo",
  description:
    "A concept admissions landing page for Luff Learning Fine Arts Academy — a secular fine arts academy and virtual microschool in Spring, Texas.",
  path: "/demo/luff-learning",
  noIndex: true,
});

export default function LuffLearningLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className={`${dmSerifDisplay.variable} ${openSans.variable} [&_.font-heading]:font-[family-name:var(--font-dm-serif-display)] [&_.font-secondary]:font-[family-name:var(--font-open-sans)]`}
    >
      {children}
    </div>
  );
}
