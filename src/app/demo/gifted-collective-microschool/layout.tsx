import type { Metadata } from "next";
import SchoolDemoWebsiteFonts from "@/app/demo/_shared/SchoolDemoWebsiteFonts";
import { pageMetadata } from "@/lib/metadata";

export const metadata: Metadata = pageMetadata({
  title: "Gifted Microschool at The Gifted Collective Website Demo",
  description:
    "A private website redesign concept for the Gifted Microschool at The Gifted Collective in Phoenix, Arizona.",
  path: "/demo/gifted-collective-microschool",
  noIndex: true,
});

export default function DemoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SchoolDemoWebsiteFonts>{children}</SchoolDemoWebsiteFonts>;
}
