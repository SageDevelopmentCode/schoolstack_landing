import { NextResponse } from "next/server";
import { apiError } from "@/lib/api/route-errors";
import { userHasEnrolledAccess } from "@/lib/admissions/parent-portal-access";
import {
  isParentNewslettersFeatureEnabled,
  loadParentNewslettersListBundle,
} from "@/lib/parent-portal/newsletters/load-parent-newsletters";
import { createClientFromRequest, getUserFromRequest, signedInErrorForRequest } from "@/lib/supabase/request-client";
import { createAdminClient } from "@/utils/supabase/admin";

const ROUTE = "/api/parent-portal/newsletters";

export async function GET(request: Request) {
  const supabase = await createClientFromRequest(request);
  const organizationId = new URL(request.url).searchParams.get("organizationId")?.trim() ?? "";

  if (!organizationId) {
    return apiError(ROUTE, {
      request,
      status: 400,
      error: "organizationId is required.",
      code: "missing_fields",
    });
  }

  const {
    data: { user },
    error: authError,
  } = await getUserFromRequest(supabase, request);

  if (!user) {
    return apiError(ROUTE, {
      request,
      status: 401,
      error: await signedInErrorForRequest(request, authError),
      code: "unauthorized",
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
    const { data: settingsRow, error: settingsError } = await admin
      .from("organization_settings")
      .select("features")
      .eq("organization_id", organizationId)
      .maybeSingle();

    if (settingsError) throw settingsError;

    if (!isParentNewslettersFeatureEnabled(settingsRow?.features as never)) {
      return apiError(ROUTE, {
        request,
        status: 403,
        error: "Newsletters are not available for this school.",
        code: "feature_disabled",
      });
    }

    const bundle = await loadParentNewslettersListBundle(admin, organizationId);
    return NextResponse.json(bundle);
  } catch (err) {
    return apiError(ROUTE, {
      request,
      status: 500,
      error: "Failed to load newsletters.",
      cause: err,
      code: "load_failed",
    });
  }
}
