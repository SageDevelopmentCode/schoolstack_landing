import type { Metadata } from "next";
import BreadcrumbJsonLd from "@/components/seo/BreadcrumbJsonLd";
import GardenRoot from "@/components/garden/GardenRoot";
import CompareIndexPage from "@/components/compare-garden/CompareIndexPage";
import { COMPARE_INDEX_COPY } from "@/components/compare-garden/compare-copy";
import { pageMetadata } from "@/lib/metadata";
import { COMPARE_PATH } from "@/lib/marketing/compare";
import { buildBreadcrumbs } from "@/lib/seo";

export const metadata: Metadata = {
  ...pageMetadata({
    title: COMPARE_INDEX_COPY.seoTitle,
    description: COMPARE_INDEX_COPY.seoDescription,
    path: COMPARE_PATH,
  }),
  title: { absolute: COMPARE_INDEX_COPY.seoTitle },
};

const BREADCRUMBS = buildBreadcrumbs({ name: "Compare", path: COMPARE_PATH });

export default function CompareRoute() {
  return (
    <GardenRoot>
      <BreadcrumbJsonLd items={BREADCRUMBS} />
      <CompareIndexPage />
    </GardenRoot>
  );
}
