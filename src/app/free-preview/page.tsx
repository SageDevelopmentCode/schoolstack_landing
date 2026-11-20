import type { Metadata } from "next";
import GardenRoot from "@/components/garden/GardenRoot";
import FreePreviewPage from "@/components/free-preview/FreePreviewPage";
import { FREE_PREVIEW_COPY, FREE_PREVIEW_PAGE_PATH } from "@/components/free-preview/free-preview-copy";
import BreadcrumbJsonLd from "@/components/seo/BreadcrumbJsonLd";
import { pageMetadata } from "@/lib/metadata";
import { buildBreadcrumbs } from "@/lib/seo";

// Ad landing page: kept out of search results and the sitemap, like /gift-card.
export const metadata: Metadata = pageMetadata({
  title: FREE_PREVIEW_COPY.meta.title,
  description: FREE_PREVIEW_COPY.meta.description,
  path: FREE_PREVIEW_PAGE_PATH,
  noIndex: true,
});

const BREADCRUMBS = buildBreadcrumbs({ name: "Free Preview", path: FREE_PREVIEW_PAGE_PATH });

export default function FreePreviewRoute() {
  return (
    <>
      <BreadcrumbJsonLd items={BREADCRUMBS} />
      <GardenRoot>
        <FreePreviewPage />
      </GardenRoot>
    </>
  );
}
