"use client";

import { useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react";
import StudentPhoto from "@/components/students/StudentPhoto";
import {
  attendanceDayTimeline,
  attendanceRecordedAtTime,
  attendanceRelativeDayLabel,
  attendanceStaffRecorder,
  attendanceStatusLabel,
  attendanceStatusTone,
} from "@/components/school-parent/attendance/attendance-format";
import {
  ATTENDANCE_PANEL_BG,
  AttendanceStatusMark,
} from "@/components/school-parent/attendance/garden/attendance-garden-tones";
import GSidePanel from "@/components/school-parent/garden/GSidePanel";
import { GChip, GKicker, gBtnOutlineSm } from "@/components/school-parent/garden/ui";
import { useParentTheme } from "@/components/school-parent/ParentThemeContext";
import { formatAttendanceHistoryFullDateLabel } from "@/lib/school-admin/attendance/attendance-history";
import type { AttendanceHistoryEntry } from "@/lib/school-admin/attendance/attendance-types";

const PANEL_ID = "parent-attendance-history-detail";

function useIsClient() {
  const [isClient, setIsClient] = useState(false);
  useEffect(() => {
    queueMicrotask(() => setIsClient(true));
  }, []);
  return isClient;
}

/*
 * Day detail drawer: status hero → the day as steps (check-in → pickup, or
 * absent) → recorded at / by / picked up by. Footer steps to the newer or
 * older loaded day (and loads the next page when you reach the end).
 * Portalled to <body> so the per-child motion wrapper's transform can never
 * trap the fixed drawer; GSidePanel brings its own Garden frame.
 */
export default function AttendanceDayDrawer({
  entry,
  entries,
  firstName,
  hasMore,
  loadingMore,
  onClose,
  onNavigate,
  onLoadOlder,
}: {
  entry: AttendanceHistoryEntry | null;
  entries: AttendanceHistoryEntry[];
  firstName: string;
  hasMore: boolean;
  loadingMore: boolean;
  onClose: () => void;
  onNavigate: (entry: AttendanceHistoryEntry) => void;
  onLoadOlder: () => void;
}) {
  const { theme, adminCompat } = useParentTheme();
  const index = entry ? entries.findIndex((item) => item.date === entry.date) : -1;
  const newer = index > 0 ? entries[index - 1] : null;
  const older = index >= 0 && index < entries.length - 1 ? entries[index + 1] : null;
  const canLoadOlder = !older && hasMore;
  const isClient = useIsClient();
  if (!isClient) return null;

  return createPortal(
    <GSidePanel
      theme={theme}
      open={entry !== null}
      onClose={onClose}
      panelId={PANEL_ID}
      testId="parent-attendance-history-detail-sidebar"
      closeLabel="Close attendance details"
      kicker={`${firstName}'s attendance`}
      title={entry ? formatAttendanceHistoryFullDateLabel(entry.date) : ""}
      headerAside={
        entry ? (
          <GChip tone={attendanceStatusTone(entry.status)}>{attendanceStatusLabel(entry.status)}</GChip>
        ) : null
      }
      footer={
        entry ? (
          <div className="flex w-full items-center justify-between gap-2.5">
            <button
              type="button"
              className={gBtnOutlineSm}
              onClick={() => newer && onNavigate(newer)}
              disabled={!newer}
              data-testid="parent-attendance-detail-newer"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Newer day
            </button>
            <span className="hidden text-[12px] font-bold text-[var(--sf-soft)] sm:inline" aria-live="polite">
              {index >= 0 ? `Day ${index + 1} of ${entries.length}${hasMore ? "+" : ""}` : ""}
            </span>
            <button
              type="button"
              className={gBtnOutlineSm}
              onClick={() => {
                if (older) onNavigate(older);
                else if (canLoadOlder) onLoadOlder();
              }}
              disabled={(!older && !canLoadOlder) || loadingMore}
              aria-busy={loadingMore || undefined}
              data-testid="parent-attendance-detail-older"
            >
              {loadingMore ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> Loading…
                </>
              ) : (
                <>
                  {canLoadOlder ? "Load older day" : "Older day"}
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </>
              )}
            </button>
          </div>
        ) : null
      }
    >
      {entry ? <DayBody entry={entry} firstName={firstName} accent={adminCompat} /> : null}
    </GSidePanel>,
    document.body,
  );
}

