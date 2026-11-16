"use client";

import Link from "next/link";
import { ArrowRight, ChevronRight } from "lucide-react";
import { Tick } from "@/components/garden/ui";
import ParentCoopFamiliesSection from "@/components/school-parent/ParentCoopFamiliesSection";
import ParentHomeFridayBranchSection from "@/components/school-parent/home/ParentHomeFridayBranchSection";
import { ParentHomeFridayBranchSkeleton } from "@/components/school-parent/home/ParentHomeDeferredSkeleton";
import ParentOnboardingSidebar from "@/components/school-parent/ParentOnboardingSidebar";
import ParentDocumentationGuidePanel from "@/components/school-parent/ParentDocumentationGuidePanel";
import { PortalIsland } from "@/components/school-parent/garden/ParentGardenFrame";
import { GCard, GChip, GNoteTile, GSkeleton, NOTE_TINTS, G_FOCUS, gLinkSm } from "@/components/school-parent/garden/ui";
import type { ParentHomePageProps } from "../parent-home-types";
import type { ParentHomeModel } from "../useParentHomeModel";

/* Home cards below the fold: forms, what's new, guides, program blocks, drawers. */

/** Forms snapshot as a ticked notebook list. */
export function HomeFormsCard({ model, props }: { model: ParentHomeModel; props: ParentHomePageProps }) {
  const snap = props.formSnapshot;
  if (!snap) {
    return props.contentDeferred && model.formsFeatureEnabled ? <GSkeleton className="h-60" /> : null;
  }
  return (
    <GCard
      index={5}
      kicker="Forms & documents"
      title="Your family's forms"
      action={
        <Link href={snap.formsPageHref} className={gLinkSm}>
          View all forms <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
        </Link>
      }
    >
      <div className="mb-3 flex flex-wrap gap-2">
        {snap.counts.needsAction > 0 ? <GChip tone="warning">Needs action · {snap.counts.needsAction}</GChip> : null}
        {snap.counts.signed > 0 ? <GChip tone="success">Signed · {snap.counts.signed}</GChip> : null}
      </div>
      <ul className="sf-paper -mx-1 flex flex-col rounded-xl px-1">
        {snap.items.map((item) => {
          const signed = item.listStatus === "signed";
          return (
            <li key={item.formId}>
              <Link
                href={item.formsHref}
                data-testid={`parent-home-form-card-${item.formId}`}
                className={`group flex min-h-[52px] items-center gap-3 rounded-lg px-2 py-2 hover:bg-white/70 ${G_FOCUS}`}
              >
                {signed ? (
                  <Tick className="h-6 w-6" color="var(--sf-forest)" fill="var(--sf-mint)" />
                ) : (
                  <span className="h-6 w-6 shrink-0 rounded-full border-2 border-[var(--sf-ink)]/60 bg-white" aria-hidden="true" />
                )}
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[15px] font-extrabold text-[var(--sf-ink)]">{item.formTitle}</span>
                  {item.studentNames.length > 0 ? (
                    <span className="block truncate text-xs font-semibold text-[var(--sf-soft)]">{item.studentNames.join(", ")}</span>
                  ) : null}
                </span>
                <ChevronRight className="h-4 w-4 shrink-0 text-[var(--sf-ink)]/40 transition-transform duration-300 group-hover:translate-x-0.5" aria-hidden="true" />
              </Link>
            </li>
          );
        })}
      </ul>
    </GCard>
  );
}

/** MudKitchen feature announcements as pastel note links. */
export function HomeNewsCard({ props }: { props: ParentHomePageProps }) {
  const announcements = props.featureAnnouncements ?? [];
  if (announcements.length === 0) return null;
  return (
    <GCard index={6} kicker="What's new" title="New features for you">
      <ul className="flex flex-col gap-3">
        {announcements.map((a, i) => (
          <li key={a.id}>
            <GNoteTile tint={NOTE_TINTS[(i + 1) % NOTE_TINTS.length]} href={a.href} tape={false}>
              <span className="block text-[15px] font-extrabold text-[var(--sf-ink)]">{a.title}</span>
              <span className="mt-1 block text-[13px] leading-snug text-[var(--sf-ink)]/70">{a.description}</span>
              <span className="mt-2 inline-flex items-center gap-1 text-[13px] font-extrabold text-[var(--sf-clay-deep)]">
                {a.ctaLabel} <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </span>
            </GNoteTile>
          </li>
        ))}
      </ul>
    </GCard>
  );
}

