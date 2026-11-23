import type { Metadata } from "next";
import SchoolDemoWebsiteFonts from "@/app/demo/_shared/SchoolDemoWebsiteFonts";
import { pageMetadata } from "@/lib/metadata";

export const metadata: Metadata = pageMetadata({
  title: "Blue Horizon Studio Website Demo",
  description:
    "A private website redesign concept for Blue Horizon Studio, a boutique grades 3–8 microschool opening in Lathrop/Manteca, California.",
  path: "/demo/blue-horizon-studio",
  noIndex: true,
});

export default function DemoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SchoolDemoWebsiteFonts>{children}</SchoolDemoWebsiteFonts>;
}
