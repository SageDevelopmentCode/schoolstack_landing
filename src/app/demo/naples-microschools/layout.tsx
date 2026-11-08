import type { Metadata } from "next";
import SchoolDemoWebsiteFonts from "@/app/demo/_shared/SchoolDemoWebsiteFonts";
import { pageMetadata } from "@/lib/metadata";

export const metadata: Metadata = pageMetadata({
  title: "Naples MicroSchools Website Demo",
  description:
    "A concept admissions landing page for Naples MicroSchools — a nature-immersive homeschool partner on a working farm in Golden Gate Estates, Florida.",
  path: "/demo/naples-microschools",
  noIndex: true,
});

export default function DemoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SchoolDemoWebsiteFonts>{children}</SchoolDemoWebsiteFonts>;
}
