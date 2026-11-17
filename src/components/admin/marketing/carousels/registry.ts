import { APPLICATION_FINISH_LINE_CAROUSEL } from "@/components/admin/marketing/carousels/application-finish-line";
import { GETTING_READY_TO_ENROLL_CAROUSEL } from "@/components/admin/marketing/carousels/getting-ready-to-enroll";
import { MASCOT_BRAMBLE_FORMS_CAROUSEL } from "@/components/admin/marketing/carousels/mascot-bramble-forms";
import { MASCOT_CLOVER_TIMECLOCK_CAROUSEL } from "@/components/admin/marketing/carousels/mascot-clover-timeclock";
import { MASCOT_CREW_SINGLES_CAROUSEL } from "@/components/admin/marketing/carousels/mascot-crew-singles";
import { MASCOT_DOT_CALENDAR_CAROUSEL } from "@/components/admin/marketing/carousels/mascot-dot-calendar";
import { MASCOT_FENNEL_ATTENDANCE_CAROUSEL } from "@/components/admin/marketing/carousels/mascot-fennel-attendance";
import { MASCOT_LOAM_MESSAGES_CAROUSEL } from "@/components/admin/marketing/carousels/mascot-loam-messages";
import { MASCOT_MARIGOLD_MARKETING_CAROUSEL } from "@/components/admin/marketing/carousels/mascot-marigold-marketing";
import { MASCOT_TERRA_WEBSITE_CAROUSEL } from "@/components/admin/marketing/carousels/mascot-terra-website";
import { MASCOT_DIG_ADMIN_CAROUSEL } from "@/components/admin/marketing/carousels/mascot-dig-admin";
import { MASCOT_NUTMEG_TUITION_CAROUSEL } from "@/components/admin/marketing/carousels/mascot-nutmeg-tuition";
import { MASCOT_PIP_ENROLLMENT_CAROUSEL } from "@/components/admin/marketing/carousels/mascot-pip-enrollment";
import { ONE_PLACE_AD_CAROUSEL } from "@/components/admin/marketing/carousels/one-place-ad";
import { TUITION_REVIEW_CAROUSEL } from "@/components/admin/marketing/carousels/tuition-review";
import { WHERE_WAS_THAT_UPDATE_CAROUSEL } from "@/components/admin/marketing/carousels/where-was-that-update";
import type { MarketingCarousel } from "@/components/admin/marketing/carousels/types";

export const MARKETING_CAROUSELS: MarketingCarousel[] = [
  TUITION_REVIEW_CAROUSEL,
  APPLICATION_FINISH_LINE_CAROUSEL,
  GETTING_READY_TO_ENROLL_CAROUSEL,
  WHERE_WAS_THAT_UPDATE_CAROUSEL,
  ONE_PLACE_AD_CAROUSEL,
  MASCOT_PIP_ENROLLMENT_CAROUSEL,
  MASCOT_NUTMEG_TUITION_CAROUSEL,
  MASCOT_DIG_ADMIN_CAROUSEL,
  MASCOT_TERRA_WEBSITE_CAROUSEL,
  MASCOT_FENNEL_ATTENDANCE_CAROUSEL,
  MASCOT_CLOVER_TIMECLOCK_CAROUSEL,
  MASCOT_MARIGOLD_MARKETING_CAROUSEL,
  MASCOT_LOAM_MESSAGES_CAROUSEL,
  MASCOT_DOT_CALENDAR_CAROUSEL,
  MASCOT_BRAMBLE_FORMS_CAROUSEL,
  MASCOT_CREW_SINGLES_CAROUSEL,
];

export const DEFAULT_CAROUSEL_ID = MARKETING_CAROUSELS[0]?.id ?? "tuition-review";

export function getMarketingCarousel(id: string): MarketingCarousel | undefined {
  return MARKETING_CAROUSELS.find((carousel) => carousel.id === id);
}

export function resolveMarketingCarouselId(id: string | null | undefined): string {
  if (id && getMarketingCarousel(id)) return id;
  return DEFAULT_CAROUSEL_ID;
}
