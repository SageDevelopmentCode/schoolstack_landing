import type { Metadata } from "next";
import SchoolDemoWebsiteFonts from "@/app/demo/_shared/SchoolDemoWebsiteFonts";
import { pageMetadata } from "@/lib/metadata";

export const metadata: Metadata = pageMetadata({
  title: "Arizona Gifted Academy Website Demo",
  description:
    "A concept admissions landing page for Arizona Gifted Academy — a boutique gifted microschool in Scottsdale, Arizona for PK–5 learners.",
  path: "/demo/arizona-gifted-academy",
  noIndex: true,
});

export default function DemoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SchoolDemoWebsiteFonts>{children}</SchoolDemoWebsiteFonts>;
}
