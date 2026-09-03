import { NextResponse } from "next/server";
import { apiError } from "@/lib/api/route-errors";
import { userHasEnrolledAccess } from "@/lib/admissions/parent-portal-access";
import {
  filterChargesForFamilyGuardian,
  listChargesForFamilyPaginated,
} from "@/lib/tuition/charges";
import { listBillingSplits } from "@/lib/tuition/billing-splits";
import { resolveGuardianIdForUser } from "@/lib/tuition/payment-settlement";
import { createClientFromRequest } from "@/lib/supabase/request-client";

const ROUTE = "/api/parent-portal/billing/charges";

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
  const limit = Number(url.searchParams.get("limit") ?? "50");
  const offset = Number(url.searchParams.get("offset") ?? "0");

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

    const [guardianId, billingSplits, page] = await Promise.all([
      resolveGuardianIdForUser(supabase, { familyId, userId: user.id }),
      listBillingSplits(supabase, familyId),
      listChargesForFamilyPaginated(supabase, familyId, { limit, offset }),
    ]);

    const hasBillingSplit = billingSplits.length > 0;
    const charges = filterChargesForFamilyGuardian(
      page.charges,
      guardianId,
      { hasBillingSplit },
    );

    return NextResponse.json({
      charges,
      totalCount: page.totalCount,
      hasBillingSplit,
      guardianId,
    });
  } catch (err) {
    return apiError(ROUTE, {
      request,
      status: 500,
      error: err instanceof Error ? err.message : "Failed to load charges.",
      code: "internal_error",
      cause: err,
    });
  }
}
