import { NextResponse } from "next/server";
import { apiError } from "@/lib/api/route-errors";
import {
  getSchoolAdminUserProfile,
  requireSchoolAdminUser,
  SchoolAdminAuthError,
} from "@/lib/school-admin/access";
import { loadStudentHealthProfile } from "@/lib/student-health/load-student-health-profile";
import {
  createStudentHealthItem,
  getStudentDisplayName,
} from "@/lib/student-health/mutations";
import { sendStudentHealthItemNotifications } from "@/lib/student-health/student-health-notifications";
import {
  StudentHealthValidationError,
  parseHealthItemType,
  validateHealthItemInput,
} from "@/lib/student-health/validate";
import { createClientFromRequest } from "@/lib/supabase/request-client";
import { createAdminClient } from "@/utils/supabase/admin";

const ROUTE = "/api/school/[slug]/students/[studentId]/health";

type RouteContext = {
  params: Promise<{ slug: string; studentId: string }>;
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

export async function GET(request: Request, context: RouteContext) {
  const { slug, studentId } = await context.params;
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

    await requireSchoolAdminUser(supabase, organizationId, request);

    const profile = await loadStudentHealthProfile(supabase, organizationId, studentId);
    return NextResponse.json({ profile });
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
      error: error instanceof Error ? error.message : "Failed to load health profile.",
      code: "load_failed",
      cause: error,
    });
  }
}

type CreateBody = {
  itemType?: string;
  values?: Record<string, unknown>;
};

export async function POST(request: Request, context: RouteContext) {
  const { slug, studentId } = await context.params;
  const supabase = await createClientFromRequest(request);

  try {
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
      createStudentHealthItem(
        admin,
        {
          organizationId,
          studentId,
          userId: user.id,
          guardianId: null,
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
      error: error instanceof Error ? error.message : "Failed to save health item.",
      code: "create_failed",
      cause: error,
    });
  }
}
