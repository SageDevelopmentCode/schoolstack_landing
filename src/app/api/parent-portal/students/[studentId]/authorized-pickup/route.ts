import { cookies } from "next/headers";
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
import { createClient } from "@/utils/supabase/server";

const ROUTE = "/api/parent-portal/students/[studentId]/authorized-pickup";

type RouteContext = {
  params: Promise<{ studentId: string }>;
};

export async function GET(request: Request, context: RouteContext) {
  const { studentId } = await context.params;
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
      error: "You do not have permission to view this student's authorized pickup list.",
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
      error: error instanceof Error ? error.message : "Failed to load authorized pickup contacts.",
      code: "load_failed",
    });
  }
}

type CreateBody = AuthorizedPickupContactInput & {
  organizationId?: string;
};

export async function POST(request: Request, context: RouteContext) {
  const { studentId } = await context.params;
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

  let body: CreateBody;
  try {
    body = (await request.json()) as CreateBody;
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
    const familyId = await loadStudentFamilyId(admin, organizationId, studentId);
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
      error: error instanceof Error ? error.message : "Failed to create authorized pickup contact.",
      code: "create_failed",
    });
  }
}
