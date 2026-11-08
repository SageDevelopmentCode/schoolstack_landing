import type { Metadata } from "next";
import SchoolDemoWebsiteFonts from "@/app/demo/_shared/SchoolDemoWebsiteFonts";
import { pageMetadata } from "@/lib/metadata";

export const metadata: Metadata = pageMetadata({
  title: "Athena Micro-academy Website Demo",
  description:
    "A concept admissions landing page for Athena Micro-academy of Austin — a relationship-centered microschool for grades 6–12 in South Austin.",
  path: "/demo/athena-microacademy",
  noIndex: true,
});

export default function DemoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SchoolDemoWebsiteFonts>{children}</SchoolDemoWebsiteFonts>;
}
