"use client";

import { useMemo, useState } from "react";
import { ChevronRight, Search } from "lucide-react";
import GSidePanel from "@/components/school-parent/garden/GSidePanel";
import { G_INPUT, gLinkSm } from "@/components/school-parent/garden/ui";
import { ROW_INTERACTIVE } from "@/components/school-admin/dashboard/garden/shared";
import { StudentFace } from "@/components/school-teacher/home/garden/parts";
import {
  formatEnrolledStudentName,
  formatStudentGrade,
  type AdminEnrolledStudentSummary,
} from "@/lib/school-admin/enrolled-students";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";

type TeacherClassroomStudentsSidebarProps = {
  theme: ParentThemeTokens;
  classroomName: string;
  students: AdminEnrolledStudentSummary[];
  open: boolean;
  onClose: () => void;
  onSelectStudent: (student: AdminEnrolledStudentSummary) => void;
};

/**
 * Classroom roster drawer (Garden `GSidePanel`: Escape, focus in/return,
 * full width on phones). Rows open the student detail panel on top.
 * Mount outside the page's Garden frame.
 */
export default function TeacherClassroomStudentsSidebar({
  theme,
  classroomName,
  students,
  open,
  onClose,
  onSelectStudent,
}: TeacherClassroomStudentsSidebarProps) {
  const [query, setQuery] = useState("");
  const [lastName, setLastName] = useState(classroomName);
  // Keep the last title while the drawer animates closed; reset search per classroom.
  if (classroomName && classroomName !== lastName) {
    setLastName(classroomName);
    setQuery("");
  }

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return students;
    return students.filter((student) =>
      `${student.firstName} ${student.lastName} ${student.familyName ?? ""}`.toLowerCase().includes(q),
    );
  }, [query, students]);

  return (
    <GSidePanel
      theme={theme}
      open={open}
      onClose={onClose}
      kicker="Classroom"
      title={classroomName || lastName}
      subtitle={`${students.length} student${students.length === 1 ? "" : "s"} you teach in this room`}
      closeLabel="Close classroom students"
      testId="teacher-classroom-students-sidebar"
      panelId="teacher-classroom-students"
    >
      {students.length > 6 ? (
        <label className="relative block">
          <span className="sr-only">Search this classroom</span>
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--sf-ink)]/40" aria-hidden />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search students"
            className={`${G_INPUT} !rounded-full !py-2 !pl-9`}
          />
        </label>
      ) : null}

      {students.length === 0 ? (
        <p className="m-0 rounded-[16px] bg-[var(--sf-paper)] p-4 text-[14px] font-semibold leading-relaxed text-[var(--sf-soft)]">
          No students are assigned to this classroom yet.
        </p>
      ) : visible.length === 0 ? (
        <div className="flex flex-col items-start gap-2 rounded-[16px] bg-[var(--sf-paper)] p-4">
          <p className="m-0 text-[14px] font-semibold text-[var(--sf-soft)]">No students match &ldquo;{query}&rdquo;.</p>
          <button type="button" className={gLinkSm} onClick={() => setQuery("")}>
            Show everyone
          </button>
        </div>
      ) : (
        <ul className="m-0 flex list-none flex-col gap-1.5 p-0" aria-label={`Students in ${classroomName || lastName}`}>
          {visible.map((student, index) => {
            const name = formatEnrolledStudentName(student);
            return (
              <li key={student.id} className="rounded-[16px] border-[1.5px] border-[var(--sf-ink)]/10 bg-white">
                <button type="button" onClick={() => onSelectStudent(student)} className={ROW_INTERACTIVE} aria-label={`Open ${name}'s profile`}>
                  <StudentFace student={student} index={index} size="sm" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[15px] font-extrabold text-[var(--sf-ink)]">{name}</span>
                    <span className="block truncate text-[12.5px] font-semibold text-[var(--sf-soft)]">
                      {formatStudentGrade(student.grade) ?? "Grade not listed"}
                      {student.familyName ? ` · ${student.familyName} family` : ""}
                    </span>
                  </span>
                  <ChevronRight className="h-4 w-4 shrink-0 text-[var(--sf-ink)]/40 transition-transform duration-200 group-hover:translate-x-0.5" aria-hidden />
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </GSidePanel>
  );
}
