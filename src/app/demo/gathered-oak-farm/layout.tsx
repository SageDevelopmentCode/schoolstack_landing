import type { Metadata } from "next";
import SchoolDemoWebsiteFonts from "@/app/demo/_shared/SchoolDemoWebsiteFonts";
import { pageMetadata } from "@/lib/metadata";

export const metadata: Metadata = pageMetadata({
  title: "Gathered Oak Farm Website Demo",
  description:
    "A concept admissions landing page for Gathered Oak Farm — a nature- and farm-based microschool in Fallbrook, California, where children learn through hands-on discovery and community.",
  path: "/demo/gathered-oak-farm",
  noIndex: true,
});

export default function DemoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SchoolDemoWebsiteFonts>{children}</SchoolDemoWebsiteFonts>;
}
