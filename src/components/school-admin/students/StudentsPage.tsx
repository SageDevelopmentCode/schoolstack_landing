"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { AnimatePresence } from "framer-motion";
import { Search } from "lucide-react";
import { SchoolAdminTableSkeleton } from "@/components/school-admin/skeletons";
import { useSchoolAdminStoryTheme } from "@/components/school-admin/SchoolAdminStoryShell";
import AdminButton from "@/components/school-admin/ui/story/AdminButton";
import AdminCard from "@/components/school-admin/ui/story/AdminCard";
import AdminMetricCard from "@/components/school-admin/ui/story/AdminMetricCard";
import StudentContactCell from "./StudentContactCell";
import StudentDetailPanel from "./StudentDetailPanel";
import StudentEnrolledCell from "./StudentEnrolledCell";
import StudentIdentityCell from "./StudentIdentityCell";
import StudentTeacherCell from "./StudentTeacherCell";
import {
  deriveStudentRosterMetrics,
  filterStudentsByRosterFilter,
  matchesStudentSearch,
  type StudentRosterFilter,
} from "@/lib/school-admin/admin-student-roster-metrics";
import { adminStudentRowStyle } from "@/lib/school-admin/admin-student-row-style";
import {
  formatEnrolledStudentName,
  formatStaffMemberName,
  formatStudentGrade,
  listOrgEnrolledStudents,
  type AdminEnrolledStudentSummary,
} from "@/lib/school-admin/enrolled-students";
import { schoolAdminPath } from "@/lib/organization-settings/admin-routes";
import type { OrganizationBranding } from "@/lib/organization-settings/types";
import { adminToast, formatActionError } from "@/lib/school-admin/admin-toast";
import { mergeStudentStandingHealthFlags } from "@/lib/school-admin/merge-student-standing-health-flags";
import type { StaffMemberRecord } from "@/lib/staff/staff-members";
import { createClient } from "@/utils/supabase/client";

