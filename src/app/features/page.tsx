import type { Metadata } from "next";
import BreadcrumbJsonLd from "@/components/seo/BreadcrumbJsonLd";
import FaqJsonLd from "@/components/seo/FaqJsonLd";
import GardenRoot from "@/components/garden/GardenRoot";
import FeaturesGardenPage from "@/components/features-garden/FeaturesGardenPage";
import { pageMetadata } from "@/lib/metadata";
import { buildBreadcrumbs } from "@/lib/seo";
import { FEATURES_INDEX_COPY } from "@/lib/marketing/features/features-copy";
import { FEATURES_FAQ } from "@/lib/marketing/features/features-faq";
import { FEATURES_PATH } from "@/lib/marketing/features/paths";

export const metadata: Metadata = pageMetadata({
  title: FEATURES_INDEX_COPY.seoTitle,
  description: FEATURES_INDEX_COPY.seoDescription,
  path: FEATURES_PATH,
});

const BREADCRUMBS = buildBreadcrumbs({ name: "Features", path: FEATURES_PATH });

export default function FeaturesRoute() {
  return (
    <GardenRoot>
      <BreadcrumbJsonLd items={BREADCRUMBS} />
      {FEATURES_FAQ.length ? <FaqJsonLd faqs={FEATURES_FAQ} /> : null}
      <FeaturesGardenPage />
    </GardenRoot>
  );
}
