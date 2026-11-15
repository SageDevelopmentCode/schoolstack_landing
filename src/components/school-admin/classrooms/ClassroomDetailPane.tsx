"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Check, Home, Pencil, Plus, Trash2, UserMinus, UserPlus, Users, X } from "lucide-react";
import ConfirmDialog from "@/components/school-admin/ConfirmDialog";
import {
  BusyLabel,
  GardenEmptyState,
  GardenField,
  GardenLoadError,
  GardenNotice,
  GardenSelect,
  gBtnOutlineXs,
  gInputClass,
  useGardenFieldId,
} from "@/components/school-admin/garden/kit";
import {
  GardenAvatar,
  GardenGroupHeading,
  GardenPickerSheet,
  type GardenPickerOption,
} from "@/components/school-admin/garden/blocks";
import { gBtnDangerTight } from "@/components/school-admin/garden/skin";
import { useAdminAction, NOT_SAVED } from "@/components/school-admin/garden/useAdminAction";
import {
  GChip,
  GSkeleton,
  G_TOGGLE,
  G_TOGGLE_OFF,
  G_TOGGLE_ON,
  gBtnOutlineSm,
  gBtnPopSm,
  gLinkSm,
} from "@/components/school-parent/garden/ui";
import { schoolAdminPath } from "@/lib/organization-settings/admin-routes";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";
import {
  formatEnrolledStudentName,
  formatStudentGrade,
  listOrgEnrolledStudents,
  type AdminEnrolledStudentSummary,
} from "@/lib/school-admin/enrolled-students";
import type {
  ClassroomDetail,
  ClassroomStaffAssignment,
  ClassroomStaffRole,
  ClassroomStatus,
  ClassroomSummary,
} from "@/lib/school-admin/classrooms";
import { groupStudentsForClassroomPicker, isStudentInClassroomProgram } from "@/lib/school-admin/classroom-roster-ui";
import { formatActionError } from "@/lib/school-admin/admin-toast";
import { reportPortalOperationalError } from "@/lib/portal-operational-errors";
import { staffDisplayName } from "@/lib/staff/staff-display";
import { createClient } from "@/utils/supabase/client";
import { CLASSROOM_STATUS_LABELS, type ClassroomsModel } from "./useClassroomsModel";
import { CLASSROOM_STATUS_TONES } from "./ClassroomsPage";

const ROLE_LABELS: Record<ClassroomStaffRole, string> = { lead: "Lead teacher", assistant: "Assistant" };

function plural(count: number, one: string, many = `${one}s`) {
  return `${count} ${count === 1 ? one : many}`;
}

async function readJson(response: Response) {
  return ((await response.json().catch(() => ({}))) ?? {}) as Record<string, unknown>;
}

