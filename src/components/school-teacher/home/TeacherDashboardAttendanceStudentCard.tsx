"use client";

import { Loader2 } from "lucide-react";
import AttendanceActionLabel, {
  attendancePrimaryActionType,
} from "@/components/school-admin/attendance/AttendanceActionLabel";
import AttendanceStatusBadge from "@/components/school-admin/attendance/AttendanceStatusBadge";
import StudentPhoto from "@/components/students/StudentPhoto";
import ParentButton from "@/components/school-parent/ui/ParentButton";
import ParentCard from "@/components/school-parent/ui/ParentCard";
import {
  formatEnrolledStudentName,
  formatStudentGrade,
} from "@/lib/school-admin/enrolled-students";
import type { AttendanceRosterStudent } from "@/lib/school-admin/attendance/attendance-types";
import {
  childAccentBg,
  parentThemeToAdminCompat,
  type ParentThemeTokens,
} from "@/lib/organization-settings/parent-theme";

type TeacherDashboardAttendanceStudentCardProps = {
  student: AttendanceRosterStudent;
  theme: ParentThemeTokens;
  index: number;
  saving?: boolean;
  previewMode?: boolean;
  onOpenDetails: () => void;
  onMarkPresent: () => void;
  onRecordPickup: () => void;
};

function studentSubtitle(student: AttendanceRosterStudent): string {
  const gradePart = formatStudentGrade(student.grade) ?? "Grade not listed";
  const programPart =
    student.programNames.length > 0 ? student.programNames.join(", ") : null;
  return programPart ? `${gradePart} · ${programPart}` : gradePart;
}

export default function TeacherDashboardAttendanceStudentCard({
  student,
  theme,
  index,
  saving = false,
  previewMode = false,
  onOpenDetails,
  onMarkPresent,
  onRecordPickup,
}: TeacherDashboardAttendanceStudentCardProps) {
  const adminCompat = parentThemeToAdminCompat(theme);
  const studentName = formatEnrolledStudentName(student);
  const studentFirstName = student.firstName.trim() || studentName;
  const accentBg = childAccentBg(index);

  const primaryActionType = attendancePrimaryActionType(student.attendanceStatus);
  const primaryAction =
    student.attendanceStatus === "present"
      ? {
          onClick: onRecordPickup,
          disabled: saving,
          variant: "primary" as const,
        }
      : student.attendanceStatus === "picked_up"
        ? {
            onClick: () => {},
            disabled: true,
            variant: "soft" as const,
          }
        : {
            onClick: onMarkPresent,
            disabled: saving,
            variant: "soft" as const,
          };

  const cardContent = (
    <ParentCard theme={theme} className="relative flex h-full flex-col !p-5">
      <div className="mb-4 flex items-start gap-3">
        <div
          className="shrink-0 overflow-hidden rounded-[18px]"
          style={{ backgroundColor: accentBg }}
        >
          <StudentPhoto
            name={studentName}
            photoUrl={student.profilePhotoUrl}
            size="xl"
            shape="square"
            theme={adminCompat}
          />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h3
              className="m-0 text-base font-semibold"
              style={{ color: theme.ink, fontFamily: theme.fontDisplay }}
            >
              {studentFirstName}
            </h3>
            <AttendanceStatusBadge status={student.attendanceStatus} />
          </div>
          <p className="m-0 mt-1 text-xs leading-relaxed" style={{ color: "#7B878D" }}>
            {studentSubtitle(student)}
          </p>
          {student.pickedUpByName ? (
            <p className="m-0 mt-1 text-xs" style={{ color: theme.muted }}>
              Picked up by {student.pickedUpByName}
            </p>
          ) : null}
        </div>
      </div>

      {!previewMode ? (
        <div className="mt-auto pt-2" onClick={(event) => event.stopPropagation()}>
          <ParentButton
            theme={theme}
            variant={primaryAction.variant}
            disabled={primaryAction.disabled}
            onClick={primaryAction.onClick}
            className="inline-flex w-full items-center justify-center gap-1.5"
          >
            {saving ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
                Saving…
              </>
            ) : (
              <AttendanceActionLabel action={primaryActionType} />
            )}
          </ParentButton>
        </div>
      ) : null}
    </ParentCard>
  );

  if (previewMode) {
    return cardContent;
  }

  return (
    <div
      className="h-full cursor-pointer"
      role="button"
      tabIndex={0}
      onClick={onOpenDetails}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onOpenDetails();
        }
      }}
    >
      {cardContent}
    </div>
  );
}
