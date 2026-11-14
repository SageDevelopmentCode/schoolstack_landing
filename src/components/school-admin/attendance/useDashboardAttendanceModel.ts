"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  useAttendanceApiBasePath,
  useAttendancePreviewMode,
} from "@/components/school-admin/attendance/AttendanceApiContext";
import { adminToast, formatActionError } from "@/lib/school-admin/admin-toast";
import { formatDashboardAttendanceSubcopy } from "@/lib/school-admin/attendance/dashboard-attendance";
import {
  buildAttendanceHref,
  isToday,
  parseDateKey,
  shiftDate,
  toDateKey,
} from "@/lib/school-admin/attendance/attendance-date-utils";
import { formatEnrolledStudentName } from "@/lib/school-admin/enrolled-students";
import type {
  AttendanceAction,
  AttendancePickupSelection,
  AttendanceRosterResponse,
  AttendanceRosterStudent,
  AttendanceRosterSummary,
} from "@/lib/school-admin/attendance/attendance-types";
import { reportClientOperationalError } from "@/lib/operational-errors-client";
import { reportPortalOperationalError } from "@/lib/portal-operational-errors";
import type { PortalOperationalSurface } from "@/lib/portal-operational-errors";

export type DashboardAttendanceModelInput = {
  organizationId: string;
  /** Date key of the server-provided roster (today). */
  date: string;
  students: AttendanceRosterStudent[];
  summary: AttendanceRosterSummary;
  attendanceHref: string;
  previewMode?: boolean;
  operationalErrorSurface?: PortalOperationalSurface;
  onSummaryChange?: (summary: AttendanceRosterSummary) => void;
  /** Called after a record saves (e.g. refresh the dashboard focus queue). */
  onRecordSaved?: () => void;
  /** False when there is no roster to show; nothing is fetched. */
  enabled?: boolean;
};

function reportDashboardAttendanceError(
  surface: PortalOperationalSurface,
  organizationId: string,
  operation: string,
  error: string,
) {
  if (surface === "school_admin") {
    void reportClientOperationalError({ organizationId, operation, error });
    return;
  }
  void reportPortalOperationalError(
    surface,
    { organizationId, operation, error },
    error,
  );
}

function savedToastTitle(action: AttendanceAction, name: string): string {
  if (action === "present") return `${name} marked present.`;
  if (action === "absent") return `${name} marked absent.`;
  return `Pickup recorded for ${name}.`;
}

/**
 * Attendance roster state for dashboard surfaces: date stepping, roster
 * loading, inline saves, and the detail / pickup sheets. Shared by the story
 * attendance section (admin + teacher) and the Garden admin dashboard.
 */
