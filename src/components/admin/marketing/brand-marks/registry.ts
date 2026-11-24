import { COVER_MARKS } from "@/components/admin/marketing/brand-marks/marks-covers";
import { CREW_MARKS } from "@/components/admin/marketing/brand-marks/marks-crew";
import { IOS_HEADER_MARKS } from "@/components/admin/marketing/brand-marks/marks-ios-headers";
import { LINK_PREVIEW_MARKS } from "@/components/admin/marketing/brand-marks/marks-link-previews";
import { LOGO_MARKS } from "@/components/admin/marketing/brand-marks/marks-logos";
import { EVERYDAY_MARKS } from "@/components/admin/marketing/brand-marks/marks-everyday";
import { SEASONAL_MARKS } from "@/components/admin/marketing/brand-marks/marks-seasonal";
import type { BrandMark, BrandMarkKind, BrandMarkSeason, CoverFormat, IosHeaderFormat } from "@/components/admin/marketing/brand-marks/types";

export const BRAND_MARKS: BrandMark[] = [...EVERYDAY_MARKS, ...CREW_MARKS, ...SEASONAL_MARKS, ...COVER_MARKS, ...IOS_HEADER_MARKS, ...LINK_PREVIEW_MARKS, ...LOGO_MARKS];

export const DEFAULT_BRAND_MARK_ID = "mint-dots";

export function getBrandMark(id: string | null | undefined): BrandMark | undefined {
  return BRAND_MARKS.find((mark) => mark.id === id);
}

export function brandMarksOfKind(kind: BrandMarkKind): BrandMark[] {
  return BRAND_MARKS.filter((mark) => mark.kind === kind);
}

/** The same cover concept in another format. */
export function coverInFormat(mark: BrandMark, format: CoverFormat): BrandMark | undefined {
  return BRAND_MARKS.find((m) => m.kind === "cover" && m.concept === mark.concept && m.format === format);
}

/** The same App Store concept at another size and/or with text switched on or off. */
export function iosHeaderSibling(mark: BrandMark, next: { format?: IosHeaderFormat; textless?: boolean }): BrandMark | undefined {
  const format = next.format ?? mark.iosFormat;
  const textless = next.textless ?? mark.textless ?? false;
  return BRAND_MARKS.find((m) => m.kind === "ios-header" && m.concept === mark.concept && m.iosFormat === format && (m.textless ?? false) === textless);
}

/** How many distinct designs a kind has (covers and App Store art count once per concept). */
export function designCount(kind: BrandMarkKind) {
  const marks = brandMarksOfKind(kind);
  return kind === "cover" || kind === "ios-header" ? new Set(marks.map((m) => m.concept)).size : marks.length;
}

/** "now" while the window is open, "soon" if it opens within `soonDays`, else "later". */
export type SeasonTiming = { state: "now" | "soon" | "later"; daysUntil: number };

const DAY = 24 * 60 * 60 * 1000;

function dateIn(year: number, mmdd: string) {
  const [month, day] = mmdd.split("-").map(Number);
  return new Date(year, (month ?? 1) - 1, day ?? 1);
}

export function seasonTiming(season: BrandMarkSeason, today = new Date(), soonDays = 45): SeasonTiming {
  const t = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  for (const year of [t.getFullYear() - 1, t.getFullYear()]) {
    const start = dateIn(year, season.from);
    let end = dateIn(year, season.to);
    if (end < start) end = dateIn(year + 1, season.to);
    if (t >= start && t <= end) return { state: "now", daysUntil: 0 };
  }
  let next = dateIn(t.getFullYear(), season.from);
  if (next < t) next = dateIn(t.getFullYear() + 1, season.from);
  const daysUntil = Math.round((next.getTime() - t.getTime()) / DAY);
  return { state: daysUntil <= soonDays ? "soon" : "later", daysUntil };
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** "12-26" → "Dec 26". */
export function formatMonthDay(mmdd: string) {
  const [month, day] = mmdd.split("-").map(Number);
  return `${MONTHS[(month ?? 1) - 1]} ${day}`;
}
