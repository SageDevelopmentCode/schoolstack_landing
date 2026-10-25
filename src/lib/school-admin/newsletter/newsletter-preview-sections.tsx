import type { ReactNode } from "react";
import { staffDisplayName } from "@/lib/staff/staff-display";
import type { StaffMemberRecord } from "@/lib/staff/staff-members";
import { shortDate } from "./newsletter-dates";
import { getWelcomeValue } from "./newsletter-template";
import type { NewsletterEdition, NewsletterSchoolTemplate } from "./newsletter-types";

export type NewsletterPreviewStyles = {
  nQuote: string;
  nCallout: string;
  nLabel: string;
  nEvent: string;
  nDate: string;
  nReminders: string;
  nPhotos: string;
};

export type PreviewSection = {
  title: string;
  body: ReactNode;
};

export type BuildPreviewSectionsOptions = {
  staff?: StaffMemberRecord[];
  template?: NewsletterSchoolTemplate;
};

function sentence(prefix: string, value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return "";
  const ending = /[.!?…]$/.test(trimmed) ? "" : ".";
  return prefix + trimmed + ending;
}

function renderStoryBlockBody(
  block: NewsletterEdition["storyBlocks"][number],
  s: NewsletterPreviewStyles,
): ReactNode {
  const value = block.value.trim();
  if (!value) return null;

  switch (block.kind) {
    case "learning":
      return <p>{sentence("This week, we explored ", value)}</p>;
    case "next":
      return <p>{sentence("Next week, we'll explore ", value)}</p>;
    case "family":
      return (
        <div className={s.nCallout}>
          <div className={s.nLabel}>Try it together</div>
          <p>{value}</p>
        </div>
      );
    case "quote": {
      const q = value.replace(/^['"""]|['"""]$/g, "");
      return (
        <div className={s.nQuote}>
          &ldquo;{q}&rdquo;
        </div>
      );
    }
    default:
      return <p>{value}</p>;
  }
}

export function buildPreviewSections(
  edition: NewsletterEdition,
  s: NewsletterPreviewStyles,
  options: BuildPreviewSectionsOptions = {},
): PreviewSection[] {
  const sections: PreviewSection[] = [];
  const template = options.template;

  for (const block of edition.storyBlocks) {
    if (!block.enabled || block.kind === "welcome") continue;
    const body = renderStoryBlockBody(block, s);
    if (!body) continue;
    sections.push({
      title: block.heading.trim() || block.prompt,
      body,
    });
  }

  if (edition.sections.teacherUpdates && options.staff?.length) {
    const heading =
      template?.teacherUpdatesHeading?.trim() || "Class updates";
    const items = options.staff
      .map((member) => {
        const text = edition.teacherUpdates[member.id]?.trim();
        if (!text) return null;
        return (
          <div key={member.id} style={{ marginTop: 12 }}>
            <strong style={{ fontSize: 11, display: "block", marginBottom: 4 }}>
              {staffDisplayName(member)}
            </strong>
            <p style={{ margin: 0 }}>{text}</p>
          </div>
        );
      })
      .filter(Boolean);
    if (items.length) {
      sections.push({
        title: heading,
        body: <>{items}</>,
      });
    }
  }

  if (edition.sections.events && edition.events.length) {
    sections.push({
      title: "Dates for your calendar",
      body: (
        <>
          {edition.events.map((event) => (
            <div key={event.id} className={s.nEvent}>
              <div className={s.nDate}>
                {shortDate(event.date, { month: "short" }).toUpperCase()}
                <strong>{shortDate(event.date, { day: "numeric" })}</strong>
              </div>
              <div>
                <strong>{event.title}</strong>
                {event.time ? <p>{event.time}</p> : null}
                {event.note ? <p>{event.note}</p> : null}
              </div>
            </div>
          ))}
        </>
      ),
    });
  }

  if (edition.sections.reminders) {
    const reminders = edition.reminders.filter((r) => r.text.trim());
    if (reminders.length) {
      sections.push({
        title: "A few reminders",
        body: (
          <ul className={s.nReminders}>
            {reminders.map((r) => (
              <li key={r.id}>{r.text.trim()}</li>
            ))}
          </ul>
        ),
      });
    }
  }

  if (edition.sections.photos && edition.photos.length) {
    sections.push({
      title: "Moments from our days",
      body: (
        <div className={s.nPhotos}>
          {edition.photos.map((photo) => (
            <figure key={photo.id}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={photo.src} alt={photo.caption || "School-day photo"} />
              {photo.caption ? <figcaption>{photo.caption}</figcaption> : null}
            </figure>
          ))}
        </div>
      ),
    });
  }

  return sections;
}

export function previewHeroTitle(edition: NewsletterEdition): string {
  return edition.title.trim() || "A note from our school";
}

export function previewHasWelcome(edition: NewsletterEdition): boolean {
  return Boolean(getWelcomeValue(edition).trim());
}
