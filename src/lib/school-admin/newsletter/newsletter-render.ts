import type { StaffMemberRecord } from "@/lib/staff/staff-members";
import { staffDisplayName } from "@/lib/staff/staff-display";
import {
  MUDKITCHEN_FOOTER_LABEL,
  MUDKITCHEN_LOGO_ALT,
  MUDKITCHEN_LOGO_PATH,
  MUDKITCHEN_SITE_URL,
  NEWSLETTER_MASTHEAD_TAGLINE,
  mudkitchenLogoUrlForExport,
  type NewsletterVisualBranding,
} from "./newsletter-branding";
import { getWelcomeValue } from "./newsletter-template";
import type {
  NewsletterEdition,
  NewsletterSchoolMeta,
  NewsletterSchoolTemplate,
  NewsletterStoryBlock,
} from "./newsletter-types";
import { weekLabel } from "./newsletter-dates";

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function sentence(prefix: string, value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return "";
  const ending = /[.!?…]$/.test(trimmed) ? "" : ".";
  return prefix + trimmed + ending;
}

function paragraph(value: string): string {
  const trimmed = value.trim();
  return trimmed ? `<p>${escapeHtml(trimmed)}</p>` : "";
}

function shortDate(
  key: string,
  opts: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" },
): string {
  if (!key) return "";
  return new Intl.DateTimeFormat("en-US", {
    ...opts,
    timeZone: "UTC",
  }).format(new Date(`${key}T12:00:00Z`));
}

