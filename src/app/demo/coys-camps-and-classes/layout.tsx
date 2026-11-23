import type { Metadata } from "next";
import SchoolDemoWebsiteFonts from "@/app/demo/_shared/SchoolDemoWebsiteFonts";
import { pageMetadata } from "@/lib/metadata";

export const metadata: Metadata = pageMetadata({
  title: "Coy's Camps And Classes Website Demo",
  description:
    "A private website redesign concept for Coy's Camps And Classes and its Prodigypreneurs K–8 microschool in Tucson, Arizona.",
  path: "/demo/coys-camps-and-classes",
  noIndex: true,
});

export default function DemoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SchoolDemoWebsiteFonts>{children}</SchoolDemoWebsiteFonts>;
}
