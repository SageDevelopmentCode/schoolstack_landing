"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useParentTheme } from "@/components/school-parent/ParentThemeContext";
import TeacherMyHoursAdjustPanel from "@/components/school-teacher/my-hours/TeacherMyHoursAdjustPanel";
import TeacherMyHoursDayPanel from "@/components/school-teacher/my-hours/TeacherMyHoursDayPanel";
import TeacherMyHoursMonthPanel from "@/components/school-teacher/my-hours/TeacherMyHoursMonthPanel";
import TeacherMyHoursStoryHeader from "@/components/school-teacher/my-hours/TeacherMyHoursStoryHeader";
import TeacherMyHoursSummarySidebar from "@/components/school-teacher/my-hours/TeacherMyHoursSummarySidebar";
import TeacherMyHoursWeekPanel from "@/components/school-teacher/my-hours/TeacherMyHoursWeekPanel";
import { PORTAL_HOME_CONTAINER_CLASS } from "@/lib/portal-home/layout";
import { reportPortalOperationalError } from "@/lib/portal-operational-errors";
import {
  portalJsonApiErrorCode,
  portalJsonApiErrorStatus,
} from "@/lib/portal-json-api-error";
import { parentToast } from "@/lib/school-parent/parent-toast";
import {
  addDays,
  formatHoursMinutes,
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
import {
  mergeTeacherMyHoursPageData,
  weekRangeNeedsFetch,
} from "@/lib/school-teacher/my-hours/my-hours-range-merge";
import { myHoursViewTransition } from "@/lib/school-teacher/my-hours/my-hours-motion";
import {
  activeSessionLoggedMinutesForFocusDay,
  activeSessionStartedAtForFocusDay,
  getDayLogForDateKey,
  referenceDateFromKey,
} from "@/lib/school-teacher/my-hours/my-hours-page-utils";
import { useLiveElapsed } from "@/lib/school-teacher/my-hours/use-live-elapsed";
import type { MyHoursView, TeacherMyHoursPageData } from "@/lib/school-teacher/my-hours/types";
import type { OrganizationBranding } from "@/lib/organization-settings/types";

type ClockActionPending = "in" | "out" | null;

type TeacherMyHoursPageProps = {
  branding: OrganizationBranding;
  organizationId: string;
  slug: string;
  initialData: TeacherMyHoursPageData;
  previewMode?: boolean;
};

export default function TeacherMyHoursPage({
  branding,
  organizationId,
  slug,
  initialData,
  previewMode = false,
}: TeacherMyHoursPageProps) {
  void branding;
  void slug;
  const { theme } = useParentTheme();
  const reducedMotion = useReducedMotion();
  const viewMotion = myHoursViewTransition(reducedMotion ?? false);

  const [pageData, setPageData] = useState(initialData);
  const referenceDate = useMemo(
    () => referenceDateFromKey(pageData.referenceDateKey),
    [pageData.referenceDateKey],
  );

  const [view, setView] = useState<MyHoursView>("day");
  const [focusDate, setFocusDate] = useState(() => referenceDateFromKey(initialData.referenceDateKey));
  const [monthDate, setMonthDate] = useState(() => {
    const ref = referenceDateFromKey(initialData.referenceDateKey);
    return new Date(ref.getFullYear(), ref.getMonth(), 1);
  });
  const [clockActionPending, setClockActionPending] = useState<ClockActionPending>(
    null,
  );
  const adjustWeekFetchRef = useRef(0);
  const [loadedAdjustWeekToken, setLoadedAdjustWeekToken] = useState<
    string | null
  >(null);

  const adjustWeekStartKey = useMemo(() => {
    if (view !== "adjust") return null;
    return toDateKey(startOfWeekMonday(focusDate));
  }, [view, focusDate]);

  const adjustWeekEndKey = useMemo(() => {
    if (adjustWeekStartKey == null) return null;
    return toDateKey(addDays(parseDateKey(adjustWeekStartKey), 6));
  }, [adjustWeekStartKey]);

  const adjustWeekToken =
    adjustWeekStartKey != null && adjustWeekEndKey != null
      ? `${adjustWeekStartKey}:${adjustWeekEndKey}`
      : null;

  const needsAdjustWeekFetch =
    view === "adjust" &&
    adjustWeekStartKey != null &&
    adjustWeekEndKey != null &&
    weekRangeNeedsFetch(
      adjustWeekStartKey,
      adjustWeekEndKey,
      pageData.rangeFrom,
      pageData.rangeTo,
    );

  const adjustWeekLoading =
    needsAdjustWeekFetch &&
    adjustWeekToken != null &&
    loadedAdjustWeekToken !== adjustWeekToken;

  const loadAdjustWeekIntoPageData = useCallback(
    async (
      base: TeacherMyHoursPageData,
      weekStartKey: string,
      weekEndKey: string,
    ): Promise<TeacherMyHoursPageData> => {
      if (!weekRangeNeedsFetch(weekStartKey, weekEndKey, base.rangeFrom, base.rangeTo)) {
        return base;
      }
      const patch = await fetchTeacherMyHoursPageData(organizationId, {
        from: weekStartKey,
        to: weekEndKey,
      });
      return mergeTeacherMyHoursPageData(base, patch);
    },
    [organizationId],
  );

  useEffect(() => {
    if (
      !needsAdjustWeekFetch ||
      adjustWeekStartKey == null ||
      adjustWeekEndKey == null ||
      adjustWeekToken == null ||
      loadedAdjustWeekToken === adjustWeekToken
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
        parentToast.error(
          error instanceof Error ? error.message : "Could not load this week.",
        );
        void reportPortalOperationalError(
          "teacher_portal",
          {
            organizationId,
            operation: "my_hours.adjust_week_load",
            error: "",
          },
          error,
          portalJsonApiErrorStatus(error),
          portalJsonApiErrorCode(error),
        );
      }
    })();
  }, [
    needsAdjustWeekFetch,
    adjustWeekStartKey,
    adjustWeekEndKey,
    adjustWeekToken,
    loadedAdjustWeekToken,
    organizationId,
  ]);

  const activeSessionStartedAt = useMemo(() => {
    if (!pageData.activeSession) return null;
    return new Date(pageData.activeSession.clockInAt);
  }, [pageData.activeSession]);

  const elapsedSeconds = useLiveElapsed(activeSessionStartedAt);

  const focusDateKey = toDateKey(focusDate);

  const dayLog = useMemo(
    () => getDayLogForDateKey(pageData.entriesByDateKey, focusDate),
    [pageData.entriesByDateKey, focusDate],
  );

  const closedSessionsForFocusDay = useMemo(() => {
    const sessions = pageData.sessionsByDateKey[focusDateKey] ?? [];
    return sessions.filter((session) => session.clockOutAt != null);
  }, [pageData.sessionsByDateKey, focusDateKey]);

  const activeOnFocusDay = activeSessionStartedAtForFocusDay(
    pageData.activeSession,
    focusDateKey,
    pageData.referenceDateKey,
  );

  const sidebarTodayMinutes = useMemo(() => {
    const todayKey = pageData.referenceDateKey;
    const closed = (pageData.sessionsByDateKey[todayKey] ?? []).filter(
      (session) => session.clockOutAt != null,
    );
    const completed = closed.reduce((sum, s) => sum + s.minutes, 0);
    const active = activeSessionLoggedMinutesForFocusDay(
      pageData.activeSession,
      todayKey,
      todayKey,
      elapsedSeconds,
    );
    const total = completed + active;
    return total > 0 || pageData.activeSession ? total : pageData.sidebar.todayMinutes;
  }, [
    pageData.referenceDateKey,
    pageData.sessionsByDateKey,
    pageData.activeSession,
    pageData.sidebar.todayMinutes,
    elapsedSeconds,
  ]);

  const handleClockIn = useCallback(async () => {
    if (previewMode || activeSessionStartedAt || clockActionPending) return;
    setClockActionPending("in");
    try {
      const next = await postTeacherMyHoursClockIn(organizationId);
      setPageData(next);
      const clockInAt = next.activeSession?.clockInAt;
      parentToast.success(
        clockInAt
          ? `Clocked in at ${formatWallClockTime(new Date(clockInAt))}`
          : "Clocked in",
      );
    } catch (error) {
      parentToast.error(
        error instanceof Error ? error.message : "Could not clock in.",
      );
      void reportPortalOperationalError(
        "teacher_portal",
        {
          organizationId,
          operation: "my_hours.clock_in",
          error: "",
        },
        error,
        portalJsonApiErrorStatus(error),
        portalJsonApiErrorCode(error),
      );
    } finally {
      setClockActionPending(null);
    }
  }, [
    previewMode,
    activeSessionStartedAt,
    clockActionPending,
    organizationId,
  ]);

  const handleClockOut = useCallback(async () => {
    if (previewMode || !activeSessionStartedAt || clockActionPending) return;
    setClockActionPending("out");
    try {
      const { pageData: next, sessionMinutes } =
        await postTeacherMyHoursClockOut(organizationId);
      setPageData(next);
      parentToast.success(
        `Session saved · ${formatHoursMinutes(Math.max(1, sessionMinutes))}`,
      );
    } catch (error) {
      parentToast.error(
        error instanceof Error ? error.message : "Could not clock out.",
      );
      void reportPortalOperationalError(
        "teacher_portal",
        {
          organizationId,
          operation: "my_hours.clock_out",
          error: "",
        },
        error,
        portalJsonApiErrorStatus(error),
        portalJsonApiErrorCode(error),
      );
    } finally {
      setClockActionPending(null);
    }
  }, [
    previewMode,
    activeSessionStartedAt,
    clockActionPending,
    organizationId,
  ]);

  const handleAdjustSubmit = useCallback(
    async (input: {
      dateKey: string;
      note: string;
      sessions: { clockIn: string; clockOut: string }[];
    }) => {
      if (previewMode) return;
      try {
        const result = await postTeacherMyHoursAdjustment({
          organizationId,
          dateKey: input.dateKey,
          note: input.note,
          sessions: input.sessions,
        });
        const weekStartKey = toDateKey(startOfWeekMonday(focusDate));
        const weekEndKey = toDateKey(addDays(parseDateKey(weekStartKey), 6));
        let nextPageData = result.pageData;
        try {
          nextPageData = await loadAdjustWeekIntoPageData(
            result.pageData,
            weekStartKey,
            weekEndKey,
          );
        } catch (reloadError) {
          void reportPortalOperationalError(
            "teacher_portal",
            {
              organizationId,
              operation: "my_hours.adjust_week_load",
              error: "",
            },
            reloadError,
            portalJsonApiErrorStatus(reloadError),
            portalJsonApiErrorCode(reloadError),
          );
        }
        setPageData(nextPageData);
        if (
          adjustWeekToken &&
          adjustWeekStartKey != null &&
          adjustWeekEndKey != null &&
          !weekRangeNeedsFetch(
            adjustWeekStartKey,
            adjustWeekEndKey,
            nextPageData.rangeFrom,
            nextPageData.rangeTo,
          )
        ) {
          setLoadedAdjustWeekToken(adjustWeekToken);
        } else {
          setLoadedAdjustWeekToken(null);
        }
        parentToast.success(
          result.requireApproval
            ? "Sent to your school for approval."
            : "Hours saved.",
        );
      } catch (error) {
        parentToast.error(
          error instanceof Error ? error.message : "Could not save hours.",
        );
        void reportPortalOperationalError(
          "teacher_portal",
          {
            organizationId,
            operation: "my_hours.adjust",
            error: "",
          },
          error,
          portalJsonApiErrorStatus(error),
          portalJsonApiErrorCode(error),
        );
        throw error;
      }
    },
    [
      previewMode,
      organizationId,
      focusDate,
      loadAdjustWeekIntoPageData,
      adjustWeekToken,
      adjustWeekStartKey,
      adjustWeekEndKey,
    ],
  );

  const shiftFocusDate = useCallback(
    (delta: number) => {
      setFocusDate((current) => {
        const next = addDays(current, delta);
        if (view === "month") {
          setMonthDate(next);
        }
        return next;
      });
    },
    [view],
  );

  const shiftMonth = useCallback((deltaMonths: number) => {
    setMonthDate((current) => {
      const next = new Date(current.getFullYear(), current.getMonth() + deltaMonths, 1);
      setFocusDate(next);
      return next;
    });
  }, []);

  const openDayDetail = useCallback((date: Date) => {
    setFocusDate(date);
    setView("day");
  }, []);

  return (
    <div className={PORTAL_HOME_CONTAINER_CLASS} data-testid="teacher-my-hours-page">
      <TeacherMyHoursStoryHeader
        theme={theme}
        focusDate={view === "month" ? monthDate : focusDate}
        view={view}
        onViewChange={(nextView) => {
          setView(nextView);
          if (nextView === "month") {
            setMonthDate(
              new Date(focusDate.getFullYear(), focusDate.getMonth(), 1),
            );
          }
        }}
        onPreviousDate={() => {
          if (view === "month") {
            shiftMonth(-1);
          } else {
            shiftFocusDate(view === "week" || view === "adjust" ? -7 : -1);
          }
        }}
        onNextDate={() => {
          if (view === "month") {
            shiftMonth(1);
          } else {
            shiftFocusDate(view === "week" || view === "adjust" ? 7 : 1);
          }
        }}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_300px]">
        <AnimatePresence mode="wait">
          <motion.div key={view} className="min-w-0" {...viewMotion}>
            {view === "day" ? (
              <TeacherMyHoursDayPanel
                theme={theme}
                focusDate={focusDate}
                referenceDate={referenceDate}
                dayLog={dayLog}
                closedSessions={closedSessionsForFocusDay}
                activeSession={pageData.activeSession}
                activeSessionStartedAt={activeOnFocusDay}
                elapsedSeconds={elapsedSeconds}
                previewMode={previewMode}
                clockActionPending={clockActionPending}
                onClockIn={handleClockIn}
                onClockOut={handleClockOut}
              />
            ) : null}
            {view === "week" ? (
              <TeacherMyHoursWeekPanel
                theme={theme}
                entriesByDateKey={pageData.entriesByDateKey}
                focusDate={focusDate}
                referenceDate={referenceDate}
                onDaySelect={openDayDetail}
              />
            ) : null}
            {view === "month" ? (
              <TeacherMyHoursMonthPanel
                theme={theme}
                entriesByDateKey={pageData.entriesByDateKey}
                monthDate={monthDate}
                referenceDate={referenceDate}
                onPreviousMonth={() => shiftMonth(-1)}
                onNextMonth={() => shiftMonth(1)}
                onDaySelect={openDayDetail}
              />
            ) : null}
            {view === "adjust" ? (
              <TeacherMyHoursAdjustPanel
                theme={theme}
                focusDate={focusDate}
                referenceDate={referenceDate}
                timezone={pageData.timezone}
                rangeFrom={pageData.rangeFrom}
                rangeTo={pageData.rangeTo}
                weekLoading={adjustWeekLoading}
                sessionsByDateKey={pageData.sessionsByDateKey}
                pendingAdjustmentsByDateKey={
                  pageData.pendingAdjustmentsByDateKey ?? {}
                }
                adjustmentsRequireApproval={
                  pageData.adjustmentsRequireApproval !== false
                }
                activeSession={pageData.activeSession}
                previewMode={previewMode}
                onSubmit={handleAdjustSubmit}
              />
            ) : null}
          </motion.div>
        </AnimatePresence>

        <TeacherMyHoursSummarySidebar
          theme={theme}
          summary={pageData.sidebar}
          clockedIn={activeSessionStartedAt != null}
          todayLiveMinutes={sidebarTodayMinutes}
        />
      </div>
    </div>
  );
}
