"use client";

import Link from "next/link";
import { ArrowRight, ChevronRight, MessageSquare } from "lucide-react";
import { GCountUp } from "@/components/school-parent/garden/motion";
import {
  DateStamp,
  GCard,
  GChip,
  GIcon,
  G_FOCUS,
  SPRINGY,
  eventWhen,
  gBtnButterSm,
} from "@/components/school-parent/garden/ui";
import type { TeacherDashboardModel } from "../useTeacherDashboardModel";

const NOTE_ROW = `group relative flex w-full items-center gap-3.5 rounded-[14px] p-4 pt-5 text-left no-underline shadow-[0_10px_20px_-14px_rgba(43,36,29,0.55)] hover:-translate-y-0.5 ${SPRINGY} ${G_FOCUS}`;

type Figure = { key: string; value: number; label: string; onClick: () => void; aria: string };

/**
 * Rail: the page's one dark card (classroom snapshot with linked figures and
 * the next date) and the messages note when the bulletin is off.
 */
export default function TeacherSnapshotRail({ model }: { model: TeacherDashboardModel }) {
  const { summary, todaySummary, nextEvent } = model;
  const figures: Figure[] = [];
  if (model.myStudentsEnabled) {
    figures.push({
      key: "learners",
      value: model.studentCount,
      label: model.studentCount === 1 ? "Learner" : "Learners",
      onClick: () => model.showWorkspace("students"),
      aria: `Learners in your care: ${model.studentCount}. Show your students`,
    });
    if (summary.staffClassrooms.length > 0) {
      figures.push({
        key: "classrooms",
        value: summary.staffClassrooms.length,
        label: summary.staffClassrooms.length === 1 ? "Classroom" : "Classrooms",
        onClick: () => model.showWorkspace("classrooms"),
        aria: `Your classrooms: ${summary.staffClassrooms.length}. Show classrooms`,
      });
    }
  }
  if (model.showAttendanceSection && todaySummary.totalStudents > 0) {
    const here = todaySummary.presentCount + todaySummary.pickedUpCount;
    figures.push({
      key: "present",
      value: here,
      label: "Present today",
      onClick: () => model.showRoster(todaySummary.presentCount > 0 ? "present" : "all"),
      aria: `Present today: ${here} of ${todaySummary.totalStudents}. Show the roster`,
    });
  }

  return (
    <div className="flex flex-col gap-5">
      <GCard index={2} tone="dark" kicker="Classroom snapshot" title={model.snapshotTitle} data-testid="teacher-dashboard-snapshot">
        <p className="m-0 text-[14px] font-semibold leading-relaxed text-white/80">{model.snapshotBody}</p>

        {figures.length > 0 ? (
          <dl className={`m-0 mt-4 grid gap-2 ${figures.length === 3 ? "grid-cols-3" : figures.length === 2 ? "grid-cols-2" : "grid-cols-1"}`}>
            {figures.map((figure) => (
              <div key={figure.key} className="min-w-0">
                <dt className="sr-only">{figure.label}</dt>
                <dd className="m-0">
                  <button
                    type="button"
                    onClick={figure.onClick}
                    aria-label={figure.aria}
                    className="group flex w-full flex-col items-start rounded-[14px] bg-white/10 px-3 py-2.5 text-left transition-colors hover:bg-white/20 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--sf-butter)]/60"
                  >
                    <span className="sf-display text-[1.9rem] leading-none tabular-nums text-white">
                      <GCountUp value={figure.value} />
                    </span>
                    <span className="mt-1 flex items-center gap-1 text-[12px] font-extrabold text-white/75 group-hover:text-white">
                      <span className="truncate">{figure.label}</span>
                      <ArrowRight className="h-3 w-3 shrink-0 opacity-0 transition-opacity group-hover:opacity-100" aria-hidden />
                    </span>
                  </button>
                </dd>
              </div>
            ))}
          </dl>
        ) : null}

        {nextEvent ? (
          <div className="mt-4">
            <p className="m-0 mb-2 text-[11px] font-extrabold uppercase tracking-[0.18em] text-white/65">Next on the calendar</p>
            <div className="sf-ticket flex items-stretch rounded-2xl bg-[var(--sf-paper)] text-[var(--sf-ink)]">
              <div className="flex items-center py-2.5 pl-5 pr-3">
                <DateStamp event={nextEvent} size="sm" />
              </div>
              <div className="my-3 border-l-[1.5px] border-dashed border-[var(--sf-ink)]/20" aria-hidden="true" />
              <div className="min-w-0 flex-1 px-4 py-3 pr-6">
                <p className="m-0 truncate text-[15px] font-extrabold">{nextEvent.title}</p>
                <p className="m-0 truncate text-[13px] font-semibold text-[var(--sf-soft)]">{eventWhen(nextEvent)}</p>
              </div>
            </div>
          </div>
        ) : null}

        {model.calendarEnabled ? (
          <div className="mt-5">
            <Link href={model.calendarHref} className={gBtnButterSm}>
              View school calendar <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        ) : null}
      </GCard>

      {model.showSchoolUpdates ? (
        <Link href={model.messagesHref} className={`${NOTE_ROW} bg-[var(--sf-sky)]`} data-testid="teacher-dashboard-messages-tile">
          <span aria-hidden="true" className="absolute left-1/2 top-0 h-3.5 w-12 -translate-x-1/2 -translate-y-1/2 rotate-2 rounded-sm bg-white/75" />
          <GIcon size="sm">
            <MessageSquare />
          </GIcon>
          <span className="min-w-0 flex-1">
            <span className="flex items-center gap-2 text-[15px] font-extrabold text-[var(--sf-ink)]">
              {model.messagesPromo.title}
              {summary.messagesUnreadCount > 0 ? <GChip tone="alert">New</GChip> : null}
            </span>
            <span className="block truncate text-[13px] font-semibold text-[var(--sf-ink)]/65">
              {model.messagesPromo.subtitle}
            </span>
          </span>
          <ChevronRight className="h-4 w-4 text-[var(--sf-ink)]/60 transition-transform duration-300 group-hover:translate-x-0.5" aria-hidden="true" />
        </Link>
      ) : null}
    </div>
  );
}
