import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  AuthError,
  requireAuthenticatedUser,
} from "@/lib/admissions/application-auth";
import { apiError } from "@/lib/api/route-errors";
import { canManageOrganization } from "@/lib/school-admin/access";
import { buildConnectStatusResult } from "@/lib/stripe/connect-status";
import { getStripeClient } from "@/lib/stripe/client";
import {
  getOrganizationPaymentAccount,
  syncPaymentAccountFromStripe,
} from "@/lib/stripe/organization-payment-account";
import { createAdminClient } from "@/utils/supabase/admin";
import { createClient } from "@/utils/supabase/server";

const ROUTE = "/api/stripe/connect/status";

export async function GET(request: Request) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  try {
    const user = await requireAuthenticatedUser(supabase);
    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get("organizationId")?.trim();

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
        error: "You do not have permission to view payments setup.",
        code: "forbidden",
      });
    }

    const admin = createAdminClient();

    const { data: org, error: orgError } = await admin
      .from("organizations")
      .select("slug")
      .eq("id", organizationId)
      .maybeSingle();

    if (orgError || !org?.slug) {
      return apiError(ROUTE, {
        request,
        status: 404,
        error: "School not found.",
        code: "org_not_found",
        cause: orgError,
      });
    }

    let account = await getOrganizationPaymentAccount(admin, organizationId);
    let stripeAccount: {
      details_submitted?: boolean;
    } | null = null;

    if (account?.stripeConnectAccountId) {
      const stripe = getStripeClient();
      const retrieved = await stripe.accounts.retrieve(
        account.stripeConnectAccountId,
      );
      stripeAccount = retrieved;
      await syncPaymentAccountFromStripe(
        admin,
        account.stripeConnectAccountId,
        retrieved,
      );
      account = await getOrganizationPaymentAccount(admin, organizationId);
    }

    const { data: publishedForm } = await admin
      .from("application_form_versions")
      .select("public_slug")
      .eq("organization_id", organizationId)
      .eq("status", "published")
      .order("published_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    const status = buildConnectStatusResult({
      account,
      orgSlug: String(org.slug),
      publishedFormSlug: publishedForm?.public_slug
        ? String(publishedForm.public_slug)
        : null,
      stripeAccount,
    });

    return NextResponse.json(status);
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
      error: "Failed to load payment setup status.",
      code: "internal_error",
      cause: error,
    });
  }
}
