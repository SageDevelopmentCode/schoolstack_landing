import type { SupabaseClient } from "@supabase/supabase-js";
import type { FridayBranchClassEnrollmentStatus } from "@/lib/school-admin/friday-branch/friday-branch-types";
import {
  computeSpotsRemaining,
  loadParentFridayBranchClassDetail,
} from "./load-parent-friday-branch";
import type { ParentFridayBranchClassDetailBundle, ParentFridayBranchStudentOption } from "./types";

export type FridayBranchEnrollmentErrorCode =
  | "time_conflict"
  | "already_enrolled"
  | "class_not_found"
  | "class_not_visible"
  | "student_not_in_family"
  | "not_enrolled"
  | "block_not_open";

export class FridayBranchEnrollmentConflictError extends Error {
  status: number;
  code: FridayBranchEnrollmentErrorCode;

  constructor(
    message: string,
    code: FridayBranchEnrollmentErrorCode,
    status = 409,
  ) {
    super(message);
    this.name = "FridayBranchEnrollmentConflictError";
    this.status = status;
    this.code = code;
  }
}

export function resolveEnrollmentStatus(
  capacity: number | null,
  confirmedCount: number,
): FridayBranchClassEnrollmentStatus {
  if (capacity == null) return "confirmed";
  return confirmedCount >= capacity ? "waitlisted" : "confirmed";
}

type ClassContext = {
  classId: string;
  blockId: string;
  slotId: string;
  slotTime: string;
  familyVisible: boolean;
  blockStatus: string;
  capacity: number | null;
};

type EnrollmentRow = {
  id: string;
  status: string;
};

function relationOne<T>(value: T | T[] | null | undefined): T | null {
  if (!value) return null;
  return Array.isArray(value) ? value[0] ?? null : value;
}

async function loadClassContextForEnrollment(
  admin: SupabaseClient,
  organizationId: string,
  classId: string,
): Promise<ClassContext | null> {
  const { data, error } = await admin
    .from("friday_branch_classes")
    .select(
      `id, family_visible, capacity, time_slot_id,
      friday_branch_time_slots!inner (
        id, time, block_id,
        friday_branch_blocks!inner ( id, status )
      )`,
    )
    .eq("id", classId)
    .eq("organization_id", organizationId)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  const row = data as unknown as {
    id: string;
    family_visible: boolean;
    capacity: number | null;
    friday_branch_time_slots: {
      id: string;
      time: string;
      block_id: string;
      friday_branch_blocks: { id: string; status: string };
    };
  };

  const slot = relationOne(row.friday_branch_time_slots);
  const block = slot ? relationOne(slot.friday_branch_blocks) : null;
  if (!slot || !block) return null;

  return {
    classId: row.id,
    blockId: block.id,
    slotId: slot.id,
    slotTime: slot.time,
    familyVisible: row.family_visible,
    blockStatus: block.status,
    capacity: row.capacity,
  };
}

async function assertStudentInFamily(
  admin: SupabaseClient,
  organizationId: string,
  familyId: string,
  studentId: string,
): Promise<void> {
  const { data, error } = await admin
    .from("students")
    .select("id")
    .eq("id", studentId)
    .eq("family_id", familyId)
    .eq("organization_id", organizationId)
    .maybeSingle();

  if (error) throw error;
  if (!data) {
    throw new FridayBranchEnrollmentConflictError(
      "This child is not part of your family.",
      "student_not_in_family",
      403,
    );
  }
}

async function assertNoTimeConflict(
  admin: SupabaseClient,
  organizationId: string,
  blockId: string,
  studentId: string,
  slotTime: string,
  excludeClassId: string,
): Promise<void> {
  const { data, error } = await admin
    .from("friday_branch_class_enrollments")
    .select(
      `class_id,
      friday_branch_classes!inner (
        friday_branch_time_slots!inner ( time )
      )`,
    )
    .eq("organization_id", organizationId)
    .eq("block_id", blockId)
    .eq("student_id", studentId)
    .in("status", ["confirmed", "waitlisted"])
    .neq("class_id", excludeClassId);

  if (error) throw error;

  for (const row of data ?? []) {
    const record = row as unknown as {
      class_id: string;
      friday_branch_classes: {
        friday_branch_time_slots: { time: string } | { time: string }[];
      };
    };
    const slot = relationOne(record.friday_branch_classes.friday_branch_time_slots);
    if (slot?.time === slotTime) {
      throw new FridayBranchEnrollmentConflictError(
        "This child is already signed up for another class at this time.",
        "time_conflict",
      );
    }
  }
}

