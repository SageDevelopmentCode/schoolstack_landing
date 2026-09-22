import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { listOrganizationCoopDiscussionThreads } from "@/lib/admin/organization-coop-discussion-messages";
import { requirePlatformAdminUser } from "@/lib/admin/require-platform-admin-api";
import { AuthError } from "@/lib/admissions/application-auth";
import { apiError } from "@/lib/api/route-errors";
import { createAdminClient } from "@/utils/supabase/admin";
import { createClient } from "@/utils/supabase/server";

const ROUTE = "/api/admin/organizations/[id]/messages/coop-discussion";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(request: Request, context: RouteContext) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { id: organizationId } = await context.params;

  try {
    await requirePlatformAdminUser(supabase);

    const admin = createAdminClient();
    const { data: organization, error: organizationError } = await admin
      .from("organizations")
      .select("id")
      .eq("id", organizationId)
      .maybeSingle();

    if (organizationError) {
      return apiError(ROUTE, {
        request,
        status: 500,
        error: "Failed to load co-op discussion threads.",
        cause: organizationError,
      });
    }

    if (!organization?.id) {
      return apiError(ROUTE, {
        request,
        status: 404,
        error: "Organization not found.",
        code: "organization_not_found",
      });
    }

    const threads = await listOrganizationCoopDiscussionThreads(
      admin,
      organizationId,
    );

    return NextResponse.json({ threads });
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
      error: "Failed to load co-op discussion threads.",
      code: "internal_error",
      cause: error,
    });
  }
}
