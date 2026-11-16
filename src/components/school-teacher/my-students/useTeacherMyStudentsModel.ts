"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useParentTheme } from "@/components/school-parent/ParentThemeContext";
import {
  deriveStudentRosterMetrics,
  filterStudentsByRosterFilter,
  matchesStudentSearch,
  type StudentRosterFilter,
} from "@/lib/school-admin/admin-student-roster-metrics";
import { mergeStudentStandingHealthFlags } from "@/lib/school-admin/merge-student-standing-health-flags";
import {
  formatEnrolledStudentName,
  formatStudentGrade,
  listAssignedEnrolledStudents,
  listOrgEnrolledStudents,
  type AdminEnrolledStudentSummary,
} from "@/lib/school-admin/enrolled-students";
import type { StaffClassroomOption } from "@/lib/school-admin/classrooms";
import {
  studentMatchesClassroomFilter,
  type TeacherClassroomFilter,
} from "@/lib/school-teacher/filter-students-by-classroom";
import type { OrganizationBranding } from "@/lib/organization-settings/types";
import { reportPortalOperationalError } from "@/lib/portal-operational-errors";
import { createClient } from "@/utils/supabase/client";

export type TeacherMyStudentsPageProps = {
  organizationId: string;
  branding: OrganizationBranding;
  slug: string;
  staffMemberId: string | null;
  initialStudents?: AdminEnrolledStudentSummary[];
  initialClassrooms?: StaffClassroomOption[];
  initialSelectedStudentId?: string;
  previewMode?: boolean;
};

export type TeacherRosterScope = "assigned" | "school";

export const STUDENTS_PAGE_SIZE = 50;

function updateStudentHealthFlag(
  students: AdminEnrolledStudentSummary[],
  studentId: string,
  hasStandingHealthItems: boolean,
): AdminEnrolledStudentSummary[] {
  return students.map((student) =>
    student.id === studentId ? { ...student, hasStandingHealthItems } : student,
  );
}

function plural(count: number, word: string): string {
  return `${count} ${word}${count === 1 ? "" : "s"}`;
}

/**
 * My Students view-model: roster scope (mine / whole school, lazy), classroom
 * group, roster + health filters, search, paging, `?classroom=` and the
 * student drawer. Rules: `.agents/skills/teacher-portal-garden-design`.
 */
