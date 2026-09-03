import { NextResponse } from "next/server";
import { apiError } from "@/lib/api/route-errors";
import { listFamilyBillingSummaries } from "@/lib/tuition/charges";
import {
  requireSchoolAdminUser,
  SchoolAdminAuthError,
} from "@/lib/school-admin/access";
import { createClientFromRequest } from "@/lib/supabase/request-client";
import { createAdminClient } from "@/utils/supabase/admin";

const ROUTE = "/api/school-admin/tuition/families";
const DEFAULT_LIMIT = 50;
const MAX_LIMIT = 100;

export async function GET(request: Request) {
  const supabase = await createClientFromRequest(request);
  const { searchParams } = new URL(request.url);
  const organizationId = searchParams.get("organizationId")?.trim() ?? "";
  const limit = Math.min(
    Math.max(Number(searchParams.get("limit") ?? DEFAULT_LIMIT), 1),
    MAX_LIMIT,
  );
  const offset = Math.max(Number(searchParams.get("offset") ?? 0), 0);

  if (!organizationId) {
    return apiError(ROUTE, {
      request,
      status: 400,
      error: "organizationId is required.",
      code: "missing_fields",
    });
  }

  try {
    await requireSchoolAdminUser(supabase, organizationId, request);
    const admin = createAdminClient();

    const [families, totalCountResult] = await Promise.all([
      listFamilyBillingSummaries(admin, organizationId, { limit, offset }),
      admin
        .from("families")
        .select("id", { count: "exact", head: true })
        .eq("organization_id", organizationId),
    ]);

    if (totalCountResult.error) throw totalCountResult.error;

    return NextResponse.json({
      families,
      totalCount: totalCountResult.count ?? families.length,
      limit,
      offset,
      hasMore: families.length >= limit,
    });
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
      error: err instanceof Error ? err.message : "Failed to load tuition families.",
      code: "internal_error",
      cause: err,
    });
  }
}
