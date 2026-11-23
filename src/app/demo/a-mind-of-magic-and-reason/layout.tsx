import type { Metadata } from "next";
import SchoolDemoWebsiteFonts from "@/app/demo/_shared/SchoolDemoWebsiteFonts";
import { pageMetadata } from "@/lib/metadata";

export const metadata: Metadata = pageMetadata({
  title: "A Mind of Magic and Reason Website Demo",
  description:
    "A private website redesign concept for A Mind of Magic and Reason Learning Center, a secular K–8 microschool in Tucson, Arizona.",
  path: "/demo/a-mind-of-magic-and-reason",
  noIndex: true,
});

export default function DemoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SchoolDemoWebsiteFonts>{children}</SchoolDemoWebsiteFonts>;
}
