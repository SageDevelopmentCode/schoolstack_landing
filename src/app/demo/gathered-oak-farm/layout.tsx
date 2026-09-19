import type { Metadata } from "next";
import { fraunces, nunitoSans } from "@/lib/fonts";
import { pageMetadata } from "@/lib/metadata";

export const metadata: Metadata = pageMetadata({
  title: "Gathered Oak Farm Website Demo",
  description:
    "A concept admissions landing page for Gathered Oak Farm — a nature- and farm-based microschool in Fallbrook, California, where children learn through hands-on discovery and community.",
  path: "/demo/gathered-oak-farm",
  noIndex: true,
});

export default function GatheredOakFarmLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className={`${fraunces.variable} ${nunitoSans.variable} [&_.font-heading]:font-[family-name:var(--font-fraunces)] [&_.font-secondary]:font-[family-name:var(--font-nunito-sans)]`}
    >
      {children}
    </div>
  );
}
