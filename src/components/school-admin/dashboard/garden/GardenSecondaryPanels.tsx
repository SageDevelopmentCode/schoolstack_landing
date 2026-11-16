"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Check,
  ChevronRight,
  Copy,
  Link2,
  MessageSquare,
  PencilLine,
  ClipboardList,
} from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { PORTAL_EASE } from "@/components/school-parent/garden/motion";
import {
  GCard,
  GChip,
  GKicker,
  G_FOCUS,
  gLinkSm,
  type GChipTone,
} from "@/components/school-parent/garden/ui";
import type { AdminDashboardModel } from "@/components/school-admin/dashboard/useAdminDashboardModel";
import { schoolMudKitchenPortalPath } from "@/lib/organization-settings/admin-routes";
import { formatProgressEntryDate } from "@/lib/organization-progress";
import { adminToast } from "@/lib/school-admin/admin-toast";
import type { JourneySection } from "@/lib/school-admin/dashboard-family-journey";
import {
  activityCategoryChipTone,
  activityCategoryLabel,
  type DashboardQuickAction,
} from "@/lib/school-admin/dashboard-summary";
import { GardenLoadError, GardenPanelSkeleton, ROW_INTERACTIVE } from "./shared";

/* ------------------------------------------------------------------ */
/* Journey                                                             */
/* ------------------------------------------------------------------ */

/**
 * Family journey: a 4-stage stepper (prospects → enrolled) that switches the
 * shortcut tiles below. Same links and test ids as the story panel.
 */
