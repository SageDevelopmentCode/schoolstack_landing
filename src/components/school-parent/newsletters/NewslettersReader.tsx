"use client";

import Link from "next/link";
import { ArrowLeft, ArrowRight, ChevronRight, ExternalLink, Maximize2, Newspaper } from "lucide-react";
import NewsletterArticle from "@/components/school-admin/newsletter/NewsletterArticle";
import NewsletterMediaImage from "@/components/school-admin/newsletter/NewsletterMediaImage";
import ParentGardenFrame from "@/components/school-parent/garden/ParentGardenFrame";
import ParentGardenPageHeader from "@/components/school-parent/garden/ParentGardenPageHeader";
import {
  G_FOCUS,
  GCard,
  GChip,
  GKicker,
  gBtnOutlineSm,
  gBtnPopSm,
  gLinkSm,
} from "@/components/school-parent/garden/ui";
import type { OrganizationBranding } from "@/lib/organization-settings/types";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";
import type {
  ParentNewsletterDetailBundle,
  ParentNewslettersListBundle,
} from "@/lib/parent-portal/newsletters/load-parent-newsletters";
import { PORTAL_HOME_CONTAINER_CLASS } from "@/lib/portal-home/layout";
import { newsletterVisualBrandingForPreview } from "@/lib/school-admin/newsletter/newsletter-branding";
import { weekLabel } from "@/lib/school-admin/newsletter/newsletter-dates";
import type { PublishedNewsletterSummary } from "@/lib/school-admin/newsletter/newsletter-db";

export type NewslettersReaderProps = {
  theme: ParentThemeTokens;
  branding: OrganizationBranding;
  list: ParentNewslettersListBundle;
  /** The open edition (`?edition=`), or null when it couldn't be loaded. */
  editionId: string | null;
  detailBundle?: ParentNewsletterDetailBundle | null;
  /** List page path; editions open at `${basePath}?edition=…`. */
  basePath: string;
  /** Full-screen reader and raw document links (hidden in preview mode). */
  readHref?: (editionId: string) => string;
  documentHref?: (editionId: string) => string;
  previewMode?: boolean;
  "data-testid"?: string;
};

function publishedLabel(iso?: string): string | null {
  if (!iso) return null;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  return `Published ${new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(date)}`;
}

function editionTitle(edition: PublishedNewsletterSummary): string {
  return edition.title.trim() || weekLabel(edition);
}

/**
 * Newsletters for families and staff (web): the latest edition as a feature
 * card, earlier editions as rows, and the edition itself drawn by the shared
 * Garden newsletter renderer. Mirrors the mobile Garden list.
 * Rules: `.claude/skills/parent-portal-garden-design/SKILL.md`.
 */
