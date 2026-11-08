import type { Metadata } from "next";
import SchoolDemoWebsiteFonts from "@/app/demo/_shared/SchoolDemoWebsiteFonts";
import { pageMetadata } from "@/lib/metadata";

export const metadata: Metadata = pageMetadata({
  title: "The Woodlands Microschool Website Demo",
  description:
    "A concept admissions landing page for The Woodlands Microschool — an accredited private microschool in Conroe, Texas with a distinctive four-hour day.",
  path: "/demo/the-woodlands-microschool",
  noIndex: true,
});

export default function DemoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SchoolDemoWebsiteFonts>{children}</SchoolDemoWebsiteFonts>;
}
