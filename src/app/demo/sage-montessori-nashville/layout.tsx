import type { Metadata } from "next";
import SchoolDemoWebsiteFonts from "@/app/demo/_shared/SchoolDemoWebsiteFonts";
import { pageMetadata } from "@/lib/metadata";

export const metadata: Metadata = pageMetadata({
  title: "Sage Montessori School of Nashville Website Demo",
  description:
    "A private website redesign concept for Sage Montessori School of Nashville, a Wildflower Montessori school for ages 3–6 in downtown Nashville.",
  path: "/demo/sage-montessori-nashville",
  noIndex: true,
});

export default function DemoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SchoolDemoWebsiteFonts>{children}</SchoolDemoWebsiteFonts>;
}
