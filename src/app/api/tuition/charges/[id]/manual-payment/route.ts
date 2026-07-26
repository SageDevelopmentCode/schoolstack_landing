import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { apiError } from "@/lib/api/route-errors";
import {
  AuthError,
  requireAuthenticatedUser,
} from "@/lib/admissions/application-auth";
import { recordManualTuitionPayment } from "@/lib/tuition/payments";
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

    await recordManualTuitionPayment(admin, {
      organizationId: charge.organizationId,
      familyId: charge.familyId,
      tuitionChargeId: charge.id,
      amountCents: charge.amountCents,
      label: charge.label,
      payerUserId: user.id,
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
