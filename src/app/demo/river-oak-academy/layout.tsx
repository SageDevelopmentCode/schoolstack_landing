import type { Metadata } from "next";
import { dmSerifDisplay, inter } from "@/lib/fonts";
import { pageMetadata } from "@/lib/metadata";

export const metadata: Metadata = pageMetadata({
  title: "River Oak Academy Website Demo",
  description:
    "A concept admissions landing page for River Oak Academy — a learner-driven, nature-rich private school in St. Johns, Florida.",
  path: "/demo/river-oak-academy",
  noIndex: true,
});

export default function RiverOakAcademyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className={`${dmSerifDisplay.variable} ${inter.variable} [&_.font-heading]:font-[family-name:var(--font-dm-serif-display)] [&_.font-secondary]:font-[family-name:var(--font-inter)]`}
    >
      {children}
    </div>
  );
}
