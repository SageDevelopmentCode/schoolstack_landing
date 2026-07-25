import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { apiError } from "@/lib/api/route-errors";
import { backfillTuitionAssignmentsForOrganization } from "@/lib/tuition/assignments";
import {
  requireSchoolAdminUser,
  SchoolAdminAuthError,
} from "@/lib/school-admin/access";
import { createAdminClient } from "@/utils/supabase/admin";
import { createClient } from "@/utils/supabase/server";

const ROUTE = "/api/tuition/sync-assignments";

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  try {
    const admin = createAdminClient();
    const body = (await request.json()) as { organizationId?: string };

    if (!body.organizationId) {
      return apiError(ROUTE, {
        request,
        status: 400,
        error: "organizationId is required.",
        code: "invalid_request",
      });
    }

    const organizationId = body.organizationId;
    const user = await requireSchoolAdminUser(supabase, organizationId);

    const result = await backfillTuitionAssignmentsForOrganization(
      admin,
      organizationId,
      user.id,
    );

    return NextResponse.json(result);
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
    throw error;
  }
}
