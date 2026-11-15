"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { GraduationCap, Plus, UserMinus } from "lucide-react";
import { BusyLabel, GardenEmptyState, GardenLoadError, gBtnOutlineXs } from "@/components/school-admin/garden/kit";
import {
  GardenAvatar,
  GardenGroupHeading,
  GardenPickerSheet,
  type GardenPickerOption,
} from "@/components/school-admin/garden/blocks";
import { useAdminAction, NOT_SAVED } from "@/components/school-admin/garden/useAdminAction";
import { GSkeleton, gBtnOutlineSm, gLinkSm } from "@/components/school-parent/garden/ui";
import {
  formatEnrolledStudentName,
  formatStudentGrade,
  listOrgEnrolledStudents,
  studentHasAssignedTeacher,
  type AdminEnrolledStudentSummary,
} from "@/lib/school-admin/enrolled-students";
import { schoolAdminPath } from "@/lib/organization-settings/admin-routes";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";
import { formatActionError } from "@/lib/school-admin/admin-toast";
import { reportPortalOperationalError } from "@/lib/portal-operational-errors";
import { createClient } from "@/utils/supabase/client";

const UNASSIGNED = "Unassigned to classroom";

function classroomLabel(student: AdminEnrolledStudentSummary): string {
  return student.classroomNames.length > 0 ? student.classroomNames.join(", ") : UNASSIGNED;
}

function groupStudentsByClassroom(students: AdminEnrolledStudentSummary[]): [string, AdminEnrolledStudentSummary[]][] {
  const buckets = new Map<string, AdminEnrolledStudentSummary[]>();
  for (const student of students) {
    const label = classroomLabel(student);
    buckets.set(label, [...(buckets.get(label) ?? []), student]);
  }
  return [...buckets.entries()].sort(([left], [right]) => {
    if (left === UNASSIGNED) return 1;
    if (right === UNASSIGNED) return -1;
    return left.localeCompare(right);
  });
}

function studentMeta(student: AdminEnrolledStudentSummary): string {
  const grade = formatStudentGrade(student.grade) ?? "—";
  const programs = student.programNames.length > 0 ? student.programNames.join(", ") : "—";
  return `${grade} · ${programs}`;
}

type StaffAssignedStudentsSectionProps = {
  slug: string;
  organizationId: string;
  staffMemberId: string;
  staffMemberName: string;
  staffIsActive: boolean;
  /** Kept for callers; the Garden section reads Garden tokens. */
  C?: AdminThemeTokens;
  embedded?: boolean;
  previewMode?: boolean;
  onAssignmentsChanged?: () => void;
};

/**
 * Learners assigned to one staff member (Staff → Learners & groups). Garden
 * look; assign through a picker that stays open on failure, unassign with
 * an Undo toast.
 */
