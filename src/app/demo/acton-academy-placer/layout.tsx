import type { Metadata } from "next";
import SchoolDemoWebsiteFonts from "@/app/demo/_shared/SchoolDemoWebsiteFonts";
import { pageMetadata } from "@/lib/metadata";

export const metadata: Metadata = pageMetadata({
  title: "Acton Academy Placer Website Demo",
  description:
    "A concept admissions landing page for Acton Academy Placer — a learner-driven school in the Sacramento–Placer region with campuses in Roseville, Sacramento, and Rocklin.",
  path: "/demo/acton-academy-placer",
  noIndex: true,
});

export default function DemoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SchoolDemoWebsiteFonts>{children}</SchoolDemoWebsiteFonts>;
}
