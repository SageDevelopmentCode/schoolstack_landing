import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { requirePlatformAdminUser } from "@/lib/admin/require-platform-admin-api";
import { AuthError } from "@/lib/admissions/application-auth";
import { apiError } from "@/lib/api/route-errors";
import { fetchParentActivityNotifications } from "@/lib/parent-portal/parent-activity-notifications";
import { createAdminClient } from "@/utils/supabase/admin";
import { createClient } from "@/utils/supabase/server";

const ROUTE = "/api/admin/organizations/[id]/parent-activity-notifications";
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
  const familyId = searchParams.get("familyId")?.trim() ?? "";
  const cursor = searchParams.get("cursor")?.trim() || null;
  const limit = parseLimit(searchParams.get("limit"));

  if (!familyId) {
    return apiError(ROUTE, {
      request,
      status: 400,
      error: "familyId is required.",
      code: "missing_fields",
    });
  }

  try {
    await requirePlatformAdminUser(supabase);

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
        error: "Failed to load family activity notifications.",
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

    const page = await fetchParentActivityNotifications(
      admin,
      organizationId,
      String(organization.slug),
      familyId,
      { cursor, limit, aggregateAllContexts: true },
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
      error: "Failed to load family activity notifications.",
      code: "internal_error",
      cause: error,
    });
  }
}