export default function NewslettersReader({
  theme,
  branding,
  list,
  editionId,
  detailBundle,
  basePath,
  readHref,
  documentHref,
  previewMode = false,
  "data-testid": testId,
}: NewslettersReaderProps) {
  const editionHref = (id: string) => `${basePath}?edition=${encodeURIComponent(id)}`;
  const backLink = (
    <Link href={basePath} className={`${gLinkSm} ${G_FOCUS}`} data-testid="newsletters-back">
      <ArrowLeft size={16} strokeWidth={2.4} aria-hidden />
      All newsletters
    </Link>
  );

  if (editionId) {
    return (
      <ParentGardenFrame theme={theme} className="bg-[var(--sf-cream)]">
        <div className={PORTAL_HOME_CONTAINER_CLASS} data-testid={testId ? `${testId}-edition` : undefined}>
          <div className="flex flex-wrap items-center justify-between gap-3">
            {backLink}
            {detailBundle && !previewMode && (readHref || documentHref) ? (
              <div className="flex flex-wrap items-center gap-2">
                {readHref ? (
                  <a href={readHref(editionId)} className={`${gBtnOutlineSm} ${G_FOCUS}`}>
                    <Maximize2 size={15} strokeWidth={2.4} aria-hidden />
                    Full screen
                  </a>
                ) : null}
                {documentHref ? (
                  <a
                    href={documentHref(editionId)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`${gBtnOutlineSm} ${G_FOCUS}`}
                  >
                    <ExternalLink size={15} strokeWidth={2.4} aria-hidden />
                    Open in new tab
                  </a>
                ) : null}
              </div>
            ) : null}
          </div>

          {detailBundle ? (
            <>
              <h1 className="sr-only">{detailBundle.edition.title.trim() || weekLabel(detailBundle.edition)}</h1>
              <NewsletterArticle
                edition={detailBundle.edition}
                school={detailBundle.school}
                branding={newsletterVisualBrandingForPreview(branding)}
                staffMembers={detailBundle.staffMembers}
                template={detailBundle.template}
                primaryColor={detailBundle.school.primary}
              />
            </>
          ) : (
            <GCard>
              <h1 className="sf-display m-0 text-[1.5rem] leading-[1.05] text-[var(--sf-ink)]">Newsletter not found</h1>
              <p className="m-0 mt-2 text-[15px] text-[var(--sf-soft)]">
                This newsletter could not be found or is no longer available.
              </p>
            </GCard>
          )}
        </div>
      </ParentGardenFrame>
    );
  }

  const [latest, ...earlier] = list.editions;
  const count = list.editions.length;

  return (
    <ParentGardenFrame theme={theme} className="bg-[var(--sf-cream)]">
      <div className={PORTAL_HOME_CONTAINER_CLASS} data-testid={testId}>
        <ParentGardenPageHeader
          kicker="School updates"
          title="Newsletters"
          subtitle={
            count
              ? `${count} ${count === 1 ? "newsletter" : "newsletters"} · latest ${weekLabel(latest)}`
              : "Weekly stories and updates from your school."
          }
        />

        {!latest ? (
          <GCard>
            <div className="flex items-center gap-4">
              <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[var(--sf-peach)] text-[var(--sf-clay-deep)] ring-2 ring-[var(--sf-ink)]">
                <Newspaper size={22} strokeWidth={2.4} aria-hidden />
              </span>
              <p className="m-0 text-[15px] font-semibold text-[var(--sf-soft)]">
                No newsletters have been published yet.
              </p>
            </div>
          </GCard>
        ) : (
          <>
            <Link
              href={editionHref(latest.id)}
              className={`group grid overflow-hidden rounded-[28px] border-2 border-[var(--sf-ink)] bg-[var(--sf-paper)] shadow-[0_6px_0_0_var(--sf-ink)] transition-transform hover:-translate-y-0.5 md:grid-cols-[1.2fr_1fr] ${G_FOCUS}`}
              data-testid="newsletters-latest"
            >
              <div className="relative aspect-[16/9] bg-[var(--sf-peach)] md:aspect-auto md:min-h-[260px]">
                {latest.coverImage ? (
                  <NewsletterMediaImage
                    src={latest.coverImage}
                    alt=""
                    instanceKey={latest.id}
                    className="absolute inset-0 h-full w-full"
                    imageClassName="h-full w-full object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-[var(--sf-clay-deep)]" aria-hidden>
                    <Newspaper size={42} strokeWidth={2} />
                  </div>
                )}
              </div>
              <div className="flex flex-col justify-center gap-3 p-6 sm:p-8">
                <div className="flex flex-wrap items-center gap-2">
                  <GChip tone="warning">Latest</GChip>
                  <GKicker>{weekLabel(latest)}</GKicker>
                </div>
                <h2 className="sf-display m-0 text-[1.9rem] leading-[1] text-[var(--sf-ink)] sm:text-[2.2rem]">
                  {editionTitle(latest)}
                </h2>
                {publishedLabel(latest.publishedAt) ? (
                  <p className="m-0 text-[14px] font-semibold text-[var(--sf-soft)]">{publishedLabel(latest.publishedAt)}</p>
                ) : null}
                <span className={`${gBtnPopSm} mt-1 self-start`} aria-hidden>
                  Read newsletter
                  <ArrowRight size={16} strokeWidth={2.6} />
                </span>
              </div>
            </Link>

            {earlier.length ? (
              <GCard kicker="Archive" title="Earlier newsletters" index={1}>
                <ul className="m-0 flex list-none flex-col gap-1 p-0">
                  {earlier.map((edition) => (
                    <li key={edition.id}>
                      <Link
                        href={editionHref(edition.id)}
                        className={`flex items-center gap-4 rounded-[14px] px-2 py-2.5 transition-colors hover:bg-[var(--sf-accent-wash)] ${G_FOCUS}`}
                      >
                        <span className="relative h-14 w-20 shrink-0 overflow-hidden rounded-xl bg-[var(--sf-peach)]">
                          {edition.coverImage ? (
                            <NewsletterMediaImage
                              src={edition.coverImage}
                              alt=""
                              instanceKey={edition.id}
                              className="absolute inset-0 h-full w-full"
                              imageClassName="h-full w-full object-cover"
                            />
                          ) : (
                            <span className="absolute inset-0 flex items-center justify-center text-[var(--sf-clay-deep)]" aria-hidden>
                              <Newspaper size={20} strokeWidth={2.2} />
                            </span>
                          )}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-[15px] font-extrabold text-[var(--sf-ink)]">{editionTitle(edition)}</span>
                          <span className="block text-[13px] font-semibold text-[var(--sf-soft)]">
                            {weekLabel(edition)}
                            {publishedLabel(edition.publishedAt) ? ` · ${publishedLabel(edition.publishedAt)}` : ""}
                          </span>
                        </span>
                        <ChevronRight size={18} strokeWidth={2.4} className="shrink-0 text-[var(--sf-ink)]/45" aria-hidden />
                      </Link>
                    </li>
                  ))}
                </ul>
              </GCard>
            ) : null}
          </>
        )}
      </div>
    </ParentGardenFrame>
  );
}
