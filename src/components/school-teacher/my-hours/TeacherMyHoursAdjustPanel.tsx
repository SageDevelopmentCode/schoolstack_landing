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
  addDays,
  formatHoursMinutes,
  formatLongWeekdayDate,
  formatShortWeekdayDate,
  parseDateKey,
  startOfWeekMonday,
  toDateKey,
} from "@/lib/school-teacher/my-hours/format-duration";
import { MY_HOURS_CALENDAR_LINE } from "@/lib/school-teacher/my-hours/calendar-styles";
import type {
  MyHoursSession,
  TeacherMyHoursActiveSession,
} from "@/lib/school-teacher/my-hours/types";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";

type DayDraft = {
  sessions: AdjustSessionDraft[];
  note: string;
};

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
  sessionsByDateKey: Record<string, MyHoursSession[]>;
  activeSession: TeacherMyHoursActiveSession | null;
  previewMode?: boolean;
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

function cloneDraft(draft: DayDraft): DayDraft {
  return {
    note: draft.note,
    sessions: draft.sessions.map((session) => ({ ...session })),
  };
}

export default function TeacherMyHoursAdjustPanel({
  theme,
  focusDate,
  referenceDate,
  timezone,
  sessionsByDateKey,
  activeSession,
  previewMode = false,
}: TeacherMyHoursAdjustPanelProps) {
  const keyRef = useRef(0);
  const [savedDrafts, setSavedDrafts] = useState<Record<string, DayDraft>>({});
  const [editor, setEditor] = useState<EditorState | null>(null);

  const weekStart = startOfWeekMonday(focusDate);
  const weekKey = toDateKey(weekStart);
  const weekEndKey = toDateKey(addDays(weekStart, 6));
  const days = Array.from({ length: 7 }, (_, index) => addDays(weekStart, index));
  const referenceKey = toDateKey(referenceDate);
  const visibleEditor =
    editor && editor.dateKey >= weekKey && editor.dateKey <= weekEndKey
      ? editor
      : null;

  const nextKey = () => {
    keyRef.current += 1;
    return `adjust-session-${keyRef.current}`;
  };

  const closedSessionsFor = (dateKey: string) =>
    (sessionsByDateKey[dateKey] ?? []).filter((session) => session.clockOutAt != null);

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
    if (editor?.dateKey === dateKey) return;
    const saved = savedDrafts[dateKey];
    if (saved) {
      const draft = cloneDraft(saved);
      setEditor({
        dateKey,
        sessions: draft.sessions,
        note: draft.note,
        showError: false,
      });
      return;
    }
    const closed = closedSessionsFor(dateKey);
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
      return {
        ...current,
        showError: false,
        sessions: [
          ...current.sessions,
          {
            key: nextKey(),
            clockIn: DEFAULT_CLOCK_IN,
            clockOut: DEFAULT_CLOCK_OUT,
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

  const saveEditor = () => {
    if (!editor || previewMode) return;
    const invalid = editor.sessions.some((session) =>
      isAdjustSessionInvalid(session.clockIn, session.clockOut),
    );
    if (invalid) {
      setEditor({ ...editor, showError: true });
      return;
    }
    setSavedDrafts((current) => ({
      ...current,
      [editor.dateKey]: {
        note: editor.note,
        sessions: editor.sessions.map((session) => ({ ...session })),
      },
    }));
    setEditor(null);
  };

  const editorDateKey = visibleEditor?.dateKey ?? null;
  const editorClosedCount = editorDateKey ? closedSessionsFor(editorDateKey).length : 0;
  const editorHasSaved = editorDateKey ? savedDrafts[editorDateKey] != null : false;
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
          Changes stay on this screen until saving hours is turned on.
        </p>
      </div>
      <ul>
        {days.map((day, index) => {
          const dateKey = toDateKey(day);
          const isLast = index === days.length - 1;
          const isToday = dateKey === referenceKey;
          const isFuture = dateKey > referenceKey;
          const closedSessions = closedSessionsFor(dateKey);
          const saved = savedDrafts[dateKey] ?? null;
          const openOnDay = activeSession?.workDate === dateKey ? activeSession : null;
          const openStartedLabel = openOnDay
            ? formatDemoTimeLabelInTimezone(new Date(openOnDay.clockInAt), timezone)
            : null;
          const canEdit = !isFuture && (closedSessions.length > 0 || saved != null || !openOnDay);
          const actionLabel =
            saved || closedSessions.length > 0 ? "Adjust" : "Add hours";

          let summary = "Not logged";
          if (isFuture) {
            summary = "Upcoming";
          } else if (saved) {
            const count = saved.sessions.length;
            const total = formatHoursMinutes(adjustDraftMinutes(saved.sessions));
            if (count === 1) {
              const session = saved.sessions[0];
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
                    {saved ? (
                      <ParentChip theme={theme} tone="warning">
                        Draft
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
                  {openOnDay && !canEdit ? (
                    <p className="mt-1 text-sm" style={{ color: theme.muted }}>
                      Clock out before changing this open session.
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
      mode={editorHasSaved || editorClosedCount > 0 ? "adjust" : "add"}
      sessions={visibleEditor?.sessions ?? []}
      note={visibleEditor?.note ?? ""}
      showError={visibleEditor?.showError ?? false}
      openSessionLabel={
        editorOpenSession
          ? formatDemoTimeLabelInTimezone(new Date(editorOpenSession.clockInAt), timezone)
          : null
      }
      previewMode={previewMode}
      onClose={() => setEditor(null)}
      onSave={saveEditor}
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
