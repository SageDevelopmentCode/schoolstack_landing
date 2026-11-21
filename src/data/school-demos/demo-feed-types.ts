import type { DemoNewsletterGalleryPhoto } from "@/data/school-demos/demo-newsletter-gallery-photos";

/*
 * Shared types for the demo-only Garden feeds (parent "School feed" and the
 * teacher Feed). `Tab` is the set of demo tabs an update can switch to.
 */

export type DemoFeedKind =
  | "photos"
  | "announcement"
  | "form"
  | "event"
  | "newsletter"
  | "message"
  | "hours"
  | "student";
export type DemoFeedDay = "today" | "yesterday" | "earlier";

/** What the update's CTA does: switch to a demo tab, open the photo dialog, or open the read dialog. */
export type DemoFeedTarget<Tab extends string> =
  | { type: "tab"; tab: Tab }
  | { type: "photos" }
  | { type: "read" };

export type DemoFeedPhotoSet = {
  /** Total shared (the strip shows 4 and "+N"). */
  total: number;
  photos: DemoNewsletterGalleryPhoto[];
  caption: string;
};

export type DemoFeedItem<Tab extends string> = {
  id: string;
  kind: DemoFeedKind;
  day: DemoFeedDay;
  /** ISO timestamp, used for ordering and `<time dateTime>`. */
  postedAt: string;
  /** Relative label shown in the meta line ("2h ago", "Yesterday", "Wed"). */
  whenLabel: string;
  /** Longer label for dialogs ("Today, 1:10 PM"). */
  whenLong: string;
  title: string;
  /** Classroom or "School office". */
  source: string;
  preview: string;
  ctaLabel: string;
  target: DemoFeedTarget<Tab>;
  photos?: DemoFeedPhotoSet;
  /** Short excerpt shown on a paper note in the row (announcements). */
  excerpt?: string;
  /** Full text for the read dialog, one string per paragraph. */
  body?: string[];
};

export const DEMO_FEED_DAY_LABELS: Record<DemoFeedDay, string> = {
  today: "Today",
  yesterday: "Yesterday",
  earlier: "Earlier this week",
};
