import type { Metadata } from "next";
import SchoolDemoWebsiteFonts from "@/app/demo/_shared/SchoolDemoWebsiteFonts";
import { pageMetadata } from "@/lib/metadata";

export const metadata: Metadata = pageMetadata({
  title: "Zoe Learning House Website Demo",
  description:
    "A concept admissions landing page for Zoe Learning House — a holistic Christian K–5 microschool in Greater New Orleans with flexible 1–5 day options.",
  path: "/demo/zoe-learning-house",
  noIndex: true,
});

export default function DemoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SchoolDemoWebsiteFonts>{children}</SchoolDemoWebsiteFonts>;
}
