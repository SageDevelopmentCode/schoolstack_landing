import { NextResponse } from "next/server";
import { requirePlatformAdminUser } from "@/lib/admin/require-platform-admin-api";
import { AuthError } from "@/lib/admissions/application-auth";
import { apiError } from "@/lib/api/route-errors";
import { createClientFromRequest } from "@/lib/supabase/request-client";
import { sendAutopayConfirmationNotifications } from "@/lib/tuition/payment-receipt-notifications";
import { createAdminClient } from "@/utils/supabase/admin";

const ROUTE = "/api/admin/organizations/[id]/tuition/autopay-confirmation";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(request: Request, context: RouteContext) {
  const supabase = await createClientFromRequest(request);
  const { id: organizationId } = await context.params;

  try {
    await requirePlatformAdminUser(supabase, request);

    const body = (await request.json().catch(() => ({}))) as {
      paymentIds?: unknown;
      showDisregardNote?: unknown;
    };
    const paymentIds = Array.isArray(body.paymentIds)
      ? body.paymentIds.filter((id): id is string => typeof id === "string" && id.length > 0)
      : [];

    if (paymentIds.length === 0) {
      return apiError(ROUTE, {
        request,
        status: 400,
        error: "paymentIds is required.",
        code: "invalid_request",
      });
    }

    const result = await sendAutopayConfirmationNotifications(createAdminClient(), {
      organizationId,
      paymentIds,
      showDisregardNote: body.showDisregardNote !== false,
    });

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof AuthError) {
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
      error: "Failed to send autopay confirmation emails.",
      code: "internal_error",
      cause: error,
    });
  }
}