/** How-to guides grouped by category; each opens the guide panel. */
export function HomeGuidesCard({ model }: { model: ParentHomeModel }) {
  if (model.howToGuides.length === 0) return null;
  return (
    <GCard
      index={7}
      kicker="How-to guides"
      title="Step-by-step help"
      action={
        <Link href={model.documentationHref} className={gLinkSm}>
          View full how-to guides <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
        </Link>
      }
    >
      <div className="grid gap-x-6 gap-y-5 md:grid-cols-2 xl:grid-cols-3">
        {model.groupedHowToGuides.map((group) => (
          <div key={group.category}>
            <h3 className="m-0 mb-1 text-xs font-extrabold uppercase tracking-[0.16em] text-[var(--sf-soft)]">{group.category}</h3>
            <ul className="flex flex-col">
              {group.guides.map((guide) => (
                <li key={guide.id} className="border-b-[1.5px] border-[var(--sf-ink)]/[0.08] last:border-b-0">
                  <button
                    type="button"
                    onClick={() => model.openGuide(guide)}
                    className={`group flex w-full items-center justify-between gap-2 rounded-md py-2.5 text-left text-sm font-extrabold text-[var(--sf-ink)] ${G_FOCUS}`}
                  >
                    {guide.title}
                    <ChevronRight className="h-4 w-4 shrink-0 text-[var(--sf-ink)]/40 transition-transform duration-300 group-hover:translate-x-0.5" aria-hidden="true" />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </GCard>
  );
}

/** Friday Branch + co-op families: not yet migrated, so rendered in portal type. */
export function HomeProgramSections({ model, props }: { model: ParentHomeModel; props: ParentHomePageProps }) {
  const {
    organizationId,
    schoolSlug,
    familyId,
    contentDeferred = false,
    previewMode = false,
    parentNavBasePath,
    fridayBranchHome = null,
    coopModeEnabled = false,
    programPortalLabel,
    coopFamilies = [],
    programId,
    schoolName,
  } = props;
  const showFriday =
    model.fridayBranchHomeEnabled &&
    organizationId &&
    (contentDeferred || (fridayBranchHome && fridayBranchHome.blocks.length > 0));
  const showCoop = coopModeEnabled && programPortalLabel;
  if (!showFriday && !showCoop) return null;
  return (
    <PortalIsland className="flex flex-col gap-6">
      {showFriday && organizationId ? (
        contentDeferred || !fridayBranchHome ? (
          <ParentHomeFridayBranchSkeleton theme={model.theme} />
        ) : (
          <ParentHomeFridayBranchSection
            theme={model.theme}
            organizationId={organizationId}
            schoolSlug={schoolSlug}
            initialBundle={fridayBranchHome}
            previewMode={previewMode}
            previewFamilyId={previewMode ? familyId : undefined}
            parentNavBasePath={parentNavBasePath}
          />
        )
      ) : null}
      {showCoop ? (
        <ParentCoopFamiliesSection
          programLabel={programPortalLabel}
          families={coopFamilies}
          organizationId={organizationId}
          programId={programId}
          schoolName={schoolName}
          messagesHref={model.messagesHref}
          messagesEnabled={model.messagesEnabled}
          previewMode={previewMode}
          contentDeferred={contentDeferred}
        />
      ) : null}
    </PortalIsland>
  );
}

/** The to-do drawer and guide panel. Render OUTSIDE ParentGardenFrame (they're portal UI). */
export function HomeOverlays({ model, props }: { model: ParentHomeModel; props: ParentHomePageProps }) {
  return (
    <>
      <ParentOnboardingSidebar
        C={model.adminCompat}
        theme={model.theme}
        open={model.onboardingOpen}
        items={props.onboardingItems ?? []}
        attentionItems={model.portalAttentionItems}
        onClose={model.closeTodos}
      />
      <ParentDocumentationGuidePanel
        theme={model.theme}
        guide={model.activeGuide}
        open={model.activeGuide != null}
        onClose={model.closeGuide}
      />
    </>
  );
}
