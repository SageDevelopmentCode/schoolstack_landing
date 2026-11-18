import type { ReactNode } from "react";
import type { SlideSize } from "@/components/admin/marketing/slide-frame";

/** Text that goes next to the image in Meta Ads Manager (or the LinkedIn post box). */
export type MarketingAdCopy = {
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
};

export type MarketingCarousel = {
  id: string;
  title: string;
  description?: string;
  fileSlug: string;
  /**
   * Leave unset for a swipe carousel (slide 1 gets the audience banner).
   * "ad" = a set of standalone paid ads (grouped under Ads); "post" = a set of standalone organic posts.
   * Neither gets the carousel banner.
   */
  kind?: "post" | "ad";
  /** Ads only: show the Offer on/off switch (for ads where the gift card is a callout, not the whole message). */
  offerToggle?: boolean;
  /** Sizes this entry can export. Defaults to `["feed"]`. */
  sizes?: SlideSize[];
  /** Override first-slide audience strip copy (multi-slide carousels only). */
  audienceBanner?: string;
  slides: MarketingSlide[];
};
