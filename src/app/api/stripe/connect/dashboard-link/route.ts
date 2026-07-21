import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  AuthError,
  requireAuthenticatedUser,
} from "@/lib/admissions/application-auth";
import { apiError } from "@/lib/api/route-errors";
import { canManageOrganization } from "@/lib/school-admin/access";
import { getStripeClient } from "@/lib/stripe/client";
import { getOrganizationPaymentAccount } from "@/lib/stripe/organization-payment-account";
import { createAdminClient } from "@/utils/supabase/admin";
import { createClient } from "@/utils/supabase/server";

const ROUTE = "/api/stripe/connect/dashboard-link";

type DashboardLinkRequestBody = {
  organizationId?: string;
};

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  try {
    const user = await requireAuthenticatedUser(supabase);

    let body: DashboardLinkRequestBody;
    try {
      body = (await request.json()) as DashboardLinkRequestBody;
    } catch {
      return apiError(ROUTE, {
        request,
        status: 400,
        error: "Invalid request body.",
        code: "invalid_body",
      });
    }

    const organizationId = body.organizationId?.trim();
    if (!organizationId) {
      return apiError(ROUTE, {
        request,
        status: 400,
        error: "organizationId is required.",
        code: "missing_fields",
      });
    }

    const canManage = await canManageOrganization(
      supabase,
      user.id,
      organizationId,
    );
    if (!canManage) {
      return apiError(ROUTE, {
        request,
        status: 403,
        error: "You do not have permission to manage payments.",
        code: "forbidden",
      });
    }

    const admin = createAdminClient();
    const account = await getOrganizationPaymentAccount(admin, organizationId);

    if (!account?.stripeConnectAccountId) {
      return apiError(ROUTE, {
        request,
        status: 400,
        error: "Stripe is not connected for this school yet.",
        code: "not_connected",
      });
    }

    const stripe = getStripeClient();
    const loginLink = await stripe.accounts.createLoginLink(
      account.stripeConnectAccountId,
    );

    return NextResponse.json({ url: loginLink.url });
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
      error: "Failed to open Stripe dashboard.",
      code: "internal_error",
      cause: error,
    });
  }
}
