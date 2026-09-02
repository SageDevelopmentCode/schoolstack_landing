import { NextResponse } from "next/server";
import { apiError } from "@/lib/api/route-errors";
import { userHasEnrolledAccess } from "@/lib/admissions/parent-portal-access";
import { loadParentSignupAttentionItems } from "@/lib/classroom-signups/load-parent-signups";
import { createAdminClient } from "@/utils/supabase/admin";
import { createClientFromRequest } from "@/lib/supabase/request-client";

const ROUTE = "/api/parent-portal/signups/attention";

export async function GET(request: Request) {
  const supabase = await createClientFromRequest(request);
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

  const url = new URL(request.url);
  const organizationId = url.searchParams.get("organizationId")?.trim() ?? "";
  const familyId = url.searchParams.get("familyId")?.trim() ?? "";

  if (!organizationId || !familyId) {
    return apiError(ROUTE, {
      request,
      status: 400,
      error: "organizationId and familyId are required.",
      code: "missing_fields",
    });
  }

  try {
    const hasAccess = await userHasEnrolledAccess(supabase, user.id, organizationId);
    if (!hasAccess) {
      return apiError(ROUTE, {
        request,
        status: 403,
        error: "You do not have access to the parent portal.",
        code: "forbidden",
      });
    }

    const admin = createAdminClient();
    const items = await loadParentSignupAttentionItems(admin, organizationId, familyId);

    return NextResponse.json({ items });
  } catch (err) {
    return apiError(ROUTE, {
      request,
      status: 500,
      error: err instanceof Error ? err.message : "Failed to load signup attention items.",
      code: "internal_error",
      cause: err,
    });
  }
}
