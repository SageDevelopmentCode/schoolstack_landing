import type { Metadata } from "next";
import SchoolDemoWebsiteFonts from "@/app/demo/_shared/SchoolDemoWebsiteFonts";
import { pageMetadata } from "@/lib/metadata";

export const metadata: Metadata = pageMetadata({
  title: "God's Little People Learning Academy Website Demo",
  description:
    "A private website redesign concept for God's Little People Learning Academy, a faith-based Pre-K–2nd grade microschool in Houston, Texas.",
  path: "/demo/gods-little-people-learning-academy",
  noIndex: true,
});

export default function DemoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SchoolDemoWebsiteFonts>{children}</SchoolDemoWebsiteFonts>;
}
