"use client";

import { useMemo, useState } from "react";
import { Loader2, Search } from "lucide-react";
import SchoolAdminSlideOverShell from "@/components/school-admin/ui/SchoolAdminSlideOverShell";
import AdminButton from "@/components/school-admin/ui/story/AdminButton";
import ClassroomStudentRow from "@/components/school-admin/classrooms/ClassroomStudentRow";
import { useSchoolAdminStoryTheme } from "@/components/school-admin/SchoolAdminStoryShell";
import {
  formatEnrolledStudentName,
  formatStudentGrade,
  type AdminEnrolledStudentSummary,
} from "@/lib/school-admin/enrolled-students";
import { groupStudentsForClassroomPicker } from "@/lib/school-admin/classroom-roster-ui";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";

type ClassroomStudentAssignSheetProps = {
  open: boolean;
  onClose: () => void;
  classroomName: string;
  classroomProgramName: string | null;
  enrolledStudents: AdminEnrolledStudentSummary[];
  rosterStudentIds: Set<string>;
  saving?: boolean;
  C: AdminThemeTokens;
  onSave: (studentIds: string[]) => Promise<void>;
};

export default function ClassroomStudentAssignSheet({
  open,
  onClose,
  classroomName,
  classroomProgramName,
  enrolledStudents,
  rosterStudentIds,
  saving = false,
  C,
  onSave,
}: ClassroomStudentAssignSheetProps) {
  const { theme } = useSchoolAdminStoryTheme();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [wasOpen, setWasOpen] = useState(open);

  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) {
      setSelectedIds([]);
      setSearchQuery("");
    }
  }

  const assignableStudents = useMemo(
    () => enrolledStudents.filter((student) => !rosterStudentIds.has(student.id)),
    [enrolledStudents, rosterStudentIds],
  );

  const filteredStudents = useMemo(() => {
    const normalized = searchQuery.trim().toLowerCase();
    if (!normalized) return assignableStudents;
    return assignableStudents.filter((student) => {
      const haystack = [
        formatEnrolledStudentName(student),
        student.familyName ?? "",
        formatStudentGrade(student.grade) ?? "",
        student.programNames.join(" "),
        student.classroomNames.join(" "),
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(normalized);
    });
  }, [assignableStudents, searchQuery]);

  const groupedStudents = useMemo(
    () => groupStudentsForClassroomPicker(filteredStudents, classroomProgramName),
    [filteredStudents, classroomProgramName],
  );

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
      title="Add students"
      subtitle={classroomName}
      C={C}
      footer={
        <>
          <AdminButton theme={theme} variant="soft" onClick={onClose} disabled={saving}>
            Cancel
          </AdminButton>
          <AdminButton
            theme={theme}
            variant="primary"
            onClick={() => void handleSave()}
            disabled={saving || selectedIds.length === 0}
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Add {selectedIds.length > 0 ? `(${selectedIds.length})` : ""}
          </AdminButton>
        </>
      }
    >
      {assignableStudents.length === 0 ? (
        <p className="text-sm" style={{ color: C.textTertiary }}>
          All enrolled students are already in this classroom.
        </p>
      ) : (
        <div className="space-y-4">
          <div className="relative">
            <Search
              className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2"
              style={{ color: C.textTertiary }}
            />
            <input
              type="search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search students…"
              className="w-full rounded-[9px] border py-2 pl-8 pr-3 text-sm outline-none"
              style={{
                borderColor: C.inputBorder,
                backgroundColor: C.input,
                color: C.textPrimary,
              }}
            />
          </div>

          {filteredStudents.length === 0 ? (
            <p className="text-sm" style={{ color: C.textTertiary }}>
              No available students match your search.
            </p>
          ) : (
            <div className="space-y-4">
              {groupedStudents.map((group) => (
                <section key={group.label ?? "all"}>
                  {group.label ? (
                    <h3
                      className="mb-2 text-[10px] font-semibold uppercase tracking-widest"
                      style={{ color: C.textTertiary }}
                    >
                      {group.label}
                    </h3>
                  ) : null}
                  <ul className="space-y-1.5">
                    {group.students.map((student) => (
                      <li key={student.id}>
                        <ClassroomStudentRow
                          student={student}
                          classroomProgramName={classroomProgramName}
                          theme={theme}
                          C={C}
                          selectable
                          selected={selectedIds.includes(student.id)}
                          disabled={saving}
                          onSelect={() => toggleStudent(student.id)}
                        />
                      </li>
                    ))}
                  </ul>
                </section>
              ))}
            </div>
          )}
        </div>
      )}
    </SchoolAdminSlideOverShell>
  );
}
