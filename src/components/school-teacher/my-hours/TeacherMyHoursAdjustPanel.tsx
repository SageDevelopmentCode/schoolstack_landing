"use client";

import { useRef, useState } from "react";
import { formatDemoTimeLabelInTimezone } from "@/lib/demo-scheduler-timezone";
import ParentButton from "@/components/school-parent/ui/ParentButton";
import ParentCard from "@/components/school-parent/ui/ParentCard";
import ParentChip from "@/components/school-parent/ui/ParentChip";
import TeacherMyHoursAdjustSidebar, {
  adjustDraftMinutes,
  formatAdjustTimeLabel,
  isAdjustSessionInvalid,
  type AdjustSessionDraft,
} from "@/components/school-teacher/my-hours/TeacherMyHoursAdjustSidebar";
import {
  adjustmentSessionsOverlap,
  defaultNextAdjustmentSession,
} from "@/lib/school-teacher/my-hours/my-hours-adjustment-rules";
import {
  addDays,
  formatHoursMinutes,
  formatLongWeekdayDate,
  formatShortWeekdayDate,
  parseDateKey,
  startOfWeekMonday,
  toDateKey,
} from "@/lib/school-teacher/my-hours/format-duration";
import { MY_HOURS_CALENDAR_LINE } from "@/lib/school-teacher/my-hours/calendar-styles";
import { isDateKeyInLoadedRange } from "@/lib/school-teacher/my-hours/my-hours-range-merge";
import type {
  MyHoursPendingAdjustment,
  MyHoursSession,
  TeacherMyHoursActiveSession,
} from "@/lib/school-teacher/my-hours/types";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";

type EditorState = {
  dateKey: string;
  sessions: AdjustSessionDraft[];
  note: string;
  showError: boolean;
};

type TeacherMyHoursAdjustPanelProps = {
  theme: ParentThemeTokens;
  focusDate: Date;
  referenceDate: Date;
  timezone: string;
  rangeFrom: string;
  rangeTo: string;
  weekLoading?: boolean;
  sessionsByDateKey: Record<string, MyHoursSession[]>;
  pendingAdjustmentsByDateKey: Record<string, MyHoursPendingAdjustment>;
  adjustmentsRequireApproval: boolean;
  activeSession: TeacherMyHoursActiveSession | null;
  previewMode?: boolean;
  onSubmit: (input: {
    dateKey: string;
    note: string;
    sessions: { clockIn: string; clockOut: string }[];
  }) => Promise<void>;
};

const DEFAULT_CLOCK_IN = "08:00";
const DEFAULT_CLOCK_OUT = "15:00";

function timeInputValue(iso: string, timeZone: string): string {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date(iso));
  let hour = parts.find((part) => part.type === "hour")?.value ?? "00";
  const minute = parts.find((part) => part.type === "minute")?.value ?? "00";
  if (hour === "24") hour = "00";
  return `${hour.padStart(2, "0")}:${minute.padStart(2, "0")}`;
}