type StudentsPageProps = {
  organizationId: string;
  branding: OrganizationBranding;
  slug: string;
  initialStudents?: AdminEnrolledStudentSummary[];
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
  theme: ReturnType<typeof useSchoolAdminStoryTheme>["theme"];
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

export default function StudentsPage({
  organizationId,
  branding,
  slug,
  initialStudents,
}: StudentsPageProps) {
  const { theme, C } = useSchoolAdminStoryTheme();
  const supabase = useMemo(() => createClient(), []);
  const searchParams = useSearchParams();
  const deepLinkStudentId = searchParams.get("student");
  const hasInitialData = initialStudents !== undefined;
  const tableRef = useRef<HTMLDivElement>(null);

  const [students, setStudents] = useState<AdminEnrolledStudentSummary[]>(
    initialStudents ?? [],
  );
  const [loading, setLoading] = useState(!hasInitialData);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [rosterFilter, setRosterFilter] = useState<StudentRosterFilter>("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState(STUDENTS_PAGE_SIZE);
  const [staffMembers, setStaffMembers] = useState<StaffMemberRecord[]>([]);
  const [assigningStudentId, setAssigningStudentId] = useState<string | null>(
    null,
  );

  const submissionsPath = schoolAdminPath(slug, "admissions", "submissions");
  const staffPath = schoolAdminPath(slug, "my_school", "staff");

  const activeStaff = useMemo(
    () => staffMembers.filter((member) => member.employmentStatus === "active"),
    [staffMembers],
  );

  const metrics = useMemo(
    () => deriveStudentRosterMetrics(students),
    [students],
  );

  const showProgramMetrics = metrics.programCount > 1;

  function changeRosterFilter(next: StudentRosterFilter) {
    setRosterFilter(next);
    setVisibleCount(STUDENTS_PAGE_SIZE);
  }

  const loadStudents = useCallback(async () => {
    setLoading(true);
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
      setStudents(withFlags);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load students.");
    } finally {
      setLoading(false);
    }
  }, [organizationId, supabase]);

  useEffect(() => {
    if (hasInitialData) return;
    queueMicrotask(() => {
      void loadStudents();
    });
  }, [hasInitialData, loadStudents]);

  useEffect(() => {
    let cancelled = false;

    async function loadStaff() {
      try {
        const response = await fetch(`/api/school/${slug}/staff`);
        if (!response.ok) {
          throw new Error("Failed to load staff.");
        }
        const payload = (await response.json()) as {
          staffMembers?: StaffMemberRecord[];
        };
        if (!cancelled) {
          setStaffMembers(payload.staffMembers ?? []);
        }
      } catch {
        if (!cancelled) {
          setStaffMembers([]);
        }
      }
    }

    void loadStaff();

    return () => {
      cancelled = true;
    };
  }, [slug]);

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

  const handleSetTeachers = useCallback(
    async (studentId: string, staffMemberIds: string[]) => {
      let previousStudents: AdminEnrolledStudentSummary[] = [];

      setAssigningStudentId(studentId);
      setStudents((current) => {
        previousStudents = current;
        const selectedStaff = activeStaff
          .filter((member) => staffMemberIds.includes(member.id))
          .map((member) => ({
            id: member.id,
            name: formatStaffMemberName(member),
          }))
          .sort((a, b) => a.name.localeCompare(b.name));

        return current.map((row) =>
          row.id === studentId
            ? {
                ...row,
                assignedTeachers: selectedStaff,
                assignedTeacherNames: selectedStaff.map((t) => t.name).join(", "),
              }
            : row,
        );
      });

      try {
        const response = await fetch(
          `/api/school/${slug}/students/${studentId}/teacher`,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ staffMemberIds }),
          },
        );

        if (!response.ok) {
          const payload = (await response.json().catch(() => null)) as {
            error?: string;
          } | null;
          throw new Error(payload?.error ?? "Failed to assign teachers.");
        }

        const result = (await response.json()) as {
          assignedTeachers: { id: string; name: string }[];
          assignedTeacherNames: string;
        };

        setStudents((current) =>
          current.map((row) =>
            row.id === studentId
              ? {
                  ...row,
                  assignedTeachers: result.assignedTeachers,
                  assignedTeacherNames: result.assignedTeacherNames,
                }
              : row,
          ),
        );
      } catch (error) {
        setStudents(previousStudents);
        adminToast.error(formatActionError(error, "Failed to assign teachers."));
      } finally {
        setAssigningStudentId(null);
      }
    },
    [activeStaff, slug],
  );

  useEffect(() => {
    if (!deepLinkStudentId || loading) return;
    const match = students.find((row) => row.id === deepLinkStudentId);
    if (match) {
      queueMicrotask(() => setSelectedId(match.id));
    }
  }, [deepLinkStudentId, loading, students]);

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

  const tableColumnCount = 7;
  const tableMinWidth = "min-w-[1040px]";
  const tableHeadings = [
    "Student",
    "Grade",
    "Program",
    "Classroom",
    "Teacher",
    "Family",
    "Enrolled",
  ];

  const inputStyle = {
    borderColor: "#DCE4DC",
    backgroundColor: theme.white,
    color: theme.ink,
  };

  const focusUnassignedStudents = () => {
    changeRosterFilter("unassigned");
    tableRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="relative flex h-full min-h-0 flex-col">
      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto max-w-[1350px] px-[clamp(25px,4vw,56px)] py-[30px] pb-14">
          {!loading && students.length > 0 ? (
            <>
              <div className="mb-[19px] grid grid-cols-1 gap-[13px] sm:grid-cols-2 xl:grid-cols-4">
                <AdminMetricCard
                  theme={theme}
                  value={String(metrics.totalCount)}
                  label="All enrolled"
                  accent="forest"
                />
                <AdminMetricCard
                  theme={theme}
                  value={String(metrics.unassignedCount)}
                  label="Unassigned teacher"
                  accent="gold"
                />
                {showProgramMetrics ? (
                  <AdminMetricCard
                    theme={theme}
                    value={String(metrics.programCount)}
                    label="Programs"
                    accent="sky"
                  />
                ) : null}
                <AdminMetricCard
                  theme={theme}
                  value={String(metrics.newEnrollmentCount)}
                  label="New enrollments"
                  accent="berry"
                />
              </div>

              {metrics.unassignedCount > 0 ? (
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
              {metrics.unassignedCount > 0 ? (
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
                  No enrolled students yet. Mark applications as enrolled in Admissions to add
                  students to your roster.
                </p>
                <Link
                  href={submissionsPath}
                  className="mt-3 inline-block text-sm font-extrabold"
                  style={{ color: theme.primary }}
                >
                  Go to Admissions Submissions →
                </Link>
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
                        const classroomLabel =
                          student.classroomNames.length > 0
                            ? student.classroomNames.join(", ")
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
                            style={{
                              ...rowStyle,
                              borderTop: "1px solid #EDF1ED",
                            }}
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
                              style={{ color: "#607078" }}
                            >
                              {formatStudentGrade(student.grade) ?? "—"}
                            </td>
                            <td className="px-[15px] py-3">
                              <div
                                className="max-w-[14rem] truncate text-xs font-semibold"
                                style={{ color: theme.ink }}
                              >
                                {programLabel}
                              </div>
                            </td>
                            <td
                              className="px-[15px] py-3 text-xs"
                              style={{ color: "#607078" }}
                            >
                              <div className="max-w-[12rem] truncate">{classroomLabel}</div>
                            </td>
                            <td className="px-[15px] py-3">
                              <StudentTeacherCell
                                C={C}
                                studentId={student.id}
                                studentName={studentName}
                                assignedTeachers={student.assignedTeachers}
                                activeStaff={activeStaff}
                                staffPath={staffPath}
                                disabled={assigningStudentId === student.id}
                                onAssign={handleSetTeachers}
                              />
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
                    style={{ borderTop: "1px solid #EDF1ED" }}
                  >
                    <button
                      type="button"
                      onClick={() =>
                        setVisibleCount((count) => count + STUDENTS_PAGE_SIZE)
                      }
                      className="text-sm font-extrabold"
                      style={{ color: theme.primary }}
                    >
                      Show more ({filteredStudents.length - visibleStudents.length} remaining) →
                    </button>
                  </div>
                ) : null}
              </AdminCard>
            )}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {selectedStudent ? (
          <StudentDetailPanel
            key={selectedStudent.id}
            student={selectedStudent}
            organizationId={organizationId}
            branding={branding}
            schoolSlug={slug}
            activeStaff={activeStaff}
            staffPath={staffPath}
            assigningTeacher={assigningStudentId === selectedStudent.id}
            onAssignTeacher={handleSetTeachers}
            onStudentHealthChange={handleStudentHealthChange}
            onClose={() => setSelectedId(null)}
          />
        ) : null}
      </AnimatePresence>
    </div>
  );
}
