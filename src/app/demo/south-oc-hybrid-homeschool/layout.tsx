import type { Metadata } from "next";
import SchoolDemoWebsiteFonts from "@/app/demo/_shared/SchoolDemoWebsiteFonts";
import { pageMetadata } from "@/lib/metadata";

export const metadata: Metadata = pageMetadata({
  title: "South OC Hybrid Homeschool Website Demo",
  description:
    "A private website redesign concept for South OC Hybrid Homeschool, a nonprofit hybrid homeschool program in Mission Viejo, California.",
  path: "/demo/south-oc-hybrid-homeschool",
  noIndex: true,
});

export default function DemoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SchoolDemoWebsiteFonts>{children}</SchoolDemoWebsiteFonts>;
}
