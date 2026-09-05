"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Home, Loader2 } from "lucide-react";
import StudentPhoto from "@/components/students/StudentPhoto";
import ConfirmDialog from "@/components/school-admin/ConfirmDialog";
import ClassroomStaffAssignSheet from "@/components/school-admin/classrooms/ClassroomStaffAssignSheet";
import ClassroomStaffRow from "@/components/school-admin/classrooms/ClassroomStaffRow";
import ClassroomStudentAssignSheet from "@/components/school-admin/classrooms/ClassroomStudentAssignSheet";
import ClassroomStudentRow from "@/components/school-admin/classrooms/ClassroomStudentRow";
import { useSchoolAdminStoryTheme } from "@/components/school-admin/SchoolAdminStoryShell";
import AdminButton from "@/components/school-admin/ui/story/AdminButton";
import AdminCard from "@/components/school-admin/ui/story/AdminCard";
import AdminChip from "@/components/school-admin/ui/story/AdminChip";
import AdminDisplayHeading from "@/components/school-admin/ui/story/AdminDisplayHeading";
import AdminSectionKicker from "@/components/school-admin/ui/story/AdminSectionKicker";
import AdminTextLink from "@/components/school-admin/ui/story/AdminTextLink";
import { staffDisplayName } from "@/lib/staff/staff-display";
import type { StaffMemberRecord } from "@/lib/staff/staff-members";
import {
  listOrgEnrolledStudents,
  type AdminEnrolledStudentSummary,
} from "@/lib/school-admin/enrolled-students";
import type {
  ClassroomDetail,
  ClassroomStaffAssignment,
  ClassroomStatus,
  ClassroomSummary,
} from "@/lib/school-admin/classrooms";
import { adminToast, formatActionError } from "@/lib/school-admin/admin-toast";
import { schoolAdminPath } from "@/lib/organization-settings/admin-routes";
import { createClient } from "@/utils/supabase/client";

type ProgramOption = { id: string; name: string };

type ClassroomDetailPaneProps = {
  classroom: ClassroomSummary;
  slug: string;
  organizationId: string;
  programs: ProgramOption[];
  staffMembers: StaffMemberRecord[];
  onUpdated: () => void | Promise<void>;
  onDeleted: () => void | Promise<void>;
};

const STATUS_LABELS: Record<ClassroomStatus, string> = {
  open: "Open",
  full: "Full",
  inactive: "Inactive",
};

function statusChipTone(status: ClassroomStatus): "success" | "warning" | "info" {
  if (status === "open") return "success";
  if (status === "full") return "warning";
  return "info";
}

