import { APPLICATION_FINISH_LINE_CAROUSEL } from "@/components/admin/marketing/carousels/application-finish-line";
import { GETTING_READY_TO_ENROLL_CAROUSEL } from "@/components/admin/marketing/carousels/getting-ready-to-enroll";
import { TUITION_REVIEW_CAROUSEL } from "@/components/admin/marketing/carousels/tuition-review";
import { WHERE_WAS_THAT_UPDATE_CAROUSEL } from "@/components/admin/marketing/carousels/where-was-that-update";
import type { MarketingCarousel } from "@/components/admin/marketing/carousels/types";

export const MARKETING_CAROUSELS: MarketingCarousel[] = [
  TUITION_REVIEW_CAROUSEL,
  APPLICATION_FINISH_LINE_CAROUSEL,
  GETTING_READY_TO_ENROLL_CAROUSEL,
  WHERE_WAS_THAT_UPDATE_CAROUSEL,
];

export const DEFAULT_CAROUSEL_ID = MARKETING_CAROUSELS[0]?.id ?? "tuition-review";

export function getMarketingCarousel(id: string): MarketingCarousel | undefined {
  return MARKETING_CAROUSELS.find((carousel) => carousel.id === id);
}

export function resolveMarketingCarouselId(id: string | null | undefined): string {
  if (id && getMarketingCarousel(id)) return id;
  return DEFAULT_CAROUSEL_ID;
}
