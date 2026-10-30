import { NextResponse } from "next/server";
import {
  searchAdminManualVisitBookingTargets,
  type AdminManualBookingContext,
} from "@/lib/admissions/admin-manual-visit-booking";
import { apiError } from "@/lib/api/route-errors";
import {
  requireSchoolAdminUser,
  SchoolAdminAuthError,
} from "@/lib/school-admin/access";
import { createAdminClient } from "@/utils/supabase/admin";
import { createClientFromRequest } from "@/lib/supabase/request-client";

const ROUTE = "/api/school-admin/admissions/visits/booking-targets";

function parseContext(value: string | null): AdminManualBookingContext | null {
  if (value === "tours" || value === "shadow") return value;
  return null;
}

export async function GET(request: Request) {
  const supabase = await createClientFromRequest(request);
  const { searchParams } = new URL(request.url);
  const organizationId = searchParams.get("organizationId")?.trim() ?? "";
  const query = searchParams.get("q")?.trim() ?? "";
  const context = parseContext(searchParams.get("context"));
  const limit = Math.min(
    Math.max(Number(searchParams.get("limit") ?? 25), 1),
    50,
  );

  if (!organizationId) {
    return apiError(ROUTE, {
      request,
      status: 400,
      error: "organizationId is required.",
      code: "missing_fields",
    });
  }

  if (!context) {
    return apiError(ROUTE, {
      request,
      status: 400,
      error: "context must be tours or shadow.",
      code: "invalid_request",
    });
  }

  try {
    await requireSchoolAdminUser(supabase, organizationId, request);
    const admin = createAdminClient();
    const targets = await searchAdminManualVisitBookingTargets(
      admin,
      organizationId,
      context,
      { query, limit },
    );

    return NextResponse.json(targets);
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

    return apiError(ROUTE, {
      request,
      status: 500,
      error: "Failed to load booking targets.",
      cause: error,
      code: "load_failed",
    });
  }
}
