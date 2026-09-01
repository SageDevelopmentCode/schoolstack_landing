"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { Search } from "lucide-react";
import { SchoolAdminTableSkeleton } from "@/components/school-admin/skeletons";
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
  type AdminEnrolledStudentSummary,
} from "@/lib/school-admin/enrolled-students";
import type { OrganizationBranding } from "@/lib/organization-settings/types";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";
import { createClient } from "@/utils/supabase/client";

type TeacherMyStudentsPageProps = {
  organizationId: string;
  branding: OrganizationBranding;
  slug: string;
  staffMemberId: string | null;
  initialStudents?: AdminEnrolledStudentSummary[];
  previewMode?: boolean;
};

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

export default function TeacherMyStudentsPage({
  organizationId,
  branding: _branding,
  slug,
  staffMemberId,
  initialStudents,
  previewMode = false,
}: TeacherMyStudentsPageProps) {
  const { theme, adminCompat: C } = useParentTheme();
  const supabase = useMemo(() => createClient(), []);
  const hasInitialData = initialStudents !== undefined;
  const tableRef = useRef<HTMLDivElement>(null);

  const [students, setStudents] = useState<AdminEnrolledStudentSummary[]>(
    initialStudents ?? [],
  );
  const [loading, setLoading] = useState(!hasInitialData && staffMemberId != null);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [rosterFilter, setRosterFilter] = useState<StudentRosterFilter>("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState(STUDENTS_PAGE_SIZE);

  const metrics = useMemo(() => deriveStudentRosterMetrics(students), [students]);

  const healthFlagCount = useMemo(
    () => students.filter((student) => student.hasStandingHealthItems).length,
    [students],
  );

  const showProgramMetrics = metrics.programCount > 1;

  function changeRosterFilter(next: StudentRosterFilter) {
    setRosterFilter(next);
    setVisibleCount(STUDENTS_PAGE_SIZE);
  }

  const loadStudents = useCallback(async () => {
    if (!staffMemberId) {
      setStudents([]);
      setLoading(false);
      return;
    }

    setLoading(true);
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
      setStudents(withFlags);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load students.");
    } finally {
      setLoading(false);
    }
  }, [organizationId, staffMemberId, supabase]);

  useEffect(() => {
    if (hasInitialData) return;
    queueMicrotask(() => {
      void loadStudents();
    });
  }, [hasInitialData, loadStudents]);

  const handleStudentHealthChange = useCallback(
    (studentId: string, hasStandingHealthItems: boolean) => {
      setStudents((current) =>
        current.map((student) =>
          student.id === studentId
            ? { ...student, hasStandingHealthItems }
            : student,
        ),
      );
    },
    [],
  );

  const filteredStudents = useMemo(() => {
    const byFilter = filterStudentsByRosterFilter(students, rosterFilter);
    return byFilter.filter((student) =>
      matchesStudentSearch(
        student,
        searchQuery,
        formatStudentGrade,
        formatEnrolledStudentName,
      ),
    );
  }, [rosterFilter, searchQuery, students]);

  const visibleStudents = useMemo(
    () => filteredStudents.slice(0, visibleCount),
    [filteredStudents, visibleCount],
  );

  const hasMoreStudents = visibleStudents.length < filteredStudents.length;

  const selectedStudent =
    filteredStudents.find((row) => row.id === selectedId) ??
    students.find((row) => row.id === selectedId) ??
    null;

  const tableColumnCount = 5;
  const tableMinWidth = "min-w-[820px]";
  const tableHeadings = ["Student", "Grade", "Program", "Parent", "Enrolled"];

  const inputStyle = {
    borderColor: "#DCE4DC",
    backgroundColor: theme.white,
    color: theme.ink,
  };

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
              {students.length} assigned student{students.length === 1 ? "" : "s"}
            </p>
          </header>

          {!loading && students.length > 0 ? (
            <div
              className={`mb-[19px] grid grid-cols-1 gap-[13px] sm:grid-cols-2 ${showProgramMetrics ? "xl:grid-cols-3" : "xl:grid-cols-2"}`}
            >
              <AdminMetricCard
                theme={theme}
                value={String(metrics.totalCount)}
                label="Assigned students"
                accent="forest"
              />
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
                  No students assigned to you yet. Your school admin can assign students
                  from My School → My Students.
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
            readOnly={previewMode}
            onStudentHealthChange={handleStudentHealthChange}
            onClose={() => setSelectedId(null)}
          />
        ) : null}
      </AnimatePresence>
    </div>
  );
}
