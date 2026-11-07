import { NextResponse } from "next/server";
import { apiError } from "@/lib/api/route-errors";
import { sendAuthorizedPickupContactNotifications } from "@/lib/authorized-pickup/authorized-pickup-notifications";
import { authorizeParentStudentPickupAccess } from "@/lib/authorized-pickup/authorize-parent-student";
import { loadStudentAuthorizedPickupContacts } from "@/lib/authorized-pickup/load-student-pickup-contacts";
import { loadStudentFamilyId } from "@/lib/authorized-pickup/load-student-family";
import { formatAuthorizedPickupContactName } from "@/lib/authorized-pickup/map-row";
import {
  AuthorizedPickupValidationError,
  createAuthorizedPickupContact,
  validateAuthorizedPickupContactInput,
} from "@/lib/authorized-pickup/mutations";
import type { AuthorizedPickupContactInput } from "@/lib/authorized-pickup/types";
import { reportOperationalError } from "@/lib/operational-errors";
import { getStudentDisplayName } from "@/lib/student-health/mutations";
import { createAdminClient } from "@/utils/supabase/admin";
import { withParentPortalRoute } from "@/lib/parent-portal/with-parent-portal-route";

const ROUTE = "/api/parent-portal/students/[studentId]/authorized-pickup";

type StudentParams = { studentId: string };

export const GET = withParentPortalRoute<undefined, StudentParams>(
  {
    route: ROUTE,
    enforceAccess: false,
    fallbackErrorMessage: "Failed to load authorized pickup contacts.",
  },
  async ({
    request,
    supabase,
    user,
    organizationId,
    access: portalAccess,
    params,
  }) => {
    const { studentId } = params;

    const access = await authorizeParentStudentPickupAccess(
      supabase,
      user,
      organizationId,
      studentId,
      portalAccess,
    );

    if (!access.ok) {
      return apiError(ROUTE, {
        request,
        status: 403,
        error:
          "You do not have permission to view this student's authorized pickup list.",
        code: "forbidden",
      });
    }

    try {
      const contacts = await loadStudentAuthorizedPickupContacts(
        supabase,
        organizationId,
        studentId,
      );
      return NextResponse.json({ contacts });
    } catch (error) {
      return apiError(ROUTE, {
        request,
        status: 500,
        error: "Failed to load authorized pickup contacts.",
        cause: error,
        code: "load_failed",
      });
    }
  },
);

type CreateBody = AuthorizedPickupContactInput & {
  organizationId?: string;
};

export const POST = withParentPortalRoute<CreateBody, StudentParams>(
  {
    route: ROUTE,
    organizationFrom: "body",
    enforceAccess: false,
    fallbackErrorMessage: "Failed to create authorized pickup contact.",
  },
  async ({
    request,
    supabase,
    user,
    organizationId,
    access: portalAccess,
    body,
    params,
  }) => {
    const { studentId } = params;

    const access = await authorizeParentStudentPickupAccess(
      supabase,
      user,
      organizationId,
      studentId,
      portalAccess,
    );

    if (!access.ok) {
      return apiError(ROUTE, {
        request,
        status: 403,
        error:
          "You do not have permission to update this student's authorized pickup list.",
        code: "forbidden",
      });
    }

    try {
      const input = validateAuthorizedPickupContactInput(body);
      const admin = createAdminClient();
      const familyId = await loadStudentFamilyId(
        admin,
        organizationId,
        studentId,
      );
      const [contact, studentName] = await Promise.all([
        createAuthorizedPickupContact(
          admin,
          {
            organizationId,
            studentId,
            familyId,
            userId: user.id,
            guardianId: access.guardian.id,
          },
          input,
        ),
        getStudentDisplayName(admin, organizationId, studentId),
      ]);

      void sendAuthorizedPickupContactNotifications(admin, {
        organizationId,
        studentId,
        studentName,
        contactId: contact.id,
        contactName: formatAuthorizedPickupContactName(contact),
        action: "created",
        actorUserId: user.id,
        actorName: access.guardian.displayName,
        actorEmail: access.guardian.email,
      }).catch((error) =>
        reportOperationalError({
          supabase: admin,
          surface: "parent_portal",
          operation: "authorized_pickup.contact.create.notify",
          error: "Failed to record authorized pickup contact activity.",
          organizationId,
          entityType: "authorized_pickup_contact",
          entityId: contact.id,
          actor: {
            type: "parent",
            userId: user.id,
            email: access.guardian.email,
          },
          cause: error,
        }),
      );

      return NextResponse.json({ contact });
    } catch (error) {
      if (error instanceof AuthorizedPickupValidationError) {
        return apiError(ROUTE, {
          request,
          status: error.status,
          error: error.message,
          code: error.code,
        });
      }

      return apiError(ROUTE, {
        request,
        status: 500,
        error: "Failed to create authorized pickup contact.",
        cause: error,
        code: "create_failed",
      });
    }
  },
);
