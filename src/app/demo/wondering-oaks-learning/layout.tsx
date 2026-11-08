import type { Metadata } from "next";
import SchoolDemoWebsiteFonts from "@/app/demo/_shared/SchoolDemoWebsiteFonts";
import { pageMetadata } from "@/lib/metadata";

export const metadata: Metadata = pageMetadata({
  title: "Wondering Oaks Learning Website Demo",
  description:
    "A concept admissions landing page for Wondering Oaks Learning — a secular homeschool-away-from-home microschool in Conroe, Texas for ages 5–8.",
  path: "/demo/wondering-oaks-learning",
  noIndex: true,
});

export default function DemoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SchoolDemoWebsiteFonts>{children}</SchoolDemoWebsiteFonts>;
}
