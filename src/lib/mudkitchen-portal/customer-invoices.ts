import type { SupabaseClient } from "@supabase/supabase-js";

export type CustomerInvoiceStatus = "due" | "paid";

export type OrganizationCustomerInvoice = {
  id: string;
  organization_id: string;
  billing_period_label: string;
  amount_cents: number;
  currency: string;
  stripe_invoice_url: string;
  status: CustomerInvoiceStatus;
  paid_at: string | null;
  paid_by_user_id: string | null;
  paid_by_email: string | null;
  created_by_user_id: string | null;
  created_at: string;
  updated_at: string;
};

const CUSTOMER_INVOICE_STATUSES = new Set<CustomerInvoiceStatus>(["due", "paid"]);

export function parseCustomerInvoiceStatus(
  value: string | null | undefined,
): CustomerInvoiceStatus | null {
  if (!value) return null;
  return CUSTOMER_INVOICE_STATUSES.has(value as CustomerInvoiceStatus)
    ? (value as CustomerInvoiceStatus)
    : null;
}

export function normalizeCustomerInvoiceRow(
  row: Record<string, unknown>,
): OrganizationCustomerInvoice {
  return {
    id: String(row.id),
    organization_id: String(row.organization_id),
    billing_period_label: String(row.billing_period_label),
    amount_cents: Number(row.amount_cents),
    currency: String(row.currency ?? "usd"),
    stripe_invoice_url: String(row.stripe_invoice_url),
    status: parseCustomerInvoiceStatus(String(row.status)) ?? "due",
    paid_at: row.paid_at ? String(row.paid_at) : null,
    paid_by_user_id: row.paid_by_user_id ? String(row.paid_by_user_id) : null,
    paid_by_email: row.paid_by_email ? String(row.paid_by_email) : null,
    created_by_user_id: row.created_by_user_id
      ? String(row.created_by_user_id)
      : null,
    created_at: String(row.created_at),
    updated_at: String(row.updated_at ?? row.created_at),
  };
}

export function formatCustomerInvoiceAmount(
  amountCents: number,
  currency = "usd",
): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(amountCents / 100);
}

export function isValidStripeInvoiceUrl(url: string): boolean {
  try {
    const parsed = new URL(url.trim());
    if (parsed.protocol !== "https:") return false;
    return (
      parsed.hostname.endsWith("stripe.com") ||
      parsed.hostname === "invoice.stripe.com"
    );
  } catch {
    return false;
  }
}

export function parseAmountDollarsToCents(value: string | number): number | null {
  const normalized =
    typeof value === "number"
      ? value
      : Number.parseFloat(String(value).replace(/[^0-9.]/g, ""));

  if (!Number.isFinite(normalized) || normalized <= 0) {
    return null;
  }

  return Math.round(normalized * 100);
}

export function formatBillingPeriodLabel(month: number, year: number): string {
  return new Date(year, month - 1, 1).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
}

export const BILLING_PERIOD_MONTHS = Array.from({ length: 12 }, (_, index) => {
  const month = index + 1;
  return {
    value: String(month),
    label: formatBillingPeriodLabel(month, 2000).replace(" 2000", ""),
  };
});

export function getBillingPeriodYearOptions(
  referenceDate = new Date(),
): Array<{ value: string; label: string }> {
  const currentYear = referenceDate.getFullYear();
  return Array.from({ length: 4 }, (_, index) => {
    const year = currentYear - 1 + index;
    return { value: String(year), label: String(year) };
  });
}

export function getDefaultBillingPeriodValues(referenceDate = new Date()) {
  return {
    month: String(referenceDate.getMonth() + 1),
    year: String(referenceDate.getFullYear()),
  };
}

function sortCustomerInvoices(
  invoices: OrganizationCustomerInvoice[],
): OrganizationCustomerInvoice[] {
  return [...invoices].sort((a, b) => {
    if (a.status !== b.status) {
      return a.status === "due" ? -1 : 1;
    }

    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });
}

export async function fetchOrganizationCustomerInvoices(
  supabase: SupabaseClient,
  organizationId: string,
): Promise<OrganizationCustomerInvoice[]> {
  const { data, error } = await supabase
    .from("organization_customer_invoices")
    .select("*")
    .eq("organization_id", organizationId)
    .order("created_at", { ascending: false });

  if (error || !data) return [];

  return sortCustomerInvoices(data.map((row) => normalizeCustomerInvoiceRow(row)));
}

export async function fetchCustomerInvoiceById(
  supabase: SupabaseClient,
  invoiceId: string,
): Promise<OrganizationCustomerInvoice | null> {
  const { data, error } = await supabase
    .from("organization_customer_invoices")
    .select("*")
    .eq("id", invoiceId)
    .maybeSingle();

  if (error || !data) return null;

  return normalizeCustomerInvoiceRow(data);
}

export async function countDueCustomerInvoices(
  supabase: SupabaseClient,
  organizationId: string,
): Promise<number> {
  const { count, error } = await supabase
    .from("organization_customer_invoices")
    .select("*", { count: "exact", head: true })
    .eq("organization_id", organizationId)
    .eq("status", "due");

  if (error) return 0;

  return count ?? 0;
}

export async function fetchDueCustomerInvoices(
  supabase: SupabaseClient,
  organizationId: string,
): Promise<OrganizationCustomerInvoice[]> {
  const { data, error } = await supabase
    .from("organization_customer_invoices")
    .select("*")
    .eq("organization_id", organizationId)
    .eq("status", "due")
    .order("created_at", { ascending: false });

  if (error || !data) return [];

  return data.map((row) => normalizeCustomerInvoiceRow(row));
}

export function getDueInvoiceActionLabel(count: number): string {
  if (count <= 0) return "";
  if (count === 1) return "Pay now";
  return `${count} to pay`;
}

export function getDueInvoiceBillingAriaLabel(count: number): string {
  if (count <= 0) return "Billing";
  if (count === 1) return "Billing, pay invoice now";
  return `Billing, ${count} invoices to pay`;
}
