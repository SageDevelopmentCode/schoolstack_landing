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

const RPC_ERROR_MESSAGES: Record<
  FridayBranchEnrollmentErrorCode,
  { message: string; status: number }
> = {
  class_not_found: {
    message: "Friday Branch class not found.",
    status: 404,
  },
  class_not_visible: {
    message: "This class is not open for sign-up.",
    status: 404,
  },
  block_not_open: {
    message: "This block is not open for sign-up yet.",
    status: 403,
  },
  student_not_in_family: {
    message: "This child is not part of your family.",
    status: 403,
  },
  already_enrolled: {
    message: "This child is already signed up for this class.",
    status: 409,
  },
  time_conflict: {
    message: "This child is already signed up for another class at this time.",
    status: 409,
  },
  not_enrolled: {
    message: "This child is not signed up for this class.",
    status: 404,
  },
};

function mapFridayBranchEnrollRpcError(error: { message?: string; code?: string }): never {
  const message = typeof error.message === "string" ? error.message : "";

  for (const [code, details] of Object.entries(RPC_ERROR_MESSAGES)) {
    if (message.includes(code)) {
      throw new FridayBranchEnrollmentConflictError(
        details.message,
        code as FridayBranchEnrollmentErrorCode,
        details.status,
      );
    }
  }

  if (error.code === "P0001") {
    throw new FridayBranchEnrollmentConflictError(
      "Unable to complete Friday Branch sign-up.",
      "already_enrolled",
    );
  }

  throw error;
}

function parseEnrollmentStatus(value: unknown): FridayBranchClassEnrollmentStatus {
  if (value === "confirmed" || value === "waitlisted" || value === "withdrawn") {
    return value;
  }
  return "confirmed";
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
  const { data, error } = await admin.rpc("enroll_friday_branch_student_atomic", {
    p_organization_id: organizationId,
    p_class_id: classId,
    p_family_id: familyId,
    p_student_id: studentId,
    p_source: "parent",
  });

  if (error) {
    mapFridayBranchEnrollRpcError(error);
  }

  const payload = data as { enrollment_id?: string; status?: string } | null;
  const enrollmentId = payload?.enrollment_id ? String(payload.enrollment_id) : "";
  const status = parseEnrollmentStatus(payload?.status);

  if (!enrollmentId) {
    throw new Error("Friday Branch enrollment did not return an enrollment id.");
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
  const { data, error } = await admin.rpc("withdraw_friday_branch_student_atomic", {
    p_organization_id: organizationId,
    p_class_id: classId,
    p_family_id: familyId,
    p_student_id: studentId,
    p_source: "parent",
  });

  if (error) {
    mapFridayBranchEnrollRpcError(error);
  }

  const payload = data as { withdrawn_enrollment_id?: string } | null;
  if (!payload?.withdrawn_enrollment_id) {
    throw new Error("Friday Branch withdrawal did not return an enrollment id.");
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

  return detail;
}

export { computeSpotsRemaining };