export async function enrollStudentInFridayBranchClass(
  admin: SupabaseClient,
  organizationId: string,
  familyId: string,
  classId: string,
  studentId: string,
  studentOptions: ParentFridayBranchStudentOption[],
): Promise<{
  enrollmentId: string;
  status: FridayBranchClassEnrollmentStatus;
  detail: ParentFridayBranchClassDetailBundle;
}> {
  const context = await loadClassContextForEnrollment(admin, organizationId, classId);
  if (!context) {
    throw new FridayBranchEnrollmentConflictError(
      "Friday Branch class not found.",
      "class_not_found",
      404,
    );
  }

  if (!context.familyVisible) {
    throw new FridayBranchEnrollmentConflictError(
      "This class is not open for sign-up.",
      "class_not_visible",
      404,
    );
  }

  if (context.blockStatus !== "current" && context.blockStatus !== "upcoming") {
    throw new FridayBranchEnrollmentConflictError(
      "This block is not open for sign-up yet.",
      "block_not_open",
      403,
    );
  }

  await assertStudentInFamily(admin, organizationId, familyId, studentId);

  const { data: existing, error: existingError } = await admin
    .from("friday_branch_class_enrollments")
    .select("id, status")
    .eq("class_id", classId)
    .eq("student_id", studentId)
    .maybeSingle();

  if (existingError) throw existingError;

  const existingRow = existing as EnrollmentRow | null;
  if (
    existingRow &&
    (existingRow.status === "confirmed" || existingRow.status === "waitlisted")
  ) {
    throw new FridayBranchEnrollmentConflictError(
      "This child is already signed up for this class.",
      "already_enrolled",
    );
  }

  await assertNoTimeConflict(
    admin,
    organizationId,
    context.blockId,
    studentId,
    context.slotTime,
    classId,
  );

  const { count: confirmedCount, error: countError } = await admin
    .from("friday_branch_class_enrollments")
    .select("id", { count: "exact", head: true })
    .eq("organization_id", organizationId)
    .eq("class_id", classId)
    .eq("status", "confirmed");

  if (countError) throw countError;

  const status = resolveEnrollmentStatus(context.capacity, confirmedCount ?? 0);

  const payload = {
    organization_id: organizationId,
    class_id: classId,
    block_id: context.blockId,
    student_id: studentId,
    family_id: familyId,
    status,
    source: "parent" as const,
  };

  let enrollmentId: string;

  if (existingRow) {
    const { data: updated, error: updateError } = await admin
      .from("friday_branch_class_enrollments")
      .update({ status, source: "parent" })
      .eq("id", existingRow.id)
      .select("id")
      .single();

    if (updateError) throw updateError;
    enrollmentId = String((updated as { id: string }).id);
  } else {
    const { data: inserted, error: insertError } = await admin
      .from("friday_branch_class_enrollments")
      .insert(payload)
      .select("id")
      .single();

    if (insertError) throw insertError;
    enrollmentId = String((inserted as { id: string }).id);
  }

  const detail = await loadParentFridayBranchClassDetail(
    admin,
    organizationId,
    familyId,
    classId,
    studentOptions,
  );

  if (!detail) {
    throw new FridayBranchEnrollmentConflictError(
      "Friday Branch class not found.",
      "class_not_found",
      404,
    );
  }

  return { enrollmentId, status, detail };
}

export async function withdrawStudentFromFridayBranchClass(
  admin: SupabaseClient,
  organizationId: string,
  familyId: string,
  classId: string,
  studentId: string,
  studentOptions: ParentFridayBranchStudentOption[],
): Promise<ParentFridayBranchClassDetailBundle> {
  const { data: existing, error: existingError } = await admin
    .from("friday_branch_class_enrollments")
    .select("id, status")
    .eq("organization_id", organizationId)
    .eq("family_id", familyId)
    .eq("class_id", classId)
    .eq("student_id", studentId)
    .maybeSingle();

  if (existingError) throw existingError;

  const existingRow = existing as EnrollmentRow | null;
  if (
    !existingRow ||
    (existingRow.status !== "confirmed" && existingRow.status !== "waitlisted")
  ) {
    throw new FridayBranchEnrollmentConflictError(
      "This child is not signed up for this class.",
      "not_enrolled",
      404,
    );
  }

  const { error: updateError } = await admin
    .from("friday_branch_class_enrollments")
    .update({ status: "withdrawn", source: "parent" })
    .eq("id", existingRow.id);

  if (updateError) throw updateError;

  const detail = await loadParentFridayBranchClassDetail(
    admin,
    organizationId,
    familyId,
    classId,
    studentOptions,
  );

  if (!detail) {
    throw new FridayBranchEnrollmentConflictError(
      "Friday Branch class not found.",
      "class_not_found",
      404,
    );
  }

  return detail;
}

export { computeSpotsRemaining };
