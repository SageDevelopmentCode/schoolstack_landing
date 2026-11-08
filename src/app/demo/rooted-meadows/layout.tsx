import type { Metadata } from "next";
import SchoolDemoWebsiteFonts from "@/app/demo/_shared/SchoolDemoWebsiteFonts";
import { pageMetadata } from "@/lib/metadata";

export const metadata: Metadata = pageMetadata({
  title: "Rooted Meadows Website Demo",
  description:
    "A concept admissions landing page for Rooted Meadows Waldorf School — a Waldorf-guided micro-school serving grades K–8 in the Greater Idaho Falls area.",
  path: "/demo/rooted-meadows",
  noIndex: true,
});

export default function DemoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SchoolDemoWebsiteFonts>{children}</SchoolDemoWebsiteFonts>;
}
