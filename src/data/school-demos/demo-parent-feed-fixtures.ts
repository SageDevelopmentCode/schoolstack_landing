import { buildDemoParentBulletinPosts } from "@/data/school-demos/demo-communication-fixtures";
import { buildDemoParentFormsBundle } from "@/data/school-demos/demo-parent-forms-fixtures";
import {
  DEMO_NEWSLETTER_STOCK_GALLERY_PHOTOS,
  type DemoNewsletterGalleryPhoto,
} from "@/data/school-demos/demo-newsletter-gallery-photos";
import {
  DEMO_FEED_DAY_LABELS,
  type DemoFeedDay,
  type DemoFeedItem,
  type DemoFeedKind,
  type DemoFeedPhotoSet,
  type DemoFeedTarget,
} from "@/data/school-demos/demo-feed-types";

/*
 * Parent demo › School feed: demo-only fixtures (no backend). The demo's
 * "today" is Friday, Nov 21, 2026, so day groups and "when" labels are fixed
 * strings rather than computed from the clock (no SSR/time-zone drift).
 */

export type DemoParentFeedKind = DemoFeedKind;
export type DemoParentFeedDay = DemoFeedDay;
export type DemoParentFeedTab = "messages" | "forms" | "calendar" | "billing";
export type DemoParentFeedTarget = DemoFeedTarget<DemoParentFeedTab>;
export type DemoParentFeedPhotoSet = DemoFeedPhotoSet;
export type DemoParentFeedItem = DemoFeedItem<DemoParentFeedTab>;

/** The newest N items get the "New" dot and chip. */
export const DEMO_PARENT_FEED_NEW_COUNT = 2;

export const DEMO_PARENT_FEED_DAY_LABELS = DEMO_FEED_DAY_LABELS;

export type DemoParentFeedClassroom = {
  id: string;
  room: string;
  teacher: string;
  /** First name of the child in that room (matches `buildDemoParentChildren`). */
  childFirstName: string;
};

export const DEMO_PARENT_FEED_CLASSROOMS: DemoParentFeedClassroom[] = [
  { id: "classroom-oak", room: "Oak Room", teacher: "Ms. Rivera", childFirstName: "Emma" },
  { id: "classroom-maple", room: "Maple Room", teacher: "Mr. Patel", childFirstName: "Jake" },
];

function stockPhotos(ids: number[]): DemoNewsletterGalleryPhoto[] {
  return ids
    .map((n) => DEMO_NEWSLETTER_STOCK_GALLERY_PHOTOS.find((photo) => photo.id === `stock-${n}`))
    .filter((photo): photo is DemoNewsletterGalleryPhoto => Boolean(photo));
}

const PICKUP_FALLBACK =
  "Please review the updated pickup procedures in the family handbook before Friday dismissal. No form is required.";

