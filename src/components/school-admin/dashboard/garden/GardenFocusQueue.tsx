"use client";

import Link from "next/link";
import { ArrowRight, ChevronRight } from "lucide-react";
import { Tick } from "@/components/garden/ui";
import { useCelebrate } from "@/components/school-parent/garden/motion";
import {
  GCard,
  G_FOCUS,
  gBtnOnAccent,
} from "@/components/school-parent/garden/ui";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";
import type { DashboardFocusItem } from "@/lib/school-admin/dashboard-summary";
import { FOCUS_ICONS, FOCUS_TINTS, ROW_INTERACTIVE } from "./shared";

/** Strip a trailing arrow from server CTA labels ("Open →" → "Open"). */
export function ctaText(label: string): string {
  return label.replace(/\s*[→>]+\s*$/u, "").trim() || label;
}

export function focusTitle(count: number): string {
  return count > 0
    ? `${count} thing${count === 1 ? "" : "s"} need your attention`
    : "You're caught up for now";
}

/**
 * Today's focus as an admin work queue (Start-here recipe): the first item is
 * a solid accent strip, the rest are numbered rows. Caught-up state on mint.
 */
export default function GardenFocusQueue({
  theme,
  items,
  index = 1,
  className = "",
}: {
  theme: ParentThemeTokens;
  items: DashboardFocusItem[];
  index?: number;
  className?: string;
}) {
  const caughtUp = items.length === 0;
  useCelebrate(caughtUp, theme, "admin-dashboard-caught-up");

  const [lead, ...rest] = items;

  return (
    <GCard
      index={index}
      kicker="Today's focus"
      title={focusTitle(items.length)}
      className={className}
      data-testid="dashboard-focus-queue"
    >
      {caughtUp ? (
        <GardenCaughtUp />
      ) : (
        <>
          <p className="m-0 mb-4 max-w-xl text-[13px] font-semibold text-[var(--sf-soft)]">
            Prioritize the work only you can do, then let the rest of the system stay
            organized in the background.
          </p>
          {lead ? <FocusLeadStrip item={lead} /> : null}
          {rest.length > 0 ? (
            <ol className="m-0 mt-3 flex list-none flex-col divide-y divide-[var(--sf-ink)]/[0.08] p-0">
              {rest.map((item, i) => (
                <li key={item.id}>
                  <FocusRow item={item} step={i + 2} />
                </li>
              ))}
            </ol>
          ) : null}
        </>
      )}
    </GCard>
  );
}

export function FocusLeadStrip({ item }: { item: DashboardFocusItem }) {
  const Icon = FOCUS_ICONS[item.icon];
  return (
    <Link
      href={item.href}
      className={`group flex flex-col gap-4 rounded-[18px] bg-[var(--sf-clay)] p-4 text-white no-underline sm:flex-row sm:items-center sm:p-5 ${G_FOCUS}`}
      data-testid={`dashboard-focus-${item.id}`}
    >
      <span className="flex items-center gap-3 sm:contents">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/15 ring-2 ring-white/70">
          <Icon className="h-5 w-5 text-white" aria-hidden />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-[11px] font-extrabold uppercase tracking-[0.16em] text-white/70">
            Do this first
          </span>
          <span className="mt-0.5 block text-[17px] font-extrabold leading-snug">{item.title}</span>
          <span className="mt-0.5 block text-[13px] font-semibold text-white/85">{item.subtitle}</span>
        </span>
      </span>
      <span className={`${gBtnOnAccent} self-start sm:self-auto`} aria-hidden="true">
        {ctaText(item.ctaLabel)} <ArrowRight className="h-4 w-4" />
      </span>
    </Link>
  );
}

export function FocusRow({ item, step }: { item: DashboardFocusItem; step?: number }) {
  const Icon = FOCUS_ICONS[item.icon];
  return (
    <Link
      href={item.href}
      className={`${ROW_INTERACTIVE} no-underline`}
      data-testid={`dashboard-focus-${item.id}`}
    >
      {step != null ? (
        <span
          aria-hidden="true"
          className="w-5 shrink-0 text-center text-[13px] font-extrabold tabular-nums text-[var(--sf-ink)]/40"
        >
          {step}
        </span>
      ) : null}
      <span
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-[12px] ${FOCUS_TINTS[item.icon]}`}
        aria-hidden="true"
      >
        <Icon className="h-4 w-4 text-[var(--sf-ink)]/80" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[15px] font-extrabold leading-snug text-[var(--sf-ink)]">
          {item.title}
        </span>
        <span className="block text-[13px] font-semibold text-[var(--sf-soft)]">{item.subtitle}</span>
      </span>
      <span className="inline-flex shrink-0 items-center gap-1 text-sm font-extrabold text-[var(--sf-clay-deep)]">
        <span className="hidden sm:inline">{ctaText(item.ctaLabel)}</span>
        <ChevronRight
          className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5"
          aria-hidden
        />
      </span>
    </Link>
  );
}

export function GardenCaughtUp({ line = "Nothing needs you right now. New work shows up here as it arrives." }: { line?: string }) {
  return (
    <div className="flex items-center gap-4 rounded-[18px] bg-[var(--sf-mint)] p-5">
      <Tick className="h-12 w-12" color="var(--sf-forest)" />
      <div>
        <p className="m-0 text-[15px] font-semibold text-[var(--sf-ink)]/80">{line}</p>
        <span aria-hidden="true" className="sf-hand mt-1 block text-xl text-[var(--sf-forest)]">
          enjoy the quiet ✿
        </span>
      </div>
    </div>
  );
}
