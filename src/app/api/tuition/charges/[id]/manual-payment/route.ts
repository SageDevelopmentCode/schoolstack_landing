import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { apiError } from "@/lib/api/route-errors";
import {
  AuthError,
  requireAuthenticatedUser,
} from "@/lib/admissions/application-auth";
import { recordManualTuitionPayment } from "@/lib/tuition/payments";
import { schoolAdminActivityContext } from "@/lib/tuition/tuition-activity";
import { sendTuitionPaymentReceiptNotifications } from "@/lib/tuition/payment-receipt-notifications";
import { getChargeById } from "@/lib/tuition/charges";
import { createAdminClient } from "@/utils/supabase/admin";
import { createClient } from "@/utils/supabase/server";

const ROUTE = "/api/tuition/charges/[id]/manual-payment";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(request: Request, context: RouteContext) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { id: chargeId } = await context.params;

  try {
    const user = await requireAuthenticatedUser(supabase);
    const admin = createAdminClient();
    const charge = await getChargeById(admin, chargeId);

    if (!charge) {
      return apiError(ROUTE, {
        request,
        status: 404,
        error: "Charge not found.",
        code: "not_found",
      });
    }

    const { data: membership, error: membershipError } = await admin
      .from("organization_memberships")
      .select("role")
      .eq("organization_id", charge.organizationId)
      .eq("user_id", user.id)
      .eq("status", "active")
      .maybeSingle();

    if (membershipError) throw membershipError;
    if (membership?.role !== "owner" && membership?.role !== "admin") {
      return apiError(ROUTE, {
        request,
        status: 403,
        error: "Admin access required.",
        code: "forbidden",
      });
    }

    const body = (await request.json().catch(() => ({}))) as {
      amountCents?: unknown;
    };

    const amountCents =
      typeof body.amountCents === "number" && Number.isFinite(body.amountCents)
        ? Math.round(body.amountCents)
        : charge.amountCents - charge.paidCents;

    if (amountCents <= 0) {
      return apiError(ROUTE, {
        request,
        status: 400,
        error: "Payment amount must be greater than zero.",
        code: "invalid_amount",
      });
    }

    const { data: family } = await admin
      .from("families")
      .select("name")
      .eq("id", charge.familyId)
      .maybeSingle();

    const { paymentId, settleResult } = await recordManualTuitionPayment(
      admin,
      {
        organizationId: charge.organizationId,
        familyId: charge.familyId,
        tuitionChargeId: charge.id,
        amountCents,
        label: charge.label,
        payerUserId: user.id,
        method: "manual",
        familyName: family?.name ? String(family.name) : undefined,
      },
      { context: schoolAdminActivityContext(user) },
    );

    void sendTuitionPaymentReceiptNotifications(admin, paymentId, {
      settleResult,
      manual: true,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof AuthError) {
      return apiError(ROUTE, {
        request,
        status: error.status,
        error: error.message,
        code: error.code,
      });
    }
    throw error;
  }
}
