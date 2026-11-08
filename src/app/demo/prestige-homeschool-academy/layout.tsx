import type { Metadata } from "next";
import SchoolDemoWebsiteFonts from "@/app/demo/_shared/SchoolDemoWebsiteFonts";
import { pageMetadata } from "@/lib/metadata";

export const metadata: Metadata = pageMetadata({
  title: "Prestige Homeschool Academy Website Demo",
  description:
    "A concept admissions landing page for Prestige Homeschool Academy — project-based homeschool education with small-group learning in Niceville, Florida.",
  path: "/demo/prestige-homeschool-academy",
  noIndex: true,
});

export default function DemoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SchoolDemoWebsiteFonts>{children}</SchoolDemoWebsiteFonts>;
}
