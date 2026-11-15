"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { StudentsApiResponse } from "@/app/api/school-admin/students/route";
import { useAdminAction, NOT_SAVED } from "@/components/school-admin/garden/useAdminAction";
import {
  filterStudentsByRosterFilter,
  isStudentUnassigned,
  matchesStudentSearch,
  type StudentRosterFilter,
} from "@/lib/school-admin/admin-student-roster-metrics";
import {
  formatEnrolledStudentName,
  formatStudentGrade,
  type AdminEnrolledStudentSummary,
} from "@/lib/school-admin/enrolled-students";
import type { ClassroomSummary } from "@/lib/school-admin/classrooms";
import type { StudentsTableData } from "@/lib/school-admin/load-students-table-data";
import type { StudentsPageMeta } from "@/lib/school-admin/students-page-meta";
import { adminToast, formatActionError } from "@/lib/school-admin/admin-toast";
import { reportPortalOperationalError } from "@/lib/portal-operational-errors";

/*
 * My Students view-model (admin Garden). Same data flow as before: first
 * page from the server loader, "Show more" pages of 50, debounced search
 * (client-side once every row is loaded), roster filters, classroom
 * assignment. Adds load errors with Retry and the `?student=` drawer link.
 */

const STUDENTS_PAGE_SIZE = 50;

