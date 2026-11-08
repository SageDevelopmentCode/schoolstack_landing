import type { Metadata } from "next";
import SchoolDemoWebsiteFonts from "@/app/demo/_shared/SchoolDemoWebsiteFonts";
import { pageMetadata } from "@/lib/metadata";

export const metadata: Metadata = pageMetadata({
  title: "Tapestry Academy | Microschool & Homeschool Programs in Boca Raton, FL",
  description:
    "Tapestry Academy offers flexible microschool and homeschool programs for Grades K–12 in East Boca Raton—personalized learning, hands-on projects, mentorship, and community.",
  path: "/demo/tapestry-academy",
  noIndex: true,
});

export default function DemoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SchoolDemoWebsiteFonts>{children}</SchoolDemoWebsiteFonts>;
}
