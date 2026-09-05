"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { AnimatePresence } from "framer-motion";
import { Loader2, Search } from "lucide-react";
import type { StudentsApiResponse } from "@/app/api/school-admin/students/route";
import { SchoolAdminTableSkeleton } from "@/components/school-admin/skeletons";
import { useSchoolAdminStoryTheme } from "@/components/school-admin/SchoolAdminStoryShell";
import AdminButton from "@/components/school-admin/ui/story/AdminButton";
import AdminCard from "@/components/school-admin/ui/story/AdminCard";
import AdminMetricCard from "@/components/school-admin/ui/story/AdminMetricCard";
import StudentContactCell from "./StudentContactCell";
import StudentDetailPanel from "./StudentDetailPanel";
import StudentEnrolledCell from "./StudentEnrolledCell";
import StudentIdentityCell from "./StudentIdentityCell";
import StudentClassroomTeachersCell from "./StudentClassroomTeachersCell";
import StudentClassroomCell from "./StudentClassroomCell";
import type { StudentRosterFilter } from "@/lib/school-admin/admin-student-roster-metrics";
import { isStudentUnassigned } from "@/lib/school-admin/admin-student-roster-metrics";
import { adminStudentRowStyle } from "@/lib/school-admin/admin-student-row-style";
import type { StudentsTableData } from "@/lib/school-admin/load-students-table-data";
import type { StudentsPageMeta } from "@/lib/school-admin/students-page-meta";
import {
  formatEnrolledStudentName,
  formatStudentGrade,
  type AdminEnrolledStudentSummary,
} from "@/lib/school-admin/enrolled-students";
import { schoolAdminPath } from "@/lib/organization-settings/admin-routes";
import type { OrganizationBranding } from "@/lib/organization-settings/types";
import { adminToast, formatActionError } from "@/lib/school-admin/admin-toast";
import type { ClassroomSummary } from "@/lib/school-admin/classrooms";

