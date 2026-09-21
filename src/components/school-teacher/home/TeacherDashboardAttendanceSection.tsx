"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import SchoolAdminStoryShell, {
  useSchoolAdminStoryTheme,
} from "@/components/school-admin/SchoolAdminStoryShell";
import {
  AttendanceApiProvider,
  useAttendanceApiBasePath,
  useAttendancePreviewMode,
} from "@/components/school-admin/attendance/AttendanceApiContext";
import AttendancePickupSheet from "@/components/school-admin/attendance/AttendancePickupSheet";
import AttendanceStudentDetailSheet from "@/components/school-admin/attendance/AttendanceStudentDetailSheet";
import ParentButtonLink from "@/components/school-parent/ui/ParentButtonLink";
import ParentTextLink from "@/components/school-parent/ui/ParentTextLink";
import TeacherDashboardAttendanceStudentCard from "@/components/school-teacher/home/TeacherDashboardAttendanceStudentCard";
import { adminToast, formatActionError } from "@/lib/school-admin/admin-toast";
import {
  buildAttendanceHref,
  formatAttendanceDateLabel,
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
import { formatTeacherDashboardAttendanceSubcopy } from "@/lib/school-teacher/teacher-dashboard-attendance";
import { reportPortalOperationalError } from "@/lib/portal-operational-errors";
import type { OrganizationBranding } from "@/lib/organization-settings/types";

type TeacherDashboardAttendanceSectionProps = {
  organizationId: string;
  branding: OrganizationBranding;
  date: string;
  students: AttendanceRosterStudent[];
  summary: AttendanceRosterSummary;
  attendanceHref: string;
  previewMode?: boolean;
  onSummaryChange?: (summary: AttendanceRosterSummary) => void;
};

function TeacherDashboardAttendanceSectionContent({
  organizationId,
  date,
  students: initialStudents,
  summary: initialSummary,
  attendanceHref,
  previewMode = false,
  onSummaryChange,
}: Omit<TeacherDashboardAttendanceSectionProps, "branding">) {
  const apiBasePath = useAttendanceApiBasePath();
  const contextPreviewMode = useAttendancePreviewMode();
  const readOnly = previewMode || contextPreviewMode;
  const { theme, C } = useSchoolAdminStoryTheme();

  const [activeDate, setActiveDate] = useState(() => parseDateKey(date) ?? new Date());
  const [students, setStudents] = useState(initialStudents);
  const [summary, setSummary] = useState(initialSummary);
  const [loading, setLoading] = useState(false);
  const [savingStudentId, setSavingStudentId] = useState<string | null>(null);
  const [detailStudent, setDetailStudent] = useState<AttendanceRosterStudent | null>(null);
  const [pickupStudent, setPickupStudent] = useState<AttendanceRosterStudent | null>(null);

  const activeDateKey = useMemo(() => toDateKey(activeDate), [activeDate]);
  const viewingToday = isToday(activeDate);
  const fullAttendanceHref = buildAttendanceHref(attendanceHref, activeDateKey);

  useEffect(() => {
    const nextDate = parseDateKey(date);
    if (!nextDate) return;
    setActiveDate(nextDate);
    setStudents(initialStudents);
    setSummary(initialSummary);
  }, [date, initialStudents, initialSummary]);

  useEffect(() => {
    if (!detailStudent?.id) return;
    const refreshed = students.find((student) => student.id === detailStudent.id);
    if (!refreshed) return;

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
  }, [detailStudent?.id, students]);

  const loadRoster = useCallback(
    async (dateKey: string) => {
      setLoading(true);
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
        setStudents(roster.students);
        setSummary(roster.summary);

        if (isToday(parseDateKey(dateKey) ?? new Date())) {
          onSummaryChange?.(roster.summary);
        }

        return roster;
      } catch (err) {
        const message = formatActionError(err, "Failed to load attendance roster.");
        void reportPortalOperationalError(
          "teacher_portal",
          {
            organizationId,
            operation: "attendance.load_roster",
            error: message,
          },
          message,
        );
        adminToast.error(message);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [apiBasePath, onSummaryChange, organizationId],
  );

  useEffect(() => {
    if (activeDateKey === date) return;
    void loadRoster(activeDateKey);
  }, [activeDateKey, date, loadRoster]);

  const refreshRoster = useCallback(async () => {
    return loadRoster(activeDateKey);
  }, [activeDateKey, loadRoster]);

  const saveAttendanceAction = useCallback(
    async (
      student: AttendanceRosterStudent,
      action: AttendanceAction,
      pickupSelection?: AttendancePickupSelection,
    ) => {
      if (readOnly) return;

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

        await refreshRoster();

        if (action === "pickup") {
          setPickupStudent(null);
        }

        adminToast.success(
          action === "present"
            ? `${formatEnrolledStudentName(student)} marked present.`
            : action === "absent"
              ? `${formatEnrolledStudentName(student)} marked absent.`
              : `Pickup recorded for ${formatEnrolledStudentName(student)}.`,
        );
      } catch (err) {
        const message = formatActionError(err, "Failed to save attendance.");
        void reportPortalOperationalError(
          "teacher_portal",
          {
            organizationId,
            operation: "attendance.save_record",
            error: message,
          },
          message,
        );
        adminToast.error(message);
      } finally {
        setSavingStudentId(null);
      }
    },
    [activeDateKey, apiBasePath, organizationId, readOnly, refreshRoster],
  );

  const subcopy = formatTeacherDashboardAttendanceSubcopy(summary);
  const hasStudents = students.length > 0;
  const sectionTitle = viewingToday ? "Today's attendance" : "Attendance";

  return (
    <>
      <section>
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h3
            className="m-0 font-heading text-2xl font-semibold tracking-[-0.03em]"
            style={{ color: theme.ink, fontFamily: theme.fontDisplay }}
          >
            {sectionTitle}
          </h3>
          <ParentButtonLink
            theme={theme}
            href={fullAttendanceHref}
            variant="soft"
            showArrow
            fullWidth={false}
            className="shrink-0"
          >
            {readOnly ? "Preview attendance" : "View attendance"}
          </ParentButtonLink>
        </div>

        <div
          className="mb-4 rounded-xl border px-3 py-2.5 sm:px-4"
          style={{ borderColor: "#EDF1ED", backgroundColor: C.elevated }}
        >
          <div className="flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => setActiveDate((current) => shiftDate(current, -1))}
              className="rounded-lg p-1.5 transition-colors hover:bg-black/[0.04]"
              aria-label="Previous day"
              disabled={loading}
            >
              <ChevronLeft className="h-4 w-4" style={{ color: C.textSecondary }} />
            </button>
            <div className="min-w-0 flex-1 text-center">
              <p className="truncate text-sm font-bold" style={{ color: C.textPrimary }}>
                {formatAttendanceDateLabel(activeDate)}
              </p>
              <p className="mt-0.5 text-[11px]" style={{ color: C.textTertiary }}>
                {subcopy}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setActiveDate((current) => shiftDate(current, 1))}
              className="rounded-lg p-1.5 transition-colors hover:bg-black/[0.04]"
              aria-label="Next day"
              disabled={loading}
            >
              <ChevronRight className="h-4 w-4" style={{ color: C.textSecondary }} />
            </button>
          </div>

          {!viewingToday ? (
            <div className="mt-1 text-center">
              <button
                type="button"
                onClick={() => setActiveDate(new Date())}
                className="text-[11px] font-semibold underline-offset-2 hover:underline"
                style={{ color: C.accent }}
              >
                Jump to today
              </button>
            </div>
          ) : null}
        </div>

        {loading ? (
          <div
            className="flex items-center justify-center gap-2 py-10 text-sm"
            style={{ color: theme.muted }}
          >
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            Loading attendance…
          </div>
        ) : hasStudents ? (
          <>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {students.map((student, index) => (
                <TeacherDashboardAttendanceStudentCard
                  key={student.id}
                  student={student}
                  theme={theme}
                  index={index}
                  saving={savingStudentId === student.id}
                  previewMode={readOnly}
                  onOpenDetails={() => setDetailStudent(student)}
                  onMarkPresent={() => void saveAttendanceAction(student, "present")}
                  onRecordPickup={() => setPickupStudent(student)}
                />
              ))}
            </div>
            <div className="mt-4">
              <ParentTextLink theme={theme} href={fullAttendanceHref}>
                {readOnly ? "Preview full attendance" : "Open full attendance"}
              </ParentTextLink>
            </div>
          </>
        ) : (
          <p className="text-sm leading-relaxed" style={{ color: theme.muted }}>
            No students have Attendance enabled for their program yet.
          </p>
        )}
      </section>

      <AttendanceStudentDetailSheet
        open={detailStudent != null}
        student={detailStudent}
        organizationId={organizationId}
        rosterDate={activeDateKey}
        theme={theme}
        C={C}
        saving={detailStudent ? savingStudentId === detailStudent.id : false}
        onClose={() => setDetailStudent(null)}
        onMarkPresent={() => {
          if (detailStudent) void saveAttendanceAction(detailStudent, "present");
        }}
        onMarkAbsent={() => {
          if (detailStudent) void saveAttendanceAction(detailStudent, "absent");
        }}
        onRecordPickup={() => {
          if (detailStudent) setPickupStudent(detailStudent);
        }}
      />

      <AttendancePickupSheet
        open={pickupStudent != null}
        student={pickupStudent}
        organizationId={organizationId}
        theme={theme}
        C={C}
        saving={pickupStudent ? savingStudentId === pickupStudent.id : false}
        onClose={() => setPickupStudent(null)}
        onConfirm={(selection) => {
          if (pickupStudent) {
            void saveAttendanceAction(pickupStudent, "pickup", selection);
          }
        }}
      />
    </>
  );
}

export default function TeacherDashboardAttendanceSection({
  organizationId,
  branding,
  date,
  students,
  summary,
  attendanceHref,
  previewMode = false,
  onSummaryChange,
}: TeacherDashboardAttendanceSectionProps) {
  return (
    <SchoolAdminStoryShell branding={branding}>
      <AttendanceApiProvider
        apiBasePath="/api/teacher-portal/attendance"
        previewMode={previewMode}
      >
        <TeacherDashboardAttendanceSectionContent
          organizationId={organizationId}
          date={date}
          students={students}
          summary={summary}
          attendanceHref={attendanceHref}
          previewMode={previewMode}
          onSummaryChange={onSummaryChange}
        />
      </AttendanceApiProvider>
    </SchoolAdminStoryShell>
  );
}
