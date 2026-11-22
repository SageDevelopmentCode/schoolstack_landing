import type { SupabaseClient } from "@supabase/supabase-js";
import {
  isMarketingCarouselId,
  MARKETING_CAROUSEL_IDS,
  type MarketingCarouselId,
} from "@/lib/marketing/marketing-carousel-ids";

export type MarketingPostedFlag = {
  posted: boolean;
  postedAt: string | null;
};

/**
 * Posted status for one Studio entry. `posted` is the whole entry (swipe carousels, and sets marked
 * before per-slide status existed); `slides` holds one flag per slide of an ad set or post set.
 */
export type MarketingCarouselPostStatus = MarketingPostedFlag & {
  slides: Record<string, MarketingPostedFlag>;
};

export type CarouselPostRow = {
  carousel_id: string;
  /** '' = the whole entry. Missing before the 20261173 migration. */
  slide_id?: string | null;
  posted: boolean;
  posted_at: string | null;
};

/** Slide ids are kebab-case (see carousels/*.tsx). */
export const SLIDE_ID_PATTERN = /^[a-z0-9-]{1,80}$/;

const UNDEFINED_COLUMN = "42703";
const NO_UNIQUE_CONSTRAINT = "42P10";

export function emptyCarouselPostStatus(): MarketingCarouselPostStatus {
  return { posted: false, postedAt: null, slides: {} };
}

function defaultStatuses(): Record<MarketingCarouselId, MarketingCarouselPostStatus> {
  return MARKETING_CAROUSEL_IDS.reduce(
    (acc, id) => {
      acc[id] = emptyCarouselPostStatus();
      return acc;
    },
    {} as Record<MarketingCarouselId, MarketingCarouselPostStatus>,
  );
}

/** Rows → one status per known carousel id ('' rows fill the entry, the rest fill `slides`). */
export function statusesFromRows(rows: CarouselPostRow[]): Record<MarketingCarouselId, MarketingCarouselPostStatus> {
  const statuses = defaultStatuses();
  for (const row of rows) {
    if (!isMarketingCarouselId(row.carousel_id)) continue;
    const flag = { posted: row.posted, postedAt: row.posted_at };
    const slideId = row.slide_id ?? "";
    if (slideId) {
      statuses[row.carousel_id].slides[slideId] = flag;
    } else {
      statuses[row.carousel_id] = { ...flag, slides: statuses[row.carousel_id].slides };
    }
  }
  return statuses;
}

/** A slide counts as posted when its own flag says so, falling back to the whole entry's flag. */
export function isSlidePosted(status: MarketingCarouselPostStatus | undefined, slideId: string): boolean {
  if (!status) return false;
  return status.slides[slideId]?.posted ?? status.posted;
}

/** How many of these slides are posted. */
export function countPostedSlides(status: MarketingCarouselPostStatus | undefined, slideIds: string[]): number {
  return slideIds.filter((id) => isSlidePosted(status, id)).length;
}

function errorCode(error: unknown): string | undefined {
  return typeof error === "object" && error !== null && "code" in error ? String((error as { code: unknown }).code) : undefined;
}

export async function listMarketingCarouselPostStatuses(
  supabase: SupabaseClient,
): Promise<Record<MarketingCarouselId, MarketingCarouselPostStatus>> {
  const table = supabase.from("website_marketing_carousel_posts");
  const { data, error } = await table.select("carousel_id, slide_id, posted, posted_at");

  if (error) {
    // Before the 20261173 migration there is no slide_id column: fall back to entry-level rows.
    if (errorCode(error) !== UNDEFINED_COLUMN) throw error;
    const legacy = await supabase.from("website_marketing_carousel_posts").select("carousel_id, posted, posted_at");
    if (legacy.error) throw legacy.error;
    return statusesFromRows((legacy.data ?? []) as CarouselPostRow[]);
  }

  return statusesFromRows((data ?? []) as CarouselPostRow[]);
}

export async function setMarketingCarouselPosted(
  supabase: SupabaseClient,
  carouselId: MarketingCarouselId,
  posted: boolean,
  slideId = "",
): Promise<MarketingPostedFlag> {
  const postedAt = posted ? new Date().toISOString() : null;

  const { data, error } = await supabase
    .from("website_marketing_carousel_posts")
    .upsert({ carousel_id: carouselId, slide_id: slideId, posted, posted_at: postedAt }, { onConflict: "carousel_id,slide_id" })
    .select("posted, posted_at")
    .single();

  if (error) {
    const code = errorCode(error);
    const premigration = code === UNDEFINED_COLUMN || code === NO_UNIQUE_CONSTRAINT || code === "PGRST204";
    if (!premigration) throw error;
    if (slideId) {
      throw new Error("Per-slide posted status needs the 20261173 migration (supabase/migrations_manual/marketing_carousel_posts_per_slide_2026_11_21.sql).");
    }
    // Entry-level writes keep working on the old one-row-per-carousel table.
    const legacy = await supabase
      .from("website_marketing_carousel_posts")
      .upsert({ carousel_id: carouselId, posted, posted_at: postedAt }, { onConflict: "carousel_id" })
      .select("posted, posted_at")
      .single();
    if (legacy.error) throw legacy.error;
    const row = legacy.data as Pick<CarouselPostRow, "posted" | "posted_at">;
    return { posted: row.posted, postedAt: row.posted_at };
  }

  const row = data as Pick<CarouselPostRow, "posted" | "posted_at">;
  return { posted: row.posted, postedAt: row.posted_at };
}
