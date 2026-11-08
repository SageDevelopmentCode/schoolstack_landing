import type { Metadata } from "next";
import SchoolDemoWebsiteFonts from "@/app/demo/_shared/SchoolDemoWebsiteFonts";
import { pageMetadata } from "@/lib/metadata";

export const metadata: Metadata = pageMetadata({
  title: "WonderHere Lakeland Website Demo",
  description:
    "A concept admissions landing page for WonderHere Lakeland — play-based, project-driven learning on a ten-acre farm in Lakeland, Florida.",
  path: "/demo/wonderhere-lakeland",
  noIndex: true,
});

export default function DemoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SchoolDemoWebsiteFonts>{children}</SchoolDemoWebsiteFonts>;
}