function blockContentHtml(block: NewsletterStoryBlock): string {
  const value = block.value.trim();
  if (!value) return "";

  switch (block.kind) {
    case "learning":
      return paragraph(sentence("This week, we explored ", value));
    case "next":
      return paragraph(sentence("Next week, we'll explore ", value));
    case "family":
      return `<div class="n-callout"><div class="n-label">Try it together</div>${paragraph(value)}</div>`;
    case "quote": {
      const quote = value.replace(/^['"""]|['"""]$/g, "");
      return `<div class="n-quote">"${escapeHtml(quote)}"</div>`;
    }
    default:
      return paragraph(value);
  }
}

export type BuildContentOptions = {
  staff?: StaffMemberRecord[];
  template?: NewsletterSchoolTemplate;
  branding?: NewsletterVisualBranding;
};

function newsletterMastheadHtml(
  school: NewsletterSchoolMeta,
  branding?: NewsletterVisualBranding,
): string {
  const mkSrc = branding?.mudkitchenLogoSrc ?? mudkitchenLogoUrlForExport();
  const schoolName = escapeHtml(school.name);
  const schoolLogo = branding?.schoolLogoSrc?.trim();
  const schoolInner = schoolLogo
    ? `<img class="n-logo n-logo-school" src="${escapeHtml(schoolLogo)}" alt="${escapeHtml(branding?.schoolLogoAlt ?? "School logo")}">${schoolName}`
    : schoolName;

  return `<div class="n-masthead"><div class="n-masthead-school"><div class="n-school">${schoolInner}</div></div><div class="n-masthead-mk"><img class="n-logo n-logo-mk" src="${escapeHtml(mkSrc)}" alt="${escapeHtml(MUDKITCHEN_LOGO_ALT)}"><span class="n-masthead-tagline">${escapeHtml(NEWSLETTER_MASTHEAD_TAGLINE)}</span></div></div>`;
}

function newsletterFooterHtml(
  signatureHtml: string,
  branding?: NewsletterVisualBranding,
): string {
  const mkSrc =
    branding?.mudkitchenLogoSrc ?? `${MUDKITCHEN_SITE_URL}${MUDKITCHEN_LOGO_PATH}`;
  const mkRow = `<div class="n-footer-mk"><a href="${MUDKITCHEN_SITE_URL}" target="_blank" rel="noopener noreferrer"><img class="n-logo n-logo-mk-footer" src="${escapeHtml(mkSrc)}" alt="${escapeHtml(MUDKITCHEN_LOGO_ALT)}"><span>${escapeHtml(MUDKITCHEN_FOOTER_LABEL)}</span></a></div>`;

  return `<footer class="n-footer"><div class="n-footer-signature">${signatureHtml}</div>${mkRow}</footer>`;
}

export function buildNewsletterContentHtml(
  edition: NewsletterEdition,
  options: BuildContentOptions = {},
): string {
  let out = "";
  const add = (title: string, content: string) => {
    if (content.trim()) {
      out += `<section class="n-section"><h3>${escapeHtml(title)}</h3>${content}</section>`;
    }
  };

  for (const block of edition.storyBlocks) {
    if (!block.enabled || block.kind === "welcome") continue;
    const content = blockContentHtml(block);
    if (content.trim()) {
      add(block.heading.trim() || block.prompt, content);
    }
  }

  if (edition.sections.teacherUpdates && options.staff?.length) {
    const heading =
      options.template?.teacherUpdatesHeading?.trim() || "Class updates";
    const parts = options.staff
      .map((member) => {
        const text = edition.teacherUpdates[member.id]?.trim();
        if (!text) return "";
        return `<div><strong>${escapeHtml(staffDisplayName(member))}</strong>${paragraph(text)}</div>`;
      })
      .filter(Boolean)
      .join("");
    if (parts) add(heading, parts);
  }

  if (edition.sections.events && edition.events.length) {
    const eventsHtml = edition.events
      .map((event) => {
        const month = shortDate(event.date, { month: "short" }).toUpperCase();
        const day = shortDate(event.date, { day: "numeric" });
        return `<div class="n-event"><div class="n-date">${escapeHtml(month)}<strong>${escapeHtml(day)}</strong></div><div><strong>${escapeHtml(event.title)}</strong>${event.time ? `<p>${escapeHtml(event.time)}</p>` : ""}${event.note ? `<p>${escapeHtml(event.note)}</p>` : ""}</div></div>`;
      })
      .join("");
    add("Dates for your calendar", eventsHtml);
  }

  if (edition.sections.reminders) {
    const reminders = edition.reminders.filter((r) => r.text.trim());
    if (reminders.length) {
      const list = reminders.map((r) => `<li>${escapeHtml(r.text)}</li>`).join("");
      add("A few reminders", `<ul class="n-reminders">${list}</ul>`);
    }
  }

  if (edition.sections.photos && edition.photos.length) {
    const photos = edition.photos
      .map(
        (p) =>
          `<figure><img src="${p.src}" alt="${escapeHtml(p.caption || "School-day photo")}">${p.caption ? `<figcaption>${escapeHtml(p.caption)}</figcaption>` : ""}</figure>`,
      )
      .join("");
    add("Moments from our days", `<div class="n-photos">${photos}</div>`);
  }

  return out;
}

export function buildNewsletterArticleHtml(
  edition: NewsletterEdition,
  school: NewsletterSchoolMeta,
  options: BuildContentOptions = {},
): string {
  const welcome = paragraph(getWelcomeValue(edition));
  const content = buildNewsletterContentHtml(edition, options);
  const contentBlock =
    content.trim() ||
    '<p class="news-empty">Your weekly story will appear here.</p>';
  const signature = escapeHtml(school.signature).replaceAll("\n", "<br>");
  const title = edition.title.trim() || "A note from our school";

  const masthead = newsletterMastheadHtml(school, options.branding);
  const footer = newsletterFooterHtml(signature, options.branding);

  return `<article class="newsletter storybook">${masthead}<header class="n-hero"><div class="n-eyebrow">${escapeHtml(weekLabel(edition))}</div><h2>${escapeHtml(title)}</h2>${welcome}</header><div class="n-content">${contentBlock}</div>${footer}</article>`;
}

export function editionHasContent(edition: NewsletterEdition): boolean {
  if (getWelcomeValue(edition).trim()) return true;
  if (
    edition.storyBlocks.some((b) => b.enabled && b.kind !== "welcome" && b.value.trim())
  ) {
    return true;
  }
  if (Object.values(edition.teacherUpdates).some((t) => t.trim())) return true;
  if (edition.events.length) return true;
  if (edition.reminders.some((r) => r.text.trim())) return true;
  if (edition.photos.length) return true;
  return false;
}

export { weekLabel, plusDays, shortDate } from "./newsletter-dates";
