import type { Metadata } from "next";
import { lato, nunito } from "@/lib/fonts";
import { pageMetadata } from "@/lib/metadata";

export const metadata: Metadata = pageMetadata({
  title: "Wild Hearts Adventure Co. Website Demo",
  description:
    "A concept admissions landing page for Wild Hearts Adventure Co. — a project-based, nature-centered learning community in Visalia, California.",
  path: "/demo/wild-hearts-adventure",
  noIndex: true,
});

export default function WildHeartsAdventureLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className={`${nunito.variable} ${lato.variable} [&_.font-heading]:font-[family-name:var(--font-nunito)] [&_.font-secondary]:font-[family-name:var(--font-lato)]`}
    >
      {children}
    </div>
  );
}
