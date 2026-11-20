import type { MarketingAdCopy, MarketingSlide } from "@/components/admin/marketing/carousels/types";

const NO_OFFER_CTA = "Book a MudKitchen demo.";

/** Offer tails on primaryText in /admin/marketing offer-toggle ad sets. */
const PRIMARY_OFFER_TAIL_PATTERNS: RegExp[] = [
  /Book a MudKitchen demo now, start a paid plan within 30 days, and get a \$200 Amazon gift card\. Terms apply\.\s*$/,
  /Book a MudKitchen demo, start a paid plan within 30 days, and get a \$200 Amazon gift card\. Terms apply\.\s*$/,
  /Book a demo before the break, start a paid plan within 30 days, and get a \$200 Amazon gift card\. Terms apply\.\s*$/,
  /Book a demo, start a paid plan within 30 days, and get a \$200 Amazon gift card\. Terms apply\.\s*$/,
  /Start a paid plan within 30 days of your demo and we'll send a \$200 Amazon gift card\. Terms apply\.\s*$/,
];

function primaryTextWithoutOffer(primaryText: string): string {
  for (const pattern of PRIMARY_OFFER_TAIL_PATTERNS) {
    if (pattern.test(primaryText)) {
      return primaryText.replace(pattern, NO_OFFER_CTA);
    }
  }
  return primaryText;
}

function descriptionWithoutOffer(description: string | undefined): string | undefined {
  if (!description) return undefined;
  if (/\$200|gift card/i.test(description)) return undefined;
  return description;
}

/** Paid-ad copy with gift-card language removed (matches no-offer PNG exports). */
export function marketingAdCopyWithoutOffer(copy: MarketingAdCopy): MarketingAdCopy {
  const primaryText = primaryTextWithoutOffer(copy.primaryText);
  const description = descriptionWithoutOffer(copy.description);
  return {
    primaryText,
    headline: copy.headline,
    ...(description ? { description } : {}),
  };
}

export function resolveMarketingAdCopy(slide: MarketingSlide, offerOff: boolean): MarketingAdCopy | undefined {
  if (!slide.adCopy) return undefined;
  if (!offerOff) return slide.adCopy;
  return marketingAdCopyWithoutOffer(slide.adCopy);
}