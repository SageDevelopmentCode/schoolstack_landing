"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { Search } from "lucide-react";
import { SchoolAdminTableSkeleton } from "@/components/school-admin/skeletons";
import AdminButton from "@/components/school-admin/ui/story/AdminButton";
import AdminCard from "@/components/school-admin/ui/story/AdminCard";
import AdminMetricCard from "@/components/school-admin/ui/story/AdminMetricCard";
import StudentContactCell from "@/components/school-admin/students/StudentContactCell";
import StudentEnrolledCell from "@/components/school-admin/students/StudentEnrolledCell";
import StudentIdentityCell from "@/components/school-admin/students/StudentIdentityCell";
import { useParentTheme } from "@/components/school-parent/ParentThemeContext";
import ParentDisplayHeading from "@/components/school-parent/ui/ParentDisplayHeading";
import ParentSectionKicker from "@/components/school-parent/ui/ParentSectionKicker";
import TeacherStudentDetailPanel from "./TeacherStudentDetailPanel";
import {
  deriveStudentRosterMetrics,
  filterStudentsByRosterFilter,
  matchesStudentSearch,
  type StudentRosterFilter,
} from "@/lib/school-admin/admin-student-roster-metrics";
import { adminStudentRowStyle } from "@/lib/school-admin/admin-student-row-style";
import { mergeStudentStandingHealthFlags } from "@/lib/school-admin/merge-student-standing-health-flags";
import {
  formatEnrolledStudentName,
  formatStudentGrade,
  listAssignedEnrolledStudents,
  listOrgEnrolledStudents,
  type AdminEnrolledStudentSummary,
} from "@/lib/school-admin/enrolled-students";
import type { StaffClassroomOption } from "@/lib/school-admin/classrooms";
import type { OrganizationBranding } from "@/lib/organization-settings/types";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";
import { createClient } from "@/utils/supabase/client";

type TeacherMyStudentsPageProps = {
  organizationId: string;
  branding: OrganizationBranding;
  slug: string;
  staffMemberId: string | null;
  initialStudents?: AdminEnrolledStudentSummary[];
  initialClassrooms?: StaffClassroomOption[];
  previewMode?: boolean;
};

type TeacherRosterScope = "assigned" | "school";
type TeacherClassroomFilter = "all" | "unassigned" | string;

const STUDENTS_PAGE_SIZE = 50;

function StoryFilterPill({
  active,
  label,
  count,
  onClick,
  theme,
}: {
  active: boolean;
  label: string;
  count?: number;
  onClick: () => void;
  theme: ParentThemeTokens;
}) {
  const displayLabel = count != null ? `${label} · ${count}` : label;

  return (
    <button
      type="button"
      onClick={onClick}
      className="cursor-pointer rounded-[9px] border px-2.5 py-2 text-[11px] font-medium transition-colors"
      style={
        active
          ? {
              backgroundColor: "#E9F2EA",
              color: theme.primary,
              borderColor: "#BCD4C1",
              fontWeight: 700,
            }
          : {
              backgroundColor: theme.white,
              color: "#5D6D73",
              borderColor: "#DCE4DC",
            }
      }
    >
      {displayLabel}
    </button>
  );
}

function studentMatchesClassroomFilter(
  student: AdminEnrolledStudentSummary,
  filter: TeacherClassroomFilter,
  staffClassrooms: StaffClassroomOption[],
): boolean {
  if (filter === "all") return true;
  if (filter === "unassigned") return student.classroomNames.length === 0;
  const classroom = staffClassrooms.find((entry) => entry.id === filter);
  if (!classroom) return true;
  return student.classroomNames.includes(classroom.name);
}

function updateStudentHealthFlag(
  students: AdminEnrolledStudentSummary[],
  studentId: string,
  hasStandingHealthItems: boolean,
): AdminEnrolledStudentSummary[] {
  return students.map((student) =>
    student.id === studentId ? { ...student, hasStandingHealthItems } : student,
  );
}

