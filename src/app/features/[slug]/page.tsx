import type { Metadata } from "next";
import { notFound } from "next/navigation";
import BreadcrumbJsonLd from "@/components/seo/BreadcrumbJsonLd";
import FaqJsonLd from "@/components/seo/FaqJsonLd";
import StructuredData from "@/components/seo/StructuredData";
import GardenRoot from "@/components/garden/GardenRoot";
import FeatureDetailPage from "@/components/features-garden/FeatureDetailPage";
import { pageMetadata } from "@/lib/metadata";
import { buildBreadcrumbs, webPageJsonLd } from "@/lib/seo";
import { FEATURES_CONTENT_UPDATED } from "@/lib/marketing/features/rivals";
import { FEATURE_SLUGS, getFeature } from "@/lib/marketing/features";
import { FEATURES_PATH, featurePath } from "@/lib/marketing/features/paths";

type Params = Promise<{ slug: string }>;

export const dynamicParams = false;

export function generateStaticParams() {
  return FEATURE_SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const feature = getFeature((await params).slug);
  if (!feature) return {};
  return pageMetadata({
    title: feature.seo.title,
    description: feature.seo.description,
    path: featurePath(feature.slug),
  });
}

export default async function FeatureRoute({ params }: { params: Params }) {
  const feature = getFeature((await params).slug);
  if (!feature) notFound();
  const breadcrumbs = buildBreadcrumbs({ name: "Features", path: FEATURES_PATH }, { name: feature.name, path: featurePath(feature.slug) });
  return (
    <GardenRoot>
      <BreadcrumbJsonLd items={breadcrumbs} />
      <StructuredData
        data={webPageJsonLd({
          name: feature.seo.title,
          path: featurePath(feature.slug),
          description: feature.seo.description,
          dateModified: FEATURES_CONTENT_UPDATED,
        })}
      />
      {feature.faq.length ? <FaqJsonLd faqs={feature.faq} /> : null}
      <FeatureDetailPage key={feature.slug} slug={feature.slug} />
    </GardenRoot>
  );
}
