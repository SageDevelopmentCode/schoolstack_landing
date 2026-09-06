"use client";

import { Check } from "lucide-react";
import type { ClassroomSummary } from "@/lib/school-admin/classrooms";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";

type ClassroomPickerRowProps = {
  classroom: ClassroomSummary;
  selected: boolean;
  disabled?: boolean;
  C: AdminThemeTokens;
  onSelect: () => void;
};

function formatClassroomMeta(classroom: ClassroomSummary): string {
  const studentLabel =
    classroom.studentCount === 1
      ? "1 student"
      : `${classroom.studentCount} students`;
  const teacherLabel =
    classroom.leadTeacherNames.length > 0
      ? `Lead: ${classroom.leadTeacherNames.join(", ")}`
      : "No lead teacher";

  return `${studentLabel} · ${teacherLabel}`;
}

export default function ClassroomPickerRow({
  classroom,
  selected,
  disabled = false,
  C,
  onSelect,
}: ClassroomPickerRowProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onSelect}
      className="flex w-full items-start gap-3 rounded-[11px] border px-3 py-3 text-left transition-colors disabled:opacity-60"
      style={{
        borderColor: selected ? "#CCE0CF" : "#DCE4DC",
        backgroundColor: selected ? "#EDF5EE" : C.surface,
      }}
    >
      <span
        className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border"
        style={{
          borderColor: selected ? C.accent : C.border,
          backgroundColor: selected ? C.accent : C.surface,
        }}
      >
        {selected ? <Check className="h-3.5 w-3.5" style={{ color: "#fff" }} /> : null}
      </span>
      <span className="min-w-0 flex-1">
        <span
          className="block truncate text-sm font-semibold"
          style={{ color: C.textPrimary }}
        >
          {classroom.name}
        </span>
        <span
          className="mt-0.5 block truncate text-[11px]"
          style={{ color: C.textTertiary }}
        >
          {formatClassroomMeta(classroom)}
        </span>
        {!classroom.programId ? (
          <span
            className="mt-1 inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide"
            style={{ backgroundColor: C.bg, color: C.textTertiary }}
          >
            All programs
          </span>
        ) : null}
      </span>
    </button>
  );
}