export function buildDemoParentFeedItems(): DemoParentFeedItem[] {
  const pickupBody =
    buildDemoParentBulletinPosts().find((post) => post.id === "bulletin-pickup")?.body ?? PICKUP_FALLBACK;

  const items: DemoParentFeedItem[] = [
    {
      id: "feed-rivera-message",
      kind: "message",
      day: "today",
      postedAt: "2026-11-21T15:20:00.000Z",
      whenLabel: "1h ago",
      whenLong: "Today, 3:20 PM",
      title: "Ms. Rivera sent you a message",
      source: "Oak Room",
      preview: "Emma's watercolor is going in the spring showcase! 🎨",
      ctaLabel: "Open message",
      target: { type: "tab", tab: "messages" },
    },
    {
      id: "feed-oak-photos",
      kind: "photos",
      day: "today",
      postedAt: "2026-11-21T13:10:00.000Z",
      whenLabel: "3h ago",
      whenLong: "Today, 1:10 PM",
      title: "Ms. Rivera shared 12 photos from Oak Room",
      source: "Oak Room",
      preview: "Garden painting, reading corner and our gratitude tree.",
      ctaLabel: "See all photos",
      target: { type: "photos" },
      photos: {
        total: 12,
        photos: stockPhotos([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]),
        caption:
          "A busy week in Oak Room: watercolors of the school garden, a long afternoon in the reading corner, and leaves for our gratitude tree before the break.",
      },
    },
    {
      id: "feed-field-trip-form",
      kind: "form",
      day: "today",
      postedAt: "2026-11-21T09:15:00.000Z",
      whenLabel: "7h ago",
      whenLong: "Today, 9:15 AM",
      title: "New form: Botanical garden field trip permission",
      source: "Oak Room",
      preview: "Permission and signature for Emma. Due Tue, Nov 25.",
      ctaLabel: "Review & sign",
      target: { type: "tab", tab: "forms" },
    },
    {
      id: "feed-thanksgiving-break",
      kind: "announcement",
      day: "yesterday",
      postedAt: "2026-11-20T10:00:00.000Z",
      whenLabel: "Yesterday",
      whenLong: "Yesterday, 10:00 AM",
      title: "Thanksgiving break: no school Nov 26–27",
      source: "School office",
      preview: "Campus is closed Wednesday afternoon through Friday.",
      excerpt: "Wednesday, Nov 25 is a half day with noon dismissal. Classes start again Monday, Nov 30.",
      ctaLabel: "Read announcement",
      target: { type: "read" },
      body: [
        "Wednesday, Nov 25 is a half day with noon dismissal. There is no aftercare that afternoon.",
        "Campus is closed Thursday, Nov 26 and Friday, Nov 27 for Thanksgiving break.",
        "Classes start again Monday, Nov 30 at the usual time. We're grateful for every one of our families. Enjoy the long weekend!",
      ],
    },
    {
      id: "feed-patel-creek-walk",
      kind: "message",
      day: "yesterday",
      postedAt: "2026-11-20T16:30:00.000Z",
      whenLabel: "Yesterday",
      whenLong: "Yesterday, 4:30 PM",
      title: "Mr. Patel sent a heads-up about Monday",
      source: "Maple Room",
      preview: "Monday is our creek walk, so Jake will need rain boots and a change of socks.",
      ctaLabel: "Open message",
      target: { type: "tab", tab: "messages" },
    },
    {
      id: "feed-winter-showcase",
      kind: "event",
      day: "yesterday",
      postedAt: "2026-11-20T08:00:00.000Z",
      whenLabel: "Yesterday",
      whenLong: "Yesterday, 8:00 AM",
      title: "New on the calendar: Winter Showcase",
      source: "School office",
      preview: "Thursday, Dec 10 · 5:30 PM in the Community Room.",
      ctaLabel: "View calendar",
      target: { type: "tab", tab: "calendar" },
    },
    {
      id: "feed-maple-photos",
      kind: "photos",
      day: "earlier",
      postedAt: "2026-11-19T14:00:00.000Z",
      whenLabel: "Wed",
      whenLong: "Wednesday, 2:00 PM",
      title: "Mr. Patel shared 6 photos from Maple Room",
      source: "Maple Room",
      preview: "Leaf-pile science and building day in Maple Room.",
      ctaLabel: "See all photos",
      target: { type: "photos" },
      photos: {
        total: 6,
        photos: stockPhotos([8, 9, 10, 5, 3, 1]),
        caption:
          "Maple Room sorted leaves by shape and colour, then spent building day making bridges strong enough for a toy truck.",
      },
    },
    {
      id: "feed-november-newsletter",
      kind: "newsletter",
      day: "earlier",
      postedAt: "2026-11-18T10:00:00.000Z",
      whenLabel: "Tue",
      whenLong: "Tuesday, 10:00 AM",
      title: "The November family newsletter is here",
      source: "School office",
      preview: "Gratitude week, the Winter Showcase and a note from the office.",
      ctaLabel: "Read newsletter",
      target: { type: "read" },
      body: [
        "Gratitude week. Every classroom is adding leaves to a gratitude tree this month. Ask your child what they wrote on theirs.",
        "Winter Showcase. Save the evening of Thursday, Dec 10. Students will share art, music and projects from the fall.",
        "From the office. Please make sure pickup contacts are up to date before the break, and label coats and boots now that the weather has turned.",
      ],
    },
    {
      id: "feed-pickup-procedures",
      kind: "announcement",
      day: "earlier",
      postedAt: "2026-11-17T09:30:00.000Z",
      whenLabel: "Mon",
      whenLong: "Monday, 9:30 AM",
      title: "Updated pickup procedures",
      source: "School office",
      preview: "Please review before Friday dismissal. No form is required.",
      excerpt: pickupBody,
      ctaLabel: "Read announcement",
      target: { type: "read" },
      body: [pickupBody],
    },
    {
      id: "feed-december-tuition",
      kind: "announcement",
      day: "earlier",
      postedAt: "2026-11-17T08:00:00.000Z",
      whenLabel: "Mon",
      whenLong: "Monday, 8:00 AM",
      title: "December tuition statements are ready",
      source: "School office",
      preview: "Your December statement is in Tuition & Billing.",
      ctaLabel: "View billing",
      target: { type: "tab", tab: "billing" },
    },
  ];

  return items.sort((a, b) => b.postedAt.localeCompare(a.postedAt));
}

export type DemoParentFeedWeekStats = {
  photos: number;
  announcements: number;
  formsToSign: number;
};

/** "This week" rail numbers, derived from the same fixtures the feed and Forms tab use. */
export function buildDemoParentFeedWeekStats(
  items: DemoParentFeedItem[] = buildDemoParentFeedItems(),
): DemoParentFeedWeekStats {
  return {
    photos: items.reduce((sum, item) => sum + (item.photos?.total ?? 0), 0),
    announcements: items.filter((item) => item.kind === "announcement" || item.kind === "newsletter").length,
    formsToSign: buildDemoParentFormsBundle().items.filter((item) => item.listStatus === "needs_action").length,
  };
}
