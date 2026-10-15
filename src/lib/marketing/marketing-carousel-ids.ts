/** Keep in sync with `MARKETING_CAROUSELS` order in carousels/registry.ts */
export const MARKETING_CAROUSEL_IDS = [
  "tuition-review",
  "application-finish-line",
  "getting-ready-to-enroll",
  "where-was-that-update",
  "one-place-ad",
] as const;

export type MarketingCarouselId = (typeof MARKETING_CAROUSEL_IDS)[number];

const MARKETING_CAROUSEL_ID_SET = new Set<string>(MARKETING_CAROUSEL_IDS);

export function isMarketingCarouselId(id: string): id is MarketingCarouselId {
  return MARKETING_CAROUSEL_ID_SET.has(id);
}
