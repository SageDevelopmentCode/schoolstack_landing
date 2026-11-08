import type { Metadata } from "next";
import SchoolDemoWebsiteFonts from "@/app/demo/_shared/SchoolDemoWebsiteFonts";
import { pageMetadata } from "@/lib/metadata";

export const metadata: Metadata = pageMetadata({
  title: "Little Sprigs of Tampa Website Demo",
  description:
    "A concept community landing page for Little Sprigs of Tampa — a play-based, child-led family meetup community in the Tampa Bay area, part of The Homeschool Village.",
  path: "/demo/little-sprigs-tampa",
  noIndex: true,
});

export default function DemoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SchoolDemoWebsiteFonts>{children}</SchoolDemoWebsiteFonts>;
}
