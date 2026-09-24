import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { requirePlatformAdminUser } from "@/lib/admin/require-platform-admin-api";
import { AuthError } from "@/lib/admissions/application-auth";
import { apiError } from "@/lib/api/route-errors";
import { fetchTeacherActivityNotifications } from "@/lib/school-teacher/activity-notifications";
import { staffPreviewBasePath } from "@/lib/staff/staff-preview-access";
import { createAdminClient } from "@/utils/supabase/admin";
import { createClient } from "@/utils/supabase/server";

const ROUTE = "/api/admin/organizations/[id]/teacher-activity-notifications";
const DEFAULT_LIMIT = 15;
const MAX_LIMIT = 30;

type RouteContext = {
  params: Promise<{ id: string }>;
};

function parseLimit(value: string | null): number {
  if (!value) return DEFAULT_LIMIT;
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed < 1) return DEFAULT_LIMIT;
  return Math.min(parsed, MAX_LIMIT);
}

export async function GET(request: Request, context: RouteContext) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { id: organizationId } = await context.params;

  const { searchParams } = new URL(request.url);
  const staffMemberId = searchParams.get("staffMemberId")?.trim() ?? "";
  const cursor = searchParams.get("cursor")?.trim() || null;
  const limit = parseLimit(searchParams.get("limit"));

  if (!staffMemberId) {
    return apiError(ROUTE, {
      request,
      status: 400,
      error: "staffMemberId is required.",
      code: "missing_fields",
    });
  }

  try {
    await requirePlatformAdminUser(supabase, request);

    const admin = createAdminClient();
    const { data: organization, error: organizationError } = await admin
      .from("organizations")
      .select("id, slug")
      .eq("id", organizationId)
      .maybeSingle();

    if (organizationError) {
      return apiError(ROUTE, {
        request,
        status: 500,
        error: "Failed to load teacher activity notifications.",
        cause: organizationError,
      });
    }

    if (!organization?.slug) {
      return apiError(ROUTE, {
        request,
        status: 404,
        error: "Organization not found.",
        code: "organization_not_found",
      });
    }

    const slug = String(organization.slug);
    const teacherBasePath = staffPreviewBasePath(slug, staffMemberId);

    const page = await fetchTeacherActivityNotifications(
      admin,
      organizationId,
      slug,
      staffMemberId,
      {
        cursor,
        limit,
        teacherBasePath,
      },
    );

    return NextResponse.json(page);
  } catch (error) {
    if (error instanceof AuthError) {
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
      error: "Failed to load teacher activity notifications.",
      code: "internal_error",
      cause: error,
    });
  }
}
