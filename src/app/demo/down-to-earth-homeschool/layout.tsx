import type { Metadata } from "next";
import SchoolDemoWebsiteFonts from "@/app/demo/_shared/SchoolDemoWebsiteFonts";
import { pageMetadata } from "@/lib/metadata";

export const metadata: Metadata = pageMetadata({
  title: "Down to Earth Co-op Website Demo",
  description:
    "A private website redesign concept for Down to Earth Co-op, a Christian homeschool co-op for grades K–8 in Lighthouse Point, Florida.",
  path: "/demo/down-to-earth-homeschool",
  noIndex: true,
});

export default function DemoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SchoolDemoWebsiteFonts>{children}</SchoolDemoWebsiteFonts>;
}
