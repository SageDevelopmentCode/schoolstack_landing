import type { Metadata } from "next";
import SchoolDemoWebsiteFonts from "@/app/demo/_shared/SchoolDemoWebsiteFonts";
import { pageMetadata } from "@/lib/metadata";

export const metadata: Metadata = pageMetadata({
  title: "Spyrja Academy of New Braunfels Website Demo",
  description:
    "A private website redesign concept for Spyrja Academy of New Braunfels, a year-round microschool for 6th–12th grade in New Braunfels, Texas.",
  path: "/demo/spyrja-academy-new-braunfels",
  noIndex: true,
});

export default function DemoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SchoolDemoWebsiteFonts>{children}</SchoolDemoWebsiteFonts>;
}
