"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useParentTheme } from "@/components/school-parent/ParentThemeContext";
import { reportPortalOperationalError } from "@/lib/portal-operational-errors";
import { portalJsonApiErrorCode, portalJsonApiErrorStatus } from "@/lib/portal-json-api-error";
import { parentToast } from "@/lib/school-parent/parent-toast";
import {
  isoToTimeInput,
  validateAdjustmentSessions,
  type AdjustSessionDraft,
} from "@/lib/school-teacher/my-hours/adjust-validation";
import {
  addDays,
  formatHoursMinutes,
  formatShortWeekdayDate,
  formatWallClockTime,
  parseDateKey,
  startOfWeekMonday,
  toDateKey,
} from "@/lib/school-teacher/my-hours/format-duration";
import {
  fetchTeacherMyHoursPageData,
  postTeacherMyHoursAdjustment,
  postTeacherMyHoursClockIn,
  postTeacherMyHoursClockOut,
} from "@/lib/school-teacher/my-hours/fetch-teacher-my-hours";
import { defaultNextAdjustmentSession } from "@/lib/school-teacher/my-hours/my-hours-adjustment-rules";
import {
  activeSessionCountsInFocusDaySessionTotal,
  activeSessionStartedAtForFocusDay,
  getDayLogForDateKey,
  referenceDateFromKey,
} from "@/lib/school-teacher/my-hours/my-hours-page-utils";
import {
  isDateKeyInLoadedRange,
  mergeTeacherMyHoursPageData,
  nextLoadedAdjustWeekToken,
  weekRangeNeedsFetch,
} from "@/lib/school-teacher/my-hours/my-hours-range-merge";
import { myHoursStatusLine, sessionCountLabel } from "@/lib/school-teacher/my-hours/my-hours-status";
import { useLiveElapsed } from "@/lib/school-teacher/my-hours/use-live-elapsed";
import type {
  MyHoursAdjustmentSession,
  MyHoursSession,
  MyHoursView,
  TeacherMyHoursPageData,
} from "@/lib/school-teacher/my-hours/types";
import type { OrganizationBranding } from "@/lib/organization-settings/types";

export type TeacherMyHoursPageProps = {
  branding: OrganizationBranding;
  organizationId: string;
  slug: string;
  initialData: TeacherMyHoursPageData;
  previewMode?: boolean;
  /**
   * Marketing demos only: treat this ISO instant as "now" for the live timer,
   * so a fixture clocked in at 7:44 AM always reads like a morning session.
   */
  previewNow?: string;
};

export type ClockActionPending = "in" | "out" | null;

export type MyHoursEditor = {
  dateKey: string;
  sessions: AdjustSessionDraft[];
  note: string;
  /** The day already has hours or a pending change ("Adjust hours"). */
  hasExisting: boolean;
  pending: boolean;
  /** Set after a save attempt with invalid times; shows the summary line. */
  showErrors: boolean;
};

type AdjustInput = {
  dateKey: string;
  note: string;
  sessions: MyHoursAdjustmentSession[];
};

const DEFAULT_CLOCK_IN = "08:00";
const DEFAULT_CLOCK_OUT = "15:00";

export const MY_HOURS_PREVIEW_REASON = "Clocking in and out is off in preview";
const CLOCK_ERROR_ID = "teacher-my-hours-clock-error";
const ADJUST_ERROR_ID = "teacher-my-hours-adjust-error";

function errorMessage(error: unknown, fallback: string): string {
  return error instanceof Error && error.message ? error.message : fallback;
}

function weekBounds(dateKey: string): { start: string; end: string } {
  const start = startOfWeekMonday(parseDateKey(dateKey));
  return { start: toDateKey(start), end: toDateKey(addDays(start, 6)) };
}

/**
 * View-model for the staff My Hours page: everything the old page and adjust
 * panel held (views, focus / month dates, clock in and out, the adjust-week
 * fetch and range merge, the adjust editor) plus the Garden feedback contract
 * (saving states, toasts with Retry, inline load error). `previewMode`
 * disables every write; it never hides UI.
 * Rules: `.claude/skills/teacher-portal-garden-design/SKILL.md`.
 */
