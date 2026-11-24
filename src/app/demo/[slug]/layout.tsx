import type { Metadata } from "next";
import SchoolDemoWebsiteFonts from "@/app/demo/_shared/SchoolDemoWebsiteFonts";
import { DEMO_ROUTES } from "@/data/school-demos/demo-routes";
import { pageMetadata } from "@/lib/metadata";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const demo = DEMO_ROUTES[slug];
  if (!demo) return {};

  return pageMetadata({
    title: demo.title,
    description: demo.description,
    path: `/demo/${slug}`,
    noIndex: true,
  });
}

export default function DemoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SchoolDemoWebsiteFonts>{children}</SchoolDemoWebsiteFonts>;
}
