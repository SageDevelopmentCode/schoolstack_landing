"use client";

import { useEffect, useState } from "react";
import StudentPhoto from "@/components/students/StudentPhoto";
import SchoolAdminSlideOverShell from "@/components/school-admin/ui/SchoolAdminSlideOverShell";
import AdminButton from "@/components/school-admin/ui/story/AdminButton";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";
import { formatEnrolledStudentName } from "@/lib/school-admin/enrolled-students";
import { formatAttendanceHistoryTime } from "@/lib/school-admin/attendance/attendance-history";
import type {
  AttendanceHistoryEntry,
  AttendanceRosterStudent,
} from "@/lib/school-admin/attendance/attendance-types";
import AttendanceActionLabel from "./AttendanceActionLabel";
import AttendanceHistoryList from "./AttendanceHistoryList";
import AttendanceHistoryModal from "./AttendanceHistoryModal";
import AttendanceStatusBadge from "./AttendanceStatusBadge";
import {
  useAttendanceApiBasePath,
  useAttendancePreviewMode,
} from "./AttendanceApiContext";

const PREVIEW_LIMIT = 5;

type AttendanceStudentDetailSheetProps = {
  open: boolean;
  student: AttendanceRosterStudent | null;
  organizationId: string;
  rosterDate: string;
  theme: ParentThemeTokens;
  C: AdminThemeTokens;
  saving?: boolean;
  onClose: () => void;
  onMarkPresent: () => void;
  onMarkAbsent: () => void;
  onRecordPickup: () => void;
};

function formatRosterDateLabel(dateKey: string): string {
  const [year, month, day] = dateKey.split("-").map(Number);
  if (!year || !month || !day) return dateKey;

  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  });
}

function todayStatusDetail(student: AttendanceRosterStudent): string | null {
  if (student.attendanceStatus === "present") {
    const time = formatAttendanceHistoryTime(student.presentAt);
    return time ? `Marked present at ${time}` : "Marked present";
  }

  if (student.attendanceStatus === "absent") {
    const time = formatAttendanceHistoryTime(student.absentAt);
    return time ? `Marked absent at ${time}` : "Marked absent";
  }

  if (student.attendanceStatus === "picked_up") {
    const time = formatAttendanceHistoryTime(student.pickedUpAt);
    const pickupName = student.pickedUpByName ? ` by ${student.pickedUpByName}` : "";
    return time ? `Picked up at ${time}${pickupName}` : `Picked up${pickupName}`;
  }

  return "No attendance recorded yet for this day.";
}

