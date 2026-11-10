"use client";

import { useEffect } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Clock, X } from "lucide-react";
import PopupTimePicker from "@/components/school-events/PopupTimePicker";
import ParentButton from "@/components/school-parent/ui/ParentButton";
import ButtonLoadingLabel from "@/components/ui/ButtonLoadingLabel";
import { MY_HOURS_CALENDAR_LINE } from "@/lib/school-teacher/my-hours/calendar-styles";
import { formatHoursMinutes } from "@/lib/school-teacher/my-hours/format-duration";
import {
  MY_HOURS_EASE,
  myHoursFadeUpTransition,
  myHoursRowTransition,
  myHoursTransitionDuration,
} from "@/lib/school-teacher/my-hours/my-hours-motion";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";

export type AdjustSessionDraft = {
  key: string;
  clockIn: string;
  clockOut: string;
  originalLabel: string | null;
};

type TeacherMyHoursAdjustSidebarProps = {
  theme: ParentThemeTokens;
  open: boolean;
  dateLabel: string;
  mode: "add" | "adjust";
  sessions: AdjustSessionDraft[];
  note: string;
  showError: boolean;
  openSessionLabel: string | null;
  previewMode?: boolean;
  saving?: boolean;
  saveLabel?: string;
  onClose: () => void;
  onSave: () => void;
  onNoteChange: (note: string) => void;
  onUpdateSession: (
    sessionKey: string,
    field: "clockIn" | "clockOut",
    value: string,
  ) => void;
  onAddSession: () => void;
  onRemoveSession: (sessionKey: string) => void;
};

const TIME_PICKER_CLOSE_LABEL = "Close time picker";

function minutesBetween(clockIn: string, clockOut: string): number | null {
  if (!clockIn || !clockOut) return null;
  const [startHour, startMinute] = clockIn.split(":").map(Number);
  const [endHour, endMinute] = clockOut.split(":").map(Number);
  if (
    [startHour, startMinute, endHour, endMinute].some((part) => Number.isNaN(part))
  ) {
    return null;
  }
  const start = startHour * 60 + startMinute;
  const end = endHour * 60 + endMinute;
  if (end <= start) return null;
  return end - start;
}

export function formatAdjustTimeLabel(value: string): string {
  if (!value) return "—";
  const [hour, minute] = value.split(":").map(Number);
  if (Number.isNaN(hour) || Number.isNaN(minute)) return "—";
  const date = new Date();
  date.setHours(hour, minute, 0, 0);
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}

export function adjustDraftMinutes(
  sessions: Array<Pick<AdjustSessionDraft, "clockIn" | "clockOut">>,
): number {
  return sessions.reduce(
    (sum, session) => sum + (minutesBetween(session.clockIn, session.clockOut) ?? 0),
    0,
  );
}

export function isAdjustSessionInvalid(clockIn: string, clockOut: string): boolean {
  return sessionDurationCopy(clockIn, clockOut).invalid;
}

function sessionDurationCopy(clockIn: string, clockOut: string): {
  text: string;
  invalid: boolean;
} {
  if (!clockIn || !clockOut) {
    return { text: "Add a clock-in and clock-out", invalid: true };
  }
  const minutes = minutesBetween(clockIn, clockOut);
  if (minutes == null) {
    return { text: "Clock out needs to be later than clock in", invalid: true };
  }
  return { text: formatHoursMinutes(minutes), invalid: false };
}

