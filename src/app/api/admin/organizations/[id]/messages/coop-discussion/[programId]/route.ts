import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getOrganizationCoopDiscussionMessages } from "@/lib/admin/organization-coop-discussion-messages";
import { requirePlatformAdminUser } from "@/lib/admin/require-platform-admin-api";
import { AuthError } from "@/lib/admissions/application-auth";
import { apiError } from "@/lib/api/route-errors";
import { createAdminClient } from "@/utils/supabase/admin";
import { createClient } from "@/utils/supabase/server";

const ROUTE = "/api/admin/organizations/[id]/messages/coop-discussion/[programId]";

type RouteContext = {
  params: Promise<{ id: string; programId: string }>;
};

export async function GET(request: Request, context: RouteContext) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { id: organizationId, programId } = await context.params;
  const { searchParams } = new URL(request.url);
  const curriculumId = searchParams.get("curriculumId");

  try {
    await requirePlatformAdminUser(supabase);

    const admin = createAdminClient();
    const messages = await getOrganizationCoopDiscussionMessages(
      admin,
      organizationId,
      programId,
      curriculumId,
    );

    return NextResponse.json({ messages });
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
      error: "Failed to load co-op discussion messages.",
      code: "internal_error",
      cause: error,
    });
  }
}
