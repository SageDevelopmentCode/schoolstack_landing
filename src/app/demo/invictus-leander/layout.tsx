import type { Metadata } from "next";
import SchoolDemoWebsiteFonts from "@/app/demo/_shared/SchoolDemoWebsiteFonts";
import { pageMetadata } from "@/lib/metadata";

export const metadata: Metadata = pageMetadata({
  title: "Invictus: An Acton Academy Website Demo",
  description:
    "A private website redesign concept for Invictus: An Acton Academy, a learner-driven private school for ages 3.5 to 11 near Leander, Liberty Hill and Georgetown, Texas.",
  path: "/demo/invictus-leander",
  noIndex: true,
});

export default function DemoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SchoolDemoWebsiteFonts>{children}</SchoolDemoWebsiteFonts>;
}
