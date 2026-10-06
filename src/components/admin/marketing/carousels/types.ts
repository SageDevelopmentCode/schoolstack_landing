import type { ReactNode } from "react";

export type MarketingSlide = {
  id: string;
  fileName: string;
  render: () => ReactNode;
};

export type MarketingCarousel = {
  id: string;
  title: string;
  description?: string;
  fileSlug: string;
  slides: MarketingSlide[];
};
