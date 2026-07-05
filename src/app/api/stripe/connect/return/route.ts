import { NextResponse } from "next/server";
import { apiError } from "@/lib/api/route-errors";
import { getSiteUrl, getStripeClient } from "@/lib/stripe/client";
import {
  getOrganizationPaymentAccount,
  syncPaymentAccountFromStripe,
} from "@/lib/stripe/organization-payment-account";
import { schoolAdminPath } from "@/lib/organization-settings/admin-routes";
import { createAdminClient } from "@/utils/supabase/admin";

const ROUTE = "/api/stripe/connect/return";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const organizationId = searchParams.get("organizationId")?.trim();
  const orgSlug = searchParams.get("orgSlug")?.trim();

  if (!organizationId || !orgSlug) {
    return apiError(ROUTE, {
      request,
      status: 400,
      error: "organizationId and orgSlug are required.",
    });
  }

  try {
    const admin = createAdminClient();
    const account = await getOrganizationPaymentAccount(admin, organizationId);

    if (account?.stripeConnectAccountId) {
      const stripe = getStripeClient();
      const stripeAccount = await stripe.accounts.retrieve(
        account.stripeConnectAccountId,
      );
      await syncPaymentAccountFromStripe(
        admin,
        account.stripeConnectAccountId,
        stripeAccount,
      );
    }

    const redirectUrl = `${getSiteUrl()}${schoolAdminPath(orgSlug, "admissions", "payments")}?connected=1`;
    return NextResponse.redirect(redirectUrl);
  } catch (error) {
    console.error("stripe connect return failed:", error);
    const fallbackUrl = `${getSiteUrl()}${schoolAdminPath(orgSlug, "admissions", "payments")}?connected=0`;
    return NextResponse.redirect(fallbackUrl);
  }
}
