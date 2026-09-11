"use client";

import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import StudentPhoto from "@/components/students/StudentPhoto";
import {
  formatEnrolledStudentName,
  formatStudentGrade,
  type AdminEnrolledStudentSummary,
} from "@/lib/school-admin/enrolled-students";
import {
  parentThemeToAdminCompat,
  type ParentThemeTokens,
} from "@/lib/organization-settings/parent-theme";

type TeacherClassroomStudentsSidebarProps = {
  theme: ParentThemeTokens;
  classroomName: string;
  students: AdminEnrolledStudentSummary[];
  open: boolean;
  onClose: () => void;
  onSelectStudent: (student: AdminEnrolledStudentSummary) => void;
};

export default function TeacherClassroomStudentsSidebar({
  theme,
  classroomName,
  students,
  open,
  onClose,
  onSelectStudent,
}: TeacherClassroomStudentsSidebarProps) {
  const adminCompat = parentThemeToAdminCompat(theme);

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-[100]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <div
            className="absolute inset-0"
            style={{ backgroundColor: "rgba(0,0,0,0.45)" }}
            onClick={onClose}
            aria-hidden="true"
          />
          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-labelledby="teacher-classroom-students-title"
            initial={{ x: "100%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "100%", opacity: 0 }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
            className="absolute inset-y-0 right-0 z-[15] flex w-[min(100%,28rem)] max-w-full flex-col overflow-hidden border-l"
            style={{
              backgroundColor: theme.white,
              borderColor: theme.line,
              boxShadow: theme.shadowCard,
            }}
            onClick={(event) => event.stopPropagation()}
          >
            <div
              className="flex shrink-0 items-center justify-between gap-3 border-b px-5 py-4"
              style={{
                backgroundColor: theme.infoBg,
                borderColor: theme.line,
              }}
            >
              <div className="min-w-0">
                <p className="m-0 text-[10px] font-bold uppercase tracking-[0.08em]" style={{ color: theme.muted }}>
                  Classroom
                </p>
                <h2
                  id="teacher-classroom-students-title"
                  className="truncate text-base font-semibold"
                  style={{ color: theme.ink, fontFamily: theme.fontDisplay }}
                >
                  {classroomName}
                </h2>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="rounded-full p-1.5 transition-colors hover:bg-black/[0.05]"
                aria-label="Close classroom students"
              >
                <X className="h-5 w-5" style={{ color: theme.muted }} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-4">
              {students.length > 0 ? (
                <div className="space-y-2">
                  {students.map((student) => {
                    const studentName = formatEnrolledStudentName(student);
                    const gradeLabel = formatStudentGrade(student.grade) ?? "Grade not listed";

                    return (
                      <button
                        key={student.id}
                        type="button"
                        onClick={() => onSelectStudent(student)}
                        className="flex w-full items-center gap-3 rounded-[14px] border px-3 py-3 text-left transition-colors hover:bg-[#F5F8F5]"
                        style={{ borderColor: theme.line }}
                      >
                        <StudentPhoto
                          name={studentName}
                          photoUrl={student.profilePhotoUrl}
                          size="md"
                          shape="circle"
                          theme={adminCompat}
                        />
                        <div className="min-w-0 flex-1">
                          <p
                            className="m-0 truncate text-sm font-semibold"
                            style={{ color: theme.ink }}
                          >
                            {studentName}
                          </p>
                          <p className="m-0 mt-0.5 truncate text-xs" style={{ color: "#7B878D" }}>
                            {gradeLabel}
                            {student.familyName ? ` · ${student.familyName} family` : ""}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <p className="m-0 text-sm leading-relaxed" style={{ color: theme.muted }}>
                  No students are assigned to this classroom yet.
                </p>
              )}
            </div>
          </motion.aside>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
