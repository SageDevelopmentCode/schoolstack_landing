"use client";

import {
  ArrowRight,
  Calendar,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  PencilLine,
  Sun,
} from "lucide-react";
import { GardenLoadError } from "@/components/school-admin/dashboard/garden/shared";
import { GCard, GChip, GTabBar, G_FOCUS, gBtnOutlineSm, gLinkSm } from "@/components/school-parent/garden/ui";
import type { TeacherMyHoursModel } from "@/components/school-teacher/my-hours/useTeacherMyHoursModel";
import { draftSummary } from "@/lib/school-teacher/my-hours/adjust-validation";
import {
  addDays,
  formatCompactNavDate,
  formatHoursMinutes,
  formatLiveElapsed,
  formatLongWeekdayDate,
  formatMonthYear,
  formatShortWeekdayDate,
  formatWallClockTime,
  startOfWeekMonday,
  toDateKey,
} from "@/lib/school-teacher/my-hours/format-duration";
import { buildMonthGrid, WEEKDAY_INITIALS, WEEKDAY_SHORT } from "@/lib/school-teacher/my-hours/month-grid";
import { getMonthSummaryForMonthDate } from "@/lib/school-teacher/my-hours/my-hours-page-utils";
import { compactHours, dayBarFraction, sessionCountLabel } from "@/lib/school-teacher/my-hours/my-hours-status";
import type { MyHoursSession, MyHoursView } from "@/lib/school-teacher/my-hours/types";

const VIEW_ITEMS = [
  { key: "day", label: "Day", icon: Sun },
  { key: "week", label: "Week", icon: CalendarDays },
  { key: "month", label: "Month", icon: Calendar },
  { key: "adjust", label: "Adjust", icon: PencilLine },
] as const;

const NAV_BTN = `flex h-10 w-10 items-center justify-center rounded-full text-[var(--sf-ink)] transition-colors hover:bg-[var(--sf-accent-wash)] ${G_FOCUS}`;

/* ------------------------------------------------------------------ */
/* Toolbar: view tabs + date pager                                    */
/* ------------------------------------------------------------------ */

