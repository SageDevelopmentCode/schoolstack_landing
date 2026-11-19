import type { FlowReadiness, ReadinessItem } from "@/components/school-admin/admissions/flows/flowReadiness";
import type { StaffMemberRecord } from "@/lib/staff/staff-members";
import { weekLabel } from "./newsletter-dates";
import {
  NEWSLETTER_SECTION_TITLES,
  editionHasContent,
  storyBlockTitle,
  teacherUpdatesHeading,
  type NewsletterRegion,
} from "./newsletter-render";
import type { NewsletterEdition, NewsletterSchoolTemplate } from "./newsletter-types";

/*
 * "Before you publish" for the newsletter builder. Built ONLY from the checks
 * the publish dialog already ran (title, week, some content); no new rules.
 * Each item's `stepId` is the newsletter region that fixes it.
 */
export function newsletterReadiness(edition: NewsletterEdition): FlowReadiness {
  const hasTitle = Boolean(edition.title.trim());
  const hasWeek = Boolean(edition.week);
  const hasContent = editionHasContent(edition);
  const firstStory = edition.storyBlocks.find((b) => b.enabled && b.kind !== "welcome");

  const items: ReadinessItem[] = [
    {
      id: "title",
      status: hasTitle ? "done" : "todo",
      label: hasTitle ? "Title ready" : "Add a title",
      detail: hasTitle ? edition.title.trim() : "Families see it at the top of the newsletter.",
      stepId: "cover",
    },
    {
      id: "week",
      status: hasWeek ? "done" : "todo",
      label: hasWeek ? weekLabel(edition) : "Choose a week",
      detail: hasWeek ? undefined : "Pick the week this edition covers.",
      stepId: "cover",
    },
    {
      id: "content",
      status: hasContent ? "done" : "todo",
      label: hasContent ? "Content ready" : "Add a story, note, date, reminder, or photo",
      stepId: firstStory ? `story:${firstStory.id}` : "cover",
    },
  ];
  const blocking = items.filter((item) => item.status === "todo").length;
  return {
    items,
    blocking,
    ready: blocking === 0,
    summary: blocking === 0 ? "Ready to publish" : `${blocking} to fix before publishing`,
  };
}

export type NewsletterOutlineStatus = "filled" | "empty" | "todo";

export type NewsletterOutlineRow = {
  region: NewsletterRegion;
  label: string;
  meta: string;
  status: NewsletterOutlineStatus;
};

/** One row per part of the newsletter, in reading order (enabled parts only). */
export function newsletterOutline(
  edition: NewsletterEdition,
  template: NewsletterSchoolTemplate,
  staff: Pick<StaffMemberRecord, "id" | "firstName" | "lastName" | "employmentStatus">[],
): NewsletterOutlineRow[] {
  const rows: NewsletterOutlineRow[] = [];
  const coverDone = Boolean(edition.title.trim() && edition.week);
  rows.push({
    region: "cover",
    label: "Cover & welcome",
    meta: edition.week ? weekLabel(edition) : "Title, cover photo, week",
    status: coverDone ? "filled" : "todo",
  });

  for (const block of edition.storyBlocks) {
    if (!block.enabled || block.kind === "welcome") continue;
    const filled = Boolean(block.value.trim());
    rows.push({
      region: `story:${block.id}`,
      label: storyBlockTitle(block),
      meta: filled ? "Written" : block.optional ? "Optional" : "Not written yet",
      status: filled ? "filled" : "empty",
    });
  }

  if (edition.sections.teacherUpdates) {
    const active = staff.filter((m) => m.employmentStatus === "active");
    const written = active.filter((m) => edition.teacherUpdates[m.id]?.trim()).length;
    rows.push({
      region: "teachers",
      label: teacherUpdatesHeading(template),
      meta: active.length ? `${written} of ${active.length} written` : "No active staff",
      status: written ? "filled" : "empty",
    });
  }
  if (edition.sections.events) {
    const n = edition.events.length;
    rows.push({
      region: "events",
      label: NEWSLETTER_SECTION_TITLES.events,
      meta: n ? `${n} ${n === 1 ? "date" : "dates"}` : "None yet",
      status: n ? "filled" : "empty",
    });
  }
  if (edition.sections.reminders) {
    const n = edition.reminders.filter((r) => r.text.trim()).length;
    rows.push({
      region: "reminders",
      label: NEWSLETTER_SECTION_TITLES.reminders,
      meta: n ? `${n} ${n === 1 ? "reminder" : "reminders"}` : "None yet",
      status: n ? "filled" : "empty",
    });
  }
  if (edition.sections.photos) {
    const n = edition.photos.length;
    rows.push({
      region: "photos",
      label: NEWSLETTER_SECTION_TITLES.photos,
      meta: n ? `${n} ${n === 1 ? "photo" : "photos"}` : "None yet",
      status: n ? "filled" : "empty",
    });
  }
  return rows;
}

/** Title for the side panel / compact card of a region. */
export function newsletterRegionTitle(
  region: NewsletterRegion,
  edition: NewsletterEdition,
  template: NewsletterSchoolTemplate,
): string {
  if (region === "cover") return "Cover & welcome";
  if (region === "teachers") return teacherUpdatesHeading(template);
  if (region === "events") return NEWSLETTER_SECTION_TITLES.events;
  if (region === "reminders") return NEWSLETTER_SECTION_TITLES.reminders;
  if (region === "photos") return NEWSLETTER_SECTION_TITLES.photos;
  const block = edition.storyBlocks.find((b) => `story:${b.id}` === region);
  return block ? storyBlockTitle(block) : "Section";
}

