import { NextResponse } from "next/server";
import { apiError } from "@/lib/api/route-errors";
import { withParentPortalRoute } from "@/lib/parent-portal/with-parent-portal-route";
import { authorizeParentStudentHealthAccess } from "@/lib/student-health/authorize-parent-student";
import { allergyPayload, medicationPayload, updatePayload } from "@/lib/student-health/map-row";
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
import { createAdminClient } from "@/utils/supabase/admin";

const ROUTE = "/api/parent-portal/students/[studentId]/health/[itemId]";

type ItemParams = { studentId: string; itemId: string };

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

export const PATCH = withParentPortalRoute<MutationBody, ItemParams>(
  {
    route: ROUTE,
    organizationFrom: "body",
    enforceAccess: false,
    fallbackErrorMessage: "Failed to update health item.",
  },
  async ({ request, supabase, user, organizationId, access, body, params }) => {
    const { studentId, itemId } = params;

    const healthAccess = await authorizeParentStudentHealthAccess(
      supabase,
      user,
      organizationId,
      studentId,
      access,
    );

    if (!healthAccess.ok) {
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

    try {
      const [item, studentName] = await Promise.all([
        updateStudentHealthItem(
          admin,
          {
            organizationId,
            studentId,
            userId: user.id,
            guardianId: healthAccess.guardian.id,
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
        actorType: "parent",
        actorUserId: user.id,
        actorName: healthAccess.guardian.displayName,
        actorEmail: healthAccess.guardian.email,
      });

      return NextResponse.json({ item });
    } catch (error) {
      return apiError(ROUTE, {
        request,
        status: 500,
        error: "Failed to update health item.",
        cause: error,
        code: "update_failed",
      });
    }
  },
);

export const DELETE = withParentPortalRoute<undefined, ItemParams>(
  {
    route: ROUTE,
    enforceAccess: false,
    fallbackErrorMessage: "Failed to delete health item.",
  },
  async ({ request, supabase, user, organizationId, access, params }) => {
    const { studentId, itemId } = params;

    const healthAccess = await authorizeParentStudentHealthAccess(
      supabase,
      user,
      organizationId,
      studentId,
      access,
    );

    if (!healthAccess.ok) {
      return apiError(ROUTE, {
        request,
        status: 403,
        error: "You do not have permission to update this student's health profile.",
        code: "forbidden",
      });
    }

    const admin = createAdminClient();

    try {
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
        actorType: "parent",
        actorUserId: user.id,
        actorName: healthAccess.guardian.displayName,
        actorEmail: healthAccess.guardian.email,
      });

      return NextResponse.json({ success: true });
    } catch (error) {
      return apiError(ROUTE, {
        request,
        status: 500,
        error: "Failed to delete health item.",
        cause: error,
        code: "delete_failed",
      });
    }
  },
);
