import { NextResponse } from "next/server";
import { apiError } from "@/lib/api/route-errors";
import { getFamilyIdsForUser } from "@/lib/admissions/application-auth";
import { userHasEnrolledAccess } from "@/lib/admissions/parent-portal-access";
import { loadParentSignupAttentionItems } from "@/lib/classroom-signups/load-parent-signups";
import { createClientFromRequest } from "@/lib/supabase/request-client";
import { createAdminClient } from "@/utils/supabase/admin";
import { resolveSignupAttentionFamilyId } from "./resolve-family-id";

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
  const requestedFamilyId = url.searchParams.get("familyId")?.trim() ?? "";

  if (!organizationId) {
    return apiError(ROUTE, {
      request,
      status: 400,
      error: "organizationId is required.",
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

    const familyIds = await getFamilyIdsForUser(supabase, user.id, organizationId);
    const resolvedFamily = resolveSignupAttentionFamilyId(familyIds, requestedFamilyId);
    if ("error" in resolvedFamily) {
      return apiError(ROUTE, {
        request,
        status: 403,
        error: "You do not have access to this family.",
        code: "forbidden",
      });
    }

    const familyId = resolvedFamily.familyId;
    if (!familyId) {
      return NextResponse.json({ items: [] });
    }

    const admin = createAdminClient();
    const items = await loadParentSignupAttentionItems(admin, organizationId, familyId);

    return NextResponse.json({ items });
  } catch (err) {
    return apiError(ROUTE, {
      request,
      status: 500,
      error: "Failed to load signup attention items.",
      cause: err,
      code: "internal_error",
    });
  }
}
