import { NextResponse } from "next/server";
import { parsePagination } from "@/lib/api/pagination";
import { apiError } from "@/lib/api/route-errors";
import { withParentPortalRoute } from "@/lib/parent-portal/with-parent-portal-route";
import {
  filterChargesForFamilyGuardian,
  listChargesForFamilyPaginated,
} from "@/lib/tuition/charges";
import { listBillingSplits } from "@/lib/tuition/billing-splits";
import { resolveGuardianIdForUser } from "@/lib/tuition/payment-settlement";

const ROUTE = "/api/parent-portal/billing/charges";

export const GET = withParentPortalRoute(
  {
    route: ROUTE,
    requireFamily: true,
    feature: "billing",
    fallbackErrorMessage: "Failed to load charges.",
  },
  async ({ request, supabase, user, familyId }) => {
    const { limit, offset } = parsePagination(new URL(request.url).searchParams, {
      defaultLimit: 50,
      maxLimit: 200,
    });

    try {
      const [guardianId, billingSplits, page] = await Promise.all([
        resolveGuardianIdForUser(supabase, { familyId: familyId!, userId: user.id }),
        listBillingSplits(supabase, familyId!),
        listChargesForFamilyPaginated(supabase, familyId!, { limit, offset }),
      ]);

      const hasBillingSplit = billingSplits.length > 0;
      const charges = filterChargesForFamilyGuardian(page.charges, guardianId, {
        hasBillingSplit,
      });

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
  },
);
