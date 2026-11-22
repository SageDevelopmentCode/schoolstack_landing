import type { ReactNode } from "react";
import type { SlideSize } from "@/components/admin/marketing/slide-frame";

/*
 * Copy budget: every word on an ad or post has to earn its place. People scan feeds; Meta favours images with little text.
 *
 * On the image
 * - One idea per image. Headline ≤ 8 words (10 at most).
 * - At most ONE support line (`sub` or `hand`, not both), ≤ 10 words, saying something the headline doesn't.
 * - Lists / checklists: ≤ 4 rows, labels ≤ 4 words, no second "detail" line.
 * - Letters, notes, emails, texts: ≤ 3 short lines (~12 words each) plus the sign-off.
 * - Swipe-carousel content slides: `body` ≤ 14 words, or none when the title already says it.
 * - The logo pill already says "for microschools": don't repeat the audience on the image.
 *
 * Captions (`adCopy` / `adCopyVariants`)
 * - Hook + payoff inside the first 125 characters of `primaryText` (the rest hides behind "See more").
 * - ~3 short sentences before the offer tail; emoji lists ≤ 4 rows.
 * - `headline` ≤ 40 characters (aim for ≤ 27). `description` ≤ 25 characters, or leave it out.
 * - Offer tails stay word-for-word so `marketingAdCopyWithoutOffer` can strip them (see src/lib/marketing/marketing-ad-copy.ts).
 */

/** Text that goes next to the image in Meta Ads Manager (or the LinkedIn post box). */
export type MarketingAdCopy = {
  /** Short name for this version's angle (1–3 words), shown on the Studio's version switch. */
  label?: string;
  /** Body text above the image. Lead with the offer; the first ~125 characters show before "See more". */
  primaryText: string;
  /** Bold line under the image. Aim for 40 characters or fewer. */
  headline: string;
  /** Smaller line under the headline (often hidden on mobile). */
  description?: string;
};

export type MarketingSlide = {
  id: string;
  fileName: string;
  render: () => ReactNode;
  /** Paid ads only: copy to paste into the ad manager alongside this image. */
  adCopy?: MarketingAdCopy;
  /** Other caption versions for the same image (different angles). The Studio lets you switch between them; `adCopy` stays version 1. */
  adCopyVariants?: MarketingAdCopy[];
};

export type MarketingCarousel = {
  id: string;
  title: string;
  description?: string;
  fileSlug: string;
  /**
   * Leave unset for a swipe carousel (slide 1 gets the audience banner).
   * "ad" = a set of standalone paid ads (grouped under Ads); "post" = a set of standalone organic posts.
   * "store" = app store / Play store screenshots (grouped under App store; export sizes `appStore` / `playStore`).
   * None of these get the carousel banner.
   */
  kind?: "post" | "ad" | "store";
  /** Ads only: show the Offer on/off switch (for ads where the gift card is a callout, not the whole message). */
  offerToggle?: boolean;
  /** Sizes this entry can export. Defaults to `["feed"]`. */
  sizes?: SlideSize[];
  /** Override first-slide audience strip copy (multi-slide carousels only). */
  audienceBanner?: string;
  slides: MarketingSlide[];
};