export default function TeacherMyStudentsPage({
  organizationId,
  branding: _branding,
  slug,
  staffMemberId,
  initialStudents,
  initialClassrooms,
  previewMode = false,
}: TeacherMyStudentsPageProps) {
  const { theme, adminCompat: C } = useParentTheme();
  const supabase = useMemo(() => createClient(), []);
  const hasInitialData = initialStudents !== undefined;
  const tableRef = useRef<HTMLDivElement>(null);

  const [rosterScope, setRosterScope] = useState<TeacherRosterScope>("assigned");
  const [classroomFilter, setClassroomFilter] = useState<TeacherClassroomFilter>("all");
  const [staffClassrooms] = useState<StaffClassroomOption[]>(initialClassrooms ?? []);
  const [assignedStudents, setAssignedStudents] = useState<AdminEnrolledStudentSummary[]>(
    initialStudents ?? [],
  );
  const [schoolStudents, setSchoolStudents] = useState<AdminEnrolledStudentSummary[] | null>(
    null,
  );
  const [loadingAssigned, setLoadingAssigned] = useState(
    !hasInitialData && staffMemberId != null,
  );
  const [loadingSchool, setLoadingSchool] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [rosterFilter, setRosterFilter] = useState<StudentRosterFilter>("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState(STUDENTS_PAGE_SIZE);

  const students = rosterScope === "assigned" ? assignedStudents : (schoolStudents ?? []);
  const loading = rosterScope === "assigned" ? loadingAssigned : loadingSchool;

  const assignedMetrics = useMemo(
    () => deriveStudentRosterMetrics(assignedStudents),
    [assignedStudents],
  );
  const schoolMetrics = useMemo(
    () => deriveStudentRosterMetrics(schoolStudents ?? []),
    [schoolStudents],
  );
  const metrics = rosterScope === "assigned" ? assignedMetrics : schoolMetrics;

  const healthFlagCount = useMemo(
    () => students.filter((student) => student.hasStandingHealthItems).length,
    [students],
  );

  const showProgramMetrics = metrics.programCount > 1;
  const isSchoolScope = rosterScope === "school";

  function changeRosterScope(next: TeacherRosterScope) {
    setRosterScope(next);
    setRosterFilter("all");
    setClassroomFilter("all");
    setVisibleCount(STUDENTS_PAGE_SIZE);
    setSelectedId(null);
  }

  function changeClassroomFilter(next: TeacherClassroomFilter) {
    setClassroomFilter(next);
    setVisibleCount(STUDENTS_PAGE_SIZE);
    setSelectedId(null);
  }

  function changeRosterFilter(next: StudentRosterFilter) {
    setRosterFilter(next);
    setVisibleCount(STUDENTS_PAGE_SIZE);
  }

  const loadAssignedStudents = useCallback(async () => {
    if (!staffMemberId) {
      setAssignedStudents([]);
      setLoadingAssigned(false);
      return;
    }

    setLoadingAssigned(true);
    setError(null);

    try {
      const rows = await listAssignedEnrolledStudents(
        supabase,
        organizationId,
        staffMemberId,
        { limit: 500 },
      );
      const withFlags = await mergeStudentStandingHealthFlags(
        supabase,
        organizationId,
        rows,
      );
      setAssignedStudents(withFlags);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load students.");
    } finally {
      setLoadingAssigned(false);
    }
  }, [organizationId, staffMemberId, supabase]);

  const loadSchoolStudents = useCallback(async () => {
    setLoadingSchool(true);
    setError(null);

    try {
      const rows = await listOrgEnrolledStudents(supabase, organizationId, {
        limit: 500,
      });
      const withFlags = await mergeStudentStandingHealthFlags(
        supabase,
        organizationId,
        rows,
      );
      setSchoolStudents(withFlags);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load students.");
    } finally {
      setLoadingSchool(false);
    }
  }, [organizationId, supabase]);

  useEffect(() => {
    if (hasInitialData) return;
    queueMicrotask(() => {
      void loadAssignedStudents();
    });
  }, [hasInitialData, loadAssignedStudents]);

  useEffect(() => {
    if (rosterScope !== "school" || schoolStudents !== null) return;
    queueMicrotask(() => {
      void loadSchoolStudents();
    });
  }, [loadSchoolStudents, rosterScope, schoolStudents]);

  const handleStudentHealthChange = useCallback(
    (studentId: string, hasStandingHealthItems: boolean) => {
      setAssignedStudents((current) =>
        updateStudentHealthFlag(current, studentId, hasStandingHealthItems),
      );
      setSchoolStudents((current) =>
        current
          ? updateStudentHealthFlag(current, studentId, hasStandingHealthItems)
          : current,
      );
    },
    [],
  );

  const focusUnassignedStudents = () => {
    changeRosterFilter("unassigned");
    tableRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const filteredStudents = useMemo(() => {
    const byFilter = filterStudentsByRosterFilter(students, rosterFilter);
    const byClassroom =
      rosterScope === "assigned" && classroomFilter !== "all"
        ? byFilter.filter((student) =>
            studentMatchesClassroomFilter(student, classroomFilter, staffClassrooms),
          )
        : byFilter;
    return byClassroom.filter((student) =>
      matchesStudentSearch(
        student,
        searchQuery,
        formatStudentGrade,
        formatEnrolledStudentName,
      ),
    );
  }, [
    classroomFilter,
    rosterFilter,
    rosterScope,
    searchQuery,
    staffClassrooms,
    students,
  ]);

  const unassignedClassroomCount = useMemo(
    () =>
      assignedStudents.filter((student) => student.classroomNames.length === 0).length,
    [assignedStudents],
  );

  const visibleStudents = useMemo(
    () => filteredStudents.slice(0, visibleCount),
    [filteredStudents, visibleCount],
  );

  const hasMoreStudents = visibleStudents.length < filteredStudents.length;

  const selectedStudent =
    filteredStudents.find((row) => row.id === selectedId) ??
    students.find((row) => row.id === selectedId) ??
    null;

  const tableColumnCount = isSchoolScope ? 6 : 5;
  const tableMinWidth = isSchoolScope ? "min-w-[960px]" : "min-w-[820px]";
  const tableHeadings = isSchoolScope
    ? ["Student", "Grade", "Program", "Teacher", "Parent", "Enrolled"]
    : ["Student", "Grade", "Program", "Parent", "Enrolled"];

  const inputStyle = {
    borderColor: "#DCE4DC",
    backgroundColor: theme.white,
    color: theme.ink,
  };

  const headerSubtitle =
    rosterScope === "assigned"
      ? `${assignedStudents.length} assigned student${assignedStudents.length === 1 ? "" : "s"}`
      : schoolStudents === null
        ? "All enrolled students at your school"
        : `${schoolStudents.length} enrolled student${schoolStudents.length === 1 ? "" : "s"} at your school`;

  const emptyMessage =
    rosterScope === "assigned"
      ? "No students assigned to you yet. Your school admin can assign students from My School → My Students."
      : "No enrolled students found at your school yet.";

  if (staffMemberId == null) {
    return (
      <div className="mx-auto max-w-[1350px] px-[clamp(25px,4vw,56px)] py-[30px]">
        <p className="text-sm leading-relaxed" style={{ color: theme.muted }}>
          Your account isn&apos;t linked to a staff record. Contact your school
          administrator so they can connect your portal login to the staff directory.
        </p>
      </div>
    );
  }

  return (
    <div className="relative flex h-full min-h-0 flex-col">
      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto max-w-[1350px] px-[clamp(25px,4vw,56px)] py-[30px] pb-14">
          <header className="mb-[23px]">
            <ParentSectionKicker theme={theme}>Your classroom</ParentSectionKicker>
            <ParentDisplayHeading theme={theme} as="h1" size="display" className="!mt-2">
              My Students
            </ParentDisplayHeading>
            <p className="m-0 mt-2 text-sm" style={{ color: theme.muted }}>
              {headerSubtitle}
            </p>
          </header>

          <div className="mb-[15px] flex flex-wrap items-center gap-2">
            <StoryFilterPill
              active={rosterScope === "assigned"}
              label="My students"
              count={assignedMetrics.totalCount}
              onClick={() => changeRosterScope("assigned")}
              theme={theme}
            />
            <StoryFilterPill
              active={rosterScope === "school"}
              label="All students"
              count={
                schoolStudents?.length ??
                (schoolMetrics.totalCount > 0 ? schoolMetrics.totalCount : undefined)
              }
              onClick={() => changeRosterScope("school")}
              theme={theme}
            />
          </div>

          {rosterScope === "assigned" && staffClassrooms.length > 0 ? (
            <div className="mb-[15px] flex flex-wrap items-center gap-2">
              <StoryFilterPill
                active={classroomFilter === "all"}
                label="All groups"
                count={assignedStudents.length}
                onClick={() => changeClassroomFilter("all")}
                theme={theme}
              />
              {staffClassrooms.map((classroom) => (
                <StoryFilterPill
                  key={classroom.id}
                  active={classroomFilter === classroom.id}
                  label={classroom.name}
                  count={classroom.studentCount}
                  onClick={() => changeClassroomFilter(classroom.id)}
                  theme={theme}
                />
              ))}
              {unassignedClassroomCount > 0 ? (
                <StoryFilterPill
                  active={classroomFilter === "unassigned"}
                  label="Unassigned"
                  count={unassignedClassroomCount}
                  onClick={() => changeClassroomFilter("unassigned")}
                  theme={theme}
                />
              ) : null}
            </div>
          ) : null}

          {!loading && students.length > 0 ? (
            <>
              <div
                className={`mb-[19px] grid grid-cols-1 gap-[13px] sm:grid-cols-2 ${
                  isSchoolScope && showProgramMetrics
                    ? "xl:grid-cols-4"
                    : isSchoolScope || showProgramMetrics
                      ? "xl:grid-cols-3"
                      : "xl:grid-cols-2"
                }`}
              >
                <AdminMetricCard
                  theme={theme}
                  value={String(metrics.totalCount)}
                  label={isSchoolScope ? "All enrolled" : "Assigned students"}
                  accent="forest"
                />
                {isSchoolScope && metrics.unassignedCount > 0 ? (
                  <AdminMetricCard
                    theme={theme}
                    value={String(metrics.unassignedCount)}
                    label="Unassigned teacher"
                    accent="gold"
                  />
                ) : null}
                {healthFlagCount > 0 ? (
                  <AdminMetricCard
                    theme={theme}
                    value={String(healthFlagCount)}
                    label="Health flags"
                    accent="berry"
                  />
                ) : null}
                {showProgramMetrics ? (
                  <AdminMetricCard
                    theme={theme}
                    value={String(metrics.programCount)}
                    label="Programs"
                    accent="sky"
                  />
                ) : null}
              </div>

              {isSchoolScope && metrics.unassignedCount > 0 ? (
                <div
                  className="mb-[15px] flex flex-col items-start justify-between gap-3 rounded-[12px] border px-4 py-3.5 sm:flex-row sm:items-center"
                  style={{
                    backgroundColor: "#EAF4EB",
                    borderColor: "#C7DFCB",
                    color: "#42694F",
                  }}
                >
                  <span className="text-xs">
                    <b>Needs attention:</b> {metrics.unassignedCount} enrolled student
                    {metrics.unassignedCount === 1 ? "" : "s"} don&apos;t have a teacher
                    assigned.
                  </span>
                  <AdminButton theme={theme} variant="soft" onClick={focusUnassignedStudents}>
                    View unassigned →
                  </AdminButton>
                </div>
              ) : null}
            </>
          ) : null}

          <div className="mb-[15px] flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <StoryFilterPill
                active={rosterFilter === "all"}
                label="All"
                count={metrics.totalCount}
                onClick={() => changeRosterFilter("all")}
                theme={theme}
              />
              {isSchoolScope && metrics.unassignedCount > 0 ? (
                <StoryFilterPill
                  active={rosterFilter === "unassigned"}
                  label="Unassigned"
                  count={metrics.unassignedCount}
                  onClick={() => changeRosterFilter("unassigned")}
                  theme={theme}
                />
              ) : null}
            </div>
            <div className="relative min-w-[12rem] max-w-xs flex-1 sm:max-w-sm">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2"
                style={{ color: "#8B9699" }}
                aria-hidden="true"
              />
              <input
                type="search"
                value={searchQuery}
                onChange={(event) => {
                  setSearchQuery(event.target.value);
                  setVisibleCount(STUDENTS_PAGE_SIZE);
                }}
                placeholder="Search students, families, or email"
                className="w-full rounded-md border py-2 pl-9 pr-3 text-sm outline-none"
                style={inputStyle}
              />
            </div>
          </div>

          {metrics.programOptions.length > 1 ? (
            <div className="mb-[15px] flex flex-wrap items-center gap-2">
              {metrics.programOptions.map(([programName]) => (
                <StoryFilterPill
                  key={programName}
                  active={rosterFilter === programName}
                  label={programName}
                  count={
                    students.filter((student) =>
                      student.programNames.includes(programName),
                    ).length
                  }
                  onClick={() => changeRosterFilter(programName)}
                  theme={theme}
                />
              ))}
            </div>
          ) : null}

          <div ref={tableRef}>
            {loading ? (
              <AdminCard theme={theme} padding="none">
                <SchoolAdminTableSkeleton
                  C={C}
                  rows={8}
                  columns={tableColumnCount}
                  showFilters={false}
                  label="Loading students"
                />
              </AdminCard>
            ) : error ? (
              <AdminCard theme={theme} padding="canvas">
                <p className="text-sm" style={{ color: C.error }}>
                  {error}
                </p>
              </AdminCard>
            ) : students.length === 0 ? (
              <AdminCard theme={theme} padding="canvas">
                <p className="text-sm leading-relaxed" style={{ color: theme.muted }}>
                  {emptyMessage}
                </p>
              </AdminCard>
            ) : filteredStudents.length === 0 ? (
              <AdminCard theme={theme} padding="canvas">
                <p className="text-sm" style={{ color: theme.muted }}>
                  No students match the current filters.
                </p>
              </AdminCard>
            ) : (
              <AdminCard theme={theme} padding="none" className="overflow-hidden">
                <div className="overflow-x-auto">
                  <table className={`w-full ${tableMinWidth} border-collapse text-left`}>
                    <thead style={{ backgroundColor: "#FBFCFB" }}>
                      <tr>
                        {tableHeadings.map((heading) => (
                          <th
                            key={heading}
                            className="px-[15px] py-2.5 text-left text-[10px] font-extrabold uppercase tracking-[0.08em]"
                            style={{ color: "#8B9699" }}
                          >
                            {heading}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {visibleStudents.map((student) => {
                        const isSelected = student.id === selectedId;
                        const isHovered = hoveredId === student.id;
                        const rowStyle = adminStudentRowStyle(C, {
                          isSelected,
                          isHovered,
                        });
                        const studentName = formatEnrolledStudentName(student);
                        const programLabel =
                          student.programNames.length > 0
                            ? student.programNames.join(", ")
                            : "—";
                        const teacherLabel =
                          student.assignedTeacherNames.trim() || "Unassigned";

                        return (
                          <tr
                            key={student.id}
                            onClick={() =>
                              setSelectedId((prev) =>
                                prev === student.id ? null : student.id,
                              )
                            }
                            onMouseEnter={() => setHoveredId(student.id)}
                            onMouseLeave={() => setHoveredId(null)}
                            className="cursor-pointer transition-colors"
                            style={rowStyle}
                          >
                            <td className="px-[15px] py-3">
                              <StudentIdentityCell
                                name={studentName}
                                familyName={student.familyName}
                                photoUrl={student.profilePhotoUrl}
                                hasStandingHealthItems={student.hasStandingHealthItems}
                                C={C}
                              />
                            </td>
                            <td
                              className="px-[15px] py-3 text-xs"
                              style={{ color: "#5D6D73" }}
                            >
                              {formatStudentGrade(student.grade) ?? "—"}
                            </td>
                            <td
                              className="px-[15px] py-3 text-xs"
                              style={{ color: "#5D6D73" }}
                            >
                              <div className="max-w-[14rem] truncate">{programLabel}</div>
                            </td>
                            {isSchoolScope ? (
                              <td
                                className="px-[15px] py-3 text-xs"
                                style={{ color: "#5D6D73" }}
                              >
                                <div className="max-w-[12rem] truncate">{teacherLabel}</div>
                              </td>
                            ) : null}
                            <td className="px-[15px] py-3">
                              <StudentContactCell
                                contactName={student.primaryContactName}
                                contactEmail={student.primaryContactEmail}
                              />
                            </td>
                            <td className="px-[15px] py-3">
                              <StudentEnrolledCell enrolledAt={student.enrolledAt} />
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {hasMoreStudents ? (
                  <div
                    className="flex justify-center px-4 py-3"
                    style={{ borderTop: `1px solid ${theme.line}` }}
                  >
                    <button
                      type="button"
                      onClick={() =>
                        setVisibleCount((count) => count + STUDENTS_PAGE_SIZE)
                      }
                      className="text-sm font-medium underline-offset-2 hover:underline"
                      style={{ color: theme.primary }}
                    >
                      Show more students
                    </button>
                  </div>
                ) : null}
              </AdminCard>
            )}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {selectedStudent && staffMemberId ? (
          <TeacherStudentDetailPanel
            key={selectedStudent.id}
            student={selectedStudent}
            organizationId={organizationId}
            staffMemberId={staffMemberId}
            branding={_branding}
            schoolSlug={slug}
            detailAccess={isSchoolScope ? "school" : "assigned"}
            readOnly={previewMode}
            onStudentHealthChange={handleStudentHealthChange}
            onClose={() => setSelectedId(null)}
          />
        ) : null}
      </AnimatePresence>
    </div>
  );
}
