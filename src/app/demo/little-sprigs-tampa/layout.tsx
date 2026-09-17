import type { Metadata } from "next";
import { dmSans, fraunces } from "@/lib/fonts";
import { pageMetadata } from "@/lib/metadata";

export const metadata: Metadata = pageMetadata({
  title: "Little Sprigs of Tampa Website Demo",
  description:
    "A concept community landing page for Little Sprigs of Tampa — a play-based, child-led family meetup community in the Tampa Bay area, part of The Homeschool Village.",
  path: "/demo/little-sprigs-tampa",
  noIndex: true,
});

export default function LittleSprigsTampaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className={`${fraunces.variable} ${dmSans.variable} [&_.font-heading]:font-[family-name:var(--font-fraunces)] [&_.font-secondary]:font-[family-name:var(--font-dm-sans)]`}
    >
      {children}
    </div>
  );
}
