"use client";

import { Check, Loader2, Trash2 } from "lucide-react";
import StudentPhoto from "@/components/students/StudentPhoto";
import AdminChip from "@/components/school-admin/ui/story/AdminChip";
import {
  formatEnrolledStudentName,
  formatStudentGrade,
  type AdminEnrolledStudentSummary,
} from "@/lib/school-admin/enrolled-students";
import {
  primaryProgramLabel,
  programBadgeTone,
} from "@/lib/school-admin/classroom-roster-ui";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";

type ClassroomStudentRowProps = {
  student: AdminEnrolledStudentSummary;
  classroomProgramName: string | null;
  theme: ParentThemeTokens;
  C: AdminThemeTokens;
  onRemove?: () => void;
  removing?: boolean;
  selectable?: boolean;
  selected?: boolean;
  onSelect?: () => void;
  disabled?: boolean;
};

function studentSubtitle(student: AdminEnrolledStudentSummary): string {
  const parts: string[] = [];
  const grade = formatStudentGrade(student.grade);
  if (grade) parts.push(grade);
  if (student.assignedTeacherNames) parts.push(student.assignedTeacherNames);
  return parts.join(" · ");
}

export default function ClassroomStudentRow({
  student,
  classroomProgramName,
  theme,
  C,
  onRemove,
  removing = false,
  selectable = false,
  selected = false,
  onSelect,
  disabled = false,
}: ClassroomStudentRowProps) {
  const name = formatEnrolledStudentName(student);
  const subtitle = studentSubtitle(student);
  const programLabel = primaryProgramLabel(student);

  const content = (
    <>
      {selectable ? (
        <span
          className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border"
          style={{
            borderColor: selected ? C.accent : C.border,
            backgroundColor: selected ? C.accent : C.surface,
          }}
        >
          {selected ? <Check className="h-3 w-3" style={{ color: "#fff" }} /> : null}
        </span>
      ) : null}
      <StudentPhoto
        name={name}
        photoUrl={student.profilePhotoUrl}
        size="md"
        shape="circle"
        accentColor={C.accent}
        accentGlowColor={C.accentLight}
        healthIndicator={student.hasStandingHealthItems}
        healthIndicatorColor={C.error}
      />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="truncate text-sm font-semibold" style={{ color: theme.ink }}>
            {name}
          </span>
          <AdminChip
            theme={theme}
            tone={programBadgeTone(student, classroomProgramName)}
            className="max-w-[10rem] truncate"
          >
            {programLabel}
          </AdminChip>
        </div>
        {subtitle ? (
          <div className="mt-0.5 truncate text-[11px]" style={{ color: theme.muted }}>
            {subtitle}
          </div>
        ) : null}
      </div>
      {onRemove ? (
        <button
          type="button"
          onClick={onRemove}
          disabled={removing}
          className="rounded-md p-1.5 disabled:opacity-60"
          style={{ color: C.error }}
          aria-label={`Remove ${name}`}
        >
          {removing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
        </button>
      ) : null}
    </>
  );

  if (selectable) {
    return (
      <button
        type="button"
        onClick={onSelect}
        disabled={disabled}
        className="flex w-full items-start gap-2.5 rounded-[11px] border px-3 py-2.5 text-left transition-colors disabled:opacity-60"
        style={{
          borderColor: selected ? "#CCE0CF" : "#DCE4DC",
          backgroundColor: selected ? "#EDF5EE" : theme.white,
        }}
      >
        {content}
      </button>
    );
  }

  return (
    <div
      className="flex items-center gap-2.5 rounded-[11px] border px-3 py-2.5"
      style={{ borderColor: "#DCE4DC", backgroundColor: theme.white }}
    >
      {content}
    </div>
  );
}