export default function AttendanceStudentDetailSheet({
  open,
  student,
  organizationId,
  rosterDate,
  theme,
  C,
  saving = false,
  onClose,
  onMarkPresent,
  onMarkAbsent,
  onRecordPickup,
}: AttendanceStudentDetailSheetProps) {
  const apiBasePath = useAttendanceApiBasePath();
  const previewMode = useAttendancePreviewMode();
  const [history, setHistory] = useState<AttendanceHistoryEntry[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState<string | null>(null);
  const [historyModalOpen, setHistoryModalOpen] = useState(false);

  useEffect(() => {
    if (!open || !student) return;

    let cancelled = false;
    queueMicrotask(() => {
      setHistoryLoading(true);
      setHistoryError(null);
    });

    void (async () => {
      try {
        const response = await fetch(
          `${apiBasePath}/history?organizationId=${encodeURIComponent(organizationId)}&studentId=${encodeURIComponent(student.id)}&limit=${PREVIEW_LIMIT}&offset=0`,
        );
        const payload = (await response.json().catch(() => null)) as {
          entries?: AttendanceHistoryEntry[];
          totalCount?: number;
          error?: string;
        } | null;

        if (!response.ok) {
          throw new Error(payload?.error ?? "Failed to load attendance history.");
        }

        if (!cancelled) {
          setHistory(payload?.entries ?? []);
          setTotalCount(payload?.totalCount ?? 0);
        }
      } catch (err) {
        if (!cancelled) {
          setHistoryError(err instanceof Error ? err.message : "Failed to load attendance history.");
          setHistory([]);
          setTotalCount(0);
        }
      } finally {
        if (!cancelled) {
          setHistoryLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [apiBasePath, open, organizationId, student]);

  useEffect(() => {
    if (!open) {
      queueMicrotask(() => {
        setHistoryModalOpen(false);
      });
    }
  }, [open]);

  if (!student) return null;

  const studentName = formatEnrolledStudentName(student);
  const todayDetail = todayStatusDetail(student);

  const footerButtons = (() => {
    switch (student.attendanceStatus) {
      case "not_marked":
        return (
          <>
            <AdminButton
              theme={theme}
              variant="primary"
              type="button"
              disabled={saving}
              onClick={onMarkPresent}
              className="inline-flex w-full items-center justify-center gap-1.5 sm:w-auto"
            >
              <AttendanceActionLabel action="mark_present" />
            </AdminButton>
            <AdminButton
              theme={theme}
              variant="danger"
              type="button"
              disabled={saving}
              onClick={onMarkAbsent}
              className="inline-flex w-full items-center justify-center gap-1.5 sm:w-auto"
            >
              <AttendanceActionLabel action="mark_absent" />
            </AdminButton>
          </>
        );
      case "present":
        return (
          <>
            <AdminButton
              theme={theme}
              variant="primary"
              type="button"
              disabled={saving}
              onClick={onRecordPickup}
              className="inline-flex w-full items-center justify-center gap-1.5 sm:w-auto"
            >
              <AttendanceActionLabel action="record_pickup" />
            </AdminButton>
            <AdminButton
              theme={theme}
              variant="danger"
              type="button"
              disabled={saving}
              onClick={onMarkAbsent}
              className="inline-flex w-full items-center justify-center gap-1.5 sm:w-auto"
            >
              <AttendanceActionLabel action="mark_absent" />
            </AdminButton>
          </>
        );
      case "absent":
        return (
          <AdminButton
            theme={theme}
            variant="primary"
            type="button"
            disabled={saving}
            onClick={onMarkPresent}
            className="inline-flex w-full items-center justify-center gap-1.5 sm:w-auto"
          >
            <AttendanceActionLabel action="mark_present" />
          </AdminButton>
        );
      case "picked_up":
        return (
          <AdminButton
            theme={theme}
            variant="soft"
            type="button"
            disabled={saving}
            onClick={onMarkPresent}
            className="inline-flex w-full items-center justify-center gap-1.5 sm:w-auto"
          >
            <AttendanceActionLabel action="mark_present_again" />
          </AdminButton>
        );
      default:
        return null;
    }
  })();

  return (
    <>
      <SchoolAdminSlideOverShell
        open={open}
        onClose={onClose}
        title={studentName}
        subtitle={student.familyName ?? undefined}
        C={C}
        footer={
          previewMode
            ? undefined
            : (
              <div className="flex w-full flex-col gap-2 sm:flex-row sm:flex-wrap sm:justify-end">
                {footerButtons}
              </div>
            )
        }
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <StudentPhoto
              name={studentName}
              photoUrl={student.profilePhotoUrl}
              size="md"
              shape="circle"
              accentColor={C.accent}
              accentGlowColor={C.accentLight}
            />
            <div className="min-w-0">
              <AttendanceStatusBadge status={student.attendanceStatus} />
              {student.grade ? (
                <p className="mt-1 text-sm" style={{ color: C.textSecondary }}>
                  {student.grade}
                </p>
              ) : null}
            </div>
          </div>

          <div
            className="rounded-xl border px-3 py-2.5"
            style={{ borderColor: C.border, backgroundColor: C.elevated }}
          >
            <p
              className="text-[11px] font-semibold uppercase tracking-wide"
              style={{ color: C.textTertiary }}
            >
              {formatRosterDateLabel(rosterDate)}
            </p>
            <p className="mt-1 text-sm" style={{ color: C.textPrimary }}>
              {todayDetail}
            </p>
          </div>

          <div>
            <p
              className="text-[11px] font-semibold uppercase tracking-wide"
              style={{ color: C.textTertiary }}
            >
              Programs
            </p>
            <p className="mt-1 text-sm" style={{ color: C.textPrimary }}>
              {student.programNames.join(" · ") || "—"}
            </p>
          </div>

          {student.classroomNames.length > 0 ? (
            <div>
              <p
                className="text-[11px] font-semibold uppercase tracking-wide"
                style={{ color: C.textTertiary }}
              >
                Classrooms
              </p>
              <p className="mt-1 text-sm" style={{ color: C.textPrimary }}>
                {student.classroomNames.join(" · ")}
              </p>
            </div>
          ) : null}

          <div>
            <div className="flex items-center justify-between gap-2">
              <p
                className="text-[11px] font-semibold uppercase tracking-wide"
                style={{ color: C.textTertiary }}
              >
                Recent attendance
              </p>
              {totalCount > PREVIEW_LIMIT ? (
                <button
                  type="button"
                  onClick={() => setHistoryModalOpen(true)}
                  className="border-0 bg-transparent p-0 text-[11px] font-extrabold"
                  style={{ color: theme.primary, cursor: "pointer" }}
                >
                  View all
                </button>
              ) : null}
            </div>

            {historyError ? (
              <p className="mt-2 text-sm" style={{ color: C.error }}>
                {historyError}
              </p>
            ) : (
              <div className="mt-1">
                <AttendanceHistoryList
                  entries={history}
                  C={C}
                  loading={historyLoading}
                  highlightDate={rosterDate}
                />
              </div>
            )}
          </div>
        </div>
      </SchoolAdminSlideOverShell>

      <AttendanceHistoryModal
        open={historyModalOpen}
        organizationId={organizationId}
        studentId={student.id}
        studentName={studentName}
        theme={theme}
        C={C}
        highlightDate={rosterDate}
        onClose={() => setHistoryModalOpen(false)}
      />
    </>
  );
}
