"use client";

import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { useSchoolAdminStoryTheme } from "@/components/school-admin/SchoolAdminStoryShell";
import AttendancePickupSheet from "@/components/school-admin/attendance/AttendancePickupSheet";
import AttendanceStudentDetailSheet from "@/components/school-admin/attendance/AttendanceStudentDetailSheet";
import ParentButtonLink from "@/components/school-parent/ui/ParentButtonLink";
import ParentTextLink from "@/components/school-parent/ui/ParentTextLink";
import TeacherDashboardAttendanceStudentCard from "@/components/school-teacher/home/TeacherDashboardAttendanceStudentCard";
import { useDashboardAttendanceModel } from "@/components/school-admin/attendance/useDashboardAttendanceModel";
import { formatAttendanceDateLabel } from "@/lib/school-admin/attendance/attendance-date-utils";
import type {
  AttendanceRosterStudent,
  AttendanceRosterSummary,
} from "@/lib/school-admin/attendance/attendance-types";
import type { PortalOperationalSurface } from "@/lib/portal-operational-errors";

export type DashboardAttendanceSectionContentProps = {
  organizationId: string;
  date: string;
  students: AttendanceRosterStudent[];
  summary: AttendanceRosterSummary;
  attendanceHref: string;
  gridClassName?: string;
  previewMode?: boolean;
  operationalErrorSurface?: PortalOperationalSurface;
  onSummaryChange?: (summary: AttendanceRosterSummary) => void;
};

export function DashboardAttendanceSectionContent({
  organizationId,
  date,
  students: initialStudents,
  summary: initialSummary,
  attendanceHref,
  gridClassName = "grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3",
  previewMode = false,
  operationalErrorSurface = "teacher_portal",
  onSummaryChange,
}: DashboardAttendanceSectionContentProps) {
  const { theme, C } = useSchoolAdminStoryTheme();
  const {
    readOnly,
    activeDate,
    activeDateKey,
    viewingToday,
    fullAttendanceHref,
    students,
    subcopy,
    loading,
    loadError,
    retryLoad,
    savingStudentId,
    saveAttendanceAction,
    goToPreviousDay,
    goToNextDay,
    jumpToToday,
    detailStudent,
    setDetailStudent,
    pickupStudent,
    setPickupStudent,
  } = useDashboardAttendanceModel({
    organizationId,
    date,
    students: initialStudents,
    summary: initialSummary,
    attendanceHref,
    previewMode,
    operationalErrorSurface,
    onSummaryChange,
  });

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
              onClick={goToPreviousDay}
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
              onClick={goToNextDay}
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
                onClick={jumpToToday}
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
        ) : loadError ? (
          <div className="flex flex-col items-center gap-2 py-8 text-center text-sm" style={{ color: theme.muted }}>
            <p className="m-0">{loadError}</p>
            <button
              type="button"
              onClick={retryLoad}
              className="font-semibold underline-offset-2 hover:underline"
              style={{ color: C.accent }}
            >
              Try again
            </button>
          </div>
        ) : hasStudents ? (
          <>
            <div className={gridClassName}>
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
