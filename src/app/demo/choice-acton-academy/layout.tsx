import type { Metadata } from "next";
import SchoolDemoWebsiteFonts from "@/app/demo/_shared/SchoolDemoWebsiteFonts";
import { pageMetadata } from "@/lib/metadata";

export const metadata: Metadata = pageMetadata({
  title: "CHOICE: An Acton Academy Website Demo",
  description:
    "A private website redesign concept for CHOICE: An Acton Academy, a learner-driven school for ages 4–14 in Woods Cross, Utah.",
  path: "/demo/choice-acton-academy",
  noIndex: true,
});

export default function DemoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SchoolDemoWebsiteFonts>{children}</SchoolDemoWebsiteFonts>;
}
