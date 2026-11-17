"use client";

import { ArrowRight, ShieldCheck, TrendingUp } from "lucide-react";
import { GardenStatTiles } from "@/components/school-admin/garden/kit";
import { GCard, GNoteTile, NOTE_TINTS, gLinkSm } from "@/components/school-parent/garden/ui";
import type { TeacherMyHoursModel } from "@/components/school-teacher/my-hours/useTeacherMyHoursModel";
import { draftSummary } from "@/lib/school-teacher/my-hours/adjust-validation";
import {
  formatHoursMinutes,
  formatShortWeekdayDate,
  parseDateKey,
} from "@/lib/school-teacher/my-hours/format-duration";
import { sessionCountLabel, weekToGoLabel } from "@/lib/school-teacher/my-hours/my-hours-status";

/**
 * Rail: linked week / month totals, pending changes as note tiles, recent
 * days, and how fixing a day works at this school.
 */
export default function MyHoursRail({ model }: { model: TeacherMyHoursModel }) {
  const { pageData, week, adjust, editor } = model;
  const { sidebar } = pageData;
  const toGo = weekToGoLabel(week);

  return (
    <aside className="flex min-w-0 flex-col gap-5" data-testid="teacher-my-hours-sidebar" aria-label="Your totals">
      <GardenStatTiles
        index={2}
        ariaLabel="Your totals"
        valueClassName="text-[1.7rem] sm:text-[2rem]"
        stats={[
          {
            id: "week",
            label: "This week",
            value: formatHoursMinutes(week.loggedMinutes),
            hint:
              week.goalMinutes > 0
                ? `of ${formatHoursMinutes(week.goalMinutes)}${toGo ? ` · ${toGo}` : ""}`
                : `${week.loggedWeekdays}/${week.totalWeekdays} days`,
            accent: "forest",
            onClick: () => model.setView("week"),
            active: model.view === "week",
            testId: "teacher-my-hours-stat-week",
          },
          {
            id: "month",
            label: "This month",
            value: formatHoursMinutes(sidebar.monthLoggedMinutes),
            hint: `${sidebar.monthLoggedDays} ${sidebar.monthLoggedDays === 1 ? "day" : "days"} logged`,
            accent: "sky",
            onClick: () => model.setView("month"),
            active: model.view === "month",
            testId: "teacher-my-hours-stat-month",
          },
        ]}
      />

      {adjust.pendingList.length > 0 ? (
        <GCard index={3} kicker="Waiting on your school" title="Pending changes" data-testid="teacher-my-hours-pending">
          <ul className="m-0 grid list-none grid-cols-1 gap-3 p-0 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
            {adjust.pendingList.map((item, i) => {
              const canOpen = adjust.canEditDay(item.dateKey);
              const body = (
                <>
                  <span className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-[var(--sf-ink)]/60">Pending</span>
                  <span className="mt-1 text-[15px] font-extrabold text-[var(--sf-ink)]">
                    {formatShortWeekdayDate(parseDateKey(item.dateKey))}
                  </span>
                  <span className="text-[13px] font-semibold tabular-nums text-[var(--sf-ink)]/75">{draftSummary(item.sessions)}</span>
                  {item.note ? (
                    <span className="mt-1 line-clamp-2 text-[13px] font-semibold italic text-[var(--sf-ink)]/70">“{item.note}”</span>
                  ) : null}
                </>
              );
              return (
                <li key={item.id}>
                  <GNoteTile
                    tint={NOTE_TINTS[i % NOTE_TINTS.length]}
                    onClick={canOpen ? () => editor.openEditor(item.dateKey) : undefined}
                    data-testid={`teacher-my-hours-pending-${item.dateKey}`}
                  >
                    {body}
                  </GNoteTile>
                </li>
              );
            })}
          </ul>
        </GCard>
      ) : null}

      {sidebar.recent.length > 0 ? (
        <GCard index={3} kicker="Recent" title="Last few days">
          <ul className="m-0 flex list-none flex-col gap-1 p-0">
            {sidebar.recent.map((entry, i) => (
              <li key={`${entry.label}-${i}`} className="flex items-center justify-between gap-3 rounded-[12px] px-1 py-1.5">
                <div className="flex min-w-0 items-center gap-2.5">
                  <TrendingUp className="h-4 w-4 shrink-0 text-[var(--sf-clay-deep)]" aria-hidden />
                  <div className="min-w-0">
                    <p className="m-0 truncate text-[15px] font-extrabold text-[var(--sf-ink)]">{entry.label}</p>
                    <p className="m-0 text-[13px] font-semibold text-[var(--sf-soft)]">{sessionCountLabel(entry.sessionCount)}</p>
                  </div>
                </div>
                <span className="shrink-0 text-[15px] font-extrabold tabular-nums text-[var(--sf-ink)]">
                  {formatHoursMinutes(entry.totalMinutes)}
                </span>
              </li>
            ))}
          </ul>
        </GCard>
      ) : null}

      <GCard index={4} tone="paper" kicker="How fixing hours works" title={adjust.requireApproval ? "Needs approval" : "Saves right away"}>
        <div className="flex items-start gap-3">
          <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-[var(--sf-clay-deep)]" aria-hidden />
          <p className="m-0 text-[14px] font-semibold text-[var(--sf-soft)]">
            {adjust.requireApproval
              ? "Submitted days stay pending until your school approves them."
              : "Saved days update your hours right away."}{" "}
            Add a session for each stretch you worked.
          </p>
        </div>
        <div className="mt-3">
          <button type="button" className={gLinkSm} onClick={() => model.setView("adjust")}>
            Fix a past day <ArrowRight className="h-4 w-4" aria-hidden />
          </button>
        </div>
      </GCard>
    </aside>
  );
}
