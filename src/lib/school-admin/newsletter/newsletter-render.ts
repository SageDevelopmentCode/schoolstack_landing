import type { StaffMemberRecord } from "@/lib/staff/staff-members";
import { splitPlainTextLinks } from "@/lib/text/plain-text-links";
import { staffDisplayName } from "@/lib/staff/staff-display";
import {
  MUDKITCHEN_FOOTER_LABEL,
  MUDKITCHEN_LOGO_ALT,
  MUDKITCHEN_LOGO_PATH,
  MUDKITCHEN_SITE_URL,
  NEWSLETTER_MASTHEAD_TAGLINE,
  mudkitchenLogoUrlForExport,
  resolveNewsletterAbsoluteAssetUrl,
  type NewsletterVisualBranding,
} from "./newsletter-branding";
import { newsletterAccentInlineStyle, newsletterAccentPalette } from "./newsletter-colors";
import { getWelcomeValue } from "./newsletter-template";
import type {
  NewsletterEdition,
  NewsletterSchoolMeta,
  NewsletterSchoolTemplate,
  NewsletterStoryBlock,
} from "./newsletter-types";
import { weekLabel } from "./newsletter-dates";
import {
  getNewsletterHeroCoverSrc,
  newsletterHeroCoverOverlayInlineStyle,
} from "./newsletter-hero-cover";

/**
 * The newsletter renderer. One HTML string drives every viewer: the admin
 * builder (with `editable`), the parent and staff web pages, the full-screen
 * reader, the mobile WebView and downloads. Styles: `newsletter-styles.ts`.
 */

