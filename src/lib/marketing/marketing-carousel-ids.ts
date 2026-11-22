/** Keep in sync with `MARKETING_CAROUSELS` order in carousels/registry.ts */
export const MARKETING_CAROUSEL_IDS = [
  "tuition-review",
  "application-finish-line",
  "getting-ready-to-enroll",
  "where-was-that-update",
  "one-place-ad",
  "mascot-pip-enrollment",
  "mascot-nutmeg-tuition",
  "mascot-dig-admin",
  "mascot-terra-website",
  "mascot-fennel-attendance",
  "mascot-clover-timeclock",
  "mascot-marigold-marketing",
  "mascot-loam-messages",
  "mascot-dot-calendar",
  "mascot-bramble-forms",
  "mascot-crew-singles",
  "mascot-guided-setup",
  "mascot-family-first-week",
  "mascot-founder-week",
  "mascot-flicker-tansy-community",
  "mascot-holiday-program",
  "mascot-spring-enrollment-plan",
  "mascot-free-preview",
  "mascot-free-preview-before-after",
  "mascot-founder-letter",
  "mascot-preview-im-so-sorry",
  "mascot-preview-every-seat",
  "posts-weekly-singles",
  "posts-holiday-singles",
  "posts-free-preview-singles",
  "posts-crew-chat",
  "ads-holiday-gift",
  "ads-gift-thanksgiving-break",
  "ads-winter-break",
  "ads-crew-humor",
  "ads-pain-proof",
  "ads-feature-spotlight",
  "ads-new-year",
  "ads-free-preview",
  "ads-founder-notes",
  "ads-school-objects",
  "ads-preview-bundle",
  "ads-founder-julius",
  "ads-preview-seasonal",
  "ads-preview-thanksgiving",
  "ads-preview-thanksgiving-break",
  "ads-crew-chat",
] as const;

export type MarketingCarouselId = (typeof MARKETING_CAROUSEL_IDS)[number];

const MARKETING_CAROUSEL_ID_SET = new Set<string>(MARKETING_CAROUSEL_IDS);

export function isMarketingCarouselId(id: string): id is MarketingCarouselId {
  return MARKETING_CAROUSEL_ID_SET.has(id);
}
