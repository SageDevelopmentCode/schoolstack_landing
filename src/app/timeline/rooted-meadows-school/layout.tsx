import type { Metadata } from "next";
import { cormorantGaramond, sourceSans3 } from "@/lib/fonts";
import { pageMetadata } from "@/lib/metadata";

export const metadata: Metadata = pageMetadata({
  title: "Rooted Meadows Rollout Timeline",
  description:
    "A phased rollout plan for Rooted Meadows Waldorf School — admin, admissions, tuition, committees, teacher portal, and parent experience on MudKitchen.",
  path: "/timeline/rooted-meadows-school",
  noIndex: true,
});

export default function RootedMeadowsTimelineLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className={`${cormorantGaramond.variable} ${sourceSans3.variable} min-h-screen bg-[#FAF8F4] font-[family-name:var(--font-source-sans)] text-[#2b2a26] [&_.font-heading]:font-[family-name:var(--font-cormorant)] [&_.font-secondary]:font-[family-name:var(--font-source-sans)]`}
    >
      {children}
    </div>
  );
}
