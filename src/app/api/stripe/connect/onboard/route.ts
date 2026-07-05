import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  AuthError,
  requireAuthenticatedUser,
  userIsOrgAdmin,
} from "@/lib/admissions/application-auth";
import { apiError } from "@/lib/api/route-errors";
import { getSiteUrl, getStripeClient } from "@/lib/stripe/client";
import {
  getOrganizationPaymentAccount,
  upsertOrganizationPaymentAccount,
} from "@/lib/stripe/organization-payment-account";
import { schoolAdminPath } from "@/lib/organization-settings/admin-routes";
import { createAdminClient } from "@/utils/supabase/admin";
import { createClient } from "@/utils/supabase/server";

const ROUTE = "/api/stripe/connect/onboard";

type OnboardRequestBody = {
  organizationId?: string;
  orgSlug?: string;
};

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  try {
    const user = await requireAuthenticatedUser(supabase);

    let body: OnboardRequestBody;
    try {
      body = (await request.json()) as OnboardRequestBody;
    } catch {
      return apiError(ROUTE, {
        request,
        status: 400,
        error: "Invalid request body.",
        code: "invalid_body",
      });
    }

    const organizationId = body.organizationId?.trim();
    const orgSlug = body.orgSlug?.trim();

    if (!organizationId || !orgSlug) {
      return apiError(ROUTE, {
        request,
        status: 400,
        error: "organizationId and orgSlug are required.",
        code: "missing_fields",
      });
    }

    const isAdmin = await userIsOrgAdmin(supabase, user.id, organizationId);
    if (!isAdmin) {
      return apiError(ROUTE, {
        request,
        status: 403,
        error: "You do not have permission to manage payments.",
        code: "forbidden",
      });
    }

    const admin = createAdminClient();
    const stripe = getStripeClient();
    const siteUrl = getSiteUrl();

    let account = await getOrganizationPaymentAccount(admin, organizationId);
    let stripeAccountId = account?.stripeConnectAccountId ?? null;

    if (!stripeAccountId) {
      const stripeAccount = await stripe.accounts.create({
        type: "express",
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        },
        metadata: {
          organization_id: organizationId,
        },
      });

      stripeAccountId = stripeAccount.id;
      account = await upsertOrganizationPaymentAccount(admin, {
        organizationId,
        stripeConnectAccountId: stripeAccountId,
        onboardingStatus: "pending",
        chargesEnabled: false,
        payoutsEnabled: false,
      });
    }

    const returnPath = schoolAdminPath(orgSlug, "admissions", "payments");
    const returnUrl = `${siteUrl}/api/stripe/connect/return?organizationId=${encodeURIComponent(organizationId)}&orgSlug=${encodeURIComponent(orgSlug)}`;
    const refreshUrl = `${siteUrl}${returnPath}?refresh=1`;

    const accountLink = await stripe.accountLinks.create({
      account: stripeAccountId,
      type: "account_onboarding",
      return_url: returnUrl,
      refresh_url: refreshUrl,
    });

    return NextResponse.json({ url: accountLink.url });
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
      error: "Failed to start Stripe onboarding.",
      code: "internal_error",
      cause: error,
    });
  }
}
