import type { Metadata } from "next";
import { dmSerifDisplay, sourceSans3 } from "@/lib/fonts";
import { pageMetadata } from "@/lib/metadata";

export const metadata: Metadata = pageMetadata({
  title: "The FOCUS Academy Website Demo",
  description:
    "A concept admissions landing page for The FOCUS Academy — a Memphis-area microschool for gifted and neurodivergent middle-school boys.",
  path: "/demo/the-focus-academy",
  noIndex: true,
});

export default function TheFocusAcademyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className={`${dmSerifDisplay.variable} ${sourceSans3.variable} [&_.font-heading]:font-[family-name:var(--font-dm-serif-display)] [&_.font-secondary]:font-[family-name:var(--font-source-sans)]`}
    >
      {children}
    </div>
  );
}
