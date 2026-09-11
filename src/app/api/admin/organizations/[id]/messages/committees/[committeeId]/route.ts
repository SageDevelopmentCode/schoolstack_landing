import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getOrganizationCommitteeMessages } from "@/lib/admin/organization-committee-messages";
import { requirePlatformAdminUser } from "@/lib/admin/require-platform-admin-api";
import { AuthError } from "@/lib/admissions/application-auth";
import { apiError } from "@/lib/api/route-errors";
import { createAdminClient } from "@/utils/supabase/admin";
import { createClient } from "@/utils/supabase/server";

const ROUTE = "/api/admin/organizations/[id]/messages/committees/[committeeId]";

type RouteContext = {
  params: Promise<{ id: string; committeeId: string }>;
};

export async function GET(request: Request, context: RouteContext) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { id: organizationId, committeeId } = await context.params;

  try {
    await requirePlatformAdminUser(supabase);

    const admin = createAdminClient();
    const detail = await getOrganizationCommitteeMessages(
      admin,
      organizationId,
      committeeId,
    );

    if (!detail) {
      return apiError(ROUTE, {
        request,
        status: 404,
        error: "Committee not found.",
        code: "committee_not_found",
      });
    }

    return NextResponse.json(detail);
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
      error: "Failed to load committee messages.",
      code: "internal_error",
      cause: error,
    });
  }
}
