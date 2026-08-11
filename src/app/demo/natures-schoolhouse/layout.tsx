import type { Metadata } from "next";
import { cormorantGaramond, raleway } from "@/lib/fonts";
import { pageMetadata } from "@/lib/metadata";

export const metadata: Metadata = pageMetadata({
  title: "Nature's Schoolhouse Microschool Website Demo",
  description:
    "A concept admissions landing page for Nature's Schoolhouse Microschool — a nature-forward, flexible learning community in Cedar Park, Texas.",
  path: "/demo/natures-schoolhouse",
  noIndex: true,
});

export default function NaturesSchoolhouseLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className={`${cormorantGaramond.variable} ${raleway.variable} [&_.font-heading]:font-[family-name:var(--font-cormorant)] [&_.font-secondary]:font-[family-name:var(--font-raleway)]`}
    >
      {children}
    </div>
  );
}
