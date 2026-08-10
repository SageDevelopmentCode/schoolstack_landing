import type { Metadata } from "next";
import { lato, playfairDisplay } from "@/lib/fonts";
import { pageMetadata } from "@/lib/metadata";

export const metadata: Metadata = pageMetadata({
  title: "Micah's Mission School Website Demo",
  description:
    "A concept admissions landing page for Micah's Mission School, Inc. — a faith-based K–12 hybrid learning and resource center in Vicksburg, Mississippi.",
  path: "/demo/micahs-mission-school",
  noIndex: true,
});

export default function MicahsMissionSchoolLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className={`${playfairDisplay.variable} ${lato.variable} [&_.font-heading]:font-[family-name:var(--font-playfair-display)] [&_.font-secondary]:font-[family-name:var(--font-lato)]`}
    >
      {children}
    </div>
  );
}
