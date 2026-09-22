"use client";

import { useEffect, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CalendarCheck, X } from "lucide-react";
import StudentPhoto from "@/components/students/StudentPhoto";
import ParentChip from "@/components/school-parent/ui/ParentChip";
import type { ParentChipTone } from "@/components/school-parent/ui/ParentChip";
import { useParentTheme } from "@/components/school-parent/ParentThemeContext";
import {
  formatAttendanceHistoryFullDateLabel,
  formatAttendanceHistoryTime,
  resolveAttendanceHistoryActor,
} from "@/lib/school-admin/attendance/attendance-history";
import type { AttendanceHistoryEntry } from "@/lib/school-admin/attendance/attendance-types";

type ParentAttendanceHistoryDetailSidebarProps = {
  open: boolean;
  entry: AttendanceHistoryEntry | null;
  studentName: string;
  onClose: () => void;
};

function statusChipTone(status: AttendanceHistoryEntry["status"]): ParentChipTone {
  if (status === "present") return "success";
  if (status === "absent") return "warning";
  return "info";
}

function statusLabel(status: AttendanceHistoryEntry["status"]): string {
  if (status === "present") return "Present";
  if (status === "absent") return "Absent";
  return "Picked up";
}

function recordedAtTime(entry: AttendanceHistoryEntry): string | null {
  if (entry.status === "present") return formatAttendanceHistoryTime(entry.presentAt);
  if (entry.status === "absent") return formatAttendanceHistoryTime(entry.absentAt);
  return formatAttendanceHistoryTime(entry.pickedUpAt);
}

function DetailRow({
  label,
  children,
  theme,
}: {
  label: string;
  children: ReactNode;
  theme: ReturnType<typeof useParentTheme>["theme"];
}) {
  return (
    <div
      className="border-t py-3"
      style={{ borderColor: theme.line }}
    >
      <div
        className="text-[10px] font-extrabold uppercase tracking-[0.08em]"
        style={{ color: theme.muted }}
      >
        {label}
      </div>
      <div className="mt-1 text-sm" style={{ color: theme.ink }}>
        {children}
      </div>
    </div>
  );
}

export default function ParentAttendanceHistoryDetailSidebar({
  open,
  entry,
  studentName,
  onClose,
}: ParentAttendanceHistoryDetailSidebarProps) {
  const { theme, adminCompat } = useParentTheme();
  const titleId = "parent-attendance-history-detail-title";
  const firstName = studentName.trim().split(/\s+/)[0] ?? studentName;

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!entry) return null;

  const fullDateLabel = formatAttendanceHistoryFullDateLabel(entry.date);
  const recordedTime = recordedAtTime(entry);
  const recorder = resolveAttendanceHistoryActor(entry);
  const staffRecorder =
    entry.status === "picked_up" && entry.recordedByName
      ? { name: entry.recordedByName, photoUrl: entry.recordedByPhotoUrl }
      : entry.status !== "picked_up"
        ? recorder
        : null;

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-[110]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          data-testid="parent-attendance-history-detail-sidebar"
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
            initial={{ x: "100%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "100%", opacity: 0 }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
            className="absolute inset-y-0 right-0 z-[15] flex w-[min(100%,28rem)] max-w-full flex-col overflow-hidden border-l"
            style={{
              backgroundColor: theme.white,
              borderColor: theme.line,
              boxShadow: theme.shadowCard,
            }}
            onClick={(event) => event.stopPropagation()}
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
                  <CalendarCheck className="h-4 w-4" style={{ color: theme.primary }} aria-hidden />
                </div>
                <div className="min-w-0">
                  <h2 id={titleId} className="text-sm font-semibold" style={{ color: theme.ink }}>
                    {fullDateLabel}
                  </h2>
                  <p className="mt-0.5 text-[11px]" style={{ color: theme.muted }}>
                    {firstName}&apos;s attendance
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg p-1.5 transition-colors hover:opacity-80"
                style={{ color: theme.muted }}
                aria-label="Close attendance details"
              >
                <X className="h-4 w-4" aria-hidden />
              </button>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
              <div className="pb-4">
                <ParentChip theme={theme} tone={statusChipTone(entry.status)}>
                  {statusLabel(entry.status)}
                </ParentChip>
              </div>

              <DetailRow label="Recorded at" theme={theme}>
                {recordedTime ?? "—"}
              </DetailRow>

              {staffRecorder ? (
                <DetailRow label="Recorded by" theme={theme}>
                  <div className="flex items-center gap-2.5">
                    <StudentPhoto
                      name={staffRecorder.name}
                      photoUrl={staffRecorder.photoUrl}
                      size="sm"
                      shape="circle"
                      accentColor={adminCompat.accent}
                      accentGlowColor={adminCompat.accentLight}
                    />
                    <span>{staffRecorder.name}</span>
                  </div>
                </DetailRow>
              ) : null}

              {entry.status === "picked_up" && entry.pickedUpByName ? (
                <DetailRow label="Picked up by" theme={theme}>
                  <div className="flex items-center gap-2.5">
                    <StudentPhoto
                      name={entry.pickedUpByName}
                      photoUrl={null}
                      size="sm"
                      shape="circle"
                      accentColor={adminCompat.accent}
                      accentGlowColor={adminCompat.accentLight}
                    />
                    <span>{entry.pickedUpByName}</span>
                  </div>
                </DetailRow>
              ) : null}
            </div>
          </motion.aside>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
