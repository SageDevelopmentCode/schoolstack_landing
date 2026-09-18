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
import { createClientFromRequest } from "@/lib/supabase/request-client";
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
  } = await supabase.auth.getUser();

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
      error: err instanceof Error ? err.message : "Failed to load Friday Branch class.",
      code: "load_failed",
      cause: err,
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
  } = await supabase.auth.getUser();

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
  } = await supabase.auth.getUser();

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
    const detail = await withdrawStudentFromFridayBranchClass(
      admin,
      organizationId,
      familyId,
      classId.trim(),
      studentId,
      studentOptions,
    );

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
