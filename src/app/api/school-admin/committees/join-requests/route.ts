import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { apiError } from "@/lib/api/route-errors";
import { listCommitteeJoinRequests } from "@/lib/committees/join-requests";
import {
  requireSchoolAdminUser,
  SchoolAdminAuthError,
} from "@/lib/school-admin/access";
import { createAdminClient } from "@/utils/supabase/admin";
import { createClient } from "@/utils/supabase/server";

const ROUTE = "/api/school-admin/committees/join-requests";

export async function GET(request: Request) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { searchParams } = new URL(request.url);
  const organizationId = searchParams.get("organizationId")?.trim() ?? "";
  const committeeId = searchParams.get("committeeId")?.trim() || undefined;
  const status = searchParams.get("status")?.trim() as
    | "pending"
    | "approved"
    | "declined"
    | "withdrawn"
    | undefined;

  if (!organizationId) {
    return apiError(ROUTE, {
      request,
      status: 400,
      error: "organizationId is required.",
      code: "missing_fields",
    });
  }

  try {
    await requireSchoolAdminUser(supabase, organizationId);
    const admin = createAdminClient();
    const requests = await listCommitteeJoinRequests(admin, organizationId, {
      committeeId,
      status: status ?? "pending",
    });
    return NextResponse.json({ requests });
  } catch (err) {
    if (err instanceof SchoolAdminAuthError) {
      return apiError(ROUTE, {
        request,
        status: err.status,
        error: err.message,
        code: err.code,
        cause: err,
      });
    }

    return apiError(ROUTE, {
      request,
      status: 500,
      error: "Failed to load join requests.",
      code: "internal_error",
      cause: err,
    });
  }
}
