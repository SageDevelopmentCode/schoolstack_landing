import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { requirePlatformAdminUser } from "@/lib/admin/require-platform-admin-api";
import { AuthError } from "@/lib/admissions/application-auth";
import { apiError } from "@/lib/api/route-errors";
import {
  fetchOrganizationCustomerInvoices,
  isValidStripeInvoiceUrl,
  normalizeCustomerInvoiceRow,
  parseAmountDollarsToCents,
} from "@/lib/mudkitchen-portal/customer-invoices";
import { createAdminClient } from "@/utils/supabase/admin";
import { createClient } from "@/utils/supabase/server";

const ROUTE = "/api/admin/organizations/[id]/customer-invoices";

type RouteContext = {
  params: Promise<{ id: string }>;
};

type CreateCustomerInvoiceBody = {
  billingPeriodLabel?: string;
  amountDollars?: string | number;
  stripeInvoiceUrl?: string;
};

export async function GET(_request: Request, context: RouteContext) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { id: organizationId } = await context.params;

  try {
    await requirePlatformAdminUser(supabase);
    const admin = createAdminClient();
    const invoices = await fetchOrganizationCustomerInvoices(
      admin,
      organizationId,
    );
    return NextResponse.json({ invoices });
  } catch (error) {
    if (error instanceof AuthError) {
      return apiError(ROUTE, {
        status: error.status,
        error: error.message,
        code: error.code,
        cause: error,
      });
    }

    return apiError(ROUTE, {
      status: 500,
      error: "Failed to load customer invoices.",
      code: "internal_error",
      cause: error,
    });
  }
}

export async function POST(request: Request, context: RouteContext) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { id: organizationId } = await context.params;

  try {
    const user = await requirePlatformAdminUser(supabase);

    let body: CreateCustomerInvoiceBody;
    try {
      body = (await request.json()) as CreateCustomerInvoiceBody;
    } catch {
      return apiError(ROUTE, {
        request,
        status: 400,
        error: "Invalid request body.",
        code: "invalid_body",
      });
    }

    const billingPeriodLabel = body.billingPeriodLabel?.trim() ?? "";
    const stripeInvoiceUrl = body.stripeInvoiceUrl?.trim() ?? "";
    const amountCents = parseAmountDollarsToCents(body.amountDollars ?? "");

    if (!billingPeriodLabel) {
      return apiError(ROUTE, {
        request,
        status: 400,
        error: "Billing period label is required.",
        code: "missing_fields",
      });
    }

    if (!amountCents) {
      return apiError(ROUTE, {
        request,
        status: 400,
        error: "Amount must be greater than zero.",
        code: "invalid_amount",
      });
    }

    if (!isValidStripeInvoiceUrl(stripeInvoiceUrl)) {
      return apiError(ROUTE, {
        request,
        status: 400,
        error: "Enter a valid Stripe invoice URL (https://…stripe.com/…).",
        code: "invalid_stripe_url",
      });
    }

    const admin = createAdminClient();
    const { data, error } = await admin
      .from("organization_customer_invoices")
      .insert({
        organization_id: organizationId,
        billing_period_label: billingPeriodLabel,
        amount_cents: amountCents,
        stripe_invoice_url: stripeInvoiceUrl,
        created_by_user_id: user.id,
      })
      .select("*")
      .single();

    if (error || !data) {
      return apiError(ROUTE, {
        request,
        status: 500,
        error: error?.message ?? "Failed to create invoice.",
        code: "insert_failed",
        cause: error,
      });
    }

    return NextResponse.json({
      invoice: normalizeCustomerInvoiceRow(data),
    });
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
      error: "Failed to create customer invoice.",
      code: "internal_error",
      cause: error,
    });
  }
}
