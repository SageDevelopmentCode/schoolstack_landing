import type { Metadata } from "next";
import SchoolDemoWebsiteFonts from "@/app/demo/_shared/SchoolDemoWebsiteFonts";
import { pageMetadata } from "@/lib/metadata";

export const metadata: Metadata = pageMetadata({
  title: "Kinder Academy Prep School Website Demo",
  description:
    "A concept admissions landing page for Kinder Academy Prep School — a private early-childhood microschool in Georgetown, Texas for ages 4–8 and K–3 with personalized, play-based learning.",
  path: "/demo/kinder-academy-prep-school",
  noIndex: true,
});

export default function DemoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SchoolDemoWebsiteFonts>{children}</SchoolDemoWebsiteFonts>;
}
