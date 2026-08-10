import type { Metadata } from "next";
import { fraunces, nunito } from "@/lib/fonts";
import { pageMetadata } from "@/lib/metadata";

export const metadata: Metadata = pageMetadata({
  title: "WonderHere Lakeland Website Demo",
  description:
    "A concept admissions landing page for WonderHere Lakeland — play-based, project-driven learning on a ten-acre farm in Lakeland, Florida.",
  path: "/demo/wonderhere-lakeland",
  noIndex: true,
});

export default function WonderHereLakelandLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className={`${fraunces.variable} ${nunito.variable} [&_.font-heading]:font-[family-name:var(--font-fraunces)] [&_.font-secondary]:font-[family-name:var(--font-nunito)]`}
    >
      {children}
    </div>
  );
}
