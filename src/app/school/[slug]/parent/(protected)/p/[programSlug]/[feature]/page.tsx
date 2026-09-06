import type { Metadata } from "next";
import {
  generateSchoolParentFeatureMetadata,
  renderSchoolParentFeaturePage,
} from "@/lib/parent-portal/render-school-parent-feature-page";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ slug: string; programSlug: string; feature: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug, programSlug, feature } = await params;
  return generateSchoolParentFeatureMetadata({ slug, feature, programSlug });
}

export default async function SchoolProgramParentFeaturePage({
  params,
  searchParams,
}: PageProps) {
  const { slug, programSlug, feature } = await params;
  const resolvedSearchParams = await searchParams;
  return renderSchoolParentFeaturePage({
    slug,
    feature,
    programSlug,
    searchParams: resolvedSearchParams,
  });
}
