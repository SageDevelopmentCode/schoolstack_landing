import { NextResponse } from "next/server";
import { apiError } from "@/lib/api/route-errors";
import { sendAuthorizedPickupContactNotifications } from "@/lib/authorized-pickup/authorized-pickup-notifications";
import { authorizeParentStudentPickupAccess } from "@/lib/authorized-pickup/authorize-parent-student";
import { loadAuthorizedPickupContact } from "@/lib/authorized-pickup/load-student-pickup-contacts";
import { formatAuthorizedPickupContactName } from "@/lib/authorized-pickup/map-row";
import {
  AuthorizedPickupValidationError,
  deactivateAuthorizedPickupContact,
  updateAuthorizedPickupContact,
  validateAuthorizedPickupContactInput,
} from "@/lib/authorized-pickup/mutations";
import type { AuthorizedPickupContactInput } from "@/lib/authorized-pickup/types";
import { reportOperationalError } from "@/lib/operational-errors";
import { getStudentDisplayName } from "@/lib/student-health/mutations";
import { createAdminClient } from "@/utils/supabase/admin";
import {
  createClientFromRequest,
  getUserFromRequest,
} from "@/lib/supabase/request-client";

const ROUTE = "/api/parent-portal/students/[studentId]/authorized-pickup/[contactId]";

type RouteContext = {
  params: Promise<{ studentId: string; contactId: string }>;
};

type UpdateBody = AuthorizedPickupContactInput & {
  organizationId?: string;
};

export async function PATCH(request: Request, context: RouteContext) {
  const { studentId, contactId } = await context.params;
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

  let body: UpdateBody;
  try {
    body = (await request.json()) as UpdateBody;
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

  const access = await authorizeParentStudentPickupAccess(
    supabase,
    user,
    organizationId,
    studentId,
  );

  if (!access.ok) {
    return apiError(ROUTE, {
      request,
      status: 403,
      error: "You do not have permission to update this student's authorized pickup list.",
      code: "forbidden",
    });
  }

  try {
    const input = validateAuthorizedPickupContactInput(body);
    const admin = createAdminClient();
    const [contact, studentName] = await Promise.all([
      updateAuthorizedPickupContact(
        admin,
        organizationId,
        studentId,
        contactId,
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
      action: "updated",
      actorUserId: user.id,
      actorName: access.guardian.displayName,
      actorEmail: access.guardian.email,
    }).catch((error) =>
      reportOperationalError({
        supabase: admin,
        surface: "parent_portal",
        operation: "authorized_pickup.contact.update.notify",
        error: "Failed to record authorized pickup contact activity.",
        organizationId,
        entityType: "authorized_pickup_contact",
        entityId: contact.id,
        actor: { type: "parent", userId: user.id, email: access.guardian.email },
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
      error: "Failed to update authorized pickup contact.",
      cause: error,
      code: "update_failed",
    });
  }
}

export async function DELETE(request: Request, context: RouteContext) {
  const { studentId, contactId } = await context.params;
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

  const organizationId = new URL(request.url).searchParams.get("organizationId")?.trim() ?? "";
  if (!organizationId) {
    return apiError(ROUTE, {
      request,
      status: 400,
      error: "organizationId is required.",
      code: "missing_fields",
    });
  }

  const access = await authorizeParentStudentPickupAccess(
    supabase,
    user,
    organizationId,
    studentId,
  );

  if (!access.ok) {
    return apiError(ROUTE, {
      request,
      status: 403,
      error: "You do not have permission to update this student's authorized pickup list.",
      code: "forbidden",
    });
  }

  try {
    const admin = createAdminClient();
    const [existingContact, studentName] = await Promise.all([
      loadAuthorizedPickupContact(admin, organizationId, studentId, contactId),
      getStudentDisplayName(admin, organizationId, studentId),
    ]);

    await deactivateAuthorizedPickupContact(
      admin,
      organizationId,
      studentId,
      contactId,
    );

    void sendAuthorizedPickupContactNotifications(admin, {
      organizationId,
      studentId,
      studentName,
      contactId: existingContact.id,
      contactName: formatAuthorizedPickupContactName(existingContact),
      action: "deleted",
      actorUserId: user.id,
      actorName: access.guardian.displayName,
      actorEmail: access.guardian.email,
    }).catch((error) =>
      reportOperationalError({
        supabase: admin,
        surface: "parent_portal",
        operation: "authorized_pickup.contact.delete.notify",
        error: "Failed to record authorized pickup contact activity.",
        organizationId,
        entityType: "authorized_pickup_contact",
        entityId: existingContact.id,
        actor: { type: "parent", userId: user.id, email: access.guardian.email },
        cause: error,
      }),
    );

    return NextResponse.json({ ok: true });
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
      error: "Failed to remove authorized pickup contact.",
      cause: error,
      code: "delete_failed",
    });
  }
}
