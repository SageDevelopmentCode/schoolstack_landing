import type { Metadata } from "next";
import { dmSerifDisplay, sourceSans3 } from "@/lib/fonts";
import { pageMetadata } from "@/lib/metadata";

export const metadata: Metadata = pageMetadata({
  title: "Asheboro Hybrid Academy | Christian Hybrid School in Asheboro, NC",
  description:
    "Asheboro Hybrid Academy blends the joy of homeschooling with the structure of a traditional classroom. Explore elementary, middle, and high school hybrid learning in Asheboro, NC.",
  path: "/demo/asheboro-hybrid-academy",
  noIndex: true,
});

export default function AsheboroHybridAcademyLayout({
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
