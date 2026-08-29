"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, Loader2, Search } from "lucide-react";
import SchoolAdminSlideOverShell from "@/components/school-admin/ui/SchoolAdminSlideOverShell";
import {
  formatEnrolledStudentName,
  formatStudentGrade,
  studentHasAssignedTeacher,
  type AdminEnrolledStudentSummary,
} from "@/lib/school-admin/enrolled-students";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";

type StaffStudentAssignSheetProps = {
  open: boolean;
  onClose: () => void;
  staffMemberName: string;
  staffMemberId: string;
  enrolledStudents: AdminEnrolledStudentSummary[];
  saving?: boolean;
  C: AdminThemeTokens;
  onSave: (studentIds: string[]) => Promise<void>;
};

function studentSortKey(student: AdminEnrolledStudentSummary): string {
  return formatEnrolledStudentName(student).toLowerCase();
}

function studentSubtitle(
  student: AdminEnrolledStudentSummary,
  staffMemberId: string,
): string {
  const parts: string[] = [];
  const grade = formatStudentGrade(student.grade);
  if (grade) parts.push(grade);

  const otherTeachers = student.assignedTeachers
    .filter((teacher) => teacher.id !== staffMemberId)
    .map((teacher) => teacher.name);

  if (otherTeachers.length > 0) {
    parts.push(`Teachers: ${otherTeachers.join(", ")}`);
  }

  return parts.join(" · ");
}

export default function StaffStudentAssignSheet({
  open,
  onClose,
  staffMemberName,
  staffMemberId,
  enrolledStudents,
  saving = false,
  C,
  onSave,
}: StaffStudentAssignSheetProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  useEffect(() => {
    if (!open) return;
    setSelectedIds([]);
    setSearchQuery("");
  }, [open]);

  const assignableStudents = useMemo(
    () =>
      [...enrolledStudents]
        .filter((student) => !studentHasAssignedTeacher(student, staffMemberId))
        .sort((a, b) => studentSortKey(a).localeCompare(studentSortKey(b))),
    [enrolledStudents, staffMemberId],
  );

  const filteredStudents = useMemo(() => {
    const normalized = searchQuery.trim().toLowerCase();
    if (!normalized) return assignableStudents;
    return assignableStudents.filter((student) => {
      const haystack = [
        formatEnrolledStudentName(student),
        student.assignedTeacherNames,
        student.familyName ?? "",
        formatStudentGrade(student.grade) ?? "",
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(normalized);
    });
  }, [assignableStudents, searchQuery]);

  const toggleStudent = (studentId: string) => {
    setSelectedIds((current) =>
      current.includes(studentId)
        ? current.filter((id) => id !== studentId)
        : [...current, studentId],
    );
  };

  const handleSave = async () => {
    if (selectedIds.length === 0) return;
    await onSave(selectedIds);
    onClose();
  };

  return (
    <SchoolAdminSlideOverShell
      open={open}
      onClose={onClose}
      title="Assign students"
      subtitle={staffMemberName}
      C={C}
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="rounded-md px-3 py-1.5 text-sm font-medium disabled:opacity-60"
            style={{ color: C.textSecondary }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => void handleSave()}
            disabled={saving || selectedIds.length === 0}
            className="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium disabled:opacity-60"
            style={{ backgroundColor: C.accent, color: "#fff" }}
          >
            {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
            Assign {selectedIds.length > 0 ? `(${selectedIds.length})` : ""}
          </button>
        </>
      }
    >
      {assignableStudents.length === 0 ? (
        <p className="text-sm" style={{ color: C.textTertiary }}>
          All enrolled students are already assigned to this staff member.
        </p>
      ) : (
        <>
          <div className="relative mb-3">
            <Search
              className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2"
              style={{ color: C.textTertiary }}
            />
            <input
              type="search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search students…"
              className="w-full rounded-md border py-2 pl-8 pr-3 text-sm outline-none"
              style={{
                borderColor: C.inputBorder,
                backgroundColor: C.input,
                color: C.textPrimary,
              }}
            />
          </div>

          <ul className="space-y-1">
            {filteredStudents.map((student) => {
              const selected = selectedIds.includes(student.id);
              const subtitle = studentSubtitle(student, staffMemberId);

              return (
                <li key={student.id}>
                  <button
                    type="button"
                    disabled={saving}
                    onClick={() => toggleStudent(student.id)}
                    className="flex w-full items-start gap-2 rounded-md px-2.5 py-2 text-left text-sm disabled:opacity-60"
                    style={{
                      backgroundColor: selected ? C.accentLight : "transparent",
                      color: selected ? C.accent : C.textPrimary,
                    }}
                  >
                    <span
                      className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border"
                      style={{
                        borderColor: selected ? C.accent : C.border,
                        backgroundColor: selected ? C.accent : C.surface,
                      }}
                    >
                      {selected ? (
                        <Check className="h-3 w-3" style={{ color: "#fff" }} />
                      ) : null}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-medium">
                        {formatEnrolledStudentName(student)}
                      </span>
                      {subtitle ? (
                        <span
                          className="mt-0.5 block truncate text-xs"
                          style={{ color: C.textTertiary }}
                        >
                          {subtitle}
                        </span>
                      ) : null}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>

          {filteredStudents.length === 0 ? (
            <p className="mt-3 text-sm" style={{ color: C.textTertiary }}>
              No students match your search.
            </p>
          ) : null}
        </>
      )}
    </SchoolAdminSlideOverShell>
  );
}
