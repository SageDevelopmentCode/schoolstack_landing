import { notFound } from "next/navigation";
import SchoolDemoShell from "@/components/demo/SchoolDemoShell";
import { DEMO_ROUTES } from "@/data/school-demos/demo-routes";

// Only the slugs in DEMO_ROUTES exist; anything else is a 404.
export const dynamicParams = false;

export function generateStaticParams() {
  return Object.keys(DEMO_ROUTES).map((slug) => ({ slug }));
}

export default async function SchoolDemoPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const demo = DEMO_ROUTES[slug];
  if (!demo) notFound();

  return (
    <SchoolDemoShell
      config={demo.config}
      schoolName={demo.schoolName}
      steps={demo.steps}
    />
  );
}
