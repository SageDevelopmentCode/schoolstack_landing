import { NextResponse } from "next/server";
import { apiError } from "@/lib/api/route-errors";
import { portalRouteErrorStatus } from "@/lib/api/portal-route-errors";
import {
  enrollStudentInFridayBranchClass,
  FridayBranchEnrollmentConflictError,
  withdrawStudentFromFridayBranchClass,
} from "@/lib/parent-portal/friday-branch/enrollments";
import { loadParentFridayBranchClassDetail } from "@/lib/parent-portal/friday-branch/load-parent-friday-branch";
import {
  ParentFridayBranchAuthError,
  requireParentFridayBranchAccess,
} from "@/lib/parent-portal/friday-branch/parent-friday-branch-auth";
import {
  notifyFridayBranchEnrollmentFromParentPortal,
  notifyFridayBranchWithdrawalFromParentPortal,
} from "@/lib/friday-branch/friday-branch-admin-notifications";
import { reportOperationalError } from "@/lib/operational-errors";
import { createClientFromRequest, getUserFromRequest } from "@/lib/supabase/request-client";
import { createAdminClient } from "@/utils/supabase/admin";

const ROUTE = "/api/parent-portal/friday-branch/classes/[classId]";

type RouteContext = {
  params: Promise<{ classId: string }>;
};

export async function GET(request: Request, context: RouteContext) {
  const { classId } = await context.params;
  const supabase = await createClientFromRequest(request);
  const organizationId = new URL(request.url).searchParams.get("organizationId")?.trim() ?? "";

  if (!organizationId || !classId?.trim()) {
    return apiError(ROUTE, {
      request,
      status: 400,
      error: "organizationId and classId are required.",
      code: "missing_fields",
    });
  }

  const {
    data: { user },
  } = await getUserFromRequest(supabase, request);

  if (!user) {
    return apiError(ROUTE, {
      request,
      status: 401,
      error: "You must be signed in.",
      code: "unauthorized",
    });
  }

  try {
    const { familyId, studentOptions } = await requireParentFridayBranchAccess(
      supabase,
      user,
      organizationId,
    );

    const admin = createAdminClient();
    const detail = await loadParentFridayBranchClassDetail(
      admin,
      organizationId,
      familyId,
      classId.trim(),
      studentOptions,
    );

    if (!detail) {
      return apiError(ROUTE, {
        request,
        status: 404,
        error: "Friday Branch class not found.",
        code: "not_found",
      });
    }

    return NextResponse.json({ detail, studentOptions });
  } catch (err) {
    if (err instanceof ParentFridayBranchAuthError) {
      return apiError(ROUTE, {
        request,
        status: err.status,
        error: err.message,
        code: err.code,
        cause: err,
      });
    }

    return apiError(ROUTE, {
      request,
      status: 500,
      error: "Failed to load Friday Branch class.",
      cause: err,
      code: "load_failed",
    });
  }
}

type MutationBody = {
  organizationId?: string;
  studentId?: string;
};

export async function POST(request: Request, context: RouteContext) {
  const { classId } = await context.params;
  const supabase = await createClientFromRequest(request);

  const {
    data: { user },
  } = await getUserFromRequest(supabase, request);

  if (!user) {
    return apiError(ROUTE, {
      request,
      status: 401,
      error: "You must be signed in.",
      code: "unauthorized",
    });
  }

  let body: MutationBody;
  try {
    body = (await request.json()) as MutationBody;
  } catch {
    return apiError(ROUTE, {
      request,
      status: 400,
      error: "Invalid request body.",
      code: "invalid_body",
    });
  }

  const organizationId = body.organizationId?.trim() ?? "";
  const studentId = body.studentId?.trim() ?? "";

  if (!organizationId || !classId?.trim() || !studentId) {
    return apiError(ROUTE, {
      request,
      status: 400,
      error: "organizationId, classId, and studentId are required.",
      code: "missing_fields",
    });
  }

  try {
    const { familyId, studentOptions } = await requireParentFridayBranchAccess(
      supabase,
      user,
      organizationId,
    );

    const admin = createAdminClient();
    const result = await enrollStudentInFridayBranchClass(
      admin,
      organizationId,
      familyId,
      classId.trim(),
      studentId,
      studentOptions,
    );

    const studentName =
      studentOptions.find((student) => student.id === studentId)?.name ?? "Student";

    void notifyFridayBranchEnrollmentFromParentPortal(admin, {
      organizationId,
      familyId,
      enrollmentId: result.enrollmentId,
      classId: classId.trim(),
      studentId,
      studentName,
      status: result.status,
      detail: result.detail,
      actor: user,
    }).catch((error) =>
      reportOperationalError({
        supabase: admin,
        surface: "parent_portal",
        operation: "friday_branch.class.enroll.notify",
        error: "Failed to notify admins of Friday Branch sign-up.",
        organizationId,
        entityType: "friday_branch_class_enrollment",
        entityId: result.enrollmentId,
        actor: { type: "parent", userId: user.id, email: user.email },
        cause: error,
      }),
    );

    return NextResponse.json(result);
  } catch (err) {
    if (err instanceof ParentFridayBranchAuthError) {
      return apiError(ROUTE, {
        request,
        status: err.status,
        error: err.message,
        code: err.code,
        cause: err,
      });
    }

    if (err instanceof FridayBranchEnrollmentConflictError) {
      return apiError(ROUTE, {
        request,
        status: err.status,
        error: err.message,
        code: err.code,
        cause: err,
      });
    }

    const resolved = portalRouteErrorStatus(err, "Failed to sign up for Friday Branch class.");
    return apiError(ROUTE, {
      request,
      status: resolved.status,
      error: resolved.message,
      code: resolved.status === 500 ? "internal_error" : "enroll_failed",
      cause: err,
    });
  }
}

