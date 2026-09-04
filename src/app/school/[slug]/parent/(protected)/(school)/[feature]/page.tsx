import type { Metadata } from "next";
import {
  generateSchoolParentFeatureMetadata,
  renderSchoolParentFeaturePage,
} from "@/lib/parent-portal/render-school-parent-feature-page";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ slug: string; feature: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug, feature } = await params;
  return generateSchoolParentFeatureMetadata({ slug, feature });
}

export default async function SchoolParentFeaturePage({
  params,
  searchParams,
}: PageProps) {
  const { slug, feature } = await params;
  const resolvedSearchParams = await searchParams;
  return renderSchoolParentFeaturePage({
    slug,
    feature,
    searchParams: resolvedSearchParams,
  });
}
