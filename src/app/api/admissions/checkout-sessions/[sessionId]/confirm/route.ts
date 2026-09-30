import { NextResponse } from "next/server";
import { AuthError } from "@/lib/admissions/application-auth";
import { requireAuthenticatedUser } from "@/lib/admissions/application-auth-server";
import { apiError } from "@/lib/api/route-errors";
import {
  assertConfirmableCheckoutSession,
  CheckoutSessionSyncError,
  describeCheckoutConfirmOutcome,
  retrieveCheckoutSession,
  userCanConfirmCheckoutSession,
} from "@/lib/stripe/sync-checkout-session-completed";
import { handleCheckoutSessionCompleted } from "@/lib/stripe/webhook-handlers";
import { createClientFromRequest } from "@/lib/supabase/request-client";
import { createAdminClient } from "@/utils/supabase/admin";

const ROUTE = "/api/admissions/checkout-sessions/[sessionId]/confirm";

type RouteContext = {
  params: Promise<{ sessionId: string }>;
};

export async function POST(request: Request, context: RouteContext) {
  const supabase = await createClientFromRequest(request);
  const { sessionId } = await context.params;

  if (!sessionId?.trim()) {
    return apiError(ROUTE, {
      request,
      status: 400,
      error: "Missing checkout session id.",
      code: "missing_session_id",
    });
  }

  try {
    const user = await requireAuthenticatedUser(supabase, request);
    const admin = createAdminClient();
    const session = await retrieveCheckoutSession(sessionId.trim());
    assertConfirmableCheckoutSession(session);

    const canConfirm = await userCanConfirmCheckoutSession(
      supabase,
      admin,
      user.id,
      session,
    );
    if (!canConfirm) {
      return apiError(ROUTE, {
        request,
        status: 403,
        error: "You do not have access to this checkout session.",
        code: "forbidden",
      });
    }

    await handleCheckoutSessionCompleted(admin, session);

    return NextResponse.json({
      ok: true,
      ...describeCheckoutConfirmOutcome(session),
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return apiError(ROUTE, {
        request,
        status: error.status,
        error: error.message,
        code: error.code,
      });
    }

    if (error instanceof CheckoutSessionSyncError) {
      return apiError(ROUTE, {
        request,
        status: error.status,
        error: error.message,
        code: error.code,
      });
    }

    return apiError(ROUTE, {
      request,
      status: 500,
      error: "Failed to confirm checkout payment.",
      cause: error,
    });
  }
}
