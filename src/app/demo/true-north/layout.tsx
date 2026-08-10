import type { Metadata } from "next";
import { montserrat, playfairDisplay } from "@/lib/fonts";
import { pageMetadata } from "@/lib/metadata";

export const metadata: Metadata = pageMetadata({
  title: "True North Website Demo",
  description:
    "A concept admissions landing page for True North — a Christian, biblically based parent partnership serving grades 1–12 in The Woodlands, TX.",
  path: "/demo/true-north",
  noIndex: true,
});

export default function TrueNorthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className={`${playfairDisplay.variable} ${montserrat.variable} [&_.font-heading]:font-[family-name:var(--font-playfair-display)] [&_.font-secondary]:font-[family-name:var(--font-montserrat)]`}
    >
      {children}
    </div>
  );
}