export function GardenJourneyPanel({ sections }: { sections: JourneySection[] }) {
  const reduce = useReducedMotion() === true;
  const [activeIndex, setActiveIndex] = useState(0);
  const clamped = sections.length === 0 ? 0 : Math.min(activeIndex, sections.length - 1);
  const active = sections[clamped];

  if (!active) {
    return (
      <GCard kicker="Family journey" title="Nothing to show yet">
        <p className="m-0 text-[14px] font-semibold text-[var(--sf-soft)]">
          Journey shortcuts appear when admissions, schedule, or school workspace features are
          enabled.
        </p>
      </GCard>
    );
  }

  return (
    <div className="flex flex-col gap-5" data-testid="dashboard-journey-panel">
      <GCard index={1} kicker="Family journey" title="Where families are, and where you go next">
        {sections.length > 1 ? (
          <div role="tablist" aria-label="Journey stages" className="relative">
            <div
              aria-hidden="true"
              className="absolute left-[12.5%] right-[12.5%] top-[19px] h-[3px] rounded-full bg-[var(--sf-ink)]/10"
            />
            <div
              className="grid"
              style={{ gridTemplateColumns: `repeat(${sections.length}, minmax(0, 1fr))` }}
            >
              {sections.map((section, i) => {
                const on = i === clamped;
                const reached = i <= clamped;
                const Icon = section.icon;
                return (
                  <button
                    key={section.id}
                    type="button"
                    role="tab"
                    aria-selected={on}
                    aria-label={`${section.label}: ${section.description}`}
                    onClick={() => setActiveIndex(i)}
                    data-testid={`journey-stage-${section.id}`}
                    className={`group relative flex min-w-0 flex-col items-center gap-2 rounded-[16px] px-1 pb-1 ${G_FOCUS}`}
                  >
                    <span
                      className={`relative z-10 flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all duration-300 ${
                        on
                          ? "scale-110 border-[var(--sf-ink)] bg-[var(--sf-clay)] text-white shadow-[0_3px_0_0_var(--sf-ink)]"
                          : reached
                            ? "border-[var(--sf-clay)] bg-[var(--sf-accent-wash)] text-[var(--sf-clay-deep)]"
                            : "border-[var(--sf-ink)]/15 bg-white text-[var(--sf-ink)]/50 group-hover:border-[var(--sf-ink)]/35"
                      }`}
                    >
                      <Icon className="h-4 w-4" aria-hidden />
                    </span>
                    <span
                      className={`max-w-full truncate text-[12px] font-extrabold sm:text-[13px] ${
                        on ? "text-[var(--sf-ink)]" : "text-[var(--sf-ink)]/55"
                      }`}
                    >
                      {section.label}
                    </span>
                    <span className="hidden max-w-[180px] text-center text-[11.5px] font-semibold leading-snug text-[var(--sf-soft)] md:block">
                      {section.description}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        ) : null}
      </GCard>

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={active.id}
          initial={reduce ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduce ? undefined : { opacity: 0, y: -4 }}
          transition={{ duration: 0.25, ease: PORTAL_EASE }}
        >
          <GCard kicker={active.label} title="Where to go next" headingLevel="h3">
            <ul className="m-0 grid list-none gap-3 p-0 sm:grid-cols-2 xl:grid-cols-3">
              {active.links.map((link) => {
                const Icon = link.icon;
                return (
                  <li key={link.id}>
                    <Link
                      href={link.href}
                      aria-label={link.title}
                      data-testid={`journey-link-${link.id}`}
                      className={`group flex h-full overflow-hidden rounded-[18px] border-[1.5px] border-[var(--sf-ink)]/10 bg-white no-underline transition-all duration-200 hover:-translate-y-0.5 hover:border-[var(--sf-ink)]/25 hover:shadow-[0_3px_0_0_rgba(43,36,29,0.08)] ${G_FOCUS}`}
                    >
                      <span className="relative hidden w-24 shrink-0 sm:block">
                        <Image src={link.bannerSrc} alt="" fill sizes="96px" className="object-cover" aria-hidden />
                      </span>
                      <span className="flex min-w-0 flex-1 flex-col gap-1 p-4">
                        <span className="flex items-center justify-between gap-2">
                          <span className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-[var(--sf-accent-wash)] text-[var(--sf-clay-deep)]">
                            <Icon className="h-4 w-4" aria-hidden />
                          </span>
                          <ChevronRight
                            className="h-4 w-4 text-[var(--sf-ink)]/40 transition-transform duration-200 group-hover:translate-x-0.5"
                            aria-hidden
                          />
                        </span>
                        <span className="mt-1 text-[15px] font-extrabold leading-snug text-[var(--sf-ink)]">
                          {link.title}
                        </span>
                        <span className="line-clamp-3 text-[12.5px] font-semibold leading-snug text-[var(--sf-soft)]">
                          {link.subtitle}
                        </span>
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </GCard>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Activity                                                            */
/* ------------------------------------------------------------------ */

const CATEGORY_TONE: Record<ReturnType<typeof activityCategoryChipTone>, GChipTone> = {
  success: "success",
  warning: "warning",
  info: "info",
  purple: "neutral",
};

function relativeDay(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const diffMin = Math.round((Date.now() - date.getTime()) / 60000);
  if (diffMin < 1) return "Just now";
  if (diffMin < 60) return `${diffMin} min ago`;
  const diffHr = Math.round(diffMin / 60);
  if (diffHr < 24) return `${diffHr} hr ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function GardenActivityPanel({
  model,
  onViewAll,
}: {
  model: AdminDashboardModel;
  onViewAll: () => void;
}) {
  if (!model.activity) {
    return model.activityError ? (
      <GardenLoadError
        title="Couldn't load recent activity"
        description="Your activity is safe. Try again in a moment."
        onRetry={() => model.retrySection("activity")}
        retrying={model.loadingTabKey === "activity"}
      />
    ) : (
      <GardenPanelSkeleton label="Loading activity…" />
    );
  }
  const { recentActivity, quickActions } = model.activity;
  return (
    <div className="grid items-start gap-5 lg:grid-cols-[1.55fr_1fr]">
      <GCard
        index={1}
        kicker="Activity"
        title="Recent school activity"
        action={
          <button type="button" onClick={onViewAll} className={gLinkSm}>
            View all <ArrowRight className="h-3.5 w-3.5" aria-hidden />
          </button>
        }
      >
        <p className="m-0 -mt-2 mb-3 text-[13px] font-semibold text-[var(--sf-soft)]">
          Important changes across families and operations.
        </p>
        {recentActivity.length === 0 ? (
          <p className="m-0 rounded-[16px] bg-[var(--sf-paper)] p-4 text-[14px] font-semibold text-[var(--sf-soft)]">
            No recent activity yet.
          </p>
        ) : (
          <ul className="m-0 flex list-none flex-col divide-y divide-[var(--sf-ink)]/[0.07] rounded-[18px] border-[1.5px] border-[var(--sf-ink)]/10 bg-white p-1">
            {recentActivity.map((item) => (
              <li key={item.id}>
                <Link href={item.href} className={`${ROW_INTERACTIVE} items-start no-underline`}>
                  <GChip tone={CATEGORY_TONE[activityCategoryChipTone(item.category)]} className="mt-0.5">
                    {activityCategoryLabel(item.category)}
                  </GChip>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[14px] font-extrabold leading-snug text-[var(--sf-ink)]">
                      {item.category === "payments" ? item.detail : item.title}
                    </span>
                    {item.category !== "payments" ? (
                      <span className="line-clamp-2 block text-[12.5px] font-semibold leading-snug text-[var(--sf-soft)]">
                        {item.detail}
                      </span>
                    ) : null}
                    <span className="mt-0.5 block text-[11.5px] font-bold text-[var(--sf-ink)]/40">
                      {relativeDay(item.createdAt)}
                    </span>
                  </span>
                  <span className="mt-0.5 inline-flex shrink-0 items-center gap-1 text-[13px] font-extrabold text-[var(--sf-clay-deep)]">
                    <span className="hidden sm:inline">{item.ctaLabel}</span>
                    <ChevronRight className="h-4 w-4" aria-hidden />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </GCard>

      {quickActions.length > 0 ? (
        <GCard index={2} kicker="Quick actions" title="Keep moving">
          <ul className="m-0 flex list-none flex-col gap-1 p-0">
            {quickActions.map((action) => (
              <li key={action.id}>
                {action.kind === "copy-apply-link" ? (
                  <CopyApplyLinkRow action={action} />
                ) : (
                  <Link href={action.href} className={`${ROW_INTERACTIVE} no-underline`}>
                    <QuickActionIcon id={action.id} />
                    <span className="min-w-0 flex-1">
                      <span className="block text-[14px] font-extrabold text-[var(--sf-ink)]">{action.title}</span>
                      <span className="block text-[12.5px] font-semibold leading-snug text-[var(--sf-soft)]">
                        {action.subtitle}
                      </span>
                    </span>
                    <ChevronRight className="h-4 w-4 shrink-0 text-[var(--sf-ink)]/40" aria-hidden />
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </GCard>
      ) : null}
    </div>
  );
}

function QuickActionIcon({ id }: { id: string }) {
  const Icon =
    id === "submissions" ? ClipboardList : id === "edit-apply-form" ? PencilLine : id === "messages" ? MessageSquare : Link2;
  return (
    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[12px] bg-[var(--sf-accent-wash)] text-[var(--sf-clay-deep)]" aria-hidden="true">
      <Icon className="h-4 w-4" />
    </span>
  );
}

function CopyApplyLinkRow({
  action,
}: {
  action: Extract<DashboardQuickAction, { kind: "copy-apply-link" }>;
}) {
  const [copied, setCopied] = useState(false);
  useEffect(() => {
    if (!copied) return;
    const timer = window.setTimeout(() => setCopied(false), 2000);
    return () => window.clearTimeout(timer);
  }, [copied]);

  const handleCopy = useCallback(async () => {
    const absoluteUrl = `${window.location.origin}${action.applyFormPublicPath}`;
    try {
      await navigator.clipboard.writeText(absoluteUrl);
      setCopied(true);
      adminToast.success("Link copied", {
        id: "copy-apply-link",
        description: "Paste it anywhere families will see it. Parents choose their program inside the application.",
      });
    } catch {
      adminToast.error("Could not copy link.", {
        id: "copy-apply-link",
        description: absoluteUrl,
      });
    }
  }, [action.applyFormPublicPath]);

  return (
    <button
      type="button"
      onClick={() => void handleCopy()}
      className={`${ROW_INTERACTIVE} ${copied ? "!bg-[var(--sf-mint)]" : ""}`}
      aria-live="polite"
    >
      <span
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-[12px] transition-colors ${
          copied ? "bg-[var(--sf-forest)] text-white" : "bg-[var(--sf-accent-wash)] text-[var(--sf-clay-deep)]"
        }`}
        aria-hidden="true"
      >
        {copied ? <Check className="h-4 w-4" strokeWidth={3} /> : <Copy className="h-4 w-4" />}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[14px] font-extrabold text-[var(--sf-ink)]">
          {copied ? "Link copied" : action.title}
        </span>
        <span className="block text-[12.5px] font-semibold leading-snug text-[var(--sf-soft)]">
          {action.subtitle}
        </span>
      </span>
    </button>
  );
}

/* ------------------------------------------------------------------ */
/* Guides                                                              */
/* ------------------------------------------------------------------ */

export function GardenGuidesPanel({
  model,
  slug,
}: {
  model: AdminDashboardModel;
  slug: string;
}) {
  if (!model.guides) {
    return model.guidesError ? (
      <GardenLoadError
        title="Couldn't load guides"
        description="Try again in a moment."
        onRetry={() => model.retrySection("guides")}
        retrying={model.loadingTabKey === "guides"}
      />
    ) : (
      <GardenPanelSkeleton label="Loading guides…" />
    );
  }
  const announcements = model.guides.featureAnnouncements;
  const groups = model.groupedHowToGuides.filter((group) => group.guides.length > 0);

  if (announcements.length === 0 && groups.length === 0) {
    return (
      <GCard kicker="Guides">
        <p className="m-0 text-[14px] font-semibold text-[var(--sf-soft)]">
          Guides and product updates will show up here when they are available.
        </p>
      </GCard>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      {announcements.length > 0 ? (
        <GCard
          index={1}
          kicker="What's new"
          title="New features for you"
          action={
            <Link href={schoolMudKitchenPortalPath(slug, "build-log")} className={gLinkSm}>
              View full build log <ArrowRight className="h-3.5 w-3.5" aria-hidden />
            </Link>
          }
        >
          <ul className="m-0 grid list-none gap-3 p-0 md:grid-cols-2 xl:grid-cols-3">
            {announcements.map((announcement) => (
              <li key={announcement.id} className="flex flex-col rounded-[18px] border-[1.5px] border-[var(--sf-ink)]/10 bg-[var(--sf-paper)] p-4">
                <time className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-[var(--sf-soft)]" dateTime={announcement.publishedAt}>
                  {formatProgressEntryDate(announcement.publishedAt)}
                </time>
                <h3 className="m-0 mt-1.5 text-[15px] font-extrabold leading-snug text-[var(--sf-ink)]">
                  {announcement.title}
                </h3>
                <p className="m-0 mt-1.5 flex-1 text-[13px] font-semibold leading-relaxed text-[var(--sf-soft)]">
                  {announcement.description}
                </p>
                <Link href={announcement.href} className={`${gLinkSm} mt-3`}>
                  {announcement.ctaLabel} <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                </Link>
              </li>
            ))}
          </ul>
        </GCard>
      ) : null}

      {groups.length > 0 ? (
        <GCard
          index={2}
          kicker="How-to guides"
          title="Step-by-step help"
          action={
            <Link href={`/school/${slug}/admin/documentation`} className={gLinkSm}>
              View full how-to guides <ArrowRight className="h-3.5 w-3.5" aria-hidden />
            </Link>
          }
        >
          <div className="grid gap-x-6 gap-y-5 md:grid-cols-2 xl:grid-cols-3">
            {groups.map((group) => (
              <section key={group.category} aria-label={group.category}>
                <GKicker className="mb-1.5 px-3">{group.category}</GKicker>
                <ul className="m-0 flex list-none flex-col p-0">
                  {group.guides.map((guide) => (
                    <li key={guide.id}>
                      <button
                        type="button"
                        onClick={() => model.openGuide(guide)}
                        className={`${ROW_INTERACTIVE} !py-2.5`}
                      >
                        <BookOpen className="h-4 w-4 shrink-0 text-[var(--sf-clay-deep)]" aria-hidden />
                        <span className="min-w-0 flex-1 text-[14px] font-bold text-[var(--sf-ink)]">{guide.title}</span>
                        <ChevronRight className="h-4 w-4 shrink-0 text-[var(--sf-ink)]/35" aria-hidden />
                      </button>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        </GCard>
      ) : null}
    </div>
  );
}
