import type { Metadata } from "next";
import SchoolDemoWebsiteFonts from "@/app/demo/_shared/SchoolDemoWebsiteFonts";
import { pageMetadata } from "@/lib/metadata";

export const metadata: Metadata = pageMetadata({
  title: "Coastal Sage Montessori Website Demo",
  description:
    "A private website redesign concept for Coastal Sage Montessori, a Christ-centered Montessori school for ages 3 to 15 and high school in Carlsbad, California.",
  path: "/demo/coastal-sage-montessori",
  noIndex: true,
});

export default function DemoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SchoolDemoWebsiteFonts>{children}</SchoolDemoWebsiteFonts>;
}