export async function DELETE(request: Request, context: RouteContext) {
  const { classId } = await context.params;
  const supabase = await createClientFromRequest(request);

  const {
    data: { user },
  } = await getUserFromRequest(supabase, request);

  if (!user) {
    return apiError(ROUTE, {
      request,
      status: 401,
      error: "You must be signed in.",
      code: "unauthorized",
    });
  }

  let body: MutationBody;
  try {
    body = (await request.json()) as MutationBody;
  } catch {
    return apiError(ROUTE, {
      request,
      status: 400,
      error: "Invalid request body.",
      code: "invalid_body",
    });
  }

  const organizationId = body.organizationId?.trim() ?? "";
  const studentId = body.studentId?.trim() ?? "";

  if (!organizationId || !classId?.trim() || !studentId) {
    return apiError(ROUTE, {
      request,
      status: 400,
      error: "organizationId, classId, and studentId are required.",
      code: "missing_fields",
    });
  }

  try {
    const { familyId, studentOptions } = await requireParentFridayBranchAccess(
      supabase,
      user,
      organizationId,
    );

    const admin = createAdminClient();

    const { data: existingEnrollment } = await admin
      .from("friday_branch_class_enrollments")
      .select("id")
      .eq("organization_id", organizationId)
      .eq("family_id", familyId)
      .eq("class_id", classId.trim())
      .eq("student_id", studentId)
      .in("status", ["confirmed", "waitlisted"])
      .maybeSingle();

    const detail = await withdrawStudentFromFridayBranchClass(
      admin,
      organizationId,
      familyId,
      classId.trim(),
      studentId,
      studentOptions,
    );

    const enrollmentId = existingEnrollment
      ? String((existingEnrollment as { id: string }).id)
      : null;
    const studentName =
      studentOptions.find((student) => student.id === studentId)?.name ?? "Student";

    if (enrollmentId) {
      void notifyFridayBranchWithdrawalFromParentPortal(admin, {
        organizationId,
        familyId,
        enrollmentId,
        classId: classId.trim(),
        studentName,
        detail,
        actor: user,
      }).catch((error) =>
        reportOperationalError({
          supabase: admin,
          surface: "parent_portal",
          operation: "friday_branch.class.withdraw.notify",
          error: "Failed to log Friday Branch withdrawal activity.",
          organizationId,
          entityType: "friday_branch_class_enrollment",
          entityId: enrollmentId,
          actor: { type: "parent", userId: user.id, email: user.email },
          cause: error,
        }),
      );
    }

    return NextResponse.json({ detail });
  } catch (err) {
    if (err instanceof ParentFridayBranchAuthError) {
      return apiError(ROUTE, {
        request,
        status: err.status,
        error: err.message,
        code: err.code,
        cause: err,
      });
    }

    if (err instanceof FridayBranchEnrollmentConflictError) {
      return apiError(ROUTE, {
        request,
        status: err.status,
        error: err.message,
        code: err.code,
        cause: err,
      });
    }

    const resolved = portalRouteErrorStatus(err, "Failed to withdraw from Friday Branch class.");
    return apiError(ROUTE, {
      request,
      status: resolved.status,
      error: resolved.message,
      code: resolved.status === 500 ? "internal_error" : "withdraw_failed",
      cause: err,
    });
  }
}