export function useTeacherMyStudentsModel({
  organizationId,
  staffMemberId,
  initialStudents,
  initialClassrooms,
  initialSelectedStudentId,
  previewMode = false,
}: TeacherMyStudentsPageProps) {
  const { theme } = useParentTheme();
  const searchParams = useSearchParams();
  const supabase = useMemo(() => createClient(), []);
  const hasInitialData = initialStudents !== undefined;
  const staffClassrooms = useMemo(() => initialClassrooms ?? [], [initialClassrooms]);

  const initialClassroomParam = searchParams.get("classroom");
  const initialClassroomFilter = useMemo((): TeacherClassroomFilter => {
    if (!initialClassroomParam) return "all";
    if (initialClassroomParam === "unassigned") return "unassigned";
    if (staffClassrooms.some((classroom) => classroom.id === initialClassroomParam)) {
      return initialClassroomParam;
    }
    return "all";
  }, [initialClassroomParam, staffClassrooms]);

  const [rosterScope, setRosterScope] = useState<TeacherRosterScope>("assigned");
  const [classroomFilter, setClassroomFilter] = useState<TeacherClassroomFilter>(initialClassroomFilter);
  const [assignedStudents, setAssignedStudents] = useState<AdminEnrolledStudentSummary[]>(initialStudents ?? []);
  const [schoolStudents, setSchoolStudents] = useState<AdminEnrolledStudentSummary[] | null>(null);
  const [loadingAssigned, setLoadingAssigned] = useState(!hasInitialData && staffMemberId != null);
  const [loadingSchool, setLoadingSchool] = useState(false);
  const [assignedError, setAssignedError] = useState<string | null>(null);
  const [schoolError, setSchoolError] = useState<string | null>(null);
  const [searchQuery, setSearchQueryState] = useState("");
  const [rosterFilter, setRosterFilter] = useState<StudentRosterFilter>("all");
  const [healthOnly, setHealthOnly] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(initialSelectedStudentId ?? null);
  /** The last opened student, kept so the drawer can animate out. */
  const [panelStudentId, setPanelStudentId] = useState<string | null>(initialSelectedStudentId ?? null);
  const [visibleCount, setVisibleCount] = useState(STUDENTS_PAGE_SIZE);

  const isSchoolScope = rosterScope === "school";
  const students = useMemo(
    () => (isSchoolScope ? (schoolStudents ?? []) : assignedStudents),
    [assignedStudents, isSchoolScope, schoolStudents],
  );
  const loading = isSchoolScope ? loadingSchool || (schoolStudents === null && !schoolError) : loadingAssigned;
  const error = isSchoolScope ? schoolError : assignedError;

  const assignedMetrics = useMemo(() => deriveStudentRosterMetrics(assignedStudents), [assignedStudents]);
  const schoolMetrics = useMemo(() => deriveStudentRosterMetrics(schoolStudents ?? []), [schoolStudents]);
  const metrics = isSchoolScope ? schoolMetrics : assignedMetrics;

  const healthFlagCount = useMemo(
    () => students.filter((student) => student.hasStandingHealthItems).length,
    [students],
  );

  const resetPaging = () => setVisibleCount(STUDENTS_PAGE_SIZE);

  function changeRosterScope(next: TeacherRosterScope) {
    if (next === rosterScope) return;
    setRosterScope(next);
    setRosterFilter("all");
    setClassroomFilter("all");
    setHealthOnly(false);
    resetPaging();
    setSelectedId(null);
  }

  function changeClassroomFilter(next: TeacherClassroomFilter) {
    setClassroomFilter((current) => (current === next && next !== "all" ? "all" : next));
    resetPaging();
  }

  function changeRosterFilter(next: StudentRosterFilter) {
    setRosterFilter(next);
    resetPaging();
  }

  function toggleHealthOnly() {
    setHealthOnly((current) => !current);
    resetPaging();
  }

  function setSearchQuery(next: string) {
    setSearchQueryState(next);
    resetPaging();
  }

  function clearFilters() {
    setSearchQueryState("");
    setRosterFilter("all");
    setClassroomFilter("all");
    setHealthOnly(false);
    resetPaging();
  }

  const loadAssignedStudents = useCallback(async () => {
    if (!staffMemberId) {
      setAssignedStudents([]);
      setLoadingAssigned(false);
      return;
    }
    setLoadingAssigned(true);
    setAssignedError(null);
    try {
      const rows = await listAssignedEnrolledStudents(supabase, organizationId, staffMemberId, { limit: 500 });
      setAssignedStudents(await mergeStudentStandingHealthFlags(supabase, organizationId, rows));
    } catch (err) {
      void reportPortalOperationalError(
        "teacher_portal",
        { organizationId, operation: "students.load_assigned", error: "" },
        err,
      );
      setAssignedError(err instanceof Error ? err.message : "Failed to load students.");
    } finally {
      setLoadingAssigned(false);
    }
  }, [organizationId, staffMemberId, supabase]);

  const loadSchoolStudents = useCallback(async () => {
    setLoadingSchool(true);
    setSchoolError(null);
    try {
      const rows = await listOrgEnrolledStudents(supabase, organizationId, { limit: 500 });
      setSchoolStudents(await mergeStudentStandingHealthFlags(supabase, organizationId, rows));
    } catch (err) {
      void reportPortalOperationalError(
        "teacher_portal",
        { organizationId, operation: "students.load_school", error: "" },
        err,
      );
      setSchoolError(err instanceof Error ? err.message : "Failed to load students.");
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
    if (rosterScope !== "school" || schoolStudents !== null || schoolError || loadingSchool) return;
    queueMicrotask(() => {
      void loadSchoolStudents();
    });
  }, [loadSchoolStudents, loadingSchool, rosterScope, schoolError, schoolStudents]);

  const retry = useCallback(() => {
    if (rosterScope === "school") void loadSchoolStudents();
    else void loadAssignedStudents();
  }, [loadAssignedStudents, loadSchoolStudents, rosterScope]);

  const handleStudentHealthChange = useCallback((studentId: string, hasStandingHealthItems: boolean) => {
    setAssignedStudents((current) => updateStudentHealthFlag(current, studentId, hasStandingHealthItems));
    setSchoolStudents((current) =>
      current ? updateStudentHealthFlag(current, studentId, hasStandingHealthItems) : current,
    );
  }, []);

  const filteredStudents = useMemo(() => {
    const byFilter = filterStudentsByRosterFilter(students, rosterFilter);
    const byClassroom =
      !isSchoolScope && classroomFilter !== "all"
        ? byFilter.filter((student) => studentMatchesClassroomFilter(student, classroomFilter, staffClassrooms))
        : byFilter;
    const byHealth = healthOnly ? byClassroom.filter((student) => student.hasStandingHealthItems) : byClassroom;
    return byHealth.filter((student) =>
      matchesStudentSearch(student, searchQuery, formatStudentGrade, formatEnrolledStudentName),
    );
  }, [classroomFilter, healthOnly, isSchoolScope, rosterFilter, searchQuery, staffClassrooms, students]);

  const unassignedClassroomCount = useMemo(
    () => assignedStudents.filter((student) => student.classroomNames.length === 0).length,
    [assignedStudents],
  );

  const visibleStudents = useMemo(() => filteredStudents.slice(0, visibleCount), [filteredStudents, visibleCount]);
  const hasMoreStudents = visibleStudents.length < filteredStudents.length;
  const remainingCount = filteredStudents.length - visibleStudents.length;

  const programCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const student of students) {
      for (const name of student.programNames) counts.set(name, (counts.get(name) ?? 0) + 1);
    }
    return counts;
  }, [students]);

  const filtersActive =
    rosterFilter !== "all" || classroomFilter !== "all" || healthOnly || searchQuery.trim().length > 0;

  const findStudent = (id: string | null) =>
    id
      ? (assignedStudents.find((row) => row.id === id) ?? schoolStudents?.find((row) => row.id === id) ?? null)
      : null;
  const panelStudent = findStudent(panelStudentId);

  const openStudent = (id: string) => {
    setSelectedId(id);
    setPanelStudentId(id);
  };
  const closeStudent = () => setSelectedId(null);

  /** "3 assigned students · 2 classrooms · 1 without a classroom" — data only. */
  const statusLine = isSchoolScope
    ? schoolStudents === null
      ? "All enrolled students at your school"
      : [
          `${plural(schoolStudents.length, "enrolled student")} at your school`,
          metrics.unassignedCount > 0 ? `${metrics.unassignedCount} without a teacher` : null,
        ]
          .filter(Boolean)
          .join(" · ")
    : [
        plural(assignedStudents.length, "assigned student"),
        staffClassrooms.length > 0 ? plural(staffClassrooms.length, "classroom") : null,
        unassignedClassroomCount > 0 ? `${unassignedClassroomCount} without a classroom` : null,
      ]
        .filter(Boolean)
        .join(" · ");

  return {
    theme,
    previewMode,
    staffMemberId,
    staffClassrooms,
    rosterScope,
    isSchoolScope,
    changeRosterScope,
    classroomFilter,
    changeClassroomFilter,
    rosterFilter,
    changeRosterFilter,
    healthOnly,
    toggleHealthOnly,
    searchQuery,
    setSearchQuery,
    clearFilters,
    filtersActive,
    assignedStudents,
    schoolStudents,
    students,
    loading,
    loadingSchool,
    error,
    retry,
    assignedMetrics,
    schoolMetrics,
    metrics,
    healthFlagCount,
    programCounts,
    unassignedClassroomCount,
    filteredStudents,
    visibleStudents,
    hasMoreStudents,
    remainingCount,
    showMore: () => setVisibleCount((count) => count + STUDENTS_PAGE_SIZE),
    selectedId,
    panelStudent,
    openStudent,
    closeStudent,
    handleStudentHealthChange,
    statusLine,
  };
}

export type TeacherMyStudentsModel = ReturnType<typeof useTeacherMyStudentsModel>;