export default function ClassroomDetailPane({
  model,
  classroom,
  C,
}: {
  model: ClassroomsModel;
  classroom: ClassroomSummary;
  C: AdminThemeTokens;
}) {
  const { slug, organizationId, previewMode } = model;
  const supabase = useMemo(() => createClient(), []);
  const action = useAdminAction();
  const base = `/api/school/${slug}/classrooms/${classroom.id}`;
  const staffPath = schoolAdminPath(slug, "my_school", "staff");
  const studentsPath = schoolAdminPath(slug, "my_school", "students");

  const [detail, setDetail] = useState<ClassroomDetail | null>(null);
  const [detailError, setDetailError] = useState<string | null>(null);
  const [students, setStudents] = useState<AdminEnrolledStudentSummary[]>([]);
  const [studentsError, setStudentsError] = useState<string | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(true);
  const [loadingStudents, setLoadingStudents] = useState(true);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState({ name: classroom.name, programId: classroom.programId ?? "", status: classroom.status });
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [staffSheetOpen, setStaffSheetOpen] = useState(false);
  const [staffRole, setStaffRole] = useState<ClassroomStaffRole>("lead");
  const [studentSheetOpen, setStudentSheetOpen] = useState(false);
  const [enrolled, setEnrolled] = useState<AdminEnrolledStudentSummary[] | null>(null);
  const [enrolledLoading, setEnrolledLoading] = useState(false);
  const [enrolledError, setEnrolledError] = useState<string | null>(null);

  const report = useCallback(
    (operation: string, error: unknown) =>
      void reportPortalOperationalError("school_admin", { organizationId, operation, error: "" }, error),
    [organizationId],
  );

  const loadDetail = useCallback(async () => {
    setLoadingDetail(true);
    try {
      const response = await fetch(base);
      const body = await readJson(response);
      if (!response.ok) throw new Error((body.error as string) ?? "Failed to load classroom.");
      setDetail(body.classroom as ClassroomDetail);
      setDetailError(null);
    } catch (error) {
      setDetailError(formatActionError(error, "Failed to load classroom."));
      report("classrooms.load_detail", error);
    } finally {
      setLoadingDetail(false);
    }
  }, [base, report]);

  const loadStudents = useCallback(async () => {
    setLoadingStudents(true);
    try {
      const response = await fetch(`${base}/students`);
      const body = await readJson(response);
      if (!response.ok) throw new Error((body.error as string) ?? "Failed to load roster.");
      setStudents((body.students as AdminEnrolledStudentSummary[]) ?? []);
      setStudentsError(null);
    } catch (error) {
      setStudentsError(formatActionError(error, "Failed to load roster."));
      report("classrooms.load_roster", error);
    } finally {
      setLoadingStudents(false);
    }
  }, [base, report]);

  useEffect(() => {
    if (previewMode) {
      // Demo: no API. Show the lead teachers the summary already knows.
      queueMicrotask(() => {
        setDetail({
          ...classroom,
          staff: classroom.leadTeacherNames.map((name, i) => ({
            id: `preview-lead-${i}`,
            staffMemberId:
              model.staffMembers.find((m) => staffDisplayName(m) === name)?.id ?? `preview-lead-${i}`,
            name,
            role: "lead" as const,
          })),
        });
        setLoadingDetail(false);
        setLoadingStudents(false);
      });
      return;
    }
    queueMicrotask(() => {
      void loadDetail();
      void loadStudents();
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- preview seeds once per classroom
  }, [loadDetail, loadStudents, previewMode]);

  const loadEnrolled = useCallback(async () => {
    setEnrolledLoading(true);
    setEnrolledError(null);
    try {
      setEnrolled(await listOrgEnrolledStudents(supabase, organizationId, { limit: 500 }));
    } catch (error) {
      setEnrolledError(formatActionError(error, "Failed to load students."));
      report("classrooms.load_enrolled_students", error);
    } finally {
      setEnrolledLoading(false);
    }
  }, [organizationId, report, supabase]);

  const refreshList = useCallback(() => model.loadClassrooms({ silent: true }), [model]);
  const refreshRef = useRef(refreshList);
  useEffect(() => {
    refreshRef.current = refreshList;
  }, [refreshList]);

  /* ---- overview ---- */
  const saveOverview = async () => {
    const next = draft;
    const result = await action.run(
      async () => {
        try {
          const response = await fetch(base, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: next.name, programId: next.programId || null, status: next.status }),
          });
          const body = await readJson(response);
          if (!response.ok) throw new Error((body.error as string) ?? "Failed to save classroom.");
        } catch (error) {
          report("classrooms.save", error);
          throw error;
        }
        await refreshRef.current();
        await loadDetail();
      },
      {
        key: "classroom-save",
        id: `classroom-save-${classroom.id}`,
        flashKey: "overview",
        success: {
          title: `${next.name.trim() || "Classroom"} updated.`,
          description: `${model.programs.find((p) => p.id === next.programId)?.name ?? "All programs"} · ${CLASSROOM_STATUS_LABELS[next.status]}.`,
        },
        error: { title: "Couldn't save the classroom.", description: `${NOT_SAVED} Your edits are still in the form.`, fallback: "Failed to save classroom." },
      },
    );
    if (result.ok) setEditing(false);
  };

  const deleteClassroom = async () => {
    const result = await action.run(
      async () => {
        try {
          const response = await fetch(base, { method: "DELETE" });
          const body = await readJson(response);
          if (!response.ok) throw new Error((body.error as string) ?? "Failed to delete classroom.");
        } catch (error) {
          report("classrooms.delete", error);
          throw error;
        }
      },
      {
        key: "classroom-delete",
        id: "classroom-delete",
        success: { title: `${classroom.name} deleted.`, description: "Its students and staff are no longer grouped in this classroom." },
        error: { title: "Couldn't delete the classroom.", description: `${classroom.name} is unchanged.`, fallback: "Failed to delete classroom." },
      },
    );
    if (result.ok) {
      setConfirmDelete(false);
      void model.loadClassrooms();
    }
  };

  /* ---- staff ---- */
  const patchStaff = async (payload: Record<string, unknown>, fallback: string) => {
    const response = await fetch(`${base}/staff`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const body = await readJson(response);
    if (!response.ok) throw new Error((body.error as string) ?? fallback);
    setDetail((current) => (current ? { ...current, staff: body.staff as ClassroomStaffAssignment[] } : current));
  };

  const staffName = (id: string) => {
    const member = model.staffMembers.find((m) => m.id === id);
    return member ? staffDisplayName(member) : detail?.staff.find((s) => s.staffMemberId === id)?.name ?? "Staff member";
  };

  const assignStaff = async (staffMemberId: string, role: ClassroomStaffRole, options?: { undo?: boolean }) => {
    const name = staffName(staffMemberId);
    const result = await action.run(
      async () => {
        try {
          await patchStaff({ staffMemberId, role }, "Failed to assign staff.");
        } catch (error) {
          report("classrooms.assign_staff", error);
          throw error;
        }
        await refreshRef.current();
        await loadStudents();
      },
      {
        key: options?.undo ? "classroom-staff-undo" : "classroom-staff-assign",
        id: "classroom-staff-assign",
        flashKey: `staff-${staffMemberId}`,
        success: {
          title: options?.undo ? `${name} is back in ${classroom.name}.` : `${name} assigned as ${ROLE_LABELS[role].toLowerCase()}.`,
          description:
            role === "lead" && !options?.undo
              ? `${classroom.name}'s roster students are now ${name.split(" ")[0]}'s assigned learners.`
              : undefined,
        },
        error: { title: "Couldn't assign staff.", description: NOT_SAVED, fallback: "Failed to assign staff." },
      },
    );
    return result.ok;
  };

  const removeStaff = async (assignment: ClassroomStaffAssignment) => {
    const name = staffName(assignment.staffMemberId);
    await action.run(
      async () => {
        try {
          await patchStaff({ staffMemberId: assignment.staffMemberId, action: "remove" }, "Failed to remove staff.");
        } catch (error) {
          report("classrooms.remove_staff", error);
          throw error;
        }
        await refreshRef.current();
        await loadStudents();
      },
      {
        key: `classroom-staff-remove-${assignment.staffMemberId}`,
        id: "classroom-staff-remove",
        success: { title: `${name} removed from ${classroom.name}.`, description: "Changed your mind? Undo puts them back." },
        successAction: { label: "Undo", onClick: () => void assignStaff(assignment.staffMemberId, assignment.role, { undo: true }) },
        error: { title: `Couldn't remove ${name}.`, description: `${name} is still assigned.`, fallback: "Failed to remove staff." },
      },
    );
  };

  /* ---- roster ---- */
  const patchStudents = async (payload: Record<string, unknown>, fallback: string) => {
    const response = await fetch(`${base}/students`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const body = await readJson(response);
    if (!response.ok) throw new Error((body.error as string) ?? fallback);
    setStudents((body.students as AdminEnrolledStudentSummary[]) ?? []);
  };

  const addStudents = async (studentIds: string[], options?: { undo?: boolean; name?: string }) => {
    const first = options?.name ?? (enrolled ?? []).find((s) => s.id === studentIds[0]);
    const firstName = typeof first === "string" ? first : first ? formatEnrolledStudentName(first) : "Student";
    const result = await action.run(
      async () => {
        try {
          await patchStudents({ studentIds }, "Failed to add students.");
        } catch (error) {
          report("classrooms.add_students", error);
          throw error;
        }
        await refreshRef.current();
        await loadDetail();
      },
      {
        key: options?.undo ? "classroom-students-undo" : "classroom-students-add",
        id: "classroom-students-add",
        flashKey: `student-${studentIds[0]}`,
        success: {
          title: options?.undo
            ? `${firstName} is back in ${classroom.name}.`
            : studentIds.length === 1
              ? `${firstName} added to ${classroom.name}.`
              : `${studentIds.length} students added to ${classroom.name}.`,
          description: options?.undo ? undefined : "They're on the roster now.",
        },
        error: { title: "Couldn't add to the roster.", description: NOT_SAVED, fallback: "Failed to add students." },
      },
    );
    return result.ok;
  };

  const removeStudent = async (student: AdminEnrolledStudentSummary) => {
    const name = formatEnrolledStudentName(student);
    await action.run(
      async () => {
        try {
          await patchStudents({ studentId: student.id, action: "remove" }, "Failed to remove student.");
        } catch (error) {
          report("classrooms.remove_student", error);
          throw error;
        }
        await refreshRef.current();
        await loadDetail();
      },
      {
        key: `classroom-student-remove-${student.id}`,
        id: "classroom-student-remove",
        success: { title: `${name} removed from ${classroom.name}.`, description: "Changed your mind? Undo puts them back." },
        successAction: { label: "Undo", onClick: () => void addStudents([student.id], { undo: true, name }) },
        error: { title: `Couldn't remove ${name}.`, description: `${name} is still on the roster.`, fallback: "Failed to remove student." },
      },
    );
  };

  /* ---- picker options ---- */
  const assignedRoles = useMemo(
    () => new Map((detail?.staff ?? []).map((s) => [s.staffMemberId, s.role])),
    [detail?.staff],
  );
  const staffOptions: GardenPickerOption[] = useMemo(
    () =>
      [...model.staffMembers]
        .sort((a, b) => staffDisplayName(a).localeCompare(staffDisplayName(b)))
        .map((member) => {
          const assigned = assignedRoles.get(member.id);
          return {
            id: member.id,
            label: staffDisplayName(member),
            meta: member.roleTitle || "No job title",
            leading: <GardenAvatar name={staffDisplayName(member)} size="sm" />,
            disabled: Boolean(assigned),
            disabledReason: assigned ? `Already ${ROLE_LABELS[assigned].toLowerCase()} here` : undefined,
            searchText: `${member.email ?? ""} ${member.roleTitle ?? ""}`,
          };
        }),
    [assignedRoles, model.staffMembers],
  );
  const rosterIds = useMemo(() => new Set(students.map((s) => s.id)), [students]);
  const studentOptions: GardenPickerOption[] = useMemo(() => {
    const assignable = (enrolled ?? []).filter((s) => !rosterIds.has(s.id));
    return groupStudentsForClassroomPicker(assignable, classroom.programName).flatMap((group) =>
      group.students.map((student) => ({
        id: student.id,
        label: formatEnrolledStudentName(student),
        meta: [formatStudentGrade(student.grade), student.programNames.join(", ") || "No program"].filter(Boolean).join(" · "),
        group: group.label ?? undefined,
        leading: <GardenAvatar name={formatEnrolledStudentName(student)} size="sm" />,
        searchText: `${student.familyName ?? ""} ${student.assignedTeacherNames}`,
      })),
    );
  }, [classroom.programName, enrolled, rosterIds]);

  const lead = detail?.staff.find((s) => s.role === "lead");
  const statusTone = CLASSROOM_STATUS_TONES[classroom.status];
  const ids = { name: useGardenFieldId("cr-name"), program: useGardenFieldId("cr-program"), status: useGardenFieldId("cr-status") };
  const overviewFlash = action.lastSavedKey === "overview";

  return (
    <section
      id="classroom-detail"
      aria-label={`${classroom.name} classroom`}
      data-testid="classroom-detail"
      className="flex min-w-0 scroll-mt-4 flex-col overflow-hidden rounded-[24px] border-[1.5px] border-[var(--sf-ink)]/12 bg-white shadow-[0_3px_0_0_rgba(43,36,29,0.08)]"
    >
      <header
        className={`flex flex-col gap-4 border-b-[1.5px] border-dashed border-[var(--sf-ink)]/12 px-5 py-5 transition-colors duration-500 sm:flex-row sm:items-start sm:justify-between sm:px-6 ${
          overviewFlash ? "bg-[var(--sf-mint)]/60" : ""
        }`}
      >
        <div className="flex min-w-0 items-center gap-3.5">
          <span aria-hidden className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[15px] bg-[var(--sf-accent-wash)] text-[var(--sf-clay-deep)]">
            <Home className="h-6 w-6" />
          </span>
          <div className="min-w-0">
            <p className="m-0 text-[11px] font-extrabold uppercase tracking-[0.16em] text-[var(--sf-soft)]">Classroom</p>
            <h2 className="sf-display m-0 mt-0.5 truncate text-[1.5rem] leading-tight text-[var(--sf-ink)]">{classroom.name}</h2>
            <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
              <GChip tone="info">{classroom.programName ?? "All programs"}</GChip>
              <GChip tone={statusTone}>{CLASSROOM_STATUS_LABELS[classroom.status]}</GChip>
              <span className="text-[12.5px] font-bold tabular-nums text-[var(--sf-soft)]">
                {plural(classroom.studentCount, "student")} · {classroom.staffCount} staff
              </span>
            </div>
          </div>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          {editing ? (
            <>
              <button type="button" className={gBtnOutlineSm} disabled={action.pendingKey === "classroom-save"} onClick={() => setEditing(false)}>
                <X className="h-4 w-4" aria-hidden />
                Cancel
              </button>
              <button
                type="button"
                className={gBtnPopSm}
                disabled={action.pendingKey === "classroom-save" || !draft.name.trim()}
                aria-busy={action.pendingKey === "classroom-save" || undefined}
                onClick={() => void saveOverview()}
                data-testid="classroom-save"
              >
                <BusyLabel busy={action.pendingKey === "classroom-save"} busyLabel="Saving…" icon={<Check className="h-4 w-4" aria-hidden />}>
                  Save
                </BusyLabel>
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                className={gBtnOutlineSm}
                disabled={previewMode}
                onClick={() => {
                  setDraft({ name: classroom.name, programId: classroom.programId ?? "", status: classroom.status });
                  setEditing(true);
                }}
                data-testid="classroom-edit"
              >
                <Pencil className="h-4 w-4" aria-hidden />
                Edit
              </button>
              <button type="button" className={gBtnDangerTight} disabled={previewMode} onClick={() => setConfirmDelete(true)} data-testid="classroom-delete">
                <Trash2 className="h-4 w-4" aria-hidden />
                Delete
              </button>
            </>
          )}
        </div>
      </header>

      <div className="flex flex-col gap-6 px-5 py-5 sm:px-6">
        {editing ? (
          <div className="grid gap-3 md:grid-cols-2">
            <GardenField id={ids.name} label="Name" required error={draft.name.trim() ? null : "Give the classroom a name."} className="md:col-span-2">
              <input id={ids.name} value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} data-garden-skip className={gInputClass(draft.name.trim() ? null : "x")} />
            </GardenField>
            <GardenField id={ids.program} label="Program">
              <GardenSelect
                id={ids.program}
                value={draft.programId}
                onChange={(value) => setDraft({ ...draft, programId: value })}
                options={[{ value: "", label: "All programs" }, ...model.programs.map((p) => ({ value: p.id, label: p.name }))]}
              />
            </GardenField>
            <GardenField id={ids.status} label="Status">
              <GardenSelect
                id={ids.status}
                value={draft.status}
                onChange={(value) => setDraft({ ...draft, status: value as ClassroomStatus })}
                options={[
                  { value: "open", label: "Open" },
                  { value: "full", label: "Full" },
                  { value: "inactive", label: "Inactive" },
                ]}
              />
            </GardenField>
          </div>
        ) : !loadingDetail && !detailError && !lead && classroom.status !== "inactive" ? (
          <GardenNotice
            tone="warning"
            title="No lead teacher yet"
            action={
              previewMode ? null : (
                <button type="button" className={gLinkSm} onClick={() => { setStaffRole("lead"); setStaffSheetOpen(true); }}>
                  Assign a lead teacher
                </button>
              )
            }
          >
            Lead teachers automatically receive roster students as assigned learners.
          </GardenNotice>
        ) : null}

        {/* Staff */}
        <div>
          <GardenGroupHeading
            count={loadingDetail || detailError ? undefined : detail?.staff.length ?? 0}
            action={
              previewMode ? null : (
                <button type="button" className={gBtnOutlineXs} onClick={() => { setStaffRole(lead ? "assistant" : "lead"); setStaffSheetOpen(true); }} disabled={Boolean(detailError)} data-testid="classroom-assign-staff">
                  <UserPlus className="h-3.5 w-3.5" aria-hidden />
                  Assign staff
                </button>
              )
            }
          >
            Staff
          </GardenGroupHeading>
          {loadingDetail ? (
            <GSkeleton className="h-[56px] !rounded-[14px]" />
          ) : detailError ? (
            <GardenLoadError title="Staff didn't load" description={detailError} onRetry={() => void loadDetail()} />
          ) : (detail?.staff.length ?? 0) === 0 ? (
            <p className="m-0 rounded-[16px] bg-[var(--sf-paper)] p-4 text-[13.5px] font-semibold text-[var(--sf-soft)]">
              No staff assigned yet. Add a lead teacher to auto-assign roster students.
            </p>
          ) : (
            <ul className="m-0 flex list-none flex-col gap-1.5 p-0">
              {[...(detail?.staff ?? [])]
                .sort((a, b) => (a.role === b.role ? 0 : a.role === "lead" ? -1 : 1))
                .map((assignment) => {
                  const name = staffName(assignment.staffMemberId);
                  const removing = action.pendingKey === `classroom-staff-remove-${assignment.staffMemberId}`;
                  const flashed = action.lastSavedKey === `staff-${assignment.staffMemberId}`;
                  return (
                    <li
                      key={assignment.id}
                      className={`flex items-center gap-3 rounded-[14px] border-[1.5px] px-3 py-2.5 transition-colors duration-500 ${
                        flashed ? "border-[var(--sf-forest)]/35 bg-[var(--sf-mint)]" : "border-[var(--sf-ink)]/10 bg-white"
                      }`}
                    >
                      <GardenAvatar name={name} size="sm" />
                      <span className="min-w-0 flex-1">
                        <Link href={`${staffPath}?staff=${encodeURIComponent(assignment.staffMemberId)}`} className="block truncate text-[14px] font-extrabold text-[var(--sf-ink)] hover:underline">
                          {name}
                        </Link>
                      </span>
                      <GChip tone={assignment.role === "lead" ? "success" : "neutral"}>{ROLE_LABELS[assignment.role]}</GChip>
                      {previewMode ? null : (
                        <button type="button" className={gBtnOutlineXs} disabled={removing} aria-busy={removing || undefined} onClick={() => void removeStaff(assignment)} aria-label={`Remove ${name}`}>
                          <BusyLabel busy={removing} busyLabel="Removing…" icon={<UserMinus className="h-3.5 w-3.5" aria-hidden />}>
                            Remove
                          </BusyLabel>
                        </button>
                      )}
                    </li>
                  );
                })}
            </ul>
          )}
        </div>

        {/* Roster */}
        <div>
          <GardenGroupHeading
            count={loadingStudents || studentsError ? undefined : students.length}
            action={
              previewMode ? null : (
                <button
                  type="button"
                  className={gBtnOutlineXs}
                  disabled={Boolean(studentsError)}
                  onClick={() => {
                    setStudentSheetOpen(true);
                    if (enrolled == null) void loadEnrolled();
                  }}
                  data-testid="classroom-add-students"
                >
                  <Plus className="h-3.5 w-3.5" aria-hidden />
                  Add students
                </button>
              )
            }
          >
            Roster
          </GardenGroupHeading>
          {loadingStudents ? (
            <div className="flex flex-col gap-1.5">
              <GSkeleton className="h-[56px] !rounded-[14px]" />
              <GSkeleton className="h-[56px] !rounded-[14px]" />
            </div>
          ) : studentsError ? (
            <GardenLoadError title="The roster didn't load" description={studentsError} onRetry={() => void loadStudents()} />
          ) : students.length === 0 ? (
            <GardenEmptyState
              icon={Users}
              title="No students in this classroom yet"
              description="Add students from your enrolled list."
              action={
                <Link href={studentsPath} className={gLinkSm}>
                  View all students
                </Link>
              }
            />
          ) : (
            <ul className="m-0 grid list-none gap-1.5 p-0 xl:grid-cols-2">
              {students.map((student) => {
                const name = formatEnrolledStudentName(student);
                const removing = action.pendingKey === `classroom-student-remove-${student.id}`;
                const flashed = action.lastSavedKey === `student-${student.id}`;
                const inProgram = !classroom.programName || isStudentInClassroomProgram(student, classroom.programName);
                return (
                  <li
                    key={student.id}
                    className={`flex items-center gap-3 rounded-[14px] border-[1.5px] px-3 py-2.5 transition-colors duration-500 ${
                      flashed ? "border-[var(--sf-forest)]/35 bg-[var(--sf-mint)]" : "border-[var(--sf-ink)]/10 bg-white"
                    }`}
                  >
                    <GardenAvatar name={name} size="sm" />
                    <span className="min-w-0 flex-1">
                      <Link href={`${studentsPath}?student=${encodeURIComponent(student.id)}`} className="block truncate text-[14px] font-extrabold text-[var(--sf-ink)] hover:underline">
                        {name}
                      </Link>
                      <span className="block truncate text-[12.5px] font-semibold text-[var(--sf-soft)]">
                        {[formatStudentGrade(student.grade), student.programNames.join(", ") || "No program"].filter(Boolean).join(" · ")}
                        {inProgram ? "" : " · other program"}
                      </span>
                    </span>
                    {previewMode ? null : (
                      <button type="button" className={gBtnOutlineXs} disabled={removing} aria-busy={removing || undefined} onClick={() => void removeStudent(student)} aria-label={`Remove ${name}`}>
                        <BusyLabel busy={removing} busyLabel="Removing…" icon={<UserMinus className="h-3.5 w-3.5" aria-hidden />}>
                          Remove
                        </BusyLabel>
                      </button>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>

      <GardenPickerSheet
        open={staffSheetOpen}
        onClose={() => setStaffSheetOpen(false)}
        kicker="Assign staff"
        title={classroom.name}
        options={staffOptions}
        initialSelected={[]}
        multiple={false}
        onSave={(selected) => (selected[0] ? assignStaff(selected[0], staffRole) : Promise.resolve(false))}
        saveLabel={() => `Assign as ${ROLE_LABELS[staffRole].toLowerCase()}`}
        savingLabel="Assigning…"
        searchPlaceholder="Search staff"
        testId="classroom-staff-picker"
        extra={
          <div className="flex flex-col gap-2 rounded-[16px] bg-[var(--sf-paper)] p-3.5">
            <p className="m-0 text-[13px] font-extrabold text-[var(--sf-ink)]">Role in this classroom</p>
            <div className="flex flex-wrap gap-1.5" role="radiogroup" aria-label="Role">
              {(["lead", "assistant"] as const).map((role) => (
                <button
                  key={role}
                  type="button"
                  role="radio"
                  aria-checked={staffRole === role}
                  onClick={() => setStaffRole(role)}
                  className={`${G_TOGGLE} ${staffRole === role ? G_TOGGLE_ON : G_TOGGLE_OFF}`}
                >
                  {ROLE_LABELS[role]}
                </button>
              ))}
            </div>
            {staffRole === "lead" ? (
              <p className="m-0 text-[12.5px] font-semibold text-[var(--sf-soft)]">
                Lead teachers automatically receive roster students as assigned learners.
              </p>
            ) : null}
          </div>
        }
        emptyState={
          <GardenEmptyState
            icon={UserPlus}
            title="No staff yet"
            description="Add staff members before assigning them to this classroom."
            action={
              <Link href={staffPath} className={gLinkSm}>
                Add staff
              </Link>
            }
          />
        }
      />

      <GardenPickerSheet
        open={studentSheetOpen}
        onClose={() => setStudentSheetOpen(false)}
        kicker="Add students"
        title={classroom.name}
        subtitle={classroom.programName ? `Students in ${classroom.programName} are listed first.` : undefined}
        options={studentOptions}
        initialSelected={[]}
        onSave={(selected) => addStudents(selected)}
        saveLabel={(count) => (count > 0 ? `Add ${count} to roster` : "Add to roster")}
        savingLabel="Adding…"
        loading={enrolledLoading}
        loadError={enrolledError}
        onRetryLoad={() => void loadEnrolled()}
        searchPlaceholder="Search students or families"
        testId="classroom-student-picker"
        emptyState={
          <GardenEmptyState icon={Users} title="Everyone is on the roster" description="All enrolled students are already in this classroom." />
        }
      />

      <ConfirmDialog
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={() => void deleteClassroom()}
        title={`Delete ${classroom.name}?`}
        description={
          classroom.studentCount + classroom.staffCount === 0
            ? "This classroom has no students or staff yet. This cannot be undone."
            : `${plural(classroom.studentCount, "student")} and ${classroom.staffCount} staff will be removed from this classroom. Lead teacher assignments synced from this classroom will be updated.`
        }
        confirmLabel="Delete classroom"
        variant="destructive"
        loading={action.pendingKey === "classroom-delete"}
        C={C}
      />
    </section>
  );
}
