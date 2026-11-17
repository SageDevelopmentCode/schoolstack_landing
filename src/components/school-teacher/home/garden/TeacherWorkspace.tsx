"use client";

import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowRight, ClipboardCheck, ClipboardList, School, Users, Zap } from "lucide-react";
import { GardenAttendanceBoard } from "@/components/school-admin/dashboard/garden/GardenAttendanceBoard";
import { PORTAL_EASE } from "@/components/school-parent/garden/motion";
import {
  GCard,
  GChip,
  GTabBar,
  G_FOCUS,
  NOTE_TINTS,
  SPRINGY,
  gBtnOutlineSm,
  gBtnPopSm,
  type GTabBarItem,
} from "@/components/school-parent/garden/ui";
import { formatStudentClassroomLabel } from "@/lib/school-admin/format-student-classroom-label";
import {
  formatEnrolledStudentName,
  formatStudentGrade,
  type AdminEnrolledStudentSummary,
} from "@/lib/school-admin/enrolled-students";
import { filterStudentsByClassroomName } from "@/lib/school-teacher/filter-students-by-classroom";
import type { TeacherDashboardWorkspaceTab } from "@/lib/school-teacher/teacher-dashboard-workspace";
import type { TeacherDashboardModel } from "../useTeacherDashboardModel";
import { StudentFace, plural } from "./parts";

const TAB_ICONS: Record<TeacherDashboardWorkspaceTab, typeof ClipboardList> = {
  attendance: ClipboardList,
  classrooms: School,
  students: Users,
};

/**
 * The working area under the fold: Attendance (shared Garden roster +
 * guided roll call), Classrooms and Your students, behind the same tab rules
 * as before (`resolveTeacherDashboardWorkspaceTabs`).
 */
