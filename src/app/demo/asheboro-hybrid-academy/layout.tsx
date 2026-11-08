import type { Metadata } from "next";
import SchoolDemoWebsiteFonts from "@/app/demo/_shared/SchoolDemoWebsiteFonts";
import { pageMetadata } from "@/lib/metadata";

export const metadata: Metadata = pageMetadata({
  title: "Asheboro Hybrid Academy | Christian Hybrid School in Asheboro, NC",
  description:
    "Asheboro Hybrid Academy blends the joy of homeschooling with the structure of a traditional classroom. Explore elementary, middle, and high school hybrid learning in Asheboro, NC.",
  path: "/demo/asheboro-hybrid-academy",
  noIndex: true,
});

export default function DemoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SchoolDemoWebsiteFonts>{children}</SchoolDemoWebsiteFonts>;
}
