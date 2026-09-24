import { NextResponse } from "next/server";
import { apiError } from "@/lib/api/route-errors";
import { userHasEnrolledAccess } from "@/lib/admissions/parent-portal-access";
import {
  filterChargesForFamilyGuardian,
  listChargesForFamilyPaginated,
} from "@/lib/tuition/charges";
import { listBillingSplits } from "@/lib/tuition/billing-splits";
import { resolveGuardianIdForUser } from "@/lib/tuition/payment-settlement";
import { createClientFromRequest, getUserFromRequest, signedInErrorForRequest } from "@/lib/supabase/request-client";

const ROUTE = "/api/parent-portal/billing/charges";

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
      error: "Failed to load charges.",
      cause: err,
      code: "internal_error",
    });
  }
}