export default function TeacherWorkspace({ model }: { model: TeacherDashboardModel }) {
  const reduce = useReducedMotion() === true;
  const { workspaceTabs, activeWorkspaceTab } = model;
  if (workspaceTabs.length === 0 || !activeWorkspaceTab) return null;

  const counts: Record<TeacherDashboardWorkspaceTab, number | null> = {
    attendance: model.att.summary.notMarkedCount > 0 ? model.att.summary.notMarkedCount : null,
    classrooms: model.summary.staffClassrooms.length,
    students: model.studentCount,
  };
  const items: GTabBarItem[] = workspaceTabs.map((tab) => {
    const Icon = TAB_ICONS[tab.key];
    const count = counts[tab.key];
    const active = tab.key === activeWorkspaceTab;
    return {
      key: tab.key,
      label: tab.label,
      testId: `teacher-dashboard-tab-${tab.key}`,
      icon: <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden />,
      suffix:
        count != null ? (
          <span
            className={`ml-0.5 rounded-full px-1.5 text-[11px] tabular-nums ${
              active ? "bg-white/25 text-white" : "bg-[var(--sf-ink)]/[0.06] text-[var(--sf-ink)]/60"
            }`}
            aria-label={tab.key === "attendance" ? `${count} to mark` : `${count}`}
          >
            {count}
          </span>
        ) : null,
    };
  });

  return (
    <section id={model.workspaceAnchorId} aria-label="Your classroom work" className="flex scroll-mt-6 flex-col gap-4">
      {workspaceTabs.length > 1 ? (
        <GTabBar
          items={items}
          activeKey={activeWorkspaceTab}
          onChange={(key) => model.setWorkspaceTab(key as TeacherDashboardWorkspaceTab)}
          ariaLabel="Dashboard workspace"
          data-testid="teacher-dashboard-workspace-nav"
        />
      ) : null}

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={activeWorkspaceTab}
          role={workspaceTabs.length > 1 ? "tabpanel" : undefined}
          aria-label={workspaceTabs.find((tab) => tab.key === activeWorkspaceTab)?.label}
          initial={reduce ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduce ? undefined : { opacity: 0, y: -4 }}
          transition={{ duration: 0.24, ease: PORTAL_EASE }}
          className="min-w-0"
        >
          {activeWorkspaceTab === "attendance" && model.showAttendanceSection ? (
            <AttendancePanel model={model} />
          ) : null}
          {activeWorkspaceTab === "classrooms" && model.myStudentsEnabled ? (
            <ClassroomsPanel model={model} />
          ) : null}
          {activeWorkspaceTab === "students" && model.myStudentsEnabled ? (
            <StudentsPanel model={model} />
          ) : null}
        </motion.div>
      </AnimatePresence>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Attendance                                                         */
/* ------------------------------------------------------------------ */

function AttendancePanel({ model }: { model: TeacherDashboardModel }) {
  const { att } = model;
  const canRollCall = att.summary.notMarkedCount > 0 && !att.loading && !att.loadError;
  const rollCallLabel = att.viewingToday ? "Take roll call" : "Mark this day";

  const headerAction = (
    <div className="flex flex-wrap items-center gap-2">
      {canRollCall ? (
        <button
          type="button"
          onClick={model.openRollCall}
          disabled={att.readOnly}
          title={att.readOnly ? "Roll call is off in preview" : undefined}
          className={gBtnPopSm}
          data-testid="teacher-dashboard-roll-call"
        >
          <Zap className="h-4 w-4" aria-hidden />
          {rollCallLabel}
          <span className="rounded-full bg-white/20 px-1.5 text-[12px] tabular-nums">{att.summary.notMarkedCount}</span>
        </button>
      ) : null}
      {/* Phones use the board footer's "Open full attendance" link (same page) so the header fits. */}
      <Link href={att.fullAttendanceHref} className={`${gBtnOutlineSm} max-sm:!hidden`}>
        {att.readOnly ? "Preview attendance" : "View attendance"}
        <ArrowRight className="h-4 w-4" aria-hidden />
      </Link>
    </div>
  );

  return (
    <GardenAttendanceBoard
      att={att}
      layout="grid"
      index={0}
      filter={model.attendanceFilter}
      onFilterChange={model.setAttendanceFilter}
      headerAction={headerAction}
    />
  );
}

/* ------------------------------------------------------------------ */
/* Classrooms                                                         */
/* ------------------------------------------------------------------ */

function ClassroomsPanel({ model }: { model: TeacherDashboardModel }) {
  const classrooms = model.summary.staffClassrooms;
  return (
    <GCard
      index={0}
      kicker="Classrooms"
      title={classrooms.length === 1 ? "Your classroom" : `Your ${classrooms.length} classrooms`}
      data-testid="teacher-dashboard-classrooms"
    >
      {classrooms.length === 0 ? (
        <p className="m-0 rounded-[16px] bg-[var(--sf-paper)] p-4 text-[14px] font-semibold text-[var(--sf-soft)]">
          No classrooms are assigned to you yet.
        </p>
      ) : (
        <ul className="m-0 grid list-none gap-3 p-0 md:grid-cols-2 xl:grid-cols-3">
          {classrooms.map((classroom, index) => {
            const roster = filterStudentsByClassroomName(model.summary.assignedStudents, classroom.name);
            const shown = roster.slice(0, 4);
            const extra = roster.length - shown.length;
            return (
              <li key={classroom.id}>
                <div className="flex h-full flex-col gap-4 rounded-[18px] border-[1.5px] border-[var(--sf-ink)]/10 bg-white p-4">
                  <div className="flex items-start gap-3">
                    <span
                      aria-hidden="true"
                      className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-[14px] ${NOTE_TINTS[index % NOTE_TINTS.length]}`}
                    >
                      <School className="h-5 w-5 text-[var(--sf-ink)]/80" strokeWidth={2.3} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <h3 className="sf-display m-0 truncate text-[1.15rem] leading-tight text-[var(--sf-ink)]">{classroom.name}</h3>
                      <p className="m-0 mt-0.5 text-[13px] font-semibold tabular-nums text-[var(--sf-soft)]">
                        {plural(classroom.studentCount, "student")}
                      </p>
                    </div>
                  </div>
                  {shown.length > 0 ? (
                    <div className="flex items-center" aria-hidden="true">
                      {shown.map((student, i) => (
                        <StudentFace key={student.id} student={student} index={i} size="xs" className={i > 0 ? "-ml-2" : ""} />
                      ))}
                      {extra > 0 ? (
                        <span className="-ml-2 flex h-8 w-8 items-center justify-center rounded-full bg-[var(--sf-paper)] text-[11px] font-extrabold text-[var(--sf-ink)]/65 ring-2 ring-white">
                          +{extra}
                        </span>
                      ) : null}
                    </div>
                  ) : null}
                  <button
                    type="button"
                    onClick={() => model.openClassroom(classroom)}
                    className={`${gBtnOutlineSm} mt-auto w-full`}
                    aria-label={`View students in ${classroom.name}`}
                  >
                    View students <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </GCard>
  );
}

/* ------------------------------------------------------------------ */
/* Students                                                           */
/* ------------------------------------------------------------------ */

function studentSubtitle(student: AdminEnrolledStudentSummary): string {
  const gradePart = formatStudentGrade(student.grade) ?? "Grade not listed";
  return student.programNames.length > 0 ? `${gradePart} · ${student.programNames.join(", ")}` : gradePart;
}

function StudentsPanel({ model }: { model: TeacherDashboardModel }) {
  const { studentCount, visibleStudents, hasMoreStudents } = model;
  return (
    <GCard
      index={0}
      kicker="Your students"
      title={studentCount > 0 ? `${studentCount} learner${studentCount === 1 ? "" : "s"} in your care` : "Your students"}
      data-testid="teacher-dashboard-students"
    >
      {studentCount === 0 ? (
        <p className="m-0 rounded-[16px] bg-[var(--sf-paper)] p-4 text-[14px] font-semibold leading-relaxed text-[var(--sf-soft)]">
          No learners assigned yet — your administrator can link students to you from the staff directory.
        </p>
      ) : (
        <>
          <ul className="m-0 grid list-none gap-3 p-0 md:grid-cols-2 xl:grid-cols-3">
            {visibleStudents.map((student, index) => {
              const first = student.firstName.trim() || formatEnrolledStudentName(student);
              return (
                <li key={student.id}>
                  <div className={`flex h-full flex-col gap-3 rounded-[18px] border-[1.5px] border-[var(--sf-ink)]/10 bg-[var(--sf-paper)] p-4 ${SPRINGY}`}>
                    <div className="flex items-start gap-3">
                      <StudentFace student={student} index={index} size="md" />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="sf-display m-0 truncate text-[1.15rem] leading-tight text-[var(--sf-ink)]">{first}</h3>
                          <GChip tone="success">● Enrolled</GChip>
                        </div>
                        <p className="m-0 mt-1 line-clamp-2 text-[12.5px] font-semibold leading-snug text-[var(--sf-soft)]">
                          {studentSubtitle(student)}
                        </p>
                        <p className="m-0 mt-0.5 truncate text-[12.5px] font-semibold text-[var(--sf-soft)]">
                          {student.classroomNames.length > 0
                            ? formatStudentClassroomLabel(student.classroomNames)
                            : "No classroom assigned"}
                        </p>
                        {student.familyName ? (
                          <p className="m-0 mt-0.5 truncate text-[12.5px] font-semibold text-[var(--sf-soft)]">
                            {student.familyName} family
                          </p>
                        ) : null}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => model.setSelectedStudent(student)}
                      className={`${gBtnOutlineSm} mt-auto w-full`}
                    >
                      View {first}&apos;s profile <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
          {hasMoreStudents ? (
            <Link
              href={model.myStudentsHref}
              className={`mt-4 flex items-center justify-center gap-2 rounded-[16px] border-[1.5px] border-dashed border-[var(--sf-ink)]/20 p-3 text-sm font-extrabold text-[var(--sf-clay-deep)] no-underline hover:bg-[var(--sf-accent-wash)] ${G_FOCUS}`}
            >
              <ClipboardCheck className="h-4 w-4" aria-hidden />
              View all {studentCount} students
            </Link>
          ) : null}
        </>
      )}
    </GCard>
  );
}
