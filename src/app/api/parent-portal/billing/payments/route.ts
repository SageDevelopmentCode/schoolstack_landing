import { NextResponse } from "next/server";
import { parsePagination } from "@/lib/api/pagination";
import { apiError } from "@/lib/api/route-errors";
import { withParentPortalRoute } from "@/lib/parent-portal/with-parent-portal-route";
import { listParentTuitionPaymentHistoryPaginated } from "@/lib/tuition/payments";

const ROUTE = "/api/parent-portal/billing/payments";

export const GET = withParentPortalRoute(
  {
    route: ROUTE,
    requireFamily: true,
    feature: "billing",
    fallbackErrorMessage: "Failed to load payments.",
  },
  async ({ request, supabase, familyId }) => {
    const { limit, offset } = parsePagination(new URL(request.url).searchParams, {
      defaultLimit: 50,
      maxLimit: 200,
    });

    try {
      const page = await listParentTuitionPaymentHistoryPaginated(supabase, familyId!, {
        limit,
        offset,
      });

      return NextResponse.json({
        payments: page.payments,
        totalCount: page.totalCount,
      });
    } catch (err) {
      return apiError(ROUTE, {
        request,
        status: 500,
        error: "Failed to load payments.",
        cause: err,
        code: "internal_error",
      });
    }
  },
);
