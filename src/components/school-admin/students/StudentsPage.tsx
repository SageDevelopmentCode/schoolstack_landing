"use client";

import { useCallback, useEffect, useMemo, useState, type CSSProperties } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { AnimatePresence } from "framer-motion";
import { Search } from "lucide-react";
import { SchoolAdminTableSkeleton } from "@/components/school-admin/skeletons";
import StudentDetailPanel from "./StudentDetailPanel";
import StudentTeacherAssignSelect from "./StudentTeacherAssignSelect";
import {
  formatEnrolledDate,
  formatEnrolledStudentName,
  formatStaffMemberName,
  formatStudentGrade,
  listOrgEnrolledStudents,
  type AdminEnrolledStudentSummary,
} from "@/lib/school-admin/enrolled-students";
import { schoolAdminPath } from "@/lib/organization-settings/admin-routes";
import {
  buildAdminThemeTokens,
  type AdminThemeTokens,
} from "@/lib/organization-settings/theme";
import type { OrganizationBranding } from "@/lib/organization-settings/types";
import { adminToast, formatActionError } from "@/lib/school-admin/admin-toast";
import type { StaffMemberRecord } from "@/lib/staff/staff-members";
import { createClient } from "@/utils/supabase/client";

type StudentsPageProps = {
  organizationId: string;
  branding: OrganizationBranding;
  slug: string;
  initialStudents?: AdminEnrolledStudentSummary[];
};

const STUDENTS_PAGE_SIZE = 50;

function columnDividerStyle(C: AdminThemeTokens, isLast: boolean): CSSProperties {
  return isLast ? {} : { borderRight: `1px solid ${C.border}` };
}

function studentColumnHeaderBadgeStyle(
  heading: string,
  C: AdminThemeTokens,
): CSSProperties {
  switch (heading) {
    case "Student":
      return { backgroundColor: C.accentLight, color: C.accent };
    case "Program":
      return { backgroundColor: C.infoBg, color: C.info };
    case "Teacher":
      return { backgroundColor: C.successBg, color: C.success };
    case "Parent":
      return { backgroundColor: C.warningBg, color: C.warning };
    case "Enrolled":
      return { backgroundColor: C.bg, color: C.textTertiary, border: `1px solid ${C.border}` };
    default:
      return {
        backgroundColor: C.bg,
        color: C.textTertiary,
        border: `1px solid ${C.border}`,
      };
  }
}

function matchesSearch(student: AdminEnrolledStudentSummary, query: string): boolean {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return true;

  const haystack = [
    formatEnrolledStudentName(student),
    student.grade ?? "",
    formatStudentGrade(student.grade) ?? "",
    student.familyName ?? "",
    student.assignedTeacherName ?? "",
    student.primaryContactName ?? "",
    student.primaryContactEmail ?? "",
    student.programNames.join(" "),
  ]
    .join(" ")
    .toLowerCase();

  return haystack.includes(normalized);
}

