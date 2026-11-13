import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { ParentHomeLabVariant } from "@/components/school-parent/home/ParentHomePageShell";
import { renderSchoolParentFeaturePage } from "@/lib/parent-portal/render-school-parent-feature-page";

/**
 * TEMPORARY: side-by-side review of three parent Home redesigns.
 * /school/[slug]/parent/home-lab/a | b | c — same data as the live Home tab.
 * Delete this route and `src/components/school-parent/home-lab/` once one is picked.
 */
export const dynamic = "force-dynamic";

const VARIANTS: Record<ParentHomeLabVariant, string> = {
  a: "Home lab A · Today",
  b: "Home lab B · Board",
  c: "Home lab C · Timeline",
};

type PageProps = {
  params: Promise<{ slug: string; variant: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function isVariant(value: string): value is ParentHomeLabVariant {
  return value in VARIANTS;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { variant } = await params;
  return {
    title: isVariant(variant) ? VARIANTS[variant] : "Home lab",
    robots: { index: false, follow: false },
  };
}

export default async function SchoolParentHomeLabPage({ params, searchParams }: PageProps) {
  const { slug, variant } = await params;
  if (!isVariant(variant)) notFound();
  return renderSchoolParentFeaturePage({
    slug,
    feature: "portal",
    searchParams: await searchParams,
    homeVariant: variant,
  });
}