function DayBody({
  entry,
  firstName,
  accent,
}: {
  entry: AttendanceHistoryEntry;
  firstName: string;
  accent: { accent: string; accentLight: string };
}) {
  const steps = attendanceDayTimeline(entry);
  const recordedTime = attendanceRecordedAtTime(entry);
  const recorder = attendanceStaffRecorder(entry);
  const relative = attendanceRelativeDayLabel(entry.date);
  const label = attendanceStatusLabel(entry.status);

  const summary =
    entry.status === "absent"
      ? `${firstName} was marked absent${relative === "Today" ? " today" : ""}.`
      : entry.status === "picked_up"
        ? entry.pickedUpByName
          ? `${firstName} was picked up by ${entry.pickedUpByName}.`
          : `${firstName} was picked up.`
        : `${firstName} was checked in${relative === "Today" ? " today" : ""}.`;

  return (
    <>
      <div className={`flex items-center gap-3.5 rounded-[18px] p-4 ${ATTENDANCE_PANEL_BG[entry.status]}`}>
        <AttendanceStatusMark status={entry.status} size="lg" />
        <div className="min-w-0">
          <p className="sf-display m-0 text-[1.6rem] leading-none text-[var(--sf-ink)]">{label}</p>
          <p className="m-0 mt-1 text-[13px] font-semibold text-[var(--sf-ink)]/75">{summary}</p>
        </div>
      </div>

      {steps.length > 0 ? (
        <section aria-labelledby={`${PANEL_ID}-timeline`} className="rounded-[18px] border-[1.5px] border-[var(--sf-ink)]/10 bg-white p-4">
          <GKicker>
            <span id={`${PANEL_ID}-timeline`}>The day</span>
          </GKicker>
          <ol className="m-0 mt-3 flex list-none flex-col p-0">
            {steps.map((step, index) => {
              const last = index === steps.length - 1;
              return (
                <li key={step.key} className="relative flex gap-3 pb-4 last:pb-0">
                  {!last ? (
                    <span
                      aria-hidden="true"
                      className="absolute left-[13px] top-7 h-[calc(100%-1.5rem)] w-[2px] rounded-full bg-[var(--sf-ink)]/15"
                    />
                  ) : null}
                  <AttendanceStatusMark
                    status={step.key === "absent" ? "absent" : step.key === "picked_up" ? "picked_up" : "present"}
                    size="sm"
                  />
                  <div className="min-w-0 pt-0.5">
                    <h3 className="m-0 text-[15px] font-extrabold leading-tight text-[var(--sf-ink)]">
                      {step.label}
                      {step.time ? (
                        <span className="font-bold text-[var(--sf-soft)]"> · {step.time}</span>
                      ) : null}
                    </h3>
                    {step.detail ? (
                      <p className="m-0 mt-0.5 text-[13px] font-semibold text-[var(--sf-soft)]">{step.detail}</p>
                    ) : null}
                  </div>
                </li>
              );
            })}
          </ol>
        </section>
      ) : null}

      <dl className="m-0 rounded-[18px] border-[1.5px] border-[var(--sf-ink)]/10 bg-white px-4">
        <DetailRow label="Recorded at">{recordedTime ?? "—"}</DetailRow>
        {recorder ? (
          <DetailRow label="Recorded by">
            <span className="flex items-center gap-2.5">
              <StudentPhoto
                name={recorder.name}
                photoUrl={recorder.photoUrl}
                size="sm"
                shape="circle"
                accentColor={accent.accent}
                accentGlowColor={accent.accentLight}
              />
              <span>{recorder.name}</span>
            </span>
          </DetailRow>
        ) : null}
        {entry.status === "picked_up" && entry.pickedUpByName ? (
          <DetailRow label="Picked up by">
            <span className="flex items-center gap-2.5">
              <StudentPhoto
                name={entry.pickedUpByName}
                photoUrl={null}
                size="sm"
                shape="circle"
                accentColor={accent.accent}
                accentGlowColor={accent.accentLight}
              />
              <span>{entry.pickedUpByName}</span>
            </span>
          </DetailRow>
        ) : null}
      </dl>

      <p className="m-0 text-[12px] font-semibold leading-snug text-[var(--sf-soft)]">
        Times are recorded by school staff. If anything here looks wrong, contact the school office.
      </p>
    </>
  );
}

function DetailRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="border-t border-dashed border-[var(--sf-ink)]/12 py-3 first:border-t-0">
      <dt className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-[var(--sf-soft)]">{label}</dt>
      <dd className="m-0 mt-1 text-[15px] font-bold text-[var(--sf-ink)]">{children}</dd>
    </div>
  );
}
