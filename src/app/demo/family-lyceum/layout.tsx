import type { Metadata } from "next";
import SchoolDemoWebsiteFonts from "@/app/demo/_shared/SchoolDemoWebsiteFonts";
import { pageMetadata } from "@/lib/metadata";

export const metadata: Metadata = pageMetadata({
  title: "Family Lyceum Website Demo",
  description:
    "A concept admissions landing page for Family Lyceum — a hybrid private school in Clearfield, Utah with small classes, family-centered learning, and programs from FIREFLY through TORCH.",
  path: "/demo/family-lyceum",
  noIndex: true,
});

export default function DemoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SchoolDemoWebsiteFonts>{children}</SchoolDemoWebsiteFonts>;
}
