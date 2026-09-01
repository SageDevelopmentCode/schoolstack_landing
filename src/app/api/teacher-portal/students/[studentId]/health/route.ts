import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { apiError } from "@/lib/api/route-errors";
import { authorizeTeacherStudentHealthAccess } from "@/lib/student-health/authorize-teacher-student";
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
import { TeacherPortalAuthError } from "@/lib/staff/teacher-portal-access";
import { createAdminClient } from "@/utils/supabase/admin";
import { createClient } from "@/utils/supabase/server";

const ROUTE = "/api/teacher-portal/students/[studentId]/health";

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
        error: "You do not have permission to view this student's health profile.",
        code: "forbidden",
      });
    }

    const admin = createAdminClient();
    const profile = await loadStudentHealthProfile(admin, organizationId, studentId);
    return NextResponse.json({ profile });
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
      error: error instanceof Error ? error.message : "Failed to load health profile.",
      code: "load_failed",
      cause: error,
    });
  }
}

type CreateBody = {
  organizationId?: string;
  itemType?: string;
  values?: Record<string, unknown>;
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
      error: error instanceof Error ? error.message : "Failed to save health item.",
      code: "create_failed",
      cause: error,
    });
  }
}
