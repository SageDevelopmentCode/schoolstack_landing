import { buildDemoTeacherForms } from "@/data/school-demos/demo-communication-fixtures";
import type { DemoFeedItem } from "@/data/school-demos/demo-feed-types";
import { DEMO_NEWSLETTER_STOCK_GALLERY_PHOTOS } from "@/data/school-demos/demo-newsletter-gallery-photos";
import { buildDemoTeacherMessagesInbox } from "@/data/school-demos/demo-teacher-portal-fixtures";

/*
 * Teacher demo › Feed (Jordan Taylor): demo-only fixtures for the shared
 * Garden feed. The demo's "today" is Friday, Nov 21, 2026; labels are fixed
 * strings (no clock, no SSR/time-zone drift). Names match the teacher demo's
 * inbox, forms and roster fixtures.
 */

export type DemoTeacherFeedTab = "messages" | "forms" | "calendar" | "hours" | "students";
export type DemoTeacherFeedItem = DemoFeedItem<DemoTeacherFeedTab>;

/** The newest N items get the "New" dot and chip. */
export const DEMO_TEACHER_FEED_NEW_COUNT = 2;

export function buildDemoTeacherFeedItems(): DemoTeacherFeedItem[] {
  const items: DemoTeacherFeedItem[] = [
    {
      id: "teacher-feed-rivera-message",
      kind: "message",
      day: "today",
      postedAt: "2026-11-21T13:45:00.000Z",
      whenLabel: "2h ago",
      whenLong: "Today, 1:45 PM",
      title: "Maria Rivera sent you a message",
      source: "Oak Room · Rivera Family",
      preview: "Emma will be picked up early today around 2:30.",
      ctaLabel: "Open message",
      target: { type: "tab", tab: "messages" },
    },
    {
      id: "teacher-feed-field-trip-signed",
      kind: "form",
      day: "today",
      postedAt: "2026-11-21T12:20:00.000Z",
      whenLabel: "3h ago",
      whenLong: "Today, 12:20 PM",
      title: "The Mitchell family signed the field trip form",
      source: "Oak Room",
      preview: "Botanical garden field trip permission · 1 of 3 families have signed so far.",
      ctaLabel: "Open form",
      target: { type: "tab", tab: "forms" },
    },
    {
      id: "teacher-feed-cedar-photos",
      kind: "photos",
      day: "today",
      postedAt: "2026-11-21T10:05:00.000Z",
      whenLabel: "5h ago",
      whenLong: "Today, 10:05 AM",
      title: "Ms. Alvarez shared 9 photos from Cedar Room",
      source: "Cedar Room",
      preview: "Seed planting, a rainy-day fort and the gratitude tree.",
      ctaLabel: "See all photos",
      target: { type: "photos" },
      photos: {
        total: 9,
        photos: DEMO_NEWSLETTER_STOCK_GALLERY_PHOTOS.slice(3, 12),
        caption:
          "Cedar Room this week: planting seeds for the spring garden, a rainy-day fort in the reading corner, and leaves for the gratitude tree.",
      },
    },
    {
      id: "teacher-feed-staff-meeting",
      kind: "announcement",
      day: "yesterday",
      postedAt: "2026-11-20T16:30:00.000Z",
      whenLabel: "Yesterday",
      whenLong: "Yesterday, 4:30 PM",
      title: "Staff meeting moves to Thursday",
      source: "School office",
      preview: "Same time, 3:45 PM in the library. Bring your field trip chaperone lists.",
      excerpt: "Next week's staff meeting moves to Thursday, same time (3:45 PM), in the library.",
      body: [
        "Next week's staff meeting moves to Thursday, same time (3:45 PM), in the library.",
        "Please bring your chaperone lists for the botanical garden trip and any questions about the spring showcase.",
      ],
      ctaLabel: "Read announcement",
      target: { type: "read" },
    },
    {
      id: "teacher-feed-showcase",
      kind: "event",
      day: "yesterday",
      postedAt: "2026-11-20T14:00:00.000Z",
      whenLabel: "Yesterday",
      whenLong: "Yesterday, 2:00 PM",
      title: "Spring art showcase added to the calendar",
      source: "School office",
      preview: "Saturday, Apr 25 · 10:00 AM. Families are invited.",
      ctaLabel: "View calendar",
      target: { type: "tab", tab: "calendar" },
    },
    {
      id: "teacher-feed-timesheet",
      kind: "hours",
      day: "earlier",
      postedAt: "2026-11-19T17:10:00.000Z",
      whenLabel: "Wed",
      whenLong: "Wednesday, 5:10 PM",
      title: "Your timesheet for Nov 3 – 16 was approved",
      source: "School office",
      preview: "Approved hours go into your next pay stub.",
      ctaLabel: "View my hours",
      target: { type: "tab", tab: "hours" },
    },
    {
      id: "teacher-feed-newsletter",
      kind: "newsletter",
      day: "earlier",
      postedAt: "2026-11-18T15:00:00.000Z",
      whenLabel: "Tue",
      whenLong: "Tuesday, 3:00 PM",
      title: "The November family newsletter went out",
      source: "School office",
      preview: "Your Oak Room update was included, along with the gratitude tree photos.",
      body: [
        "The November newsletter went out to every family this afternoon.",
        "It includes your Oak Room update, the botanical garden trip reminder and photos from the gratitude tree.",
      ],
      ctaLabel: "Read newsletter",
      target: { type: "read" },
    },
    {
      id: "teacher-feed-new-student",
      kind: "student",
      day: "earlier",
      postedAt: "2026-11-17T09:30:00.000Z",
      whenLabel: "Mon",
      whenLong: "Monday, 9:30 AM",
      title: "Mila Ortiz joins Oak Room after the break",
      source: "Oak Room",
      preview: "Her enrollment is complete. The family profile is ready to review.",
      ctaLabel: "View my students",
      target: { type: "tab", tab: "students" },
    },
  ];

  return items.sort((a, b) => b.postedAt.localeCompare(a.postedAt));
}

export type DemoTeacherFeedWeekStats = {
  familyReplies: number;
  formsSigned: number;
  photos: number;
};

/** "At a glance" numbers, derived from the same fixtures the Messages and Forms tabs use. */
export function buildDemoTeacherFeedWeekStats(
  items: DemoTeacherFeedItem[] = buildDemoTeacherFeedItems(),
): DemoTeacherFeedWeekStats {
  return {
    familyReplies: buildDemoTeacherMessagesInbox().threads.reduce((sum, thread) => sum + thread.unreadCount, 0),
    formsSigned: buildDemoTeacherForms().reduce((sum, form) => sum + form.signedFamilies, 0),
    photos: items.reduce((sum, item) => sum + (item.photos?.total ?? 0), 0),
  };
}