export function MyHoursToolbar({ model }: { model: TeacherMyHoursModel }) {
  const { view, navDate } = model;
  const unit = view === "month" ? "month" : view === "day" ? "day" : "week";
  const navLabel =
    view === "month"
      ? formatMonthYear(navDate)
      : view === "day"
        ? formatCompactNavDate(navDate)
        : `Week of ${formatShortWeekdayDate(startOfWeekMonday(navDate))}`;
  const todayLabel = view === "month" ? "This month" : view === "day" ? "Today" : "This week";

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
      <GTabBar
        ariaLabel="Hours view"
        activeKey={view}
        onChange={(key) => model.setView(key as MyHoursView)}
        data-testid="teacher-my-hours-view-nav"
        items={VIEW_ITEMS.map((item) => {
          const Icon = item.icon;
          return {
            key: item.key,
            label: item.label,
            icon: <Icon className="h-3.5 w-3.5 max-sm:hidden" aria-hidden />,
            testId: `teacher-my-hours-view-${item.key}`,
          };
        })}
      />
      <div className="flex flex-wrap items-center gap-2">
        <div className="inline-flex items-center gap-0.5 rounded-full border-[1.5px] border-[var(--sf-ink)]/12 bg-white p-1 shadow-[0_3px_0_0_rgba(43,36,29,0.08)]">
          <button type="button" className={NAV_BTN} onClick={model.goPrevious} aria-label={`Previous ${unit}`}>
            <ChevronLeft className="h-4 w-4" aria-hidden />
          </button>
          <span
            className="min-w-[8.5rem] px-1 text-center text-sm font-extrabold tabular-nums text-[var(--sf-ink)]"
            aria-live="polite"
            data-testid="teacher-my-hours-nav-label"
          >
            {navLabel}
          </span>
          <button type="button" className={NAV_BTN} onClick={model.goNext} aria-label={`Next ${unit}`}>
            <ChevronRight className="h-4 w-4" aria-hidden />
          </button>
        </div>
        {model.showingToday ? null : (
          <button type="button" className={gLinkSm} onClick={model.goToToday}>
            Back to {todayLabel.toLowerCase()}
          </button>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Day: session tickets                                                */
/* ------------------------------------------------------------------ */

function SessionTicket({ session, index }: { session: MyHoursSession; index: number }) {
  return (
    <li className="sf-ticket flex items-stretch rounded-2xl bg-[var(--sf-paper)] text-[var(--sf-ink)]">
      <div className="flex min-w-0 flex-1 flex-col justify-center py-3 pl-6 pr-3">
        <span className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-[var(--sf-soft)]">
          Session {index + 1}
        </span>
        <span className="mt-0.5 text-[15px] font-extrabold tabular-nums">
          {session.clockIn} <span className="text-[var(--sf-soft)]">→</span> {session.clockOut}
        </span>
      </div>
      <div className="my-3 border-l-[1.5px] border-dashed border-[var(--sf-ink)]/20" aria-hidden="true" />
      <div className="flex shrink-0 items-center py-3 pl-4 pr-6 text-[15px] font-extrabold tabular-nums">
        {formatHoursMinutes(session.minutes)}
      </div>
    </li>
  );
}

function ActiveTicket({ startedAt, elapsedSeconds, index }: { startedAt: Date; elapsedSeconds: number; index: number }) {
  return (
    <li className="sf-ticket flex items-stretch rounded-2xl bg-[var(--sf-mint)] text-[var(--sf-ink)]">
      <div className="flex min-w-0 flex-1 flex-col justify-center py-3 pl-6 pr-3">
        <span className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-[var(--sf-forest)]">
          Session {index + 1} · In progress
        </span>
        <span className="mt-0.5 text-[15px] font-extrabold tabular-nums">
          {formatWallClockTime(startedAt)} <span className="text-[var(--sf-soft)]">→</span> now
        </span>
      </div>
      <div className="my-3 border-l-[1.5px] border-dashed border-[var(--sf-ink)]/20" aria-hidden="true" />
      <div className="flex shrink-0 items-center py-3 pl-4 pr-6 text-[15px] font-extrabold tabular-nums text-[var(--sf-forest)]">
        {formatLiveElapsed(elapsedSeconds)}
      </div>
    </li>
  );
}

export function MyHoursDayView({ model }: { model: TeacherMyHoursModel }) {
  const { focusDate, focusDateKey, referenceKey, day, clock, adjust, editor } = model;
  const isToday = focusDateKey === referenceKey;
  const isFuture = focusDateKey > referenceKey;
  const showActive = day.activeStartedAt != null && (isToday || day.dayLog == null);
  const liveMinutes = day.activeCountsOnDay ? Math.floor(clock.elapsedSeconds / 60) : 0;
  const closedMinutes = day.closedSessions.reduce((sum, session) => sum + session.minutes, 0);
  const totalMinutes = isToday ? closedMinutes + liveMinutes : (day.dayLog?.totalMinutes ?? closedMinutes);
  const sessionCount = isToday
    ? day.closedSessions.length + (day.activeCountsOnDay ? 1 : 0)
    : (day.dayLog?.sessionCount ?? day.closedSessions.length);
  const hasHours = sessionCount > 0;
  const pending = adjust.pendingAdjustments[focusDateKey];
  const canEdit = adjust.canEditDay(focusDateKey);

  return (
    <GCard
      index={2}
      kicker={isToday ? "Today" : isFuture ? "Upcoming" : "Day"}
      title={formatLongWeekdayDate(focusDate)}
      data-testid="teacher-my-hours-day-panel"
      action={
        canEdit && hasHours ? (
          <button type="button" className={gLinkSm} onClick={() => editor.openEditor(focusDateKey)}>
            <PencilLine className="h-4 w-4" aria-hidden /> Fix this day
          </button>
        ) : null
      }
    >
      {hasHours ? (
        <div className="mb-4 flex flex-wrap items-center gap-x-3 gap-y-1 rounded-[16px] bg-[var(--sf-accent-wash)] px-4 py-3">
          <span className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-[var(--sf-clay-deep)]">Logged</span>
          <span className="text-[15px] font-extrabold tabular-nums text-[var(--sf-ink)]">
            {formatHoursMinutes(totalMinutes)} · {sessionCountLabel(sessionCount)}
          </span>
          {pending ? <GChip tone="warning">Change pending</GChip> : null}
        </div>
      ) : null}

      {day.closedSessions.length > 0 || showActive ? (
        <ul className="m-0 flex list-none flex-col gap-2.5 p-0" aria-label="Sessions">
          {day.closedSessions.map((session, index) => (
            <SessionTicket key={session.id} session={session} index={index} />
          ))}
          {showActive && day.activeStartedAt ? (
            <ActiveTicket
              startedAt={day.activeStartedAt}
              elapsedSeconds={clock.elapsedSeconds}
              index={day.closedSessions.length}
            />
          ) : null}
        </ul>
      ) : isFuture ? (
        <p className="m-0 text-[15px] font-semibold text-[var(--sf-soft)]">Upcoming — nothing to log yet.</p>
      ) : !hasHours ? (
        <div className="flex flex-col items-start gap-3 rounded-[18px] border-[1.5px] border-dashed border-[var(--sf-ink)]/15 bg-[var(--sf-paper)] p-5">
          <div>
            <p className="m-0 text-[15px] font-extrabold text-[var(--sf-ink)]">No hours logged for this day.</p>
            <p className="m-0 mt-1 text-[13px] font-semibold text-[var(--sf-soft)]">
              {isToday
                ? "Clock in above when your day starts, or add hours by hand."
                : "Forgot to clock in? Add the hours you worked."}
            </p>
          </div>
          {canEdit ? (
            <button type="button" className={gBtnOutlineSm} onClick={() => editor.openEditor(focusDateKey)}>
              Add hours for this day
            </button>
          ) : null}
        </div>
      ) : null}
    </GCard>
  );
}

/* ------------------------------------------------------------------ */
/* Week: day strip with hour bars                                     */
/* ------------------------------------------------------------------ */

export function MyHoursWeekView({ model }: { model: TeacherMyHoursModel }) {
  const { focusDate, referenceKey, pageData, week, clock } = model;
  const weekStart = startOfWeekMonday(focusDate);
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const dailyGoal = week.totalWeekdays > 0 ? week.goalMinutes / week.totalWeekdays : 0;
  const liveToday =
    pageData.activeSession?.workDate === referenceKey ? Math.floor(clock.elapsedSeconds / 60) : 0;
  const minutesFor = (key: string) => {
    const logged = pageData.entriesByDateKey[key]?.totalMinutes ?? 0;
    // Today's entry already holds closed sessions; add the running one so the bar moves.
    return key === referenceKey ? Math.max(logged, model.today.closedMinutes + liveToday) : logged;
  };
  const totals = days.map((d) => minutesFor(toDateKey(d)));
  const scale = Math.max(dailyGoal, ...totals);
  const loggedDays = totals.filter((m) => m > 0).length;
  const weekTotal = totals.reduce((sum, m) => sum + m, 0);

  return (
    <GCard
      index={2}
      kicker="Your week"
      title={`Week of ${formatShortWeekdayDate(weekStart)}`}
      data-testid="teacher-my-hours-week-panel"
      action={
        <span className="text-[13px] font-extrabold tabular-nums text-[var(--sf-soft)]">
          {loggedDays > 0 ? `${formatHoursMinutes(weekTotal)} · ${loggedDays} ${loggedDays === 1 ? "day" : "days"}` : "Nothing yet"}
        </span>
      }
    >
      <ol className="m-0 grid list-none grid-cols-7 gap-1.5 p-0 sm:gap-3">
        {days.map((d, i) => {
          const key = toDateKey(d);
          const minutes = totals[i];
          const isToday = key === referenceKey;
          const isFuture = key > referenceKey;
          const fill = dayBarFraction(minutes, scale);
          const log = pageData.entriesByDateKey[key];
          const summary = minutes > 0 ? `${formatHoursMinutes(minutes)}${log ? `, ${sessionCountLabel(log.sessionCount)}` : ""}` : "Not logged";
          return (
            <li key={key} className="min-w-0">
              <button
                type="button"
                onClick={() => model.openDayDetail(d)}
                aria-label={`View hours for ${formatLongWeekdayDate(d)}. ${summary}${isToday ? ". Today" : ""}`}
                data-testid={`teacher-my-hours-week-day-${key}`}
                className={`group flex w-full flex-col items-center gap-1.5 rounded-[16px] px-0.5 py-2 transition-colors hover:bg-[var(--sf-accent-wash)] ${G_FOCUS} ${
                  isToday ? "bg-[var(--sf-accent-wash)]" : ""
                }`}
              >
                <span className={`text-[11px] font-extrabold uppercase tracking-[0.12em] ${isToday ? "text-[var(--sf-clay-deep)]" : "text-[var(--sf-soft)]"}`}>
                  <span className="sm:hidden">{WEEKDAY_INITIALS[d.getDay()]}</span>
                  <span className="max-sm:hidden">{WEEKDAY_SHORT[d.getDay()]}</span>
                </span>
                <span className="sf-display text-[1.15rem] leading-none text-[var(--sf-ink)]">{d.getDate()}</span>
                <span
                  aria-hidden
                  className="relative mt-1 flex h-28 w-full max-w-[44px] items-end overflow-hidden rounded-[12px] border-[1.5px] border-[var(--sf-ink)]/12 bg-[var(--sf-paper)] sm:h-36"
                >
                  <span
                    className={`block w-full rounded-[10px] transition-[height] duration-500 ${
                      isToday && clock.clockedIn ? "bg-[var(--sf-forest)]" : "bg-[var(--sf-clay)]"
                    }`}
                    style={{ height: `${Math.round(fill * 100)}%` }}
                  />
                </span>
                <span
                  className={`text-[12px] font-extrabold tabular-nums ${minutes > 0 ? "text-[var(--sf-ink)]" : "text-[var(--sf-ink)]/35"}`}
                >
                  {minutes > 0 ? compactHours(minutes) : isFuture ? "·" : "—"}
                </span>
              </button>
            </li>
          );
        })}
      </ol>
      <p className="m-0 mt-4 text-[13px] font-semibold text-[var(--sf-soft)]">
        {dailyGoal > 0 ? `Bars fill toward a ${formatHoursMinutes(Math.round(dailyGoal))} day. ` : ""}
        Pick a day to see its sessions.
      </p>
    </GCard>
  );
}

/* ------------------------------------------------------------------ */
/* Month: calendar grid with totals                                   */
/* ------------------------------------------------------------------ */

export function MyHoursMonthView({ model }: { model: TeacherMyHoursModel }) {
  const { monthDate, referenceKey, pageData } = model;
  const grid = buildMonthGrid(monthDate);
  const summary = getMonthSummaryForMonthDate(pageData.entriesByDateKey, monthDate);

  return (
    <GCard
      index={2}
      kicker="Your month"
      title={summary.monthLabel}
      data-testid="teacher-my-hours-month-panel"
      action={
        <span className="text-[13px] font-extrabold tabular-nums text-[var(--sf-soft)]">
          {summary.loggedDays} {summary.loggedDays === 1 ? "day" : "days"} logged · {formatHoursMinutes(summary.totalMinutes)}
        </span>
      }
    >
      <div className="grid grid-cols-7 gap-1 sm:gap-1.5">
        {WEEKDAY_SHORT.map((name, i) => (
          <div key={name} className="pb-1 text-center text-[11px] font-extrabold uppercase tracking-[0.12em] text-[var(--sf-soft)]">
            <span className="sm:hidden" aria-hidden>{WEEKDAY_INITIALS[i]}</span>
            <span className="max-sm:sr-only">{name}</span>
          </div>
        ))}
        {grid.map((d, i) => {
          if (!d) return <div key={`blank-${i}`} aria-hidden />;
          const key = toDateKey(d);
          const log = pageData.entriesByDateKey[key];
          const isToday = key === referenceKey;
          return (
            <button
              key={key}
              type="button"
              onClick={() => model.openDayDetail(d)}
              aria-label={`${formatLongWeekdayDate(d)}${log ? `. ${formatHoursMinutes(log.totalMinutes)}, ${sessionCountLabel(log.sessionCount)}` : ". Not logged"}${isToday ? ". Today" : ""}`}
              data-testid={`teacher-my-hours-month-day-${key}`}
              className={`flex aspect-square min-w-0 flex-col items-center justify-center gap-0.5 rounded-[12px] border-[1.5px] text-center transition-all hover:-translate-y-0.5 sm:aspect-[5/4] ${G_FOCUS} ${
                log
                  ? "border-[var(--sf-clay)]/25 bg-[var(--sf-accent-wash)]"
                  : "border-[var(--sf-ink)]/[0.07] bg-white"
              } ${isToday ? "!border-[var(--sf-clay)] ring-2 ring-[var(--sf-clay)]/20" : ""}`}
            >
              <span className={`text-[13px] font-extrabold leading-none ${isToday ? "text-[var(--sf-clay-deep)]" : "text-[var(--sf-ink)]"}`}>
                {d.getDate()}
              </span>
              {log ? (
                <span className="text-[10.5px] font-extrabold leading-none tabular-nums text-[var(--sf-clay-deep)] sm:text-[12px]">
                  {compactHours(log.totalMinutes)}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-[12px] font-semibold text-[var(--sf-soft)]">
        <span className="inline-flex items-center gap-1.5">
          <span aria-hidden className="h-3 w-3 rounded-[4px] border-[1.5px] border-[var(--sf-clay)]/25 bg-[var(--sf-accent-wash)]" /> Logged
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span aria-hidden className="h-3 w-3 rounded-[4px] border-[1.5px] border-[var(--sf-clay)]" /> Today
        </span>
      </div>
    </GCard>
  );
}

/* ------------------------------------------------------------------ */
/* Adjust: pick a day of the week to add or fix                       */
/* ------------------------------------------------------------------ */

export function MyHoursAdjustView({ model }: { model: TeacherMyHoursModel }) {
  const { focusDate, referenceKey, pageData, adjust, editor } = model;
  const weekStart = startOfWeekMonday(focusDate);
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  return (
    <GCard
      index={2}
      kicker="Fix a past day"
      title={`Week of ${formatShortWeekdayDate(weekStart)}`}
      data-testid="teacher-my-hours-adjust-panel"
    >
      <p className="m-0 -mt-2 mb-4 text-[13px] font-semibold text-[var(--sf-soft)]">
        {adjust.requireApproval
          ? "Submitted days stay pending until your school approves them."
          : "Saved days update your hours right away."}
      </p>
      {adjust.weekError ? (
        <GardenLoadError
          title="We couldn't load this week"
          description={adjust.weekError}
          onRetry={adjust.retryWeek}
        />
      ) : (
        <ul className="m-0 flex list-none flex-col divide-y-[1.5px] divide-dashed divide-[var(--sf-ink)]/10 p-0">
          {days.map((d) => {
            const key = toDateKey(d);
            const isToday = key === referenceKey;
            const isFuture = key > referenceKey;
            const closed = adjust.closedSessionsFor(key);
            const pending = adjust.pendingAdjustments[key] ?? null;
            const openOnDay = pageData.activeSession?.workDate === key ? pageData.activeSession : null;
            const known = adjust.sessionsKnownFor(key);
            const loading = !isFuture && !openOnDay && (adjust.weekLoading || !known);
            const canEdit = adjust.canEditDay(key);
            const actionLabel = pending || closed.length > 0 ? "Adjust" : "Add hours";
            const summary = isFuture
              ? "Upcoming"
              : loading
                ? "Loading…"
                : pending
                  ? draftSummary(pending.sessions)
                  : closed.length > 0
                    ? `${formatHoursMinutes(closed.reduce((sum, s) => sum + s.minutes, 0))} · ${sessionCountLabel(closed.length)}`
                    : openOnDay
                      ? `Started at ${formatWallClockTime(new Date(openOnDay.clockInAt))}`
                      : "Not logged";
            const editing = editor.open && editor.state?.dateKey === key;
            return (
              <li key={key} className={`flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between ${editing ? "bg-[var(--sf-accent-wash)] -mx-3 rounded-[14px] px-3" : ""}`}>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`text-[15px] font-extrabold ${isFuture ? "text-[var(--sf-ink)]/45" : "text-[var(--sf-ink)]"}`}>
                      {formatShortWeekdayDate(d)}
                    </span>
                    {isToday ? <GChip tone="info">Today</GChip> : null}
                    {pending ? <GChip tone="warning">Pending</GChip> : null}
                    {openOnDay ? <GChip tone="success">In progress</GChip> : null}
                  </div>
                  <p className="m-0 mt-0.5 text-[13px] font-semibold tabular-nums text-[var(--sf-soft)]">{summary}</p>
                  {openOnDay ? (
                    <p className="m-0 mt-0.5 text-[13px] font-semibold text-[var(--sf-soft)]">Clock out before changing this day.</p>
                  ) : null}
                </div>
                {canEdit ? (
                  <button
                    type="button"
                    className={`${gBtnOutlineSm} w-full sm:w-auto`}
                    onClick={() => editor.openEditor(key)}
                    aria-label={`${actionLabel} for ${formatShortWeekdayDate(d)}`}
                    data-testid={`teacher-my-hours-adjust-${key}`}
                  >
                    {actionLabel}
                    <ArrowRight className="h-4 w-4" aria-hidden />
                  </button>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}
    </GCard>
  );
}