export function useStudentsModel({
  organizationId,
  slug,
  initialMeta,
  initialTableData,
  tableDeferred,
  previewMode,
}: {
  organizationId: string;
  slug: string;
  initialMeta: StudentsPageMeta;
  initialTableData?: StudentsTableData;
  tableDeferred: boolean;
  previewMode: boolean;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const deepLinkStudentId = searchParams.get("student");
  const hasInitialTable = initialTableData !== undefined;

  const [students, setStudents] = useState<AdminEnrolledStudentSummary[]>(initialTableData?.students ?? []);
  const [totalCount, setTotalCount] = useState(initialTableData?.totalCount ?? 0);
  const [pageSize, setPageSize] = useState(initialTableData?.pageSize ?? STUDENTS_PAGE_SIZE);
  const [metrics, setMetrics] = useState(initialMeta);
  const [initialLoading, setInitialLoading] = useState(!hasInitialTable && !tableDeferred);
  const [isRefetching, setIsRefetching] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refetchError, setRefetchError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [rosterFilter, setRosterFilter] = useState<StudentRosterFilter>("all");
  const [selectedId, setSelectedIdState] = useState<string | null>(deepLinkStudentId);
  const [tableReady, setTableReady] = useState(hasInitialTable);
  const [classrooms, setClassrooms] = useState<ClassroomSummary[]>([]);
  const [classroomsLoading, setClassroomsLoading] = useState(false);
  const [classroomsError, setClassroomsError] = useState<string | null>(null);
  const [classroomsRequested, setClassroomsRequested] = useState(false);
  const [lastUpdatedAt, setLastUpdatedAt] = useState(() => Date.now());
  const [prevInitialTableData, setPrevInitialTableData] = useState(initialTableData);
  const action = useAdminAction();

  const studentsLengthRef = useRef(students.length);
  const totalCountRef = useRef(totalCount);
  const debouncedSearchRef = useRef(debouncedSearch);
  useEffect(() => {
    studentsLengthRef.current = students.length;
    totalCountRef.current = totalCount;
    debouncedSearchRef.current = debouncedSearch;
  }, [students.length, totalCount, debouncedSearch]);

  const applyTableData = useCallback((tableData: StudentsTableData) => {
    setStudents(tableData.students);
    setTotalCount(tableData.totalCount);
    setPageSize(tableData.pageSize);
    setTableReady(true);
    setInitialLoading(false);
  }, []);

  if (initialTableData && initialTableData !== prevInitialTableData) {
    setPrevInitialTableData(initialTableData);
    applyTableData(initialTableData);
  }

  useEffect(() => {
    const handle = window.setTimeout(() => setDebouncedSearch(searchQuery.trim()), 300);
    return () => window.clearTimeout(handle);
  }, [searchQuery]);

  const fetchStudentsPage = useCallback(
    async ({ offset, append, includeMeta }: { offset: number; append: boolean; includeMeta?: boolean }) => {
      const params = new URLSearchParams({
        organizationId,
        offset: String(offset),
        limit: String(pageSize),
        filter: "all",
      });
      const search = debouncedSearchRef.current;
      const useServerSearch = Boolean(search) && !append && studentsLengthRef.current < totalCountRef.current;
      if (useServerSearch) params.set("q", search);
      if (includeMeta) params.set("includeMeta", "1");

      const response = await fetch(`/api/school-admin/students?${params.toString()}`);
      if (!response.ok) throw new Error("Failed to load students.");
      const body = (await response.json()) as StudentsApiResponse;
      if (body.meta) setMetrics(body.meta);
      if (append) {
        setStudents((prev) => [...prev, ...body.students]);
        setTotalCount(body.totalCount);
        setPageSize(body.limit);
      } else {
        applyTableData({ students: body.students, totalCount: body.totalCount, pageSize: body.limit, hasMore: body.hasMore });
      }
      setLastUpdatedAt(Date.now());
    },
    [applyTableData, organizationId, pageSize],
  );

  const tableReadyRef = useRef(tableReady);
  useEffect(() => {
    tableReadyRef.current = tableReady;
  }, [tableReady]);

  const loadStudentsRef = useRef<(options?: { append?: boolean }) => Promise<boolean>>(async () => false);
  const loadStudents = useCallback(
    async ({ append = false, offset, announce = false }: { append?: boolean; offset?: number; announce?: boolean } = {}) => {
      const requestOffset = offset ?? (append ? studentsLengthRef.current : 0);
      if (append) setLoadingMore(true);
      else if (tableReadyRef.current) setIsRefetching(true);
      else setInitialLoading(true);
      setError(null);
      try {
        await fetchStudentsPage({ offset: requestOffset, append, includeMeta: !append });
        setRefetchError(null);
        if (announce) {
          adminToast.success("Students updated.", { id: "students-refresh" });
        }
        return true;
      } catch (err) {
        void reportPortalOperationalError(
          "school_admin",
          { organizationId, operation: "students.load", error: "" },
          err,
        );
        const message = err instanceof Error ? err.message : "Failed to load students.";
        if (append) {
          adminToast.error("Couldn't load more students.", {
            id: "students-load-more-error",
            description: "The students already shown are unchanged.",
            action: { label: "Retry", onClick: () => void loadStudentsRef.current({ append: true }) },
          });
        } else if (!tableReadyRef.current) {
          setError(message);
        } else {
          setRefetchError(message);
        }
        return false;
      } finally {
        setInitialLoading(false);
        setIsRefetching(false);
        setLoadingMore(false);
      }
    },
    [fetchStudentsPage, organizationId],
  );
  useEffect(() => {
    loadStudentsRef.current = loadStudents;
  }, [loadStudents]);

  const skipInitialLoadRef = useRef(true);
  const skipSearchFetchRef = useRef(true);

  useEffect(() => {
    if (previewMode || tableDeferred) return;
    if (skipInitialLoadRef.current) {
      skipInitialLoadRef.current = false;
      if (hasInitialTable) return;
    }
    queueMicrotask(() => {
      void loadStudents({ offset: 0 });
    });
  }, [hasInitialTable, loadStudents, previewMode, tableDeferred]);

  useEffect(() => {
    if (previewMode || tableDeferred) return;
    if (skipSearchFetchRef.current) {
      skipSearchFetchRef.current = false;
      return;
    }
    if (students.length >= totalCount && totalCount > 0) return;
    queueMicrotask(() => {
      void loadStudents({ offset: 0 });
    });
  }, [debouncedSearch, loadStudents, previewMode, students.length, tableDeferred, totalCount]);

  /* ---- classrooms (lazy) ---- */
  const loadClassrooms = useCallback(async () => {
    if (previewMode) return;
    setClassroomsRequested(true);
    setClassroomsLoading(true);
    setClassroomsError(null);
    try {
      const response = await fetch(`/api/school/${slug}/classrooms`);
      if (!response.ok) throw new Error("Failed to load classrooms.");
      const payload = (await response.json()) as { classrooms?: ClassroomSummary[] };
      setClassrooms(payload.classrooms ?? []);
    } catch (err) {
      void reportPortalOperationalError(
        "school_admin",
        { organizationId, operation: "students.load_classrooms", error: "" },
        err,
      );
      setClassroomsError(formatActionError(err, "Failed to load classrooms."));
    } finally {
      setClassroomsLoading(false);
    }
  }, [organizationId, previewMode, slug]);

  const ensureClassroomsLoaded = useCallback(() => {
    if (previewMode || classroomsRequested) return;
    void loadClassrooms();
  }, [classroomsRequested, loadClassrooms, previewMode]);

  /** Returns true when the classrooms were saved (the picker closes only then). */
  const setStudentClassrooms = useCallback(
    async (studentId: string, classroomIds: string[]): Promise<boolean> => {
      const before = students.find((row) => row.id === studentId);
      const name = before ? formatEnrolledStudentName(before) : "Student";
      const result = await action.run(
        async () => {
          try {
            const response = await fetch(`/api/school/${slug}/students/${studentId}/classroom`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ classroomIds }),
            });
            if (!response.ok) {
              const payload = (await response.json().catch(() => null)) as { error?: string } | null;
              throw new Error(payload?.error ?? "Failed to assign classrooms.");
            }
            const body = (await response.json()) as {
              classroomIds: string[];
              classroomNames: string[];
              assignedTeachers: { id: string; name: string }[];
              assignedTeacherNames: string;
            };
            if (classroomIds.length > 0 && body.classroomIds.length === 0) {
              throw new Error("Selected classroom doesn't apply to this student's program.");
            }
            setStudents((current) =>
              current.map((row) =>
                row.id === studentId
                  ? {
                      ...row,
                      classroomIds: body.classroomIds,
                      classroomNames: body.classroomNames,
                      assignedTeachers: body.assignedTeachers,
                      assignedTeacherNames: body.assignedTeacherNames,
                    }
                  : row,
              ),
            );
            const wasUnassigned = before ? isStudentUnassigned(before) : false;
            const nowUnassigned = isStudentUnassigned({
              classroomNames: body.classroomNames,
              assignedTeachers: body.assignedTeachers,
            });
            let unassignedAfter = metrics.unassignedCount;
            if (wasUnassigned !== nowUnassigned) {
              unassignedAfter = Math.max(0, metrics.unassignedCount + (wasUnassigned ? -1 : 1));
              setMetrics((current) => ({ ...current, unassignedCount: unassignedAfter }));
            }
            return { ...body, unassignedAfter };
          } catch (err) {
            void reportPortalOperationalError(
              "school_admin",
              { organizationId, operation: "students.assign_classrooms", error: "" },
              err,
            );
            throw err;
          }
        },
        {
          key: `student-classrooms-${studentId}`,
          id: `student-classrooms-${studentId}`,
          flashKey: studentId,
          success: (body) => ({
            title:
              body.classroomNames.length === 0
                ? `${name} is no longer in a classroom.`
                : `${name} is now in ${body.classroomNames.join(", ")}.`,
            description: [
              body.assignedTeacherNames ? `Teacher: ${body.assignedTeacherNames}.` : "No lead teacher yet.",
              body.unassignedAfter === 0
                ? "Every student has a classroom and lead teacher."
                : `${body.unassignedAfter} student${body.unassignedAfter === 1 ? "" : "s"} still need attention.`,
            ].join(" "),
          }),
          error: { title: `Couldn't change ${name}'s classrooms.`, description: NOT_SAVED, fallback: "Failed to assign classrooms." },
        },
      );
      return result.ok;
    },
    [action, metrics.unassignedCount, organizationId, slug, students],
  );

  const setStudentHealth = useCallback((studentId: string, hasStandingHealthItems: boolean) => {
    setStudents((current) => current.map((s) => (s.id === studentId ? { ...s, hasStandingHealthItems } : s)));
  }, []);

  /* ---- selection (drawer) ---- */
  const writeStudentParam = useCallback(
    (id: string | null) => {
      if (previewMode) return;
      const params = new URLSearchParams(searchParams.toString());
      if (id) params.set("student", id);
      else params.delete("student");
      const query = params.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    },
    [pathname, previewMode, router, searchParams],
  );
  const openStudent = useCallback(
    (id: string) => {
      setSelectedIdState(id);
      writeStudentParam(id);
    },
    [writeStudentParam],
  );
  const closeStudent = useCallback(() => {
    setSelectedIdState(null);
    writeStudentParam(null);
  }, [writeStudentParam]);

  const changeRosterFilter = useCallback((next: StudentRosterFilter) => setRosterFilter(next), []);

  const searchFilteredClientSide = !debouncedSearch || students.length >= totalCount;
  const filteredStudents = useMemo(() => {
    let result = filterStudentsByRosterFilter(students, rosterFilter);
    if (debouncedSearch && searchFilteredClientSide) {
      result = result.filter((student) =>
        matchesStudentSearch(student, debouncedSearch, formatStudentGrade, formatEnrolledStudentName),
      );
    }
    return result;
  }, [debouncedSearch, rosterFilter, searchFilteredClientSide, students]);

  const selectedStudent = students.find((row) => row.id === selectedId) ?? null;

  return {
    students,
    filteredStudents,
    totalCount,
    hasMore: students.length < totalCount,
    remaining: Math.max(0, totalCount - students.length),
    metrics,
    initialLoading,
    tableReady,
    tableDeferred,
    isRefetching,
    loadingMore,
    error,
    refetchError,
    lastUpdatedAt,
    loadStudents,
    searchQuery,
    setSearchQuery,
    searching: searchQuery.trim() !== debouncedSearch,
    rosterFilter,
    changeRosterFilter,
    selectedId,
    selectedStudent,
    openStudent,
    closeStudent,
    classrooms,
    classroomsLoading,
    classroomsError,
    classroomsLoaded: classroomsRequested && !classroomsLoading && !classroomsError,
    ensureClassroomsLoaded,
    retryClassrooms: loadClassrooms,
    setStudentClassrooms,
    assigningStudentId: action.pendingKey?.startsWith("student-classrooms-")
      ? action.pendingKey.slice("student-classrooms-".length)
      : null,
    flashId: action.lastSavedKey,
    setStudentHealth,
    previewMode,
  };
}

export type StudentsModel = ReturnType<typeof useStudentsModel>;
