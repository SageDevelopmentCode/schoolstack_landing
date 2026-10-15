import type { SupabaseClient } from "@supabase/supabase-js";
import {
  isMarketingCarouselId,
  MARKETING_CAROUSEL_IDS,
  type MarketingCarouselId,
} from "@/lib/marketing/marketing-carousel-ids";

export type MarketingCarouselPostStatus = {
  posted: boolean;
  postedAt: string | null;
};

type CarouselPostRow = {
  carousel_id: string;
  posted: boolean;
  posted_at: string | null;
};

function defaultStatuses(): Record<MarketingCarouselId, MarketingCarouselPostStatus> {
  return MARKETING_CAROUSEL_IDS.reduce(
    (acc, id) => {
      acc[id] = { posted: false, postedAt: null };
      return acc;
    },
    {} as Record<MarketingCarouselId, MarketingCarouselPostStatus>,
  );
}

export async function listMarketingCarouselPostStatuses(
  supabase: SupabaseClient,
): Promise<Record<MarketingCarouselId, MarketingCarouselPostStatus>> {
  const statuses = defaultStatuses();

  const { data, error } = await supabase
    .from("website_marketing_carousel_posts")
    .select("carousel_id, posted, posted_at");

  if (error) {
    throw error;
  }

  for (const row of (data ?? []) as CarouselPostRow[]) {
    if (!isMarketingCarouselId(row.carousel_id)) continue;
    statuses[row.carousel_id] = {
      posted: row.posted,
      postedAt: row.posted_at,
    };
  }

  return statuses;
}

export async function setMarketingCarouselPosted(
  supabase: SupabaseClient,
  carouselId: MarketingCarouselId,
  posted: boolean,
): Promise<MarketingCarouselPostStatus> {
  const postedAt = posted ? new Date().toISOString() : null;

  const { data, error } = await supabase
    .from("website_marketing_carousel_posts")
    .upsert(
      {
        carousel_id: carouselId,
        posted,
        posted_at: postedAt,
      },
      { onConflict: "carousel_id" },
    )
    .select("posted, posted_at")
    .single();

  if (error) {
    throw error;
  }

  const row = data as Pick<CarouselPostRow, "posted" | "posted_at">;
  return {
    posted: row.posted,
    postedAt: row.posted_at,
  };
}
