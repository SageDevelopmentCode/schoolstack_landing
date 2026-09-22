import { NextResponse } from "next/server";
import { apiError } from "@/lib/api/route-errors";
import { listOrganizationTuitionPaymentsPaginated } from "@/lib/tuition/payments";
import {
  requireSchoolAdminUser,
  SchoolAdminAuthError,
} from "@/lib/school-admin/access";
import { createClientFromRequest } from "@/lib/supabase/request-client";
import { createAdminClient } from "@/utils/supabase/admin";

const ROUTE = "/api/school-admin/tuition/payments";
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

    const { payments, totalCount } = await listOrganizationTuitionPaymentsPaginated(
      admin,
      organizationId,
      { limit, offset },
    );

    return NextResponse.json({
      payments,
      totalCount,
      limit,
      offset,
      hasMore: offset + payments.length < totalCount,
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
      error: "Failed to load tuition payments.",
      cause: err,
      code: "internal_error",
    });
  }
}