export default function StudentsPage({
  organizationId,
  branding,
  slug,
  initialStudents,
}: StudentsPageProps) {
  const C = useMemo(() => buildAdminThemeTokens(branding), [branding]);
  const supabase = useMemo(() => createClient(), []);
  const searchParams = useSearchParams();
  const deepLinkStudentId = searchParams.get("student");
  const hasInitialData = initialStudents !== undefined;

  const [students, setStudents] = useState<AdminEnrolledStudentSummary[]>(
    initialStudents ?? [],
  );
  const [loading, setLoading] = useState(!hasInitialData);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
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

  const loadStudents = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const rows = await listOrgEnrolledStudents(supabase, organizationId, {
        limit: 500,
      });
      setStudents(rows);
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

  const handleAssignTeacher = useCallback(
    async (studentId: string, staffMemberId: string | null) => {
      const selectedStaff = staffMemberId
        ? activeStaff.find((member) => member.id === staffMemberId)
        : null;
      let previousStudents: AdminEnrolledStudentSummary[] = [];

      setAssigningStudentId(studentId);
      setStudents((current) => {
        previousStudents = current;
        return current.map((row) =>
          row.id === studentId
            ? {
                ...row,
                assignedTeacherId: staffMemberId,
                assignedTeacherName: selectedStaff
                  ? formatStaffMemberName(selectedStaff)
                  : null,
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
            body: JSON.stringify({ staffMemberId }),
          },
        );

        if (!response.ok) {
          const payload = (await response.json().catch(() => null)) as {
            error?: string;
          } | null;
          throw new Error(payload?.error ?? "Failed to assign teacher.");
        }

        const result = (await response.json()) as {
          assignedTeacherId: string | null;
          assignedTeacherName: string | null;
        };

        setStudents((current) =>
          current.map((row) =>
            row.id === studentId
              ? {
                  ...row,
                  assignedTeacherId: result.assignedTeacherId,
                  assignedTeacherName: result.assignedTeacherName,
                }
              : row,
          ),
        );
      } catch (error) {
        setStudents(previousStudents);
        adminToast.error(formatActionError(error, "Failed to assign teacher."));
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

  const filteredStudents = useMemo(
    () => students.filter((student) => matchesSearch(student, searchQuery)),
    [searchQuery, students],
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

  const tableColumnCount = 6;
  const tableMinWidth = "min-w-[920px]";

  const inputStyle: CSSProperties = {
    borderColor: C.inputBorder,
    backgroundColor: C.input,
    color: C.textPrimary,
  };

  return (
    <div
      className="relative flex h-full min-h-0 flex-col"
      style={{ backgroundColor: C.surface }}
    >
      <div
        className="flex flex-shrink-0 flex-col gap-3 px-4 py-3 sm:px-5"
        style={{ borderBottom: `1px solid ${C.border}` }}
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm" style={{ color: C.textSecondary }}>
            {students.length} enrolled student{students.length === 1 ? "" : "s"}
          </p>
          <div className="relative min-w-[12rem] max-w-xs flex-1 sm:max-w-sm">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2"
              style={{ color: C.textTertiary }}
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
      </div>

      <div className="relative min-h-0 flex-1 overflow-hidden">
        {loading ? (
          <SchoolAdminTableSkeleton
            C={C}
            rows={8}
            columns={tableColumnCount}
            showFilters={false}
            label="Loading students"
          />
        ) : error ? (
          <p className="px-4 py-8 text-sm sm:px-5" style={{ color: C.error }}>
            {error}
          </p>
        ) : students.length === 0 ? (
          <div className="px-4 py-10 sm:px-5">
            <p className="text-sm leading-relaxed" style={{ color: C.textSecondary }}>
              No enrolled students yet. Mark applications as enrolled in Admissions to add
              students to your roster.
            </p>
            <Link
              href={submissionsPath}
              className="mt-3 inline-block text-sm font-medium underline-offset-2 hover:underline"
              style={{ color: C.accent }}
            >
              Go to Admissions Submissions
            </Link>
          </div>
        ) : filteredStudents.length === 0 ? (
          <p className="px-4 py-8 text-sm sm:px-5" style={{ color: C.textSecondary }}>
            No students match your search.
          </p>
        ) : (
          <div className="h-full overflow-auto" style={{ backgroundColor: C.surface }}>
            <table className={`w-full ${tableMinWidth} border-collapse text-left text-sm`}>
              <thead
                className="sticky top-0 z-[1]"
                style={{
                  backgroundColor: C.surface,
                  borderBottom: `2px solid ${C.border}`,
                }}
              >
                <tr>
                  {["Student", "Grade", "Program", "Teacher", "Parent", "Enrolled"].map(
                    (heading, index, headings) => {
                      const isLast = index === headings.length - 1;
                      return (
                        <th
                          key={heading}
                          className="px-3 py-2.5 sm:px-4"
                          style={columnDividerStyle(C, isLast)}
                        >
                          <span
                            className="inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide"
                            style={studentColumnHeaderBadgeStyle(heading, C)}
                          >
                            {heading}
                          </span>
                        </th>
                      );
                    },
                  )}
                </tr>
              </thead>
              <tbody>
                {visibleStudents.map((student) => {
                  const isSelected = student.id === selectedId;
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
                        backgroundColor: isSelected
                          ? C.accentLight
                          : hoveredId === student.id
                            ? C.elevated
                            : C.surface,
                        borderBottom: `1px solid ${C.border}`,
                        borderLeft: `3px solid ${isSelected ? C.accent : "transparent"}`,
                      }}
                    >
                      <td
                        className="px-3 py-3 sm:px-4"
                        style={{ color: C.textPrimary, ...columnDividerStyle(C, false) }}
                      >
                        <div className="font-medium">
                          {formatEnrolledStudentName(student)}
                        </div>
                      </td>
                      <td
                        className="px-3 py-3 sm:px-4"
                        style={{ color: C.textSecondary, ...columnDividerStyle(C, false) }}
                      >
                        {formatStudentGrade(student.grade) ?? "—"}
                      </td>
                      <td
                        className="px-3 py-3 sm:px-4"
                        style={{ color: C.textSecondary, ...columnDividerStyle(C, false) }}
                      >
                        <div className="max-w-[14rem] truncate">{programLabel}</div>
                      </td>
                      <td
                        className="px-3 py-3 sm:px-4"
                        style={{ color: C.textSecondary, ...columnDividerStyle(C, false) }}
                      >
                        <StudentTeacherAssignSelect
                          C={C}
                          studentId={student.id}
                          assignedTeacherId={student.assignedTeacherId}
                          activeStaff={activeStaff}
                          staffPath={staffPath}
                          disabled={assigningStudentId === student.id}
                          onAssign={handleAssignTeacher}
                        />
                      </td>
                      <td
                        className="px-3 py-3 sm:px-4"
                        style={{ color: C.textSecondary, ...columnDividerStyle(C, false) }}
                      >
                        <div className="font-medium" style={{ color: C.textPrimary }}>
                          {student.primaryContactName ?? "—"}
                        </div>
                        {student.primaryContactEmail ? (
                          <div
                            className="mt-0.5 max-w-[14rem] truncate text-xs"
                            style={{ color: C.textTertiary }}
                          >
                            {student.primaryContactEmail}
                          </div>
                        ) : null}
                      </td>
                      <td
                        className="px-3 py-3 sm:px-4"
                        style={{ color: C.textSecondary, ...columnDividerStyle(C, true) }}
                      >
                        {formatEnrolledDate(student.enrolledAt)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {hasMoreStudents ? (
              <div
                className="flex justify-center px-4 py-3 sm:px-5"
                style={{ borderTop: `1px solid ${C.border}` }}
              >
                <button
                  type="button"
                  onClick={() =>
                    setVisibleCount((count) => count + STUDENTS_PAGE_SIZE)
                  }
                  className="text-sm font-medium underline-offset-2 hover:underline"
                  style={{ color: C.accent }}
                >
                  Show more students
                </button>
              </div>
            ) : null}
          </div>
        )}
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
            onAssignTeacher={handleAssignTeacher}
            onClose={() => setSelectedId(null)}
          />
        ) : null}
      </AnimatePresence>
    </div>
  );
}