export default function ClassroomDetailPane({
  classroom,
  slug,
  organizationId,
  programs,
  staffMembers,
  onUpdated,
  onDeleted,
}: ClassroomDetailPaneProps) {
  const { theme, C } = useSchoolAdminStoryTheme();
  const supabase = useMemo(() => createClient(), []);

  const [detail, setDetail] = useState<ClassroomDetail | null>(null);
  const [students, setStudents] = useState<AdminEnrolledStudentSummary[]>([]);
  const [loadingDetail, setLoadingDetail] = useState(true);
  const [loadingStudents, setLoadingStudents] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const [editName, setEditName] = useState(classroom.name);
  const [editProgramId, setEditProgramId] = useState(classroom.programId ?? "");
  const [editStatus, setEditStatus] = useState<ClassroomStatus>(classroom.status);
  const [isEditing, setIsEditing] = useState(false);

  const [staffSheetOpen, setStaffSheetOpen] = useState(false);
  const [studentSheetOpen, setStudentSheetOpen] = useState(false);
  const [assigningStaff, setAssigningStaff] = useState(false);
  const [assigningStudents, setAssigningStudents] = useState(false);
  const [removingStaffId, setRemovingStaffId] = useState<string | null>(null);
  const [removingStudentId, setRemovingStudentId] = useState<string | null>(null);
  const [enrolledStudents, setEnrolledStudents] = useState<
    AdminEnrolledStudentSummary[] | null
  >(null);
  const [loadingEnrolled, setLoadingEnrolled] = useState(false);

  const inputStyle: React.CSSProperties = useMemo(
    () => ({
      borderColor: C.inputBorder,
      backgroundColor: C.input,
      color: C.textPrimary,
    }),
    [C],
  );

  const loadDetail = useCallback(async () => {
    setLoadingDetail(true);
    try {
      const response = await fetch(`/api/school/${slug}/classrooms/${classroom.id}`);
      const body = await response.json();
      if (!response.ok) {
        throw new Error(body.error ?? "Failed to load classroom.");
      }
      setDetail(body.classroom as ClassroomDetail);
    } catch (error) {
      adminToast.error(formatActionError(error, "Failed to load classroom."));
    } finally {
      setLoadingDetail(false);
    }
  }, [classroom.id, slug]);

  const loadStudents = useCallback(async () => {
    setLoadingStudents(true);
    try {
      const response = await fetch(
        `/api/school/${slug}/classrooms/${classroom.id}/students`,
      );
      const body = await response.json();
      if (!response.ok) {
        throw new Error(body.error ?? "Failed to load roster.");
      }
      setStudents((body.students as AdminEnrolledStudentSummary[]) ?? []);
    } catch (error) {
      adminToast.error(formatActionError(error, "Failed to load roster."));
      setStudents([]);
    } finally {
      setLoadingStudents(false);
    }
  }, [classroom.id, slug]);

  useEffect(() => {
    queueMicrotask(() => {
      setEditName(classroom.name);
      setEditProgramId(classroom.programId ?? "");
      setEditStatus(classroom.status);
      setIsEditing(false);
      void loadDetail();
      void loadStudents();
    });
  }, [classroom.id, classroom.name, classroom.programId, classroom.status, loadDetail, loadStudents]);

  const loadEnrolledStudents = useCallback(async () => {
    if (enrolledStudents != null) return enrolledStudents;
    setLoadingEnrolled(true);
    try {
      const rows = await listOrgEnrolledStudents(supabase, organizationId, {
        limit: 500,
      });
      setEnrolledStudents(rows);
      return rows;
    } catch (error) {
      adminToast.error(formatActionError(error, "Failed to load students."));
      return [];
    } finally {
      setLoadingEnrolled(false);
    }
  }, [enrolledStudents, organizationId, supabase]);

  const handleSaveOverview = async () => {
    setSaveLoading(true);
    try {
      const response = await fetch(`/api/school/${slug}/classrooms/${classroom.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editName,
          programId: editProgramId || null,
          status: editStatus,
        }),
      });
      const body = await response.json();
      if (!response.ok) {
        throw new Error(body.error ?? "Failed to save classroom.");
      }
      adminToast.success("Classroom updated.");
      setIsEditing(false);
      await onUpdated();
      await loadDetail();
    } catch (error) {
      adminToast.error(formatActionError(error, "Failed to save classroom."));
    } finally {
      setSaveLoading(false);
    }
  };

  const handleDelete = async () => {
    setDeleteLoading(true);
    try {
      const response = await fetch(`/api/school/${slug}/classrooms/${classroom.id}`, {
        method: "DELETE",
      });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(body.error ?? "Failed to delete classroom.");
      }
      adminToast.success("Classroom deleted.");
      setConfirmDelete(false);
      await onDeleted();
    } catch (error) {
      adminToast.error(formatActionError(error, "Failed to delete classroom."));
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleAssignStaff = async (staffMemberId: string, role: "lead" | "assistant") => {
    setAssigningStaff(true);
    try {
      const response = await fetch(
        `/api/school/${slug}/classrooms/${classroom.id}/staff`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ staffMemberId, role }),
        },
      );
      const body = await response.json();
      if (!response.ok) {
        throw new Error(body.error ?? "Failed to assign staff.");
      }
      adminToast.success("Staff assigned.");
      setDetail((current) =>
        current
          ? { ...current, staff: body.staff as ClassroomStaffAssignment[] }
          : current,
      );
      await onUpdated();
      await loadStudents();
    } catch (error) {
      adminToast.error(formatActionError(error, "Failed to assign staff."));
    } finally {
      setAssigningStaff(false);
    }
  };

  const handleRemoveStaff = async (staffMemberId: string) => {
    setRemovingStaffId(staffMemberId);
    try {
      const response = await fetch(
        `/api/school/${slug}/classrooms/${classroom.id}/staff`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ staffMemberId, action: "remove" }),
        },
      );
      const body = await response.json();
      if (!response.ok) {
        throw new Error(body.error ?? "Failed to remove staff.");
      }
      adminToast.success("Staff removed.");
      setDetail((current) =>
        current
          ? { ...current, staff: body.staff as ClassroomStaffAssignment[] }
          : current,
      );
      await onUpdated();
      await loadStudents();
    } catch (error) {
      adminToast.error(formatActionError(error, "Failed to remove staff."));
    } finally {
      setRemovingStaffId(null);
    }
  };

  const handleAssignStudents = async (studentIds: string[]) => {
    setAssigningStudents(true);
    try {
      const response = await fetch(
        `/api/school/${slug}/classrooms/${classroom.id}/students`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ studentIds }),
        },
      );
      const body = await response.json();
      if (!response.ok) {
        throw new Error(body.error ?? "Failed to add students.");
      }
      adminToast.success(
        studentIds.length === 1
          ? "Student added to classroom."
          : `${studentIds.length} students added to classroom.`,
      );
      setStudents((body.students as AdminEnrolledStudentSummary[]) ?? []);
      await onUpdated();
      await loadDetail();
    } catch (error) {
      adminToast.error(formatActionError(error, "Failed to add students."));
    } finally {
      setAssigningStudents(false);
    }
  };

  const handleRemoveStudent = async (studentId: string) => {
    setRemovingStudentId(studentId);
    try {
      const response = await fetch(
        `/api/school/${slug}/classrooms/${classroom.id}/students`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ studentId, action: "remove" }),
        },
      );
      const body = await response.json();
      if (!response.ok) {
        throw new Error(body.error ?? "Failed to remove student.");
      }
      adminToast.success("Student removed from classroom.");
      setStudents((body.students as AdminEnrolledStudentSummary[]) ?? []);
      await onUpdated();
      await loadDetail();
    } catch (error) {
      adminToast.error(formatActionError(error, "Failed to remove student."));
    } finally {
      setRemovingStudentId(null);
    }
  };

  const assignedStaffRoles = useMemo(
    () => new Map((detail?.staff ?? []).map((member) => [member.staffMemberId, member.role])),
    [detail?.staff],
  );

  const rosterStudentIds = useMemo(
    () => new Set(students.map((student) => student.id)),
    [students],
  );

  const staffById = useMemo(
    () => new Map(staffMembers.map((member) => [member.id, member])),
    [staffMembers],
  );

  const leadTeacherAssignment = useMemo(
    () => (detail?.staff ?? []).find((assignment) => assignment.role === "lead"),
    [detail?.staff],
  );

  const leadTeacherMember = leadTeacherAssignment
    ? staffById.get(leadTeacherAssignment.staffMemberId)
    : undefined;

  const headerAvatar = leadTeacherMember ? (
    <StudentPhoto
      name={staffDisplayName(leadTeacherMember)}
      photoUrl={leadTeacherMember.profilePhotoUrl}
      size="2xl"
      shape="square"
      accentColor={C.accent}
      accentGlowColor={C.accentLight}
      className="!h-[59px] !w-[59px] rounded-[20px]"
    />
  ) : (
    <span
      className="grid h-[59px] w-[59px] shrink-0 place-items-center rounded-[20px]"
      style={{ backgroundColor: C.accentLight, color: C.accent }}
      aria-hidden="true"
    >
      <Home className="h-6 w-6" />
    </span>
  );

  return (
    <>
      <AdminCard theme={theme} padding="none" className="min-h-[520px] min-w-0 overflow-hidden">
        <header
          className="flex flex-col gap-3 px-5 py-5 sm:flex-row sm:items-start sm:justify-between"
          style={{ borderBottom: "1px solid #E0E8E0" }}
        >
          <div className="flex min-w-0 items-center gap-3">
            {headerAvatar}
            <div className="min-w-0">
              <AdminSectionKicker theme={theme}>Classroom</AdminSectionKicker>
              <AdminDisplayHeading
                theme={theme}
                as="h2"
                size="section"
                className="mt-1 truncate"
              >
                {classroom.name}
              </AdminDisplayHeading>
              <p className="mt-1 text-[11px]" style={{ color: theme.muted }}>
                {classroom.programName ?? "All programs"} · {classroom.studentCount} students ·{" "}
                {classroom.staffCount} staff
              </p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                <AdminChip theme={theme} tone="info">
                  {classroom.programName ?? "All programs"}
                </AdminChip>
                <AdminChip theme={theme} tone={statusChipTone(classroom.status)}>
                  {STATUS_LABELS[classroom.status]}
                </AdminChip>
                <AdminChip theme={theme} tone="purple">
                  {classroom.studentCount} students
                </AdminChip>
                <AdminChip theme={theme} tone="purple">
                  {classroom.staffCount} staff
                </AdminChip>
              </div>
            </div>
          </div>
          <div className="flex shrink-0 flex-wrap gap-2">
            {!isEditing ? (
              <AdminButton
                theme={theme}
                variant="soft"
                size="compact"
                onClick={() => setIsEditing(true)}
              >
                Edit
              </AdminButton>
            ) : (
              <>
                <AdminButton
                  theme={theme}
                  variant="soft"
                  size="compact"
                  onClick={() => {
                    setEditName(classroom.name);
                    setEditProgramId(classroom.programId ?? "");
                    setEditStatus(classroom.status);
                    setIsEditing(false);
                  }}
                >
                  Cancel
                </AdminButton>
                <AdminButton
                  theme={theme}
                  variant="primary"
                  size="compact"
                  onClick={() => void handleSaveOverview()}
                  disabled={saveLoading}
                >
                  {saveLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
                  Save
                </AdminButton>
              </>
            )}
            <AdminButton
              theme={theme}
              variant="outline"
              size="compact"
              onClick={() => setConfirmDelete(true)}
            >
              Delete
            </AdminButton>
          </div>
        </header>

        <div className="space-y-6 px-5 py-4">
          <section className="space-y-3">
            <h3
              className="text-[10px] font-semibold uppercase tracking-widest"
              style={{ color: C.textTertiary }}
            >
              Overview
            </h3>
            {isEditing ? (
              <div className="grid gap-3 md:grid-cols-2">
                <label className="block space-y-1 md:col-span-2">
                  <span className="text-xs font-medium" style={{ color: C.textSecondary }}>
                    Name
                  </span>
                  <input
                    value={editName}
                    onChange={(event) => setEditName(event.target.value)}
                    className="w-full rounded-md border px-3 py-2 text-sm"
                    style={inputStyle}
                  />
                </label>
                <label className="block space-y-1">
                  <span className="text-xs font-medium" style={{ color: C.textSecondary }}>
                    Program
                  </span>
                  <select
                    value={editProgramId}
                    onChange={(event) => setEditProgramId(event.target.value)}
                    className="w-full rounded-md border px-3 py-2 text-sm"
                    style={inputStyle}
                  >
                    <option value="">All programs</option>
                    {programs.map((program) => (
                      <option key={program.id} value={program.id}>
                        {program.name}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block space-y-1">
                  <span className="text-xs font-medium" style={{ color: C.textSecondary }}>
                    Status
                  </span>
                  <select
                    value={editStatus}
                    onChange={(event) => setEditStatus(event.target.value as ClassroomStatus)}
                    className="w-full rounded-md border px-3 py-2 text-sm"
                    style={inputStyle}
                  >
                    <option value="open">Open</option>
                    <option value="full">Full</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </label>
              </div>
            ) : (
              <p className="text-sm leading-relaxed" style={{ color: theme.muted }}>
                Manage staff assignments and the student roster for this classroom. Lead teachers
                automatically receive roster students as assigned learners.
              </p>
            )}
          </section>

          <section>
            <div className="mb-3 flex items-center justify-between gap-3">
              <h3
                className="text-[10px] font-semibold uppercase tracking-widest"
                style={{ color: C.textTertiary }}
              >
                Staff
                {!loadingDetail ? (
                  <span className="ml-2 normal-case tracking-normal">
                    ({detail?.staff.length ?? 0})
                  </span>
                ) : null}
              </h3>
              <AdminTextLink theme={theme} onClick={() => setStaffSheetOpen(true)}>
                Assign staff →
              </AdminTextLink>
            </div>

            {loadingDetail ? (
              <div className="flex items-center gap-2 py-4 text-sm" style={{ color: C.textTertiary }}>
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading staff…
              </div>
            ) : (detail?.staff.length ?? 0) === 0 ? (
              <p className="text-sm" style={{ color: C.textTertiary }}>
                No staff assigned yet. Add a lead teacher to auto-assign roster students.
              </p>
            ) : (
              <ul className="space-y-2">
                {(detail?.staff ?? []).map((assignment) => {
                  const member = staffById.get(assignment.staffMemberId);
                  return (
                    <li key={assignment.id}>
                      <ClassroomStaffRow
                        member={member}
                        name={member ? undefined : assignment.name}
                        role={assignment.role}
                        theme={theme}
                        C={C}
                        removing={removingStaffId === assignment.staffMemberId}
                        onRemove={() => void handleRemoveStaff(assignment.staffMemberId)}
                      />
                    </li>
                  );
                })}
              </ul>
            )}
          </section>

          <section>
            <div className="mb-3 flex items-center justify-between gap-3">
              <h3
                className="text-[10px] font-semibold uppercase tracking-widest"
                style={{ color: C.textTertiary }}
              >
                Roster
                {!loadingStudents ? (
                  <span className="ml-2 normal-case tracking-normal">({students.length})</span>
                ) : null}
              </h3>
              <AdminTextLink
                theme={theme}
                disabled={loadingEnrolled}
                onClick={() => {
                  void loadEnrolledStudents();
                  setStudentSheetOpen(true);
                }}
              >
                {loadingEnrolled ? "Loading…" : "Add students →"}
              </AdminTextLink>
            </div>

            {loadingStudents ? (
              <div className="flex items-center gap-2 py-4 text-sm" style={{ color: C.textTertiary }}>
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading roster…
              </div>
            ) : students.length === 0 ? (
              <p className="text-sm" style={{ color: C.textTertiary }}>
                No students in this classroom yet.
              </p>
            ) : (
              <ul className="space-y-2">
                {students.map((student) => (
                  <li key={student.id}>
                    <ClassroomStudentRow
                      student={student}
                      classroomProgramName={classroom.programName}
                      theme={theme}
                      C={C}
                      removing={removingStudentId === student.id}
                      onRemove={() => void handleRemoveStudent(student.id)}
                    />
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </AdminCard>

      <ClassroomStaffAssignSheet
        open={staffSheetOpen}
        onClose={() => setStaffSheetOpen(false)}
        classroomName={classroom.name}
        staffMembers={staffMembers}
        assignedStaffRoles={assignedStaffRoles}
        staffPath={schoolAdminPath(slug, "my_school", "staff")}
        saving={assigningStaff}
        C={C}
        onSave={handleAssignStaff}
      />

      <ClassroomStudentAssignSheet
        open={studentSheetOpen}
        onClose={() => setStudentSheetOpen(false)}
        classroomName={classroom.name}
        classroomProgramName={classroom.programName}
        enrolledStudents={enrolledStudents ?? []}
        rosterStudentIds={rosterStudentIds}
        saving={assigningStudents}
        C={C}
        onSave={handleAssignStudents}
      />

      <ConfirmDialog
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={() => void handleDelete()}
        title="Delete classroom?"
        description="Students will be removed from this classroom. Lead teacher assignments synced from this classroom will be updated."
        confirmLabel="Delete classroom"
        variant="destructive"
        loading={deleteLoading}
        C={C}
      />
    </>
  );
}