type StudentsPageProps = {
  organizationId: string;
  branding: OrganizationBranding;
  slug: string;
  initialMeta: StudentsPageMeta;
  initialTableData?: StudentsTableData;
  tableDeferred?: boolean;
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
  initialMeta,
  initialTableData,
  tableDeferred = false,
}: StudentsPageProps) {
  const { theme, C } = useSchoolAdminStoryTheme();
  const searchParams = useSearchParams();
  const deepLinkStudentId = searchParams.get("student");
  const hasInitialTable = initialTableData !== undefined;
  const tableRef = useRef<HTMLDivElement>(null);

  const [students, setStudents] = useState<AdminEnrolledStudentSummary[]>(
    initialTableData?.students ?? [],
  );
  const [totalCount, setTotalCount] = useState(initialTableData?.totalCount ?? 0);
  const [pageSize, setPageSize] = useState(initialTableData?.pageSize ?? STUDENTS_PAGE_SIZE);
  const [metrics, setMetrics] = useState(initialMeta);
  const [initialLoading, setInitialLoading] = useState(!hasInitialTable && !tableDeferred);
  const [isRefetching, setIsRefetching] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [rosterFilter, setRosterFilter] = useState<StudentRosterFilter>("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [tableReady, setTableReady] = useState(hasInitialTable);
  const [classrooms, setClassrooms] = useState<ClassroomSummary[]>([]);
  const [classroomsLoading, setClassroomsLoading] = useState(false);
  const [classroomsRequested, setClassroomsRequested] = useState(false);
  const [assigningClassroomStudentId, setAssigningClassroomStudentId] = useState<
    string | null
  >(null);

  const studentsLengthRef = useRef(students.length);
  useEffect(() => {
    studentsLengthRef.current = students.length;
  }, [students.length]);

  const submissionsPath = schoolAdminPath(slug, "admissions", "submissions");
  const classroomsPath = schoolAdminPath(slug, "my_school", "classrooms");

  const classroomsLoaded = classroomsRequested && !classroomsLoading;

  const showProgramMetrics = metrics.programCount > 1;

  const applyTableData = useCallback((tableData: StudentsTableData, { append = false } = {}) => {
    setStudents((prev) =>
      append ? [...prev, ...tableData.students] : tableData.students,
    );
    setTotalCount(tableData.totalCount);
    setPageSize(tableData.pageSize);
    setTableReady(true);
    setInitialLoading(false);
  }, []);

  useEffect(() => {
    if (!initialTableData) return;
    applyTableData(initialTableData);
  }, [initialTableData, applyTableData]);

  useEffect(() => {
    const handle = window.setTimeout(() => {
      setDebouncedSearch(searchQuery.trim());
    }, 300);
    return () => window.clearTimeout(handle);
  }, [searchQuery]);

  const fetchStudentsPage = useCallback(
    async ({
      offset,
      append,
      includeMeta,
    }: {
      offset: number;
      append: boolean;
      includeMeta?: boolean;
    }) => {
      const params = new URLSearchParams({
        organizationId,
        offset: String(offset),
        limit: String(pageSize),
        filter: rosterFilter,
      });
      if (debouncedSearch) {
        params.set("q", debouncedSearch);
      }
      if (includeMeta) {
        params.set("includeMeta", "1");
      }

      const response = await fetch(`/api/school-admin/students?${params.toString()}`);
      if (!response.ok) {
        throw new Error("Failed to load students.");
      }

      const body = (await response.json()) as StudentsApiResponse;

      if (body.meta) {
        setMetrics(body.meta);
      }

      if (append) {
        setStudents((prev) => [...prev, ...body.students]);
        setTotalCount(body.totalCount);
        setPageSize(body.limit);
      } else {
        applyTableData({
          students: body.students,
          totalCount: body.totalCount,
          pageSize: body.limit,
          hasMore: body.hasMore,
        });
      }
    },
    [applyTableData, debouncedSearch, organizationId, pageSize, rosterFilter],
  );

  const loadStudents = useCallback(
    async ({ append = false, offset }: { append?: boolean; offset?: number } = {}) => {
      const requestOffset = offset ?? (append ? studentsLengthRef.current : 0);

      if (append) {
        setLoadingMore(true);
      } else if (tableReady) {
        setIsRefetching(true);
      } else {
        setInitialLoading(true);
      }
      setError(null);

      try {
        await fetchStudentsPage({
          offset: requestOffset,
          append,
          includeMeta: !append,
        });
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to load students.";
        if (!append && !tableReady) {
          setError(message);
        }
      } finally {
        setInitialLoading(false);
        setIsRefetching(false);
        setLoadingMore(false);
      }
    },
    [fetchStudentsPage, tableReady],
  );

  const ensureClassroomsLoaded = useCallback(async () => {
    if (classroomsRequested) return;
    setClassroomsRequested(true);
    setClassroomsLoading(true);

    try {
      const response = await fetch(`/api/school/${slug}/classrooms`);
      if (!response.ok) {
        throw new Error("Failed to load classrooms.");
      }
      const payload = (await response.json()) as {
        classrooms?: ClassroomSummary[];
      };
      setClassrooms(payload.classrooms ?? []);
    } catch {
      setClassrooms([]);
    } finally {
      setClassroomsLoading(false);
    }
  }, [classroomsRequested, slug]);

  function changeRosterFilter(next: StudentRosterFilter) {
    setRosterFilter(next);
    setSelectedId(null);
  }

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

  const handleSetClassrooms = useCallback(
    async (studentId: string, classroomIds: string[]) => {
      await ensureClassroomsLoaded();

      let previousStudents: AdminEnrolledStudentSummary[] = [];

      setAssigningClassroomStudentId(studentId);
      setStudents((current) => {
        previousStudents = current;
        return current;
      });

      try {
        const response = await fetch(
          `/api/school/${slug}/students/${studentId}/classroom`,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ classroomIds }),
          },
        );

        if (!response.ok) {
          const payload = (await response.json().catch(() => null)) as {
            error?: string;
          } | null;
          throw new Error(payload?.error ?? "Failed to assign classrooms.");
        }

        const result = (await response.json()) as {
          classroomIds: string[];
          classroomNames: string[];
          assignedTeachers: { id: string; name: string }[];
          assignedTeacherNames: string;
        };

        if (classroomIds.length > 0 && result.classroomIds.length === 0) {
          throw new Error(
            "Selected classroom doesn't apply to this student's program.",
          );
        }

        setStudents((current) =>
          current.map((row) =>
            row.id === studentId
              ? {
                  ...row,
                  classroomIds: result.classroomIds,
                  classroomNames: result.classroomNames,
                  assignedTeachers: result.assignedTeachers,
                  assignedTeacherNames: result.assignedTeacherNames,
                }
              : row,
          ),
        );

        setMetrics((current) => {
          const wasUnassigned = previousStudents.find((row) => row.id === studentId)
            ? isStudentUnassigned(
                previousStudents.find((row) => row.id === studentId)!,
              )
            : false;
          const isUnassigned = isStudentUnassigned({
            classroomNames: result.classroomNames,
            assignedTeachers: result.assignedTeachers,
          });
          if (wasUnassigned === isUnassigned) return current;
          const delta = wasUnassigned && !isUnassigned ? -1 : !wasUnassigned && isUnassigned ? 1 : 0;
          return {
            ...current,
            unassignedCount: Math.max(0, current.unassignedCount + delta),
          };
        });

        adminToast.success("Classrooms updated.");
      } catch (error) {
        setStudents(previousStudents);
        adminToast.error(formatActionError(error, "Failed to assign classrooms."));
      } finally {
        setAssigningClassroomStudentId(null);
      }
    },
    [ensureClassroomsLoaded, slug],
  );

  const skipFilterFetchRef = useRef(true);

  useEffect(() => {
    if (tableDeferred) return;
    if (skipFilterFetchRef.current) {
      skipFilterFetchRef.current = false;
      if (hasInitialTable) return;
    }
    queueMicrotask(() => {
      void loadStudents({ offset: 0 });
    });
  }, [debouncedSearch, hasInitialTable, loadStudents, rosterFilter, tableDeferred]);

  useEffect(() => {
    if (!deepLinkStudentId || initialLoading) return;
    const match = students.find((row) => row.id === deepLinkStudentId);
    if (match) {
      queueMicrotask(() => setSelectedId(match.id));
    }
  }, [deepLinkStudentId, initialLoading, students]);

  const selectedStudent =
    students.find((row) => row.id === selectedId) ?? null;

  const hasMoreStudents = students.length < totalCount;

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

  const showMetrics = metrics.totalCount > 0;
  const showEmptyFilteredState =
    tableReady && !initialLoading && students.length === 0 && totalCount === 0 && metrics.totalCount > 0;

  return (
    <div className="relative flex h-full min-h-0 flex-col">
      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto max-w-[1350px] px-[clamp(25px,4vw,56px)] py-[30px] pb-14">
          {showMetrics ? (
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
                  label="Needs attention"
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
                    {metrics.unassignedCount === 1 ? "" : "s"} aren&apos;t in a classroom or
                    are missing a lead teacher.
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
              {isRefetching ? (
                <Loader2
                  className="h-3.5 w-3.5 animate-spin"
                  style={{ color: theme.primary }}
                  aria-label="Updating students"
                />
              ) : null}
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
                onChange={(event) => setSearchQuery(event.target.value)}
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
                  onClick={() => changeRosterFilter(programName)}
                  theme={theme}
                />
              ))}
            </div>
          ) : null}

          <div ref={tableRef}>
            {initialLoading ? (
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
            ) : !tableReady && tableDeferred ? (
              <AdminCard theme={theme} padding="none">
                <SchoolAdminTableSkeleton
                  C={C}
                  rows={8}
                  columns={tableColumnCount}
                  showFilters={false}
                  label="Loading students"
                />
              </AdminCard>
            ) : metrics.totalCount === 0 ? (
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
            ) : showEmptyFilteredState ? (
              <AdminCard theme={theme} padding="canvas">
                <p className="text-sm" style={{ color: theme.muted }}>
                  No students match the current filters.
                </p>
              </AdminCard>
            ) : (
              <AdminCard theme={theme} padding="none" className="relative overflow-hidden">
                {isRefetching ? (
                  <div
                    className="pointer-events-none absolute inset-0 z-10 flex items-start justify-center bg-white/55 pt-16"
                    aria-hidden="true"
                  >
                    <Loader2
                      className="h-5 w-5 animate-spin"
                      style={{ color: theme.primary }}
                    />
                  </div>
                ) : null}
                <div
                  className="overflow-x-auto transition-opacity duration-200"
                  style={{ opacity: isRefetching ? 0.55 : 1 }}
                >
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
                      {students.map((student) => {
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
                            <td className="px-[15px] py-3">
                              <StudentClassroomCell
                                C={C}
                                studentId={student.id}
                                studentName={studentName}
                                studentProgramNames={student.programNames}
                                classroomIds={student.classroomIds ?? []}
                                classroomNames={student.classroomNames}
                                classrooms={classrooms}
                                classroomsPath={classroomsPath}
                                classroomsLoading={classroomsLoading}
                                classroomsLoaded={classroomsLoaded}
                                disabled={assigningClassroomStudentId === student.id}
                                onAssign={handleSetClassrooms}
                                onInteract={() => void ensureClassroomsLoaded()}
                              />
                            </td>
                            <td className="px-[15px] py-3">
                              <StudentClassroomTeachersCell
                                C={C}
                                assignedTeachers={student.assignedTeachers}
                                classroomNames={student.classroomNames}
                                classroomsPath={classroomsPath}
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
                    className="flex justify-center border-t px-4 py-3"
                    style={{ borderTop: "1px solid #EDF1ED" }}
                  >
                    <button
                      type="button"
                      disabled={loadingMore}
                      onClick={() => void loadStudents({ append: true })}
                      className="text-[11px] font-extrabold disabled:opacity-60"
                      style={{ color: theme.primary }}
                    >
                      {loadingMore
                        ? "Loading more..."
                        : `Show more (${totalCount - students.length} remaining) →`}
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
            classrooms={classrooms}
            classroomsPath={classroomsPath}
            classroomsLoading={classroomsLoading}
            classroomsLoaded={classroomsLoaded}
            assigningClassroom={assigningClassroomStudentId === selectedStudent.id}
            onAssignClassrooms={handleSetClassrooms}
            onRequestClassrooms={() => void ensureClassroomsLoaded()}
            onStudentHealthChange={handleStudentHealthChange}
            onClose={() => setSelectedId(null)}
          />
        ) : null}
      </AnimatePresence>
    </div>
  );
}
