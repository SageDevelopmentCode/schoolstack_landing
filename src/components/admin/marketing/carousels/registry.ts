import { TUITION_REVIEW_CAROUSEL } from "@/components/admin/marketing/carousels/tuition-review";
import type { MarketingCarousel } from "@/components/admin/marketing/carousels/types";

export const MARKETING_CAROUSELS: MarketingCarousel[] = [TUITION_REVIEW_CAROUSEL];

export const DEFAULT_CAROUSEL_ID = MARKETING_CAROUSELS[0]?.id ?? "tuition-review";

export function getMarketingCarousel(id: string): MarketingCarousel | undefined {
  return MARKETING_CAROUSELS.find((carousel) => carousel.id === id);
}

export function resolveMarketingCarouselId(id: string | null | undefined): string {
  if (id && getMarketingCarousel(id)) return id;
  return DEFAULT_CAROUSEL_ID;
}
