import { NextResponse } from "next/server";
import { apiError } from "@/lib/api/route-errors";
import { coopPortalApiError } from "@/lib/parent-portal/coop-portal-api-route";
import { loadParentCoopSupplyListPageDataForUser } from "@/lib/parent-portal/load-parent-coop-portal-page-data";
import { createClientFromRequest, getUserFromRequest, signedInErrorForRequest } from "@/lib/supabase/request-client";

const ROUTE = "/api/parent-portal/coop/supply-list";

export async function GET(request: Request) {
  const supabase = await createClientFromRequest(request);
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

  const url = new URL(request.url);
  const organizationId = url.searchParams.get("organizationId")?.trim() ?? "";
  const programId = url.searchParams.get("programId")?.trim() ?? "";

  if (!organizationId || !programId) {
    return apiError(ROUTE, {
      request,
      status: 400,
      error: "organizationId and programId are required.",
      code: "missing_fields",
    });
  }

  try {
    const payload = await loadParentCoopSupplyListPageDataForUser({
      supabase,
      userId: user.id,
      organizationId,
      programId,
    });
    return NextResponse.json(payload);
  } catch (err) {
    return coopPortalApiError(ROUTE, request, err, "Failed to load supply list.");
  }
}
