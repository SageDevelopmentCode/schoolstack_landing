"use client";

import { ChevronRight } from "lucide-react";
import StudentPhoto from "@/components/students/StudentPhoto";
import AdminButton from "@/components/school-admin/ui/story/AdminButton";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";
import { formatEnrolledStudentName } from "@/lib/school-admin/enrolled-students";
import type { AttendanceRosterStudent } from "@/lib/school-admin/attendance/attendance-types";
import AttendanceActionLabel, {
  attendancePrimaryActionType,
} from "./AttendanceActionLabel";
import AttendanceStatusBadge from "./AttendanceStatusBadge";

type AttendanceStudentRowProps = {
  student: AttendanceRosterStudent;
  theme: ParentThemeTokens;
  C: AdminThemeTokens;
  saving?: boolean;
  previewMode?: boolean;
  selected?: boolean;
  onRowClick: () => void;
  onMarkPresent: () => void;
  onRecordPickup: () => void;
};

const CELL_BORDER = "#EDF1ED";

export default function AttendanceStudentRow({
  student,
  theme,
  C,
  saving = false,
  previewMode = false,
  selected = false,
  onRowClick,
  onMarkPresent,
  onRecordPickup,
}: AttendanceStudentRowProps) {
  const studentName = formatEnrolledStudentName(student);
  const programLabel = student.programNames.join(" · ") || "—";

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

  const pickupLabel =
    student.attendanceStatus === "picked_up" && student.pickedUpByName
      ? student.pickedUpByName
      : "—";

  return (
    <tr
      role="button"
      tabIndex={0}
      onClick={onRowClick}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onRowClick();
        }
      }}
      className="cursor-pointer transition-colors hover:bg-[#F8FCF8]"
      style={{
        backgroundColor: selected ? C.accentGlow : undefined,
      }}
    >
      <td
        className="border-t px-[17px] py-[13px] align-top"
        style={{ borderColor: CELL_BORDER }}
      >
        <div className="flex items-center gap-2.5">
          <StudentPhoto
            name={studentName}
            photoUrl={student.profilePhotoUrl}
            size="sm"
            shape="circle"
            accentColor={C.accent}
            accentGlowColor={C.accentLight}
          />
          <div className="min-w-0">
            <b className="block text-xs" style={{ color: C.textPrimary }}>
              {studentName}
            </b>
            {student.grade ? (
              <span className="mt-0.5 block text-[11px]" style={{ color: C.textTertiary }}>
                {student.grade}
              </span>
            ) : null}
          </div>
        </div>
      </td>
      <td
        className="border-t px-[17px] py-[13px] align-top"
        style={{ borderColor: CELL_BORDER }}
      >
        <span className="block max-w-[220px] truncate text-xs" style={{ color: C.textSecondary }}>
          {programLabel}
        </span>
      </td>
      <td
        className="border-t px-[17px] py-[13px] align-top"
        style={{ borderColor: CELL_BORDER }}
      >
        <AttendanceStatusBadge status={student.attendanceStatus} />
      </td>
      <td
        className="border-t px-[17px] py-[13px] align-top"
        style={{ borderColor: CELL_BORDER }}
      >
        <span className="block max-w-[180px] truncate text-xs" style={{ color: C.textSecondary }}>
          {pickupLabel}
        </span>
      </td>
      <td
        className="border-t px-[17px] py-[13px] align-top"
        style={{ borderColor: CELL_BORDER }}
        onClick={(event) => event.stopPropagation()}
        onKeyDown={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-end gap-1">
          {previewMode ? null : (
            <AdminButton
              theme={theme}
              variant={primaryAction.variant}
              size="compact"
              type="button"
              disabled={primaryAction.disabled}
              onClick={primaryAction.onClick}
              className="inline-flex items-center gap-1.5"
            >
              <AttendanceActionLabel action={primaryActionType} />
            </AdminButton>
          )}
          <ChevronRight className="h-3.5 w-3.5 shrink-0" style={{ color: C.textTertiary }} />
        </div>
      </td>
    </tr>
  );
}
