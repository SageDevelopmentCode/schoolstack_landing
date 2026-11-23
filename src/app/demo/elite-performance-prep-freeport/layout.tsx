import type { Metadata } from "next";
import SchoolDemoWebsiteFonts from "@/app/demo/_shared/SchoolDemoWebsiteFonts";
import { pageMetadata } from "@/lib/metadata";

export const metadata: Metadata = pageMetadata({
  title: "Elite Performance Prep Academy Freeport Website Demo",
  description:
    "A private website redesign concept for Elite Performance Prep Academy Freeport, a personalized K–8 microschool in Freeport, Florida.",
  path: "/demo/elite-performance-prep-freeport",
  noIndex: true,
});

export default function DemoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SchoolDemoWebsiteFonts>{children}</SchoolDemoWebsiteFonts>;
}
