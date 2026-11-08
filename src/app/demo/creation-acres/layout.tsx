import type { Metadata } from "next";
import SchoolDemoWebsiteFonts from "@/app/demo/_shared/SchoolDemoWebsiteFonts";
import { pageMetadata } from "@/lib/metadata";

export const metadata: Metadata = pageMetadata({
  title: "Creation Acres Montessori Website Demo",
  description:
    "A concept admissions landing page for Creation Acres Montessori — a Christ-centered Montessori microschool in Mint Hill, NC serving the Charlotte area.",
  path: "/demo/creation-acres",
  noIndex: true,
});

export default function DemoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SchoolDemoWebsiteFonts>{children}</SchoolDemoWebsiteFonts>;
}
