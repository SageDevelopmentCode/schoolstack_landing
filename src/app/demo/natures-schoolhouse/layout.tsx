import type { Metadata } from "next";
import SchoolDemoWebsiteFonts from "@/app/demo/_shared/SchoolDemoWebsiteFonts";
import { pageMetadata } from "@/lib/metadata";

export const metadata: Metadata = pageMetadata({
  title: "Nature's Schoolhouse Microschool Website Demo",
  description:
    "A concept admissions landing page for Nature's Schoolhouse Microschool — a nature-forward, flexible learning community in Cedar Park, Texas.",
  path: "/demo/natures-schoolhouse",
  noIndex: true,
});

export default function DemoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SchoolDemoWebsiteFonts>{children}</SchoolDemoWebsiteFonts>;
}
