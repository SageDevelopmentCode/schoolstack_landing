"use client";

import Link from "next/link";
import { ArrowRight, ChevronRight } from "lucide-react";
import { Tick } from "@/components/garden/ui";
import { useCelebrate } from "@/components/school-parent/garden/motion";
import { GCard, G_FOCUS, gBtnOnAccent } from "@/components/school-parent/garden/ui";
import { ROW_INTERACTIVE } from "@/components/school-admin/dashboard/garden/shared";
import type { TeacherDashboardFocusItem } from "@/lib/school-teacher/teacher-dashboard-summary";
import type { TeacherDashboardModel } from "../useTeacherDashboardModel";
import { TEACHER_FOCUS_CTA, TEACHER_FOCUS_ICONS, TEACHER_FOCUS_TINTS } from "./parts";

/**
 * "Start here" work queue (admin focus-queue recipe): the first item is a
 * solid accent strip, the rest are numbered rows, caught-up state on mint.
 */
export default function TeacherStartHereCard({ model }: { model: TeacherDashboardModel }) {
  const items = model.focusItems;
  const caughtUp = items.length === 0;
  // When roll call is what cleared the queue, the day rhythm celebrates instead (one burst).
  useCelebrate(
    caughtUp && !model.previewMode && !model.rollCallDoneToday,
    model.theme,
    "teacher-dashboard-caught-up",
  );
  const [lead, ...rest] = items;

  return (
    <GCard
      index={1}
      kicker="Start here"
      title={
        caughtUp
          ? "You're all caught up"
          : `${items.length} thing${items.length === 1 ? "" : "s"} need your attention`
      }
      data-testid="teacher-dashboard-start-here"
    >
      {caughtUp ? (
        <div className="flex items-center gap-4 rounded-[18px] bg-[var(--sf-mint)] p-5">
          <Tick className="h-12 w-12" color="var(--sf-forest)" />
          <div>
            <p className="m-0 text-[15px] font-semibold text-[var(--sf-ink)]/80">
              No urgent tasks right now. Check back for messages and school updates.
            </p>
            <span aria-hidden="true" className="sf-hand mt-1 block text-xl text-[var(--sf-forest)]">
              enjoy the quiet ✿
            </span>
          </div>
        </div>
      ) : (
        <>
          {lead ? <LeadStrip item={lead} /> : null}
          {rest.length > 0 ? (
            <ol className="m-0 mt-3 flex list-none flex-col divide-y divide-[var(--sf-ink)]/[0.08] p-0">
              {rest.map((item, i) => (
                <li key={item.id}>
                  <FocusRow item={item} step={i + 2} />
                </li>
              ))}
            </ol>
          ) : null}
          <div className="mt-4 flex items-center gap-2 border-t-[1.5px] border-dashed border-[var(--sf-ink)]/12 pt-3">
            <span className="flex gap-1" aria-hidden="true">
              {items.map((item, i) => (
                <span
                  key={item.id}
                  className={`h-2 w-2 rounded-full ${i === 0 ? "bg-[var(--sf-clay)]" : "bg-[var(--sf-ink)]/15"}`}
                />
              ))}
            </span>
            <span className="text-[12px] font-semibold text-[var(--sf-soft)]">
              Start at the top. Each one opens the page where you finish it.
            </span>
          </div>
        </>
      )}
    </GCard>
  );
}

function LeadStrip({ item }: { item: TeacherDashboardFocusItem }) {
  const Icon = TEACHER_FOCUS_ICONS[item.icon];
  return (
    <Link
      href={item.href}
      className={`group flex flex-col gap-4 rounded-[18px] bg-[var(--sf-clay)] p-4 text-white no-underline sm:flex-row sm:items-center sm:p-5 ${G_FOCUS}`}
      data-testid={`teacher-dashboard-focus-${item.id}`}
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
        {TEACHER_FOCUS_CTA[item.icon]} <ArrowRight className="h-4 w-4" />
      </span>
    </Link>
  );
}

function FocusRow({ item, step }: { item: TeacherDashboardFocusItem; step: number }) {
  const Icon = TEACHER_FOCUS_ICONS[item.icon];
  return (
    <Link
      href={item.href}
      className={`${ROW_INTERACTIVE} no-underline`}
      data-testid={`teacher-dashboard-focus-${item.id}`}
    >
      <span aria-hidden="true" className="w-5 shrink-0 text-center text-[13px] font-extrabold tabular-nums text-[var(--sf-ink)]/40">
        {step}
      </span>
      <span
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-[12px] ${TEACHER_FOCUS_TINTS[item.icon]}`}
        aria-hidden="true"
      >
        <Icon className="h-4 w-4 text-[var(--sf-ink)]/80" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[15px] font-extrabold leading-snug text-[var(--sf-ink)]">{item.title}</span>
        <span className="block text-[13px] font-semibold text-[var(--sf-soft)]">{item.subtitle}</span>
      </span>
      <span className="inline-flex shrink-0 items-center gap-1 text-sm font-extrabold text-[var(--sf-clay-deep)]">
        <span className="hidden sm:inline">{TEACHER_FOCUS_CTA[item.icon]}</span>
        <ChevronRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" aria-hidden />
      </span>
    </Link>
  );
}
