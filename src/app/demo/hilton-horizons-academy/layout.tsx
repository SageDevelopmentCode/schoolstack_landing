import type { Metadata } from "next";
import SchoolDemoWebsiteFonts from "@/app/demo/_shared/SchoolDemoWebsiteFonts";
import { pageMetadata } from "@/lib/metadata";

export const metadata: Metadata = pageMetadata({
  title: "Hilton Horizons Academy Website Demo",
  description:
    "A concept admissions landing page for Hilton Horizons Academy — project-based K–12 education across Category III private school and hybrid microschool pathways in the Tri-Cities.",
  path: "/demo/hilton-horizons-academy",
  noIndex: true,
});

export default function DemoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SchoolDemoWebsiteFonts>{children}</SchoolDemoWebsiteFonts>;
}
