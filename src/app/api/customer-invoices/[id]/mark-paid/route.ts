import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { requirePlatformAdminUser } from "@/lib/admin/require-platform-admin-api";
import { AuthError } from "@/lib/admissions/application-auth";
import { apiError } from "@/lib/api/route-errors";
import { notifyCustomerBillingInvoicePaid } from "@/lib/discord";
import {
  fetchCustomerInvoiceById,
  normalizeCustomerInvoiceRow,
} from "@/lib/mudkitchen-portal/customer-invoices";
import {
  requireSchoolAdminUser,
  SchoolAdminAuthError,
} from "@/lib/school-admin/access";
import { createAdminClient } from "@/utils/supabase/admin";
import { createClient } from "@/utils/supabase/server";

const ROUTE = "/api/customer-invoices/[id]/mark-paid";

type RouteContext = {
  params: Promise<{ id: string }>;
};

async function authorizeInvoiceAccess(
  supabase: ReturnType<typeof createClient>,
  organizationId: string,
) {
  try {
    const user = await requirePlatformAdminUser(supabase);
    return user;
  } catch (platformError) {
    if (
      !(platformError instanceof AuthError) ||
      platformError.code !== "forbidden"
    ) {
      throw platformError;
    }
  }

  return requireSchoolAdminUser(supabase, organizationId);
}

export async function POST(_request: Request, context: RouteContext) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { id: invoiceId } = await context.params;

  try {
    const admin = createAdminClient();
    const invoice = await fetchCustomerInvoiceById(admin, invoiceId);

    if (!invoice) {
      return apiError(ROUTE, {
        status: 404,
        error: "Invoice not found.",
        code: "not_found",
      });
    }

    const user = await authorizeInvoiceAccess(supabase, invoice.organization_id);

    if (invoice.status === "paid") {
      return NextResponse.json({ invoice });
    }

    const paidAt = new Date().toISOString();
    const paidByEmail = user.email?.trim() || "unknown";

    const { data, error } = await admin
      .from("organization_customer_invoices")
      .update({
        status: "paid",
        paid_at: paidAt,
        paid_by_user_id: user.id,
        paid_by_email: paidByEmail,
      })
      .eq("id", invoiceId)
      .select("*")
      .single();

    if (error || !data) {
      return apiError(ROUTE, {
        status: 500,
        error: error?.message ?? "Failed to mark invoice as paid.",
        code: "update_failed",
        cause: error,
      });
    }

    const updatedInvoice = normalizeCustomerInvoiceRow(data);

    const { data: organization, error: organizationError } = await admin
      .from("organizations")
      .select("id, slug, name")
      .eq("id", invoice.organization_id)
      .maybeSingle();

    if (!organizationError && organization) {
      void notifyCustomerBillingInvoicePaid({
        invoiceId: updatedInvoice.id,
        organizationId: organization.id,
        organizationSlug: organization.slug,
        organizationName: organization.name,
        billingPeriodLabel: updatedInvoice.billing_period_label,
        amountCents: updatedInvoice.amount_cents,
        currency: updatedInvoice.currency,
        stripeInvoiceUrl: updatedInvoice.stripe_invoice_url,
        paidByEmail,
        paidAt,
      });
    }

    return NextResponse.json({ invoice: updatedInvoice });
  } catch (error) {
    if (error instanceof AuthError || error instanceof SchoolAdminAuthError) {
      return apiError(ROUTE, {
        status: error.status,
        error: error.message,
        code: error.code,
        cause: error,
      });
    }

    return apiError(ROUTE, {
      status: 500,
      error: "Failed to mark invoice as paid.",
      code: "internal_error",
      cause: error,
    });
  }
}
