import type { Metadata } from "next";
import GardenRoot from "@/components/garden/GardenRoot";
import GiftCardGardenPage from "@/components/gift-card-garden/GiftCardGardenPage";
import BreadcrumbJsonLd from "@/components/seo/BreadcrumbJsonLd";
import { GIFT_CARD_PAGE_PATH } from "@/lib/marketing/gift-card-offer";
import { pageMetadata } from "@/lib/metadata";
import { buildBreadcrumbs } from "@/lib/seo";

// A time-limited ad landing page: kept out of search results and the sitemap.
export const metadata: Metadata = pageMetadata({
  title: "Book a Demo, Get a $200 Amazon Gift Card",
  description:
    "Book a MudKitchen demo by December 31, 2026. Start a paid plan within 30 days of your demo and get a $200 Amazon gift card. Terms apply.",
  path: GIFT_CARD_PAGE_PATH,
  noIndex: true,
});

const BREADCRUMBS = buildBreadcrumbs({ name: "Gift Card Offer", path: GIFT_CARD_PAGE_PATH });

export default function GiftCardPage() {
  return (
    <>
      <BreadcrumbJsonLd items={BREADCRUMBS} />
      <GardenRoot>
        <GiftCardGardenPage />
      </GardenRoot>
    </>
  );
}
