import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { apiError } from "@/lib/api/route-errors";
import {
  AuthError,
  requireAuthenticatedUser,
} from "@/lib/admissions/application-auth";
import { refundTuitionPayment } from "@/lib/tuition/autopay";
import { schoolAdminActivityContext } from "@/lib/tuition/tuition-activity";
import { createAdminClient } from "@/utils/supabase/admin";
import { createClient } from "@/utils/supabase/server";

const ROUTE = "/api/tuition/payments/[id]/refund";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(request: Request, context: RouteContext) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { id: paymentId } = await context.params;

  try {
    const user = await requireAuthenticatedUser(supabase);
    const admin = createAdminClient();

    const { data: payment, error: paymentError } = await admin
      .from("application_payments")
      .select("organization_id, payment_type, status")
      .eq("id", paymentId)
      .maybeSingle();

    if (paymentError) throw paymentError;
    if (!payment || payment.payment_type !== "tuition") {
      return apiError(ROUTE, {
        request,
        status: 404,
        error: "Tuition payment not found.",
        code: "not_found",
      });
    }

    const { data: membership, error: membershipError } = await admin
      .from("organization_memberships")
      .select("role")
      .eq("organization_id", payment.organization_id)
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

    await refundTuitionPayment(admin, paymentId, {
      context: schoolAdminActivityContext(user),
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