export function useTeacherMyHoursModel({
  organizationId,
  initialData,
  previewMode = false,
  previewNow,
}: TeacherMyHoursPageProps) {
  const { theme } = useParentTheme();

  const [pageData, setPageData] = useState(initialData);
  const referenceDate = useMemo(
    () => referenceDateFromKey(pageData.referenceDateKey),
    [pageData.referenceDateKey],
  );
  const referenceKey = pageData.referenceDateKey;

  const [view, setViewState] = useState<MyHoursView>("day");
  const [focusDate, setFocusDate] = useState(() => referenceDateFromKey(initialData.referenceDateKey));
  const [monthDate, setMonthDate] = useState(() => {
    const ref = referenceDateFromKey(initialData.referenceDateKey);
    return new Date(ref.getFullYear(), ref.getMonth(), 1);
  });
  const [clockActionPending, setClockActionPending] = useState<ClockActionPending>(null);

  /* ---------------------------------------------------------------- */
  /* Adjust week: fetch the focus week when it's outside the range     */
  /* ---------------------------------------------------------------- */

  const adjustWeekFetchRef = useRef(0);
  const [loadedAdjustWeekToken, setLoadedAdjustWeekToken] = useState<string | null>(null);
  const [adjustWeekFailure, setAdjustWeekFailure] = useState<{ token: string; message: string } | null>(null);
  const [adjustWeekAttempt, setAdjustWeekAttempt] = useState(0);

  const focusDateKey = toDateKey(focusDate);
  const adjustWeek = view === "adjust" ? weekBounds(focusDateKey) : null;
  const adjustWeekStartKey = adjustWeek?.start ?? null;
  const adjustWeekEndKey = adjustWeek?.end ?? null;
  const adjustWeekToken =
    adjustWeekStartKey != null && adjustWeekEndKey != null ? `${adjustWeekStartKey}:${adjustWeekEndKey}` : null;

  const needsAdjustWeekFetch =
    adjustWeekStartKey != null &&
    adjustWeekEndKey != null &&
    weekRangeNeedsFetch(adjustWeekStartKey, adjustWeekEndKey, pageData.rangeFrom, pageData.rangeTo);

  const adjustWeekError =
    adjustWeekFailure != null && adjustWeekFailure.token === adjustWeekToken ? adjustWeekFailure.message : null;
  const adjustWeekLoading =
    needsAdjustWeekFetch && adjustWeekToken != null && loadedAdjustWeekToken !== adjustWeekToken && !adjustWeekError;

  const reportError = useCallback(
    (operation: string, error: unknown) => {
      void reportPortalOperationalError(
        "teacher_portal",
        { organizationId, operation, error: "" },
        error,
        portalJsonApiErrorStatus(error),
        portalJsonApiErrorCode(error),
      );
    },
    [organizationId],
  );

  useEffect(() => {
    if (
      !needsAdjustWeekFetch ||
      adjustWeekStartKey == null ||
      adjustWeekEndKey == null ||
      adjustWeekToken == null ||
      loadedAdjustWeekToken === adjustWeekToken ||
      adjustWeekFailure?.token === adjustWeekToken
    ) {
      return;
    }
    const fetchId = ++adjustWeekFetchRef.current;
    void (async () => {
      try {
        const patch = await fetchTeacherMyHoursPageData(organizationId, {
          from: adjustWeekStartKey,
          to: adjustWeekEndKey,
        });
        if (fetchId !== adjustWeekFetchRef.current) return;
        setPageData((current) => mergeTeacherMyHoursPageData(current, patch));
        setLoadedAdjustWeekToken(adjustWeekToken);
      } catch (error) {
        if (fetchId !== adjustWeekFetchRef.current) return;
        // Load failures stay inline (GardenLoadError + Try again), never a toast.
        setAdjustWeekFailure({ token: adjustWeekToken, message: errorMessage(error, "Could not load this week.") });
        reportError("my_hours.adjust_week_load", error);
      }
    })();
  }, [
    needsAdjustWeekFetch,
    adjustWeekStartKey,
    adjustWeekEndKey,
    adjustWeekToken,
    loadedAdjustWeekToken,
    adjustWeekFailure,
    adjustWeekAttempt,
    organizationId,
    reportError,
  ]);

  const retryAdjustWeek = useCallback(() => {
    setAdjustWeekFailure(null);
    setAdjustWeekAttempt((n) => n + 1);
  }, []);

  /* ---------------------------------------------------------------- */
  /* Clock + derived day data                                         */
  /* ---------------------------------------------------------------- */

  const activeSessionStartedAt = useMemo(
    () => (pageData.activeSession ? new Date(pageData.activeSession.clockInAt) : null),
    [pageData.activeSession],
  );
  const anchorNow = useMemo(() => (previewNow ? new Date(previewNow) : null), [previewNow]);
  const elapsedSeconds = useLiveElapsed(activeSessionStartedAt, anchorNow);
  const clockedIn = activeSessionStartedAt != null;

  const closedSessionsFor = useCallback(
    (dateKey: string): MyHoursSession[] =>
      (pageData.sessionsByDateKey[dateKey] ?? []).filter((session) => session.clockOutAt != null),
    [pageData.sessionsByDateKey],
  );

  const dayLog = useMemo(
    () => getDayLogForDateKey(pageData.entriesByDateKey, focusDate),
    [pageData.entriesByDateKey, focusDate],
  );
  const closedSessionsForFocusDay = useMemo(() => closedSessionsFor(focusDateKey), [closedSessionsFor, focusDateKey]);
  const activeOnFocusDay = activeSessionStartedAtForFocusDay(pageData.activeSession, focusDateKey, referenceKey);
  const activeCountsOnFocusDay = activeSessionCountsInFocusDaySessionTotal(
    pageData.activeSession,
    focusDateKey,
    referenceKey,
  );

  const todayClosed = closedSessionsFor(referenceKey);
  const today = {
    closedMinutes: todayClosed.reduce((sum, session) => sum + session.minutes, 0),
    closedSessions: todayClosed.length,
    activeCountsToday: pageData.activeSession?.workDate === referenceKey,
  };
  /** Live minutes logged today (closed + running), for the Today tile. */
  const todayLiveMinutes =
    today.closedMinutes + (today.activeCountsToday ? Math.floor(elapsedSeconds / 60) : 0);
  const todayMinutes =
    today.closedSessions > 0 || clockedIn ? todayLiveMinutes : pageData.sidebar.todayMinutes;

  const week = pageData.sidebar.week;
  const statusLine = myHoursStatusLine({
    clockedInLabel: activeSessionStartedAt ? formatWallClockTime(activeSessionStartedAt) : null,
    week,
  });

  const applyPageData = useCallback(
    (next: TeacherMyHoursPageData) => {
      setPageData(next);
      setLoadedAdjustWeekToken(nextLoadedAdjustWeekToken(adjustWeekStartKey, adjustWeekEndKey, next));
    },
    [adjustWeekStartKey, adjustWeekEndKey],
  );

  // Toast Retry buttons call the latest action (state may have moved on).
  const clockInRef = useRef<() => Promise<void>>(async () => {});
  const clockOutRef = useRef<() => Promise<void>>(async () => {});
  const submitRef = useRef<(input: AdjustInput) => Promise<void>>(async () => {});

  const clockIn = useCallback(async () => {
    if (previewMode || clockedIn || clockActionPending) return;
    setClockActionPending("in");
    try {
      const next = await postTeacherMyHoursClockIn(organizationId);
      applyPageData(next);
      parentToast.dismiss(CLOCK_ERROR_ID);
      const clockInAt = next.activeSession?.clockInAt;
      parentToast.success(
        clockInAt ? `Clocked in at ${formatWallClockTime(new Date(clockInAt))}` : "Clocked in",
        { id: "teacher-my-hours-clock", description: "Your session is running. Clock out here when you leave." },
      );
    } catch (error) {
      parentToast.error("Couldn't clock you in", {
        id: CLOCK_ERROR_ID,
        description: `${errorMessage(error, "Could not clock in.")} You are not clocked in yet.`,
        action: { label: "Retry", onClick: () => void clockInRef.current() },
      });
      reportError("my_hours.clock_in", error);
    } finally {
      setClockActionPending(null);
    }
  }, [previewMode, clockedIn, clockActionPending, organizationId, applyPageData, reportError]);

  const clockOut = useCallback(async () => {
    if (previewMode || !clockedIn || clockActionPending) return;
    setClockActionPending("out");
    try {
      const { pageData: next, sessionMinutes } = await postTeacherMyHoursClockOut(organizationId);
      applyPageData(next);
      parentToast.dismiss(CLOCK_ERROR_ID);
      const nextWeek = next.sidebar.week;
      parentToast.success(`Session saved · ${formatHoursMinutes(Math.max(1, sessionMinutes))} logged`, {
        id: "teacher-my-hours-clock",
        description: `This week: ${formatHoursMinutes(nextWeek.loggedMinutes)} of ${formatHoursMinutes(nextWeek.goalMinutes)}.`,
      });
    } catch (error) {
      parentToast.error("Couldn't clock you out", {
        id: CLOCK_ERROR_ID,
        description: `${errorMessage(error, "Could not clock out.")} Your session is still running.`,
        action: { label: "Retry", onClick: () => void clockOutRef.current() },
      });
      reportError("my_hours.clock_out", error);
    } finally {
      setClockActionPending(null);
    }
  }, [previewMode, clockedIn, clockActionPending, organizationId, applyPageData, reportError]);

  useEffect(() => {
    clockInRef.current = clockIn;
    clockOutRef.current = clockOut;
  }, [clockIn, clockOut]);

  /* ---------------------------------------------------------------- */
  /* Views + date navigation                                          */
  /* ---------------------------------------------------------------- */

  const [editor, setEditor] = useState<MyHoursEditor | null>(null);

  const setView = useCallback(
    (next: MyHoursView) => {
      setViewState(next);
      if (next === "month") {
        setMonthDate(new Date(focusDate.getFullYear(), focusDate.getMonth(), 1));
      }
    },
    [focusDate],
  );

  const shiftFocusDate = useCallback(
    (delta: number) => {
      setEditor(null);
      setFocusDate((current) => {
        const next = addDays(current, delta);
        if (view === "month") setMonthDate(next);
        return next;
      });
    },
    [view],
  );

  const shiftMonth = useCallback((deltaMonths: number) => {
    setEditor(null);
    setMonthDate((current) => {
      const next = new Date(current.getFullYear(), current.getMonth() + deltaMonths, 1);
      setFocusDate(next);
      return next;
    });
  }, []);

  const goPrevious = useCallback(() => {
    if (view === "month") shiftMonth(-1);
    else shiftFocusDate(view === "week" || view === "adjust" ? -7 : -1);
  }, [view, shiftMonth, shiftFocusDate]);

  const goNext = useCallback(() => {
    if (view === "month") shiftMonth(1);
    else shiftFocusDate(view === "week" || view === "adjust" ? 7 : 1);
  }, [view, shiftMonth, shiftFocusDate]);

  const goToToday = useCallback(() => {
    setEditor(null);
    setFocusDate(referenceDate);
    setMonthDate(new Date(referenceDate.getFullYear(), referenceDate.getMonth(), 1));
  }, [referenceDate]);

  const openDayDetail = useCallback((date: Date) => {
    setFocusDate(date);
    setViewState("day");
  }, []);

  const navDate = view === "month" ? monthDate : focusDate;
  const showingToday =
    view === "month"
      ? monthDate.getFullYear() === referenceDate.getFullYear() && monthDate.getMonth() === referenceDate.getMonth()
      : view === "day"
        ? focusDateKey === referenceKey
        : weekBounds(focusDateKey).start === weekBounds(referenceKey).start;

  /* ---------------------------------------------------------------- */
  /* Adjust editor (moved from the old adjust panel)                  */
  /* ---------------------------------------------------------------- */

  const keyRef = useRef(0);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const requireApproval = pageData.adjustmentsRequireApproval !== false;
  const pendingAdjustments = useMemo(
    () => pageData.pendingAdjustmentsByDateKey ?? {},
    [pageData.pendingAdjustmentsByDateKey],
  );

  const sessionsKnownFor = useCallback(
    (dateKey: string) => isDateKeyInLoadedRange(dateKey, pageData.rangeFrom, pageData.rangeTo),
    [pageData.rangeFrom, pageData.rangeTo],
  );

  /** Same rule as the old row button: past or today, no open session that day, week loaded. */
  const canEditDay = useCallback(
    (dateKey: string) =>
      dateKey <= referenceKey &&
      pageData.activeSession?.workDate !== dateKey &&
      sessionsKnownFor(dateKey) &&
      !(view === "adjust" && adjustWeekLoading),
    [referenceKey, pageData.activeSession?.workDate, sessionsKnownFor, view, adjustWeekLoading],
  );

  const openEditor = useCallback(
    (dateKey: string) => {
      if (!canEditDay(dateKey)) return;
      if (editor?.dateKey === dateKey) return;
      const nextKey = () => `adjust-session-${++keyRef.current}`;
      const closed = closedSessionsFor(dateKey);
      const pending = pendingAdjustments[dateKey];
      const wasLabel = (index: number) =>
        closed[index] ? `Was ${closed[index].clockIn} – ${closed[index].clockOut}` : null;
      let sessions: AdjustSessionDraft[];
      if (pending && pending.sessions.length > 0) {
        sessions = pending.sessions.map((session, index) => ({
          key: nextKey(),
          clockIn: session.clockIn,
          clockOut: session.clockOut,
          originalLabel: wasLabel(index),
        }));
      } else if (closed.length > 0) {
        sessions = closed.map((session, index) => ({
          key: nextKey(),
          clockIn: isoToTimeInput(session.clockInAt, pageData.timezone),
          clockOut: session.clockOutAt ? isoToTimeInput(session.clockOutAt, pageData.timezone) : "",
          originalLabel: wasLabel(index),
        }));
      } else {
        sessions = [{ key: nextKey(), clockIn: DEFAULT_CLOCK_IN, clockOut: DEFAULT_CLOCK_OUT, originalLabel: null }];
      }
      setSaveError(null);
      setEditor({
        dateKey,
        sessions,
        note: pending?.note ?? "",
        hasExisting: Boolean(pending) || closed.length > 0,
        pending: Boolean(pending),
        showErrors: false,
      });
    },
    [canEditDay, editor?.dateKey, closedSessionsFor, pendingAdjustments, pageData.timezone],
  );

  // Hide the editor while its week (re)loads, as the old panel did.
  const visibleEditor =
    editor && sessionsKnownFor(editor.dateKey) && !(view === "adjust" && adjustWeekLoading) ? editor : null;
  // Keep the last editor on screen while the drawer animates closed.
  const [shownEditor, setShownEditor] = useState<MyHoursEditor | null>(visibleEditor);
  if (visibleEditor && visibleEditor !== shownEditor) setShownEditor(visibleEditor);
  const displayEditor = visibleEditor ?? shownEditor;

  const validation = useMemo(
    () => validateAdjustmentSessions(displayEditor?.sessions ?? []),
    [displayEditor?.sessions],
  );

  const updateSessions = useCallback((update: (sessions: AdjustSessionDraft[]) => AdjustSessionDraft[]) => {
    setSaveError(null);
    setEditor((current) => (current ? { ...current, showErrors: false, sessions: update(current.sessions) } : current));
  }, []);

  const setSessionTime = useCallback(
    (key: string, field: "clockIn" | "clockOut", value: string) =>
      updateSessions((sessions) =>
        sessions.map((session) => (session.key === key ? { ...session, [field]: value } : session)),
      ),
    [updateSessions],
  );

  const addSession = useCallback(
    () =>
      updateSessions((sessions) => {
        const next = defaultNextAdjustmentSession(sessions);
        return [
          ...sessions,
          { key: `adjust-session-${++keyRef.current}`, clockIn: next.clockIn, clockOut: next.clockOut, originalLabel: null },
        ];
      }),
    [updateSessions],
  );

  const removeSession = useCallback(
    (key: string) =>
      updateSessions((sessions) => (sessions.length > 1 ? sessions.filter((session) => session.key !== key) : sessions)),
    [updateSessions],
  );

  const setNote = useCallback((note: string) => {
    setEditor((current) => (current ? { ...current, note } : current));
  }, []);

  const closeEditor = useCallback(() => {
    if (saving) return;
    setEditor(null);
    setSaveError(null);
  }, [saving]);

  /**
   * Saves one day. Closes the editor itself on success, so a toast Retry that
   * succeeds after the panel was left open also closes it (skill §6 gotcha).
   */
  const submitAdjustment = useCallback(
    async (input: AdjustInput) => {
      if (previewMode) return;
      setSaving(true);
      setSaveError(null);
      try {
        const result = await postTeacherMyHoursAdjustment({ organizationId, ...input });
        const { start, end } = weekBounds(input.dateKey);
        let next = result.pageData;
        let weekReloadFailed = false;
        if (weekRangeNeedsFetch(start, end, next.rangeFrom, next.rangeTo)) {
          try {
            next = mergeTeacherMyHoursPageData(next, await fetchTeacherMyHoursPageData(organizationId, { from: start, to: end }));
          } catch (reloadError) {
            weekReloadFailed = true;
            reportError("my_hours.adjust_week_load", reloadError);
          }
        }
        applyPageData(next);
        setEditor((current) => (current?.dateKey === input.dateKey ? null : current));
        parentToast.dismiss(ADJUST_ERROR_ID);
        const total = validateAdjustmentSessions(
          input.sessions.map((session, index) => ({ key: String(index), ...session })),
        ).totalMinutes;
        const summary = `${formatShortWeekdayDate(parseDateKey(input.dateKey))} · ${formatHoursMinutes(total)} across ${sessionCountLabel(input.sessions.length)}.`;
        parentToast.success(result.requireApproval ? "Sent to your school for approval." : "Hours saved.", {
          id: "teacher-my-hours-adjust",
          description: result.requireApproval
            ? `${summary} It stays pending until your school approves it.`
            : `${summary} Your totals are updated.`,
        });
        if (weekReloadFailed) {
          parentToast.info("Couldn't refresh this week", {
            id: "teacher-my-hours-adjust-reload",
            description: "Your change was saved. Open the week again to see it here.",
          });
        }
      } catch (error) {
        const message = errorMessage(error, "Could not save hours.");
        setSaveError(message);
        parentToast.error("Hours not saved.", {
          id: ADJUST_ERROR_ID,
          description: `${message} Nothing was changed for ${formatShortWeekdayDate(parseDateKey(input.dateKey))}.`,
          action: { label: "Retry", onClick: () => void submitRef.current(input) },
        });
        reportError("my_hours.adjust", error);
      } finally {
        setSaving(false);
      }
    },
    [previewMode, organizationId, applyPageData, reportError],
  );
  useEffect(() => {
    submitRef.current = submitAdjustment;
  }, [submitAdjustment]);

  const saveEditor = useCallback(() => {
    if (!visibleEditor || saving || previewMode) return;
    if (!validation.valid) {
      setEditor((current) => (current ? { ...current, showErrors: true } : current));
      return;
    }
    void submitAdjustment({
      dateKey: visibleEditor.dateKey,
      note: visibleEditor.note,
      sessions: visibleEditor.sessions.map(({ clockIn, clockOut }) => ({ clockIn, clockOut })),
    });
  }, [visibleEditor, saving, previewMode, validation.valid, submitAdjustment]);

  const retrySave = saveEditor;

  const editorOpenSessionLabel =
    visibleEditor && pageData.activeSession?.workDate === visibleEditor.dateKey
      ? formatWallClockTime(new Date(pageData.activeSession.clockInAt))
      : null;

  const pendingList = useMemo(
    () =>
      Object.values(pendingAdjustments)
        .filter((item) => item.sessions.length > 0)
        .sort((a, b) => b.dateKey.localeCompare(a.dateKey)),
    [pendingAdjustments],
  );

  return {
    theme,
    previewMode,
    pageData,
    referenceDate,
    referenceKey,
    view,
    setView,
    focusDate,
    focusDateKey,
    monthDate,
    navDate,
    showingToday,
    goPrevious,
    goNext,
    goToToday,
    openDayDetail,
    statusLine,
    week,
    today,
    todayMinutes,
    clock: {
      clockedIn,
      activeSessionStartedAt,
      elapsedSeconds,
      pending: clockActionPending,
      clockIn,
      clockOut,
    },
    day: {
      dayLog,
      closedSessions: closedSessionsForFocusDay,
      activeStartedAt: activeOnFocusDay,
      activeCountsOnDay: activeCountsOnFocusDay,
    },
    adjust: {
      weekLoading: adjustWeekLoading,
      weekError: adjustWeekError,
      retryWeek: retryAdjustWeek,
      requireApproval,
      pendingAdjustments,
      pendingList,
      canEditDay,
      sessionsKnownFor,
      closedSessionsFor,
    },
    editor: {
      open: visibleEditor != null,
      state: displayEditor,
      validation,
      saving,
      saveError,
      openSessionLabel: editorOpenSessionLabel,
      openEditor,
      closeEditor,
      setSessionTime,
      addSession,
      removeSession,
      setNote,
      save: saveEditor,
      retrySave,
    },
  };
}

export type TeacherMyHoursModel = ReturnType<typeof useTeacherMyHoursModel>;
