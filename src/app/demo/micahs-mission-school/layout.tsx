import type { Metadata } from "next";
import SchoolDemoWebsiteFonts from "@/app/demo/_shared/SchoolDemoWebsiteFonts";
import { pageMetadata } from "@/lib/metadata";

export const metadata: Metadata = pageMetadata({
  title: "Micah's Mission School Website Demo",
  description:
    "A concept admissions landing page for Micah's Mission School, Inc. — a faith-based K–12 hybrid learning and resource center in Vicksburg, Mississippi.",
  path: "/demo/micahs-mission-school",
  noIndex: true,
});

export default function DemoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SchoolDemoWebsiteFonts>{children}</SchoolDemoWebsiteFonts>;
}