export function escapeHtml(value: string): string {
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

/**
 * Escapes admin-written text and turns http(s) URLs into links that open
 * outside the newsletter (new tab on web; the app's WebView hands them to
 * the in-app browser). Only http(s) is ever linked.
 */
export function linkifyText(value: string): string {
  return splitPlainTextLinks(value)
    .map((segment) =>
      segment.type === "link"
        ? `<a class="n-link" href="${escapeHtml(segment.href)}" target="_blank" rel="noopener noreferrer">${escapeHtml(segment.value)}</a>`
        : escapeHtml(segment.value),
    )
    .join("");
}

function paragraph(value: string): string {
  const trimmed = value.trim();
  return trimmed ? `<p>${linkifyText(trimmed)}</p>` : "";
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

const TICK_SVG =
  '<svg class="n-tick" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 13.2c2.4 1.5 3.9 3.4 5 5.8C11.6 12.2 15.3 7.4 20 4.4" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';

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
      const quote = value.replace(/^['"“”]|['"“”]$/g, "");
      return `<div class="n-quote">${linkifyText(quote)}</div>`;
    }
    default:
      return paragraph(value);
  }
}

/** A builder region id: what the admin clicks in the newsletter to edit it. */
export type NewsletterRegion =
  | "cover"
  | `story:${string}`
  | "teachers"
  | "events"
  | "reminders"
  | "photos";

export type BuildContentOptions = {
  staff?: Array<
    Pick<StaffMemberRecord, "id" | "firstName" | "lastName"> &
      Partial<Pick<StaffMemberRecord, "email">>
  >;
  template?: NewsletterSchoolTemplate;
  branding?: NewsletterVisualBranding;
  primaryColor?: string;
  /**
   * Admin builder only: wrap each part in a clickable edit region and show
   * placeholders for empty sections. Never set for family- or staff-facing output.
   */
  editable?: boolean;
  /** Builder only: the region whose editor is open. */
  activeRegion?: NewsletterRegion | null;
};

const REGION_LABELS: Record<string, string> = {
  cover: "Edit the title, cover, dates and welcome",
  teachers: "Edit teacher updates",
  events: "Edit dates for your calendar",
  reminders: "Edit reminders",
  photos: "Edit photos",
};

function regionHtml(
  options: BuildContentOptions,
  region: NewsletterRegion,
  inner: string,
  label?: string,
): string {
  if (!options.editable) return inner;
  const id = escapeHtml(region);
  const active = options.activeRegion === region ? " is-active" : "";
  const aria = escapeHtml(label ?? REGION_LABELS[region] ?? "Edit this part");
  return `<div class="n-region${active}" data-n-edit="${id}">${inner}<button type="button" class="n-edit-hit" data-n-edit="${id}" aria-label="${aria}"></button><span class="n-edit-chip" aria-hidden="true">✎ Edit</span></div>`;
}

function sectionHtml(title: string, body: string): string {
  return `<section class="n-section"><h3 class="n-h">${escapeHtml(title)}</h3><div class="n-body">${body}</div></section>`;
}

function placeholderSectionHtml(title: string, hint: string): string {
  return `<section class="n-section"><h3 class="n-h">${escapeHtml(title)}</h3><div class="n-placeholder">${escapeHtml(hint)}</div></section>`;
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const letters = (parts[0]?.[0] ?? "") + (parts.length > 1 ? parts[parts.length - 1][0] : "");
  return letters.toUpperCase() || "•";
}

export function teacherUpdatesHeading(template?: NewsletterSchoolTemplate): string {
  return template?.teacherUpdatesHeading?.trim() || "Class updates";
}

export const NEWSLETTER_SECTION_TITLES = {
  events: "Dates for your calendar",
  reminders: "A few reminders",
  photos: "Moments from our days",
} as const;

export function storyBlockTitle(block: NewsletterStoryBlock): string {
  return block.heading.trim() || block.prompt;
}

export function buildNewsletterContentHtml(
  edition: NewsletterEdition,
  options: BuildContentOptions = {},
): string {
  const editable = Boolean(options.editable);
  let out = "";

  for (const block of edition.storyBlocks) {
    if (!block.enabled || block.kind === "welcome") continue;
    const content = blockContentHtml(block);
    const title = storyBlockTitle(block);
    const region = `story:${block.id}` as NewsletterRegion;
    if (content.trim()) {
      out += regionHtml(options, region, sectionHtml(title, content), `Edit “${title}”`);
    } else if (editable) {
      out += regionHtml(
        options,
        region,
        placeholderSectionHtml(title, block.prompt.trim() || "Add a few lines"),
        `Edit “${title}”`,
      );
    }
  }

  if (edition.sections.teacherUpdates && (options.staff?.length || editable)) {
    const heading = teacherUpdatesHeading(options.template);
    const cards = (options.staff ?? [])
      .map((member) => {
        const text = edition.teacherUpdates[member.id]?.trim();
        if (!text) return "";
        const name = staffDisplayName(member);
        return `<div class="n-teacher"><span class="n-avatar" aria-hidden="true">${escapeHtml(initials(name))}</span><div><strong>${escapeHtml(name)}</strong>${paragraph(text)}</div></div>`;
      })
      .filter(Boolean)
      .join("");
    if (cards) {
      out += regionHtml(options, "teachers", sectionHtml(heading, `<div class="n-teachers">${cards}</div>`));
    } else if (editable) {
      out += regionHtml(
        options,
        "teachers",
        placeholderSectionHtml(heading, "Add a short update from each teacher"),
      );
    }
  }

  if (edition.sections.events) {
    if (edition.events.length) {
      const eventsHtml = edition.events
        .map((event) => {
          const month = shortDate(event.date, { month: "short" }).toUpperCase();
          const day = shortDate(event.date, { day: "numeric" });
          return `<div class="n-event"><div class="n-date">${escapeHtml(month)}<strong>${escapeHtml(day)}</strong></div><div class="n-event-body"><strong>${escapeHtml(event.title)}</strong>${event.time ? `<p class="n-event-time">${escapeHtml(event.time)}</p>` : ""}${event.note ? `<p>${linkifyText(event.note)}</p>` : ""}</div></div>`;
        })
        .join("");
      out += regionHtml(
        options,
        "events",
        sectionHtml(NEWSLETTER_SECTION_TITLES.events, `<div class="n-events">${eventsHtml}</div>`),
      );
    } else if (editable) {
      out += regionHtml(
        options,
        "events",
        placeholderSectionHtml(NEWSLETTER_SECTION_TITLES.events, "Add an upcoming date"),
      );
    }
  }

  if (edition.sections.reminders) {
    const reminders = edition.reminders.filter((r) => r.text.trim());
    if (reminders.length) {
      const list = reminders.map((r) => `<li>${TICK_SVG}<span>${linkifyText(r.text.trim())}</span></li>`).join("");
      out += regionHtml(
        options,
        "reminders",
        sectionHtml(NEWSLETTER_SECTION_TITLES.reminders, `<ul class="n-reminders">${list}</ul>`),
      );
    } else if (editable) {
      out += regionHtml(
        options,
        "reminders",
        placeholderSectionHtml(NEWSLETTER_SECTION_TITLES.reminders, "Add a reminder for families"),
      );
    }
  }

  if (edition.sections.photos) {
    if (edition.photos.length) {
      const photos = edition.photos
        .map(
          (p) =>
            `<figure class="n-polaroid"><img src="${escapeHtml(p.src)}" loading="lazy" decoding="async" alt="${escapeHtml(p.caption || "School-day photo")}">${p.caption ? `<figcaption>${escapeHtml(p.caption)}</figcaption>` : ""}</figure>`,
        )
        .join("");
      out += regionHtml(
        options,
        "photos",
        sectionHtml(NEWSLETTER_SECTION_TITLES.photos, `<div class="n-photos">${photos}</div>`),
      );
    } else if (editable) {
      out += regionHtml(
        options,
        "photos",
        placeholderSectionHtml(NEWSLETTER_SECTION_TITLES.photos, "Add photos from the week"),
      );
    }
  }

  return out;
}

function newsletterMastheadHtml(
  school: NewsletterSchoolMeta,
  branding?: NewsletterVisualBranding,
): string {
  const mkSrc = branding?.mudkitchenLogoSrc ?? mudkitchenLogoUrlForExport();
  const schoolName = escapeHtml(school.name);
  const schoolLogo = branding?.schoolLogoSrc?.trim();
  const logoAlt = escapeHtml(branding?.schoolLogoAlt?.trim() || school.name);
  const schoolInner = schoolLogo
    ? `<img class="n-logo n-logo-school" src="${escapeHtml(schoolLogo)}" alt="${logoAlt}">`
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

  const signature = signatureHtml ? `<div class="n-footer-signature">${signatureHtml}</div>` : "";
  return `<footer class="n-footer">${signature}${mkRow}</footer>`;
}

function newsletterHeroInnerHtml(
  edition: NewsletterEdition,
  title: string,
  welcome: string,
): string {
  const welcomeHtml = welcome ? `<div class="n-welcome">${welcome}</div>` : "";
  return `<div class="n-eyebrow">${escapeHtml(weekLabel(edition))}</div><h2 class="n-title">${escapeHtml(title)}</h2>${welcomeHtml}`;
}

export function newsletterHeroHtml(
  edition: NewsletterEdition,
  options: BuildContentOptions,
  title: string,
  welcome: string,
): string {
  const inner = newsletterHeroInnerHtml(edition, title, welcome);
  const rawCoverSrc = getNewsletterHeroCoverSrc(edition);
  if (!rawCoverSrc) {
    return `<header class="n-hero">${inner}</header>`;
  }
  const coverSrc = resolveNewsletterAbsoluteAssetUrl(rawCoverSrc) ?? rawCoverSrc;
  // Overlay in the readable (deep) accent so white type passes on light brand colours.
  const style = newsletterHeroCoverOverlayInlineStyle(
    newsletterAccentPalette(options.primaryColor).deep,
  );
  const coverImg = `<img class="n-hero-media" src="${escapeHtml(coverSrc)}" alt="">`;
  return `<header class="n-hero n-hero--cover" style="${style}">${coverImg}<div class="n-hero-overlay" aria-hidden="true"></div><div class="n-hero-inner">${inner}</div></header>`;
}

export function newsletterTitle(edition: NewsletterEdition): string {
  return edition.title.trim() || "A note from our school";
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
  const signature = escapeHtml(school.signature.trim()).replaceAll("\n", "<br>");
  const title = newsletterTitle(edition);

  const masthead = newsletterMastheadHtml(school, options.branding);
  const footer = newsletterFooterHtml(signature, options.branding);
  const hero = regionHtml(options, "cover", newsletterHeroHtml(edition, options, title, welcome));
  const accentStyle = newsletterAccentInlineStyle(options.primaryColor || school.primary);

  return `<article class="newsletter n-garden storybook" style="${accentStyle}"><div class="n-sheet">${masthead}${hero}<div class="n-content">${contentBlock}</div>${footer}</div></article>`;
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
