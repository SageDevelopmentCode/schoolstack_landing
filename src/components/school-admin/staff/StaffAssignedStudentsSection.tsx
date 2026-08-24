"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Loader2, Plus } from "lucide-react";
import StaffStudentAssignSelect from "@/components/school-admin/staff/StaffStudentAssignSelect";
import {
  formatEnrolledStudentName,
  formatStudentGrade,
  listOrgEnrolledStudents,
  type AdminEnrolledStudentSummary,
} from "@/lib/school-admin/enrolled-students";
import { schoolAdminPath } from "@/lib/organization-settings/admin-routes";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";
import { adminToast, formatActionError } from "@/lib/school-admin/admin-toast";
import { createClient } from "@/utils/supabase/client";

type StaffAssignedStudentsSectionProps = {
  slug: string;
  organizationId: string;
  staffMemberId: string;
  staffIsActive: boolean;
  C: AdminThemeTokens;
  embedded?: boolean;
};

export default function StaffAssignedStudentsSection({
  slug,
  organizationId,
  staffMemberId,
  staffIsActive,
  C,
  embedded = false,
}: StaffAssignedStudentsSectionProps) {
  const supabase = useMemo(() => createClient(), []);
  const studentsPath = schoolAdminPath(slug, "my_school", "students");

  const [students, setStudents] = useState<AdminEnrolledStudentSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAssign, setShowAssign] = useState(false);
  const [enrolledStudents, setEnrolledStudents] = useState<
    AdminEnrolledStudentSummary[] | null
  >(null);
  const [loadingEnrolled, setLoadingEnrolled] = useState(false);
  const [assigningStudentId, setAssigningStudentId] = useState<string | null>(
    null,
  );
  const [unassigningStudentId, setUnassigningStudentId] = useState<
    string | null
  >(null);

  const loadAssignedStudents = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/school/${slug}/staff/${staffMemberId}/students`,
      );
      const body = await response.json();

      if (!response.ok) {
        throw new Error(body.error ?? "Failed to load assigned students.");
      }

      setStudents((body.students as AdminEnrolledStudentSummary[]) ?? []);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Failed to load assigned students.",
      );
      setStudents([]);
    } finally {
      setLoading(false);
    }
  }, [slug, staffMemberId]);

  useEffect(() => {
    queueMicrotask(() => {
      void loadAssignedStudents();
    });
  }, [loadAssignedStudents]);

  const loadEnrolledStudents = useCallback(async () => {
    if (enrolledStudents != null) return enrolledStudents;

    setLoadingEnrolled(true);
    try {
      const rows = await listOrgEnrolledStudents(supabase, organizationId, {
        limit: 500,
      });
      setEnrolledStudents(rows);
      return rows;
    } catch (loadError) {
      adminToast.error(
        formatActionError(loadError, "Failed to load enrolled students."),
      );
      return [];
    } finally {
      setLoadingEnrolled(false);
    }
  }, [enrolledStudents, organizationId, supabase]);

  const handleToggleAssign = async () => {
    if (!showAssign) {
      await loadEnrolledStudents();
    }
    setShowAssign((open) => !open);
  };

  const handleAssignStudent = async (studentId: string) => {
    setAssigningStudentId(studentId);

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
        throw new Error(payload?.error ?? "Failed to assign student.");
      }

      const result = (await response.json()) as {
        assignedTeacherId: string | null;
        assignedTeacherName: string | null;
      };

      adminToast.success("Student assigned.");
      setShowAssign(false);
      await loadAssignedStudents();

      if (enrolledStudents) {
        setEnrolledStudents((current) =>
          (current ?? []).map((row) =>
            row.id === studentId
              ? {
                  ...row,
                  assignedTeacherId: result.assignedTeacherId,
                  assignedTeacherName: result.assignedTeacherName,
                }
              : row,
          ),
        );
      }
    } catch (assignError) {
      adminToast.error(
        formatActionError(assignError, "Failed to assign student."),
      );
    } finally {
      setAssigningStudentId(null);
    }
  };

  const handleUnassignStudent = async (studentId: string) => {
    setUnassigningStudentId(studentId);

    try {
      const response = await fetch(
        `/api/school/${slug}/students/${studentId}/teacher`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ staffMemberId: null }),
        },
      );

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as {
          error?: string;
        } | null;
        throw new Error(payload?.error ?? "Failed to unassign student.");
      }

      adminToast.success("Student unassigned.");
      setStudents((current) => current.filter((row) => row.id !== studentId));

      if (enrolledStudents) {
        setEnrolledStudents((current) =>
          (current ?? []).map((row) =>
            row.id === studentId
              ? { ...row, assignedTeacherId: null, assignedTeacherName: null }
              : row,
          ),
        );
      }
    } catch (unassignError) {
      adminToast.error(
        formatActionError(unassignError, "Failed to unassign student."),
      );
    } finally {
      setUnassigningStudentId(null);
    }
  };

  return (
    <section>
      <div className="mb-3 flex items-center justify-between gap-3">
        {embedded ? (
          <span className="text-xs" style={{ color: C.textTertiary }}>
            {!loading ? `${students.length} assigned` : "Loading…"}
          </span>
        ) : (
          <h3
            className="text-[10px] font-semibold uppercase tracking-widest"
            style={{ color: C.textTertiary }}
          >
            Students
            {!loading ? (
              <span className="ml-2 normal-case tracking-normal">
                ({students.length})
              </span>
            ) : null}
          </h3>
        )}
        {staffIsActive ? (
          <button
            type="button"
            onClick={() => void handleToggleAssign()}
            disabled={loadingEnrolled}
            className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium disabled:opacity-60"
            style={{ color: C.accent }}
          >
            {loadingEnrolled ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Plus className="h-3.5 w-3.5" />
            )}
            Assign student
          </button>
        ) : null}
      </div>

      {showAssign && staffIsActive ? (
        <div
          className="mb-4 rounded-md border p-3"
          style={{ borderColor: C.border, backgroundColor: C.surface }}
        >
          <StaffStudentAssignSelect
            C={C}
            staffMemberId={staffMemberId}
            enrolledStudents={enrolledStudents ?? []}
            disabled={!staffIsActive}
            assigning={assigningStudentId != null}
            onAssign={handleAssignStudent}
          />
        </div>
      ) : null}

      {loading ? (
        <div className="flex items-center gap-2 py-4 text-sm" style={{ color: C.textTertiary }}>
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading students…
        </div>
      ) : error ? (
        <p className="text-sm" style={{ color: C.error }}>
          {error}
        </p>
      ) : students.length === 0 ? (
        <p className="text-sm" style={{ color: C.textTertiary }}>
          No students assigned yet.{" "}
          <Link href={studentsPath} className="underline-offset-2 hover:underline" style={{ color: C.accent }}>
            View all students
          </Link>
        </p>
      ) : (
        <ul className="space-y-2">
          {students.map((student) => {
            const programLabel =
              student.programNames.length > 0
                ? student.programNames.join(", ")
                : "—";
            const gradeLabel = formatStudentGrade(student.grade) ?? "—";
            const isUnassigning = unassigningStudentId === student.id;

            return (
              <li
                key={student.id}
                className="flex items-start justify-between gap-3 rounded-md border px-3 py-2.5"
                style={{ borderColor: C.border, backgroundColor: C.surface }}
              >
                <div className="min-w-0">
                  <Link
                    href={`${studentsPath}?student=${encodeURIComponent(student.id)}`}
                    className="text-sm font-medium hover:underline"
                    style={{ color: C.textPrimary }}
                  >
                    {formatEnrolledStudentName(student)}
                  </Link>
                  <p className="mt-0.5 text-xs" style={{ color: C.textTertiary }}>
                    {gradeLabel} · {programLabel}
                  </p>
                </div>
                {staffIsActive ? (
                  <button
                    type="button"
                    disabled={isUnassigning}
                    onClick={() => void handleUnassignStudent(student.id)}
                    className="shrink-0 text-xs font-medium disabled:opacity-60"
                    style={{ color: C.textSecondary }}
                  >
                    {isUnassigning ? "Removing…" : "Unassign"}
                  </button>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}

      {!staffIsActive && students.length > 0 ? (
        <p className="mt-2 text-xs" style={{ color: C.textTertiary }}>
          Assign and unassign are disabled while this staff member is inactive.
        </p>
      ) : null}
    </section>
  );
}
