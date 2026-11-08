import type { Metadata } from "next";
import SchoolDemoWebsiteFonts from "@/app/demo/_shared/SchoolDemoWebsiteFonts";
import { pageMetadata } from "@/lib/metadata";

export const metadata: Metadata = pageMetadata({
  title: "Roots and Wings Microschool Website Demo",
  description:
    "A concept admissions landing page for Roots and Wings Microschool — a small, private microschool in North Mesa led by a state-certified teacher with personalized K–8 learning.",
  path: "/demo/roots-and-wings-microschool",
  noIndex: true,
});

export default function DemoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SchoolDemoWebsiteFonts>{children}</SchoolDemoWebsiteFonts>;
}