export default function TeacherMyHoursAdjustSidebar({
  theme,
  open,
  dateLabel,
  mode,
  sessions,
  note,
  showError,
  openSessionLabel,
  previewMode = false,
  saving = false,
  saveLabel,
  onClose,
  onSave,
  onNoteChange,
  onUpdateSession,
  onAddSession,
  onRemoveSession,
}: TeacherMyHoursAdjustSidebarProps) {
  const reducedMotion = useReducedMotion() ?? false;
  const fadeUp = myHoursFadeUpTransition(reducedMotion);
  const rowMotion = myHoursRowTransition(reducedMotion);
  const fadeTransition = {
    duration: myHoursTransitionDuration(reducedMotion),
    ease: MY_HOURS_EASE,
  };
  const title = mode === "adjust" ? "Adjust hours" : "Add hours";
  const titleId = "teacher-my-hours-adjust-sidebar-title";

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      if (document.querySelector(`[aria-label="${TIME_PICKER_CLOSE_LABEL}"]`)) return;
      onClose();
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose, open]);

  const panelMotion = reducedMotion
    ? {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
        transition: fadeTransition,
      }
    : {
        initial: { x: "100%", opacity: 0 },
        animate: { x: 0, opacity: 1 },
        exit: { x: "100%", opacity: 0 },
        transition: { type: "spring" as const, damping: 28, stiffness: 300 },
      };

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-[110]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={fadeTransition}
          data-testid="teacher-my-hours-adjust-sidebar"
        >
          <div
            className="absolute inset-0"
            style={{ backgroundColor: "rgba(0,0,0,0.45)" }}
            onClick={onClose}
            aria-hidden="true"
          />
          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            className="absolute inset-y-0 right-0 z-[15] flex w-[min(100%,28rem)] max-w-full flex-col overflow-hidden border-l"
            style={{
              backgroundColor: theme.white,
              borderColor: theme.line,
              boxShadow: theme.shadowCard,
            }}
            onClick={(event) => event.stopPropagation()}
            {...panelMotion}
          >
            <div
              className="flex items-start justify-between gap-3 border-b px-5 py-4"
              style={{ borderColor: theme.line }}
            >
              <div className="flex min-w-0 items-center gap-2.5">
                <div
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
                  style={{ backgroundColor: theme.primarySoft }}
                >
                  <Clock className="h-4 w-4" style={{ color: theme.primary }} aria-hidden />
                </div>
                <div className="min-w-0">
                  <h2 id={titleId} className="text-sm font-semibold" style={{ color: theme.ink }}>
                    {title}
                  </h2>
                  <p className="mt-0.5 truncate text-sm" style={{ color: theme.muted }}>
                    {dateLabel}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="border-0 bg-transparent p-0"
              >
                <X className="h-5 w-5" style={{ color: theme.muted }} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-4">
              <div className="flex flex-col gap-3">
                {openSessionLabel ? (
                  <div
                    className="rounded-lg border px-3 py-3"
                    style={{
                      borderColor: MY_HOURS_CALENDAR_LINE,
                      backgroundColor: "#F7FAF7",
                    }}
                  >
                    <p
                      className="text-[11px] font-bold uppercase tracking-wider"
                      style={{ color: theme.muted }}
                    >
                      Open session
                    </p>
                    <p className="mt-1 text-sm" style={{ color: theme.ink }}>
                      Started at {openSessionLabel} · In progress
                    </p>
                    <p className="mt-1 text-sm" style={{ color: theme.muted }}>
                      Clock out before changing this open session.
                    </p>
                  </div>
                ) : null}

                <AnimatePresence initial={false}>
                  {sessions.map((session, sessionIndex) => {
                    const duration = sessionDurationCopy(session.clockIn, session.clockOut);
                    const durationKey = duration.invalid
                      ? `invalid-${session.key}-${duration.text}`
                      : `${session.key}-${session.clockIn}-${session.clockOut}`;
                    return (
                      <motion.div
                        key={session.key}
                        className="rounded-lg border px-3 py-3"
                        style={{
                          borderColor: MY_HOURS_CALENDAR_LINE,
                          backgroundColor: theme.white,
                        }}
                        {...rowMotion}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="shrink-0">
                            <p
                              className="text-[11px] font-bold uppercase tracking-wider"
                              style={{ color: theme.muted }}
                            >
                              Session {sessionIndex + 1}
                            </p>
                            {sessions.length > 1 ? (
                              <button
                                type="button"
                                className="mt-1 text-xs font-semibold"
                                style={{ color: theme.muted }}
                                onClick={() => onRemoveSession(session.key)}
                              >
                                Remove
                              </button>
                            ) : null}
                          </div>
                          <AnimatePresence mode="wait" initial={false}>
                            {duration.invalid ? null : (
                              <motion.span
                                key={durationKey}
                                className="inline-flex shrink-0 items-center rounded-full px-2.5 py-1 text-xs font-bold tabular-nums"
                                style={{
                                  backgroundColor: theme.primarySoft,
                                  color: theme.primary,
                                }}
                                {...fadeUp}
                              >
                                {duration.text}
                              </motion.span>
                            )}
                          </AnimatePresence>
                        </div>
                        {session.originalLabel ? (
                          <p className="mt-1 text-xs" style={{ color: theme.muted }}>
                            {session.originalLabel}
                          </p>
                        ) : null}
                        <div className="mt-3 grid grid-cols-1 gap-3">
                          <div>
                            <p
                              className="mb-1.5 text-[11px] font-bold uppercase tracking-wider"
                              style={{ color: theme.muted }}
                            >
                              Clock in
                            </p>
                            <PopupTimePicker
                              theme={theme}
                              value={session.clockIn}
                              onChange={(value) =>
                                onUpdateSession(session.key, "clockIn", value)
                              }
                              ariaLabel="Clock in"
                              className="rounded-lg"
                            />
                          </div>
                          <div>
                            <p
                              className="mb-1.5 text-[11px] font-bold uppercase tracking-wider"
                              style={{ color: theme.muted }}
                            >
                              Clock out
                            </p>
                            <PopupTimePicker
                              theme={theme}
                              value={session.clockOut}
                              onChange={(value) =>
                                onUpdateSession(session.key, "clockOut", value)
                              }
                              ariaLabel="Clock out"
                              className="rounded-lg"
                            />
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>

                <ParentButton
                  theme={theme}
                  variant="outline"
                  className="inline-flex w-full items-center justify-center"
                  onClick={onAddSession}
                >
                  Add another session
                </ParentButton>

                <label className="block text-sm" htmlFor="teacher-my-hours-adjust-note">
                  <span
                    className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider"
                    style={{ color: theme.muted }}
                  >
                    Note
                  </span>
                  <textarea
                    id="teacher-my-hours-adjust-note"
                    rows={3}
                    value={note}
                    placeholder="Optional — why you're changing this day"
                    onChange={(event) => onNoteChange(event.target.value)}
                    className="w-full resize-y rounded-lg border px-3 py-2.5 text-sm outline-none"
                    style={{
                      borderColor: theme.line,
                      backgroundColor: theme.white,
                      color: theme.ink,
                    }}
                  />
                </label>

                <AnimatePresence initial={false}>
                  {showError ? (
                    <motion.p
                      key="adjust-error"
                      className="text-sm"
                      style={{ color: theme.alert }}
                      {...fadeUp}
                    >
                      Check the times above before saving.
                    </motion.p>
                  ) : null}
                </AnimatePresence>
              </div>
            </div>

            <div
              className="flex flex-col gap-2 border-t px-5 py-4 sm:flex-row sm:justify-end"
              style={{ borderColor: theme.line }}
            >
              <ParentButton
                theme={theme}
                variant="outline"
                className="inline-flex w-full items-center justify-center sm:w-auto"
                onClick={onClose}
              >
                Cancel
              </ParentButton>
              <ParentButton
                theme={theme}
                variant="primary"
                disabled={previewMode || saving}
                aria-busy={saving || undefined}
                className="inline-flex w-full items-center justify-center gap-2 sm:w-auto"
                onClick={onSave}
                data-testid="teacher-my-hours-adjust-save"
              >
                <ButtonLoadingLabel loading={saving} loadingLabel="Saving…">
                  {saveLabel ?? (mode === "adjust" ? "Save changes" : "Save")}
                </ButtonLoadingLabel>
              </ParentButton>
            </div>
          </motion.aside>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