export default function TeacherMyHoursAdjustPanel({
  theme,
  focusDate,
  referenceDate,
  timezone,
  rangeFrom,
  rangeTo,
  weekLoading = false,
  sessionsByDateKey,
  pendingAdjustmentsByDateKey,
  adjustmentsRequireApproval,
  activeSession,
  previewMode = false,
  onSubmit,
}: TeacherMyHoursAdjustPanelProps) {
  const keyRef = useRef(0);
  const [editor, setEditor] = useState<EditorState | null>(null);
  const [saving, setSaving] = useState(false);

  const weekStart = startOfWeekMonday(focusDate);
  const weekKey = toDateKey(weekStart);
  const weekEndKey = toDateKey(addDays(weekStart, 6));
  const days = Array.from({ length: 7 }, (_, index) => addDays(weekStart, index));
  const referenceKey = toDateKey(referenceDate);

  const nextKey = () => {
    keyRef.current += 1;
    return `adjust-session-${keyRef.current}`;
  };

  const closedSessionsFor = (dateKey: string) =>
    (sessionsByDateKey[dateKey] ?? []).filter((session) => session.clockOutAt != null);

  const sessionsKnownFor = (dateKey: string) =>
    isDateKeyInLoadedRange(dateKey, rangeFrom, rangeTo);

  const visibleEditor =
    editor &&
    editor.dateKey >= weekKey &&
    editor.dateKey <= weekEndKey &&
    !weekLoading &&
    sessionsKnownFor(editor.dateKey)
      ? editor
      : null;

  const seedFromSessions = (sessions: MyHoursSession[]): AdjustSessionDraft[] =>
    sessions.map((session) => ({
      key: nextKey(),
      clockIn: timeInputValue(session.clockInAt, timezone),
      clockOut: session.clockOutAt
        ? timeInputValue(session.clockOutAt, timezone)
        : "",
      originalLabel: `Was ${session.clockIn} – ${session.clockOut}`,
    }));

  const openEditor = (dateKey: string) => {
    if (weekLoading || !sessionsKnownFor(dateKey)) return;
    if (editor?.dateKey === dateKey) return;
    const closed = closedSessionsFor(dateKey);
    const pending = pendingAdjustmentsByDateKey[dateKey];
    if (pending && pending.sessions.length > 0) {
      setEditor({
        dateKey,
        sessions: pending.sessions.map((session, index) => ({
          key: nextKey(),
          clockIn: session.clockIn,
          clockOut: session.clockOut,
          originalLabel: closed[index]
            ? `Was ${closed[index].clockIn} – ${closed[index].clockOut}`
            : null,
        })),
        note: pending.note,
        showError: false,
      });
      return;
    }
    setEditor({
      dateKey,
      sessions:
        closed.length > 0
          ? seedFromSessions(closed)
          : [
              {
                key: nextKey(),
                clockIn: DEFAULT_CLOCK_IN,
                clockOut: DEFAULT_CLOCK_OUT,
                originalLabel: null,
              },
            ],
      note: "",
      showError: false,
    });
  };

  const updateSession = (
    sessionKey: string,
    field: "clockIn" | "clockOut",
    value: string,
  ) => {
    setEditor((current) => {
      if (!current) return current;
      return {
        ...current,
        showError: false,
        sessions: current.sessions.map((session) =>
          session.key === sessionKey ? { ...session, [field]: value } : session,
        ),
      };
    });
  };

  const addSession = () => {
    setEditor((current) => {
      if (!current) return current;
      const next = defaultNextAdjustmentSession(current.sessions);
      return {
        ...current,
        showError: false,
        sessions: [
          ...current.sessions,
          {
            key: nextKey(),
            clockIn: next.clockIn,
            clockOut: next.clockOut,
            originalLabel: null,
          },
        ],
      };
    });
  };

  const removeSession = (sessionKey: string) => {
    setEditor((current) => {
      if (!current || current.sessions.length < 2) return current;
      return {
        ...current,
        showError: false,
        sessions: current.sessions.filter((session) => session.key !== sessionKey),
      };
    });
  };

  const saveEditor = async () => {
    if (!editor || previewMode || saving) return;
    const invalid = editor.sessions.some((session) =>
      isAdjustSessionInvalid(session.clockIn, session.clockOut),
    );
    if (invalid || adjustmentSessionsOverlap(editor.sessions)) {
      setEditor({ ...editor, showError: true });
      return;
    }
    setSaving(true);
    try {
      await onSubmit({
        dateKey: editor.dateKey,
        note: editor.note,
        sessions: editor.sessions.map((session) => ({
          clockIn: session.clockIn,
          clockOut: session.clockOut,
        })),
      });
      setEditor(null);
    } catch {
      // The page shows the error toast.
    } finally {
      setSaving(false);
    }
  };

  const editorDateKey = visibleEditor?.dateKey ?? null;
  const editorClosedCount = editorDateKey ? closedSessionsFor(editorDateKey).length : 0;
  const editorHasPending = editorDateKey
    ? pendingAdjustmentsByDateKey[editorDateKey] != null
    : false;
  const editorOpenSession =
    editorDateKey && activeSession?.workDate === editorDateKey ? activeSession : null;

  return (
    <>
    <ParentCard
      theme={theme}
      className="overflow-hidden p-0"
      data-testid="teacher-my-hours-adjust-panel"
    >
      <div className="border-b px-5 py-4" style={{ borderColor: MY_HOURS_CALENDAR_LINE }}>
        <h2 className="font-display text-lg font-semibold" style={{ color: theme.ink }}>
          Week of {formatShortWeekdayDate(weekStart)}
        </h2>
        <p className="mt-1 text-sm" style={{ color: theme.muted }}>
          {adjustmentsRequireApproval
            ? "Submitted days stay pending until your school approves them."
            : "Saved days update your hours right away."}
        </p>
      </div>
      <ul>
        {days.map((day, index) => {
          const dateKey = toDateKey(day);
          const isLast = index === days.length - 1;
          const isToday = dateKey === referenceKey;
          const isFuture = dateKey > referenceKey;
          const closedSessions = closedSessionsFor(dateKey);
          const pending = pendingAdjustmentsByDateKey[dateKey] ?? null;
          const openOnDay = activeSession?.workDate === dateKey ? activeSession : null;
          const openStartedLabel = openOnDay
            ? formatDemoTimeLabelInTimezone(new Date(openOnDay.clockInAt), timezone)
            : null;
          const daySessionsKnown = sessionsKnownFor(dateKey);
          const canEdit =
            !isFuture && !openOnDay && daySessionsKnown && !weekLoading;
          const actionLabel =
            pending || closedSessions.length > 0 ? "Adjust" : "Add hours";

          let summary = "Not logged";
          if (isFuture) {
            summary = "Upcoming";
          } else if (!daySessionsKnown || weekLoading) {
            summary = "Loading…";
          } else if (pending) {
            const count = pending.sessions.length;
            const total = formatHoursMinutes(adjustDraftMinutes(pending.sessions));
            if (count === 1) {
              const session = pending.sessions[0];
              summary = `${formatAdjustTimeLabel(session.clockIn)} – ${formatAdjustTimeLabel(session.clockOut)} · ${total}`;
            } else {
              summary = `${total} · ${count} sessions`;
            }
          } else if (closedSessions.length > 0) {
            const total = closedSessions.reduce((sum, session) => sum + session.minutes, 0);
            summary = `${formatHoursMinutes(total)} · ${closedSessions.length} ${closedSessions.length === 1 ? "session" : "sessions"}`;
          } else if (openOnDay) {
            summary = `Started at ${openStartedLabel}`;
          }

          return (
            <li
              key={dateKey}
              className="text-left"
              style={{
                borderBottom: isLast ? undefined : `1px solid ${MY_HOURS_CALENDAR_LINE}`,
              }}
            >
              <div className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-medium" style={{ color: isFuture ? theme.muted : theme.ink }}>
                      {formatShortWeekdayDate(day)}
                    </span>
                    {isToday ? (
                      <ParentChip theme={theme} tone="info">
                        Today
                      </ParentChip>
                    ) : null}
                    {pending ? (
                      <ParentChip theme={theme} tone="warning">
                        Pending
                      </ParentChip>
                    ) : null}
                    {openOnDay ? (
                      <ParentChip theme={theme} tone="success">
                        In progress
                      </ParentChip>
                    ) : null}
                  </div>
                  <p className="mt-1 text-sm" style={{ color: theme.muted }}>
                    {summary}
                  </p>
                  {openOnDay ? (
                    <p className="mt-1 text-sm" style={{ color: theme.muted }}>
                      Clock out before changing this day.
                    </p>
                  ) : null}
                </div>
                {canEdit ? (
                  <ParentButton
                    theme={theme}
                    variant="outline"
                    className="inline-flex w-full items-center justify-center sm:w-auto"
                    onClick={() => openEditor(dateKey)}
                    data-testid={`teacher-my-hours-adjust-${dateKey}`}
                  >
                    {actionLabel}
                  </ParentButton>
                ) : !isFuture && !openOnDay && (weekLoading || !daySessionsKnown) ? (
                  <p className="text-sm" style={{ color: theme.muted }}>
                    Loading…
                  </p>
                ) : null}
              </div>
            </li>
          );
        })}
      </ul>
    </ParentCard>

    <TeacherMyHoursAdjustSidebar
      theme={theme}
      open={visibleEditor != null}
      dateLabel={editorDateKey ? formatLongWeekdayDate(parseDateKey(editorDateKey)) : ""}
      mode={editorHasPending || editorClosedCount > 0 ? "adjust" : "add"}
      sessions={visibleEditor?.sessions ?? []}
      note={visibleEditor?.note ?? ""}
      showError={visibleEditor?.showError ?? false}
      openSessionLabel={
        editorOpenSession
          ? formatDemoTimeLabelInTimezone(new Date(editorOpenSession.clockInAt), timezone)
          : null
      }
      previewMode={previewMode}
      saving={saving}
      saveLabel={
        adjustmentsRequireApproval
          ? "Submit for approval"
          : editorHasPending || editorClosedCount > 0
            ? "Save changes"
            : "Save"
      }
      onClose={() => setEditor(null)}
      onSave={() => void saveEditor()}
      onNoteChange={(nextNote) =>
        setEditor((current) => (current ? { ...current, note: nextNote } : current))
      }
      onUpdateSession={updateSession}
      onAddSession={addSession}
      onRemoveSession={removeSession}
    />
    </>
  );
}
