import type { Metadata } from "next";
import SchoolDemoWebsiteFonts from "@/app/demo/_shared/SchoolDemoWebsiteFonts";
import { pageMetadata } from "@/lib/metadata";

export const metadata: Metadata = pageMetadata({
  title: "Heartsong Cottage School Website Demo",
  description:
    "A private website redesign concept for Heartsong Cottage School, a Waldorf-inspired homeschool co-op in Highland, Utah.",
  path: "/demo/heartsong-cottage-school",
  noIndex: true,
});

export default function DemoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SchoolDemoWebsiteFonts>{children}</SchoolDemoWebsiteFonts>;
}