export default function StaffAssignedStudentsSection({
  slug,
  organizationId,
  staffMemberId,
  staffMemberName,
  staffIsActive,
  previewMode = false,
  onAssignmentsChanged,
}: StaffAssignedStudentsSectionProps) {
  const supabase = useMemo(() => createClient(), []);
  const studentsPath = schoolAdminPath(slug, "my_school", "students");
  const action = useAdminAction();
  const onChangedRef = useRef(onAssignmentsChanged);
  useEffect(() => {
    onChangedRef.current = onAssignmentsChanged;
  }, [onAssignmentsChanged]);

  const [students, setStudents] = useState<AdminEnrolledStudentSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [enrolled, setEnrolled] = useState<AdminEnrolledStudentSummary[] | null>(null);
  const [enrolledLoading, setEnrolledLoading] = useState(false);
  const [enrolledError, setEnrolledError] = useState<string | null>(null);

  const loadAssigned = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/school/${slug}/staff/${staffMemberId}/students`);
      const body = (await response.json().catch(() => ({}))) as { students?: AdminEnrolledStudentSummary[]; error?: string };
      if (!response.ok) throw new Error(body.error ?? "Failed to load assigned students.");
      setStudents(body.students ?? []);
    } catch (loadError) {
      void reportPortalOperationalError(
        "school_admin",
        { organizationId, operation: "staff.assigned_students.load", error: "" },
        loadError,
      );
      setError(formatActionError(loadError, "Failed to load assigned students."));
    } finally {
      setLoading(false);
    }
  }, [organizationId, slug, staffMemberId]);

  useEffect(() => {
    queueMicrotask(() => {
      void loadAssigned();
    });
  }, [loadAssigned]);

  const loadEnrolled = useCallback(async () => {
    setEnrolledLoading(true);
    setEnrolledError(null);
    try {
      const rows = await listOrgEnrolledStudents(supabase, organizationId, { limit: 500 });
      setEnrolled(rows);
    } catch (loadError) {
      void reportPortalOperationalError(
        "school_admin",
        { organizationId, operation: "staff.assigned_students.load_enrolled", error: "" },
        loadError,
      );
      setEnrolledError(formatActionError(loadError, "Failed to load enrolled students."));
    } finally {
      setEnrolledLoading(false);
    }
  }, [organizationId, supabase]);

  const openSheet = () => {
    setSheetOpen(true);
    if (enrolled == null) void loadEnrolled();
  };

  const syncEnrolled = useCallback(
    (studentIds: string[], assigned: boolean) => {
      setEnrolled((current) =>
        current?.map((row) => {
          if (!studentIds.includes(row.id)) return row;
          const others = row.assignedTeachers.filter((t) => t.id !== staffMemberId);
          const assignedTeachers = assigned
            ? [...others, { id: staffMemberId, name: staffMemberName }].sort((a, b) => a.name.localeCompare(b.name))
            : others;
          return { ...row, assignedTeachers, assignedTeacherNames: assignedTeachers.map((t) => t.name).join(", ") };
        }) ?? null,
      );
    },
    [staffMemberId, staffMemberName],
  );

  const patchAssignments = useCallback(
    async (payload: Record<string, unknown>, fallback: string) => {
      const response = await fetch(`/api/school/${slug}/staff/${staffMemberId}/students`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(body?.error ?? fallback);
      }
    },
    [slug, staffMemberId],
  );

  const assign = useCallback(
    async (studentIds: string[], options?: { undo?: boolean }) => {
      const names = (enrolled ?? students)
        .filter((s) => studentIds.includes(s.id))
        .map((s) => formatEnrolledStudentName(s));
      const result = await action.run(
        async () => {
          try {
            await patchAssignments({ studentIds }, "Failed to assign students.");
          } catch (err) {
            void reportPortalOperationalError(
              "school_admin",
              { organizationId, operation: "staff.assigned_students.assign", error: "" },
              err,
            );
            throw err;
          }
          await loadAssigned();
          syncEnrolled(studentIds, true);
          onChangedRef.current?.();
        },
        {
          key: options?.undo ? "staff-learners-undo" : "staff-learners-assign",
          id: "staff-learners-assign",
          flashKey: studentIds[0] ?? null,
          success: {
            title: options?.undo
              ? `${names[0] ?? "Student"} is back with ${staffMemberName}.`
              : studentIds.length === 1
                ? `${names[0] ?? "Student"} assigned to ${staffMemberName}.`
                : `${studentIds.length} students assigned to ${staffMemberName}.`,
            description: options?.undo ? undefined : "They now show on this staff member's learners list.",
          },
          error: {
            title: studentIds.length === 1 ? "Couldn't assign the student." : "Couldn't assign the students.",
            description: NOT_SAVED,
            fallback: "Failed to assign students.",
          },
        },
      );
      return result.ok;
    },
    [action, enrolled, loadAssigned, organizationId, patchAssignments, staffMemberName, students, syncEnrolled],
  );

  const unassign = useCallback(
    async (student: AdminEnrolledStudentSummary) => {
      const name = formatEnrolledStudentName(student);
      await action.run(
        async () => {
          try {
            await patchAssignments({ action: "unassign", studentId: student.id }, "Failed to unassign student.");
          } catch (err) {
            void reportPortalOperationalError(
              "school_admin",
              { organizationId, operation: "staff.assigned_students.unassign", error: "" },
              err,
            );
            throw err;
          }
          setStudents((current) => current.filter((row) => row.id !== student.id));
          syncEnrolled([student.id], false);
          onChangedRef.current?.();
        },
        {
          key: `staff-learners-unassign-${student.id}`,
          id: "staff-learners-unassign",
          success: {
            title: `${name} unassigned from ${staffMemberName}.`,
            description: "Changed your mind? Undo puts them back.",
          },
          successAction: { label: "Undo", onClick: () => void assign([student.id], { undo: true }) },
          error: {
            title: `Couldn't unassign ${name}.`,
            description: `${name} is still assigned.`,
            fallback: "Failed to unassign student.",
          },
        },
      );
    },
    [action, assign, organizationId, patchAssignments, staffMemberName, syncEnrolled],
  );

  const options: GardenPickerOption[] = useMemo(
    () =>
      (enrolled ?? [])
        .filter((student) => !studentHasAssignedTeacher(student, staffMemberId))
        .sort((a, b) => formatEnrolledStudentName(a).localeCompare(formatEnrolledStudentName(b)))
        .map((student) => {
          const others = student.assignedTeachers.filter((t) => t.id !== staffMemberId).map((t) => t.name);
          const grade = formatStudentGrade(student.grade);
          return {
            id: student.id,
            label: formatEnrolledStudentName(student),
            meta: [grade, others.length ? `Teachers: ${others.join(", ")}` : null].filter(Boolean).join(" · ") || undefined,
            group: classroomLabel(student),
            leading: <GardenAvatar name={formatEnrolledStudentName(student)} size="sm" />,
            searchText: `${student.assignedTeacherNames} ${student.familyName ?? ""} ${grade ?? ""}`,
          };
        })
        .sort((a, b) => (a.group === UNASSIGNED ? 1 : b.group === UNASSIGNED ? -1 : a.group.localeCompare(b.group))),
    [enrolled, staffMemberId],
  );

  const canEdit = staffIsActive && !previewMode;

  return (
    <section className="flex flex-col gap-4" data-testid="staff-learners-section">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="m-0 text-[13px] font-extrabold tabular-nums text-[var(--sf-ink)]/70" aria-live="polite">
          {loading ? "Loading learners…" : `${students.length} assigned`}
        </p>
        {canEdit ? (
          <button type="button" onClick={openSheet} className={gBtnOutlineSm} data-testid="staff-learners-assign">
            <Plus className="h-4 w-4" aria-hidden />
            Assign learners
          </button>
        ) : null}
      </div>

      {loading ? (
        <div className="flex flex-col gap-2" role="status" aria-live="polite">
          <span className="sr-only">Loading learners</span>
          {Array.from({ length: 3 }).map((_, i) => (
            <GSkeleton key={i} className="h-[56px] !rounded-[14px]" />
          ))}
        </div>
      ) : error ? (
        <GardenLoadError title="Learners didn't load" description={error} onRetry={() => void loadAssigned()} />
      ) : students.length === 0 ? (
        <GardenEmptyState
          icon={GraduationCap}
          title="No learners assigned yet"
          description={
            canEdit
              ? `Assign the students ${staffMemberName} works with.`
              : "Assign and unassign are disabled while this staff member is inactive."
          }
          action={
            <Link href={studentsPath} className={gLinkSm}>
              View all students
            </Link>
          }
        />
      ) : (
        groupStudentsByClassroom(students).map(([label, group]) => (
          <div key={label}>
            <GardenGroupHeading count={group.length}>{label}</GardenGroupHeading>
            <ul className="m-0 flex list-none flex-col gap-1.5 p-0">
              {group.map((student) => {
                const removing = action.pendingKey === `staff-learners-unassign-${student.id}`;
                const flashed = action.lastSavedKey === student.id;
                const name = formatEnrolledStudentName(student);
                return (
                  <li
                    key={student.id}
                    className={`flex items-center gap-3 rounded-[14px] border-[1.5px] px-3 py-2.5 transition-colors duration-500 ${
                      flashed ? "border-[var(--sf-forest)]/35 bg-[var(--sf-mint)]" : "border-[var(--sf-ink)]/10 bg-white"
                    }`}
                  >
                    <GardenAvatar name={name} size="sm" />
                    <span className="min-w-0 flex-1">
                      <Link
                        href={`${studentsPath}?student=${encodeURIComponent(student.id)}`}
                        className="block truncate text-[14px] font-extrabold text-[var(--sf-ink)] hover:underline"
                      >
                        {name}
                      </Link>
                      <span className="block truncate text-[12.5px] font-semibold text-[var(--sf-soft)]">
                        {studentMeta(student)}
                      </span>
                    </span>
                    {canEdit ? (
                      <button
                        type="button"
                        className={gBtnOutlineXs}
                        disabled={removing}
                        aria-busy={removing || undefined}
                        onClick={() => void unassign(student)}
                        aria-label={`Unassign ${name}`}
                      >
                        <BusyLabel busy={removing} busyLabel="Removing…" icon={<UserMinus className="h-3.5 w-3.5" aria-hidden />}>
                          Unassign
                        </BusyLabel>
                      </button>
                    ) : null}
                  </li>
                );
              })}
            </ul>
          </div>
        ))
      )}

      {!staffIsActive && students.length > 0 ? (
        <p className="m-0 text-[12.5px] font-semibold text-[var(--sf-soft)]">
          Assign and unassign are disabled while this staff member is inactive.
        </p>
      ) : null}

      <GardenPickerSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        kicker="Assign learners"
        title={staffMemberName}
        subtitle="Pick the students this staff member works with."
        options={options}
        initialSelected={[]}
        onSave={(ids) => assign(ids)}
        saveLabel={(count) => (count > 0 ? `Assign ${count}` : "Assign")}
        savingLabel="Assigning…"
        loading={enrolledLoading}
        loadError={enrolledError}
        onRetryLoad={() => void loadEnrolled()}
        searchPlaceholder="Search students, families, teachers"
        testId="staff-learners-picker"
        emptyState={
          <GardenEmptyState
            icon={GraduationCap}
            title="Everyone is already assigned"
            description="All enrolled students are already assigned to this staff member."
          />
        }
      />
    </section>
  );
}
