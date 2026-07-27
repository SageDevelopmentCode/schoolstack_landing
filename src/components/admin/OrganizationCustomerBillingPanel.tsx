"use client";

import { useCallback, useEffect, useState } from "react";
import { ExternalLink, Loader2, Plus } from "lucide-react";
import { AdminSelect } from "@/components/admin/ui/AdminSelect";
import {
  BILLING_PERIOD_MONTHS,
  formatBillingPeriodLabel,
  formatCustomerInvoiceAmount,
  getBillingPeriodYearOptions,
  getDefaultBillingPeriodValues,
  type OrganizationCustomerInvoice,
} from "@/lib/mudkitchen-portal/customer-invoices";

type OrganizationCustomerBillingPanelProps = {
  organizationId: string;
  organizationName: string;
};

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function statusBadgeClass(status: OrganizationCustomerInvoice["status"]) {
  return status === "paid"
    ? "bg-emerald-500/10 text-emerald-700 border-emerald-500/20"
    : "bg-amber-500/10 text-amber-800 border-amber-500/20";
}

export default function OrganizationCustomerBillingPanel({
  organizationId,
  organizationName,
}: OrganizationCustomerBillingPanelProps) {
  const defaultBillingPeriod = getDefaultBillingPeriodValues();
  const [invoices, setInvoices] = useState<OrganizationCustomerInvoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [billingMonth, setBillingMonth] = useState(defaultBillingPeriod.month);
  const [billingYear, setBillingYear] = useState(defaultBillingPeriod.year);
  const [amountDollars, setAmountDollars] = useState("");
  const [stripeInvoiceUrl, setStripeInvoiceUrl] = useState("");
  const billingYearOptions = getBillingPeriodYearOptions();

  const loadInvoices = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/admin/organizations/${organizationId}/customer-invoices`,
      );
      const payload = (await response.json()) as {
        invoices?: OrganizationCustomerInvoice[];
        error?: string;
      };

      if (!response.ok) {
        throw new Error(payload.error ?? "Failed to load invoices.");
      }

      setInvoices(payload.invoices ?? []);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Failed to load invoices.",
      );
      setInvoices([]);
    } finally {
      setLoading(false);
    }
  }, [organizationId]);

  useEffect(() => {
    queueMicrotask(() => {
      void loadInvoices();
    });
  }, [loadInvoices]);

  const handleCreate = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const billingPeriodLabel = formatBillingPeriodLabel(
        Number(billingMonth),
        Number(billingYear),
      );

      const response = await fetch(
        `/api/admin/organizations/${organizationId}/customer-invoices`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            billingPeriodLabel,
            amountDollars,
            stripeInvoiceUrl,
          }),
        },
      );
      const payload = (await response.json()) as {
        invoice?: OrganizationCustomerInvoice;
        error?: string;
      };

      if (!response.ok || !payload.invoice) {
        throw new Error(payload.error ?? "Failed to create invoice.");
      }

      const nextBillingPeriod = getDefaultBillingPeriodValues();
      setBillingMonth(nextBillingPeriod.month);
      setBillingYear(nextBillingPeriod.year);
      setAmountDollars("");
      setStripeInvoiceUrl("");
      await loadInvoices();
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "Failed to create invoice.",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleMarkPaid = async (invoiceId: string) => {
    setSaving(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/customer-invoices/${invoiceId}/mark-paid`,
        { method: "POST" },
      );
      const payload = (await response.json()) as {
        invoice?: OrganizationCustomerInvoice;
        error?: string;
      };

      if (!response.ok || !payload.invoice) {
        throw new Error(payload.error ?? "Failed to mark invoice as paid.");
      }

      await loadInvoices();
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "Failed to mark invoice as paid.",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="bg-admin-surface border border-admin-border rounded-admin-md p-4 space-y-4">
      <div>
        <h2 className="text-xs font-semibold text-admin-faint uppercase tracking-wide font-secondary">
          MudKitchen billing
        </h2>
        <p className="mt-1 text-sm text-admin-muted font-secondary">
          Create subscription invoices for {organizationName}. Schools see these
          on their MudKitchen Billing tab and can mark them paid after payment.
        </p>
      </div>

      {error ? (
        <p
          className="rounded-admin-md border border-admin-accent/30 bg-admin-accent-soft/30 px-3 py-2 text-sm text-admin-accent font-secondary"
          role="alert"
        >
          {error}
        </p>
      ) : null}

      <form onSubmit={handleCreate} className="grid gap-3">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="block space-y-1">
            <span className="text-xs text-admin-muted font-secondary">
              Billing period
            </span>
            <div className="grid grid-cols-2 gap-2">
              <AdminSelect
                value={billingMonth}
                disabled={saving}
                onChange={(event) => setBillingMonth(event.target.value)}
                className="w-full text-sm border border-admin-border rounded-admin-md bg-admin-bg"
                aria-label="Billing month"
              >
                {BILLING_PERIOD_MONTHS.map((month) => (
                  <option key={month.value} value={month.value}>
                    {month.label}
                  </option>
                ))}
              </AdminSelect>
              <AdminSelect
                value={billingYear}
                disabled={saving}
                onChange={(event) => setBillingYear(event.target.value)}
                className="w-full text-sm border border-admin-border rounded-admin-md bg-admin-bg"
                aria-label="Billing year"
              >
                {billingYearOptions.map((year) => (
                  <option key={year.value} value={year.value}>
                    {year.label}
                  </option>
                ))}
              </AdminSelect>
            </div>
          </div>
          <label className="block space-y-1">
            <span className="text-xs text-admin-muted font-secondary">
              Amount (USD)
            </span>
            <input
              type="text"
              inputMode="decimal"
              required
              value={amountDollars}
              onChange={(event) => setAmountDollars(event.target.value)}
              placeholder="250.00"
              className="w-full text-sm border border-admin-border rounded-admin-md px-3 py-2 bg-admin-bg"
            />
          </label>
        </div>
        <label className="block space-y-1">
          <span className="text-xs text-admin-muted font-secondary">
            Stripe invoice URL
          </span>
          <input
            type="url"
            required
            value={stripeInvoiceUrl}
            onChange={(event) => setStripeInvoiceUrl(event.target.value)}
            placeholder="https://invoice.stripe.com/..."
            className="w-full text-sm border border-admin-border rounded-admin-md px-3 py-2 bg-admin-bg"
          />
        </label>
        <div>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center justify-center gap-2 rounded-admin-md bg-admin-accent px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Plus className="h-4 w-4" />
            )}
            Add invoice
          </button>
        </div>
      </form>

      <div className="space-y-2">
        {loading ? (
          <div className="flex items-center gap-2 text-sm text-admin-faint font-secondary">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading invoices…
          </div>
        ) : invoices.length === 0 ? (
          <p className="text-sm text-admin-faint font-secondary">
            No invoices yet.
          </p>
        ) : (
          <ul className="divide-y divide-border rounded-admin-md border border-admin-border overflow-hidden">
            {invoices.map((invoice) => (
              <li
                key={invoice.id}
                className="flex flex-col gap-3 bg-admin-bg px-3 py-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-medium text-admin-text">
                      {invoice.billing_period_label}
                    </p>
                    <span
                      className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${statusBadgeClass(invoice.status)}`}
                    >
                      {invoice.status}
                    </span>
                  </div>
                  <p className="text-sm text-admin-muted font-secondary">
                    {formatCustomerInvoiceAmount(
                      invoice.amount_cents,
                      invoice.currency,
                    )}{" "}
                    · created {formatDateTime(invoice.created_at)}
                  </p>
                  {invoice.status === "paid" && invoice.paid_at ? (
                    <p className="text-xs text-admin-faint font-secondary">
                      Paid {formatDateTime(invoice.paid_at)}
                      {invoice.paid_by_email ? ` by ${invoice.paid_by_email}` : ""}
                    </p>
                  ) : null}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <a
                    href={invoice.stripe_invoice_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 rounded-admin-sm border border-admin-border px-2.5 py-1.5 text-xs font-medium text-admin-muted hover:bg-admin-neutral-bg"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    Stripe
                  </a>
                  {invoice.status === "due" ? (
                    <button
                      type="button"
                      disabled={saving}
                      onClick={() => void handleMarkPaid(invoice.id)}
                      className="inline-flex items-center rounded-admin-sm bg-admin-accent px-2.5 py-1.5 text-xs font-medium text-white disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      Mark as paid
                    </button>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
