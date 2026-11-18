import type { Metadata } from "next";
import BreadcrumbJsonLd from "@/components/seo/BreadcrumbJsonLd";
import GardenRoot from "@/components/garden/GardenRoot";
import GiftCardTermsGardenPage from "@/components/gift-card-garden/GiftCardTermsGardenPage";
import { GIFT_CARD_PROMOTION_TERMS } from "@/content/legal/gift-card-promotion";
import { GIFT_CARD_TERMS_PATH } from "@/lib/marketing/gift-card-offer";
import { pageMetadata } from "@/lib/metadata";
import { buildBreadcrumbs } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Gift Card Offer Terms",
  description: "Terms for the MudKitchen $200 Amazon gift card offer.",
  path: GIFT_CARD_TERMS_PATH,
  noIndex: true,
});

const BREADCRUMBS = buildBreadcrumbs({ name: "Gift Card Offer Terms", path: GIFT_CARD_TERMS_PATH });

export default function GiftCardTermsPage() {
  return (
    <>
      <BreadcrumbJsonLd items={BREADCRUMBS} />
      <GardenRoot>
        <GiftCardTermsGardenPage document={GIFT_CARD_PROMOTION_TERMS} />
      </GardenRoot>
    </>
  );
}
