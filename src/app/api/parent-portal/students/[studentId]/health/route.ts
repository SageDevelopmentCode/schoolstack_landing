import { NextResponse } from "next/server";
import { apiError } from "@/lib/api/route-errors";
import { withParentPortalRoute } from "@/lib/parent-portal/with-parent-portal-route";
import { authorizeParentStudentHealthAccess } from "@/lib/student-health/authorize-parent-student";
import { loadStudentHealthProfile } from "@/lib/student-health/load-student-health-profile";
import { createStudentHealthItem, getStudentDisplayName } from "@/lib/student-health/mutations";
import { sendStudentHealthItemNotifications } from "@/lib/student-health/student-health-notifications";
import {
  StudentHealthValidationError,
  parseHealthItemType,
  validateHealthItemInput,
} from "@/lib/student-health/validate";
import { createAdminClient } from "@/utils/supabase/admin";

const ROUTE = "/api/parent-portal/students/[studentId]/health";

type StudentParams = { studentId: string };

export const GET = withParentPortalRoute<undefined, StudentParams>(
  {
    route: ROUTE,
    enforceAccess: false,
    fallbackErrorMessage: "Failed to load health profile.",
  },
  async ({ request, supabase, user, organizationId, access, params }) => {
    const { studentId } = params;

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
        error: "You do not have permission to view this student's health profile.",
        code: "forbidden",
      });
    }

    try {
      const profile = await loadStudentHealthProfile(supabase, organizationId, studentId);
      return NextResponse.json({ profile });
    } catch (error) {
      return apiError(ROUTE, {
        request,
        status: 500,
        error: "Failed to load health profile.",
        cause: error,
        code: "load_failed",
      });
    }
  },
);

type CreateBody = {
  organizationId?: string;
  itemType?: string;
  values?: Record<string, unknown>;
};

export const POST = withParentPortalRoute<CreateBody, StudentParams>(
  {
    route: ROUTE,
    organizationFrom: "body",
    enforceAccess: false,
    fallbackErrorMessage: "Failed to save health item.",
  },
  async ({ request, supabase, user, organizationId, access, body, params }) => {
    const { studentId } = params;

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
        createStudentHealthItem(
          admin,
          {
            organizationId,
            studentId,
            userId: user.id,
            guardianId: healthAccess.guardian.id,
          },
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
        payload:
          input.itemType === "allergy"
            ? { allergen: input.values.allergen, severity: input.values.severity }
            : input.itemType === "medication"
              ? { name: input.values.name }
              : { title: input.values.title },
        action: "created",
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
        error: "Failed to save health item.",
        cause: error,
        code: "create_failed",
      });
    }
  },
);
