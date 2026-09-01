import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { apiError } from "@/lib/api/route-errors";
import { authorizeTeacherStudentHealthAccess } from "@/lib/student-health/authorize-teacher-student";
import {
  allergyPayload,
  medicationPayload,
  updatePayload,
} from "@/lib/student-health/map-row";
import {
  deleteStudentHealthItem,
  getStudentDisplayName,
  updateStudentHealthItem,
} from "@/lib/student-health/mutations";
import { sendStudentHealthItemNotifications } from "@/lib/student-health/student-health-notifications";
import type { HealthItemType } from "@/lib/student-health/types";
import {
  StudentHealthValidationError,
  parseHealthItemType,
  validateHealthItemInput,
} from "@/lib/student-health/validate";
import { TeacherPortalAuthError } from "@/lib/staff/teacher-portal-access";
import { createAdminClient } from "@/utils/supabase/admin";
import { createClient } from "@/utils/supabase/server";

const ROUTE = "/api/teacher-portal/students/[studentId]/health/[itemId]";

type RouteContext = {
  params: Promise<{ studentId: string; itemId: string }>;
};

type MutationBody = {
  organizationId?: string;
  itemType?: string;
  values?: Record<string, unknown>;
};

function payloadForNotification(
  itemType: HealthItemType,
  input: ReturnType<typeof validateHealthItemInput>,
): Record<string, unknown> {
  if (input.itemType === "allergy") {
    return allergyPayload(input.values);
  }
  if (input.itemType === "medication") {
    return medicationPayload(input.values);
  }
  return updatePayload(input.values);
}

export async function PATCH(request: Request, context: RouteContext) {
  const { studentId, itemId } = await context.params;
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

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
    body = await request.json();
  } catch {
    return apiError(ROUTE, {
      request,
      status: 400,
      error: "Invalid request body.",
      code: "invalid_body",
    });
  }

  const organizationId = body.organizationId?.trim() ?? "";
  if (!organizationId) {
    return apiError(ROUTE, {
      request,
      status: 400,
      error: "organizationId is required.",
      code: "missing_fields",
    });
  }

  try {
    const access = await authorizeTeacherStudentHealthAccess(
      supabase,
      user,
      organizationId,
      studentId,
    );

    if (!access.ok) {
      return apiError(ROUTE, {
        request,
        status: 403,
        error: "You do not have permission to update this student's health profile.",
        code: "forbidden",
      });
    }

    let input;
    try {
      const itemType = parseHealthItemType(body.itemType);
      input = validateHealthItemInput(itemType, body.values ?? {});
    } catch (error) {
      return apiError(ROUTE, {
        request,
        status: 400,
        error:
          error instanceof StudentHealthValidationError
            ? error.message
            : "Invalid health item.",
        code: "validation_failed",
      });
    }

    const admin = createAdminClient();

    const [item, studentName] = await Promise.all([
      updateStudentHealthItem(
        admin,
        {
          organizationId,
          studentId,
          userId: user.id,
          guardianId: null,
        },
        itemId,
        input,
      ),
      getStudentDisplayName(admin, organizationId, studentId),
    ]);

    await sendStudentHealthItemNotifications(admin, {
      organizationId,
      studentId,
      studentName,
      itemId: item.id,
      itemType: input.itemType,
      payload: payloadForNotification(input.itemType, input),
      action: "updated",
      actorType: "teacher",
      actorUserId: user.id,
      actorName: access.actor.displayName,
      actorEmail: access.actor.email,
    });

    return NextResponse.json({ item });
  } catch (error) {
    if (error instanceof TeacherPortalAuthError) {
      return apiError(ROUTE, {
        request,
        status: error.status,
        error: error.message,
        code: error.code,
        cause: error,
      });
    }

    return apiError(ROUTE, {
      request,
      status: 500,
      error: error instanceof Error ? error.message : "Failed to update health item.",
      code: "update_failed",
      cause: error,
    });
  }
}

export async function DELETE(request: Request, context: RouteContext) {
  const { studentId, itemId } = await context.params;
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

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

  const organizationId = new URL(request.url).searchParams.get("organizationId")?.trim() ?? "";
  if (!organizationId) {
    return apiError(ROUTE, {
      request,
      status: 400,
      error: "organizationId is required.",
      code: "missing_fields",
    });
  }

  try {
    const access = await authorizeTeacherStudentHealthAccess(
      supabase,
      user,
      organizationId,
      studentId,
    );

    if (!access.ok) {
      return apiError(ROUTE, {
        request,
        status: 403,
        error: "You do not have permission to update this student's health profile.",
        code: "forbidden",
      });
    }

    const admin = createAdminClient();

    const [deletedRow, studentName] = await Promise.all([
      deleteStudentHealthItem(admin, organizationId, studentId, itemId),
      getStudentDisplayName(admin, organizationId, studentId),
    ]);

    await sendStudentHealthItemNotifications(admin, {
      organizationId,
      studentId,
      studentName,
      itemId: deletedRow.id,
      itemType: deletedRow.item_type,
      payload: (deletedRow.payload ?? {}) as Record<string, unknown>,
      action: "deleted",
      actorType: "teacher",
      actorUserId: user.id,
      actorName: access.actor.displayName,
      actorEmail: access.actor.email,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof TeacherPortalAuthError) {
      return apiError(ROUTE, {
        request,
        status: error.status,
        error: error.message,
        code: error.code,
        cause: error,
      });
    }

    return apiError(ROUTE, {
      request,
      status: 500,
      error: error instanceof Error ? error.message : "Failed to delete health item.",
      code: "delete_failed",
      cause: error,
    });
  }
}
