import { NextResponse } from "next/server";
import { apiError } from "@/lib/api/route-errors";
import {
  getSchoolAdminUserProfile,
  requireSchoolAdminUser,
  SchoolAdminAuthError,
} from "@/lib/school-admin/access";
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
import { createClientFromRequest } from "@/lib/supabase/request-client";
import { createAdminClient } from "@/utils/supabase/admin";

const ROUTE = "/api/school/[slug]/students/[studentId]/health/[itemId]";

type RouteContext = {
  params: Promise<{ slug: string; studentId: string; itemId: string }>;
};

type MutationBody = {
  itemType?: string;
  values?: Record<string, unknown>;
};

async function resolveOrganizationId(
  admin: ReturnType<typeof createAdminClient>,
  slug: string,
): Promise<string | null> {
  const { data, error } = await admin
    .from("organizations")
    .select("id")
    .eq("slug", slug)
    .maybeSingle();

  if (error) throw error;
  return data?.id ? String(data.id) : null;
}

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
  const { slug, studentId, itemId } = await context.params;
  const supabase = await createClientFromRequest(request);

  try {
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

    const admin = createAdminClient();
    const organizationId = await resolveOrganizationId(admin, slug);

    if (!organizationId) {
      return apiError(ROUTE, {
        request,
        status: 404,
        error: "School not found.",
        code: "not_found",
      });
    }

    const user = await requireSchoolAdminUser(supabase, organizationId, request);
    const actor = getSchoolAdminUserProfile(user);

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
      actorType: "school_admin",
      actorUserId: user.id,
      actorName: actor.displayName,
      actorEmail: actor.email,
    });

    return NextResponse.json({ item });
  } catch (error) {
    if (error instanceof SchoolAdminAuthError) {
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
  const { slug, studentId, itemId } = await context.params;
  const supabase = await createClientFromRequest(request);

  try {
    const admin = createAdminClient();
    const organizationId = await resolveOrganizationId(admin, slug);

    if (!organizationId) {
      return apiError(ROUTE, {
        request,
        status: 404,
        error: "School not found.",
        code: "not_found",
      });
    }

    const user = await requireSchoolAdminUser(supabase, organizationId, request);
    const actor = getSchoolAdminUserProfile(user);

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
      actorType: "school_admin",
      actorUserId: user.id,
      actorName: actor.displayName,
      actorEmail: actor.email,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof SchoolAdminAuthError) {
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