export function useDashboardAttendanceModel({
  organizationId,
  date,
  students: initialStudents,
  summary: initialSummary,
  attendanceHref,
  previewMode = false,
  operationalErrorSurface = "teacher_portal",
  onSummaryChange,
  onRecordSaved,
  enabled = true,
}: DashboardAttendanceModelInput) {
  const apiBasePath = useAttendanceApiBasePath();
  const contextPreviewMode = useAttendancePreviewMode();
  const readOnly = previewMode || contextPreviewMode;

  const [activeDate, setActiveDate] = useState(() => parseDateKey(date) ?? new Date());
  const [students, setStudents] = useState(initialStudents);
  const [summary, setSummary] = useState(initialSummary);
  /** Date key whose roster is currently in `students` / `summary`. */
  const [loadedDateKey, setLoadedDateKey] = useState(date);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [savingStudentId, setSavingStudentId] = useState<string | null>(null);
  const [lastSavedStudentId, setLastSavedStudentId] = useState<string | null>(null);
  const [detailStudent, setDetailStudent] = useState<AttendanceRosterStudent | null>(null);
  const [pickupStudent, setPickupStudent] = useState<AttendanceRosterStudent | null>(null);
  const requestIdRef = useRef(0);
  // Callers often pass inline callbacks; keep them in refs so loadRoster stays
  // stable and the date-change effect can't refetch on every render.
  const retrySaveRef = useRef<
    ((student: AttendanceRosterStudent, action: AttendanceAction) => void) | null
  >(null);
  const onSummaryChangeRef = useRef(onSummaryChange);
  const onRecordSavedRef = useRef(onRecordSaved);
  useEffect(() => {
    onSummaryChangeRef.current = onSummaryChange;
    onRecordSavedRef.current = onRecordSaved;
  });

  const activeDateKey = useMemo(() => toDateKey(activeDate), [activeDate]);
  const viewingToday = isToday(activeDate);
  const fullAttendanceHref = buildAttendanceHref(attendanceHref, activeDateKey);

  // Server data changed. A new date resets the view; new students for the same
  // date replace the roster only while that date is on screen. A summary-only
  // change (our own onSummaryChange echo) never resets the roster.
  const [prevServer, setPrevServer] = useState({ date, initialStudents });
  if (prevServer.date !== date || prevServer.initialStudents !== initialStudents) {
    const dateChanged = prevServer.date !== date;
    setPrevServer({ date, initialStudents });
    if (dateChanged) {
      const nextDate = parseDateKey(date);
      if (nextDate) setActiveDate(nextDate);
      setStudents(initialStudents);
      setSummary(initialSummary);
      setLoadedDateKey(date);
      setLoadError(null);
    } else if (loadedDateKey === date && activeDateKey === date) {
      setStudents(initialStudents);
      setSummary(initialSummary);
    }
  }

  useEffect(() => {
    if (!detailStudent?.id) return;
    const refreshed = students.find((student) => student.id === detailStudent.id);
    if (!refreshed) return;

    queueMicrotask(() => {
      setDetailStudent((current) => {
        if (!current || current.id !== refreshed.id) return current;
        if (
          current.attendanceStatus === refreshed.attendanceStatus &&
          current.pickedUpByName === refreshed.pickedUpByName &&
          current.presentAt === refreshed.presentAt &&
          current.absentAt === refreshed.absentAt &&
          current.pickedUpAt === refreshed.pickedUpAt
        ) {
          return current;
        }
        return refreshed;
      });
    });
  }, [detailStudent?.id, students]);

  const loadRoster = useCallback(
    async (dateKey: string, options?: { silentError?: boolean }) => {
      const requestId = ++requestIdRef.current;
      setLoading(true);
      setLoadError(null);
      try {
        const response = await fetch(
          `${apiBasePath}?organizationId=${encodeURIComponent(organizationId)}&date=${encodeURIComponent(dateKey)}`,
        );
        const payload = (await response.json().catch(() => null)) as
          | AttendanceRosterResponse
          | { error?: string }
          | null;

        if (!response.ok) {
          throw new Error(
            payload && "error" in payload && payload.error
              ? payload.error
              : "Failed to load attendance roster.",
          );
        }

        const roster = payload as AttendanceRosterResponse;
        // A newer request (e.g. fast date stepping) wins.
        if (requestId !== requestIdRef.current) return roster;
        setStudents(roster.students);
        setSummary(roster.summary);
        setLoadedDateKey(dateKey);

        if (isToday(parseDateKey(dateKey) ?? new Date())) {
          onSummaryChangeRef.current?.(roster.summary);
        }

        return roster;
      } catch (err) {
        const message = formatActionError(err, "Failed to load attendance roster.");
        reportDashboardAttendanceError(
          operationalErrorSurface,
          organizationId,
          "attendance.load_roster",
          message,
        );
        if (requestId === requestIdRef.current) {
          setLoadError(message);
          // Keep the date we tried so Retry targets it and the effect doesn't loop.
          setLoadedDateKey(dateKey);
        }
        if (!options?.silentError) adminToast.error(message);
        return null;
      } finally {
        if (requestId === requestIdRef.current) setLoading(false);
      }
    },
    [apiBasePath, operationalErrorSurface, organizationId],
  );

  useEffect(() => {
    if (!enabled || activeDateKey === loadedDateKey) return;
    queueMicrotask(() => {
      void loadRoster(activeDateKey);
    });
  }, [activeDateKey, enabled, loadedDateKey, loadRoster]);

  const refreshRoster = useCallback(async () => {
    return loadRoster(activeDateKey);
  }, [activeDateKey, loadRoster]);

  const retryLoad = useCallback(() => {
    void loadRoster(activeDateKey, { silentError: true });
  }, [activeDateKey, loadRoster]);

  const saveAttendanceAction = useCallback(
    async (
      student: AttendanceRosterStudent,
      action: AttendanceAction,
      pickupSelection?: AttendancePickupSelection,
    ): Promise<boolean> => {
      if (readOnly) return false;

      const name = formatEnrolledStudentName(student);
      setSavingStudentId(student.id);
      try {
        const response = await fetch(`${apiBasePath}/records`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            organizationId,
            studentId: student.id,
            date: activeDateKey,
            action,
            pickupSource: pickupSelection?.source,
            pickupContactId: pickupSelection?.contactId,
          }),
        });

        const payload = (await response.json().catch(() => null)) as {
          error?: string;
        } | null;

        if (!response.ok) {
          throw new Error(payload?.error ?? "Failed to save attendance.");
        }

        const roster = await loadRoster(activeDateKey, { silentError: true });

        if (action === "pickup") {
          setPickupStudent(null);
        }

        setLastSavedStudentId(student.id);
        adminToast.dismiss(`attendance-error-${student.id}`);
        adminToast.success(savedToastTitle(action, name), {
          id: `attendance-${student.id}`,
          description: roster
            ? formatDashboardAttendanceSubcopy(roster.summary) +
              (isToday(activeDate) ? " today." : ".")
            : undefined,
        });
        onRecordSavedRef.current?.();
        return true;
      } catch (err) {
        const message = formatActionError(err, "Failed to save attendance.");
        reportDashboardAttendanceError(
          operationalErrorSurface,
          organizationId,
          "attendance.save_record",
          message,
        );
        adminToast.error(message, {
          id: `attendance-error-${student.id}`,
          description: `${name}'s attendance was not changed.`,
          action:
            action === "pickup"
              ? undefined
              : {
                  label: "Retry",
                  onClick: () => retrySaveRef.current?.(student, action),
                },
        });
        return false;
      } finally {
        setSavingStudentId(null);
      }
    },
    [
      activeDate,
      activeDateKey,
      apiBasePath,
      loadRoster,
      operationalErrorSurface,
      organizationId,
      readOnly,
    ],
  );

  useEffect(() => {
    retrySaveRef.current = (student, action) => void saveAttendanceAction(student, action);
  }, [saveAttendanceAction]);

  // Clear the "just saved" highlight after a moment.
  useEffect(() => {
    if (!lastSavedStudentId) return;
    const timer = window.setTimeout(() => setLastSavedStudentId(null), 1600);
    return () => window.clearTimeout(timer);
  }, [lastSavedStudentId]);

  const goToPreviousDay = useCallback(() => {
    setActiveDate((current) => shiftDate(current, -1));
  }, []);
  const goToNextDay = useCallback(() => {
    setActiveDate((current) => shiftDate(current, 1));
  }, []);
  const jumpToToday = useCallback(() => {
    setActiveDate(new Date());
  }, []);

  return {
    readOnly,
    activeDate,
    activeDateKey,
    viewingToday,
    fullAttendanceHref,
    students,
    summary,
    subcopy: formatDashboardAttendanceSubcopy(summary),
    loading,
    loadError,
    retryLoad,
    refreshRoster,
    savingStudentId,
    lastSavedStudentId,
    saveAttendanceAction,
    goToPreviousDay,
    goToNextDay,
    jumpToToday,
    detailStudent,
    setDetailStudent,
    pickupStudent,
    setPickupStudent,
  };
}

export type DashboardAttendanceModel = ReturnType<typeof useDashboardAttendanceModel>;
