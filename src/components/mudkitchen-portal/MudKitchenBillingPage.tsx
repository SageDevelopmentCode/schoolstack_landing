"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { ExternalLink, Loader2 } from "lucide-react";
import { FadeInView } from "@/components/ui/FadeInView";
import PortalPageHero from "@/components/mudkitchen-portal/ui/PortalPageHero";
import PortalSectionHeader from "@/components/mudkitchen-portal/ui/PortalSectionHeader";
import PortalCard from "@/components/mudkitchen-portal/ui/PortalCard";
import PortalConfirmDialog from "@/components/mudkitchen-portal/ui/PortalConfirmDialog";
import { usePortalTheme } from "@/components/mudkitchen-portal/PortalThemeProvider";
import {
  formatCustomerInvoiceAmount,
  normalizeCustomerInvoiceRow,
  type OrganizationCustomerInvoice,
} from "@/lib/mudkitchen-portal/customer-invoices";
import { createClient } from "@/utils/supabase/client";

type MudKitchenBillingPageProps = {
  organizationId: string;
  initialInvoices: OrganizationCustomerInvoice[];
};

function formatTimestamp(value: string) {
  return new Date(value).toLocaleString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function InvoiceCard({
  invoice,
  onRequestMarkPaid,
  markingPaidId,
}: {
  invoice: OrganizationCustomerInvoice;
  onRequestMarkPaid: (invoice: OrganizationCustomerInvoice) => void;
  markingPaidId: string | null;
}) {
  const T = usePortalTheme();
  const isDue = invoice.status === "due";
  const isMarking = markingPaidId === invoice.id;

  return (
    <PortalCard tinted={isDue}>
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2.5">
            <span
              className="font-secondary inline-flex items-center rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-widest"
              style={{
                color: isDue ? T.accentDark : T.textSecondary,
                backgroundColor: isDue ? T.stepBg : T.pageBg,
                border: `1px solid ${isDue ? T.secondaryBtnBorder : T.border}`,
              }}
            >
              {isDue ? "Due" : "Paid"}
            </span>
            {invoice.paid_at ? (
              <time
                className="font-secondary text-[13px]"
                style={{ color: T.textSecondary }}
                dateTime={invoice.paid_at}
              >
                Paid {formatTimestamp(invoice.paid_at)}
              </time>
            ) : null}
          </div>

          <div>
            <h3
              className="font-heading text-[1.35rem] font-medium leading-snug sm:text-[1.5rem]"
              style={{ color: T.textPrimary }}
            >
              {isDue
                ? `Invoice due for ${invoice.billing_period_label}`
                : invoice.billing_period_label}
            </h3>
            <p
              className="font-secondary mt-2 text-[15px] leading-relaxed"
              style={{ color: T.textSecondary }}
            >
              {formatCustomerInvoiceAmount(
                invoice.amount_cents,
                invoice.currency,
              )}
              {invoice.paid_by_email
                ? ` · Marked paid by ${invoice.paid_by_email}`
                : ""}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2.5">
          <a
            href={invoice.stripe_invoice_url}
            target="_blank"
            rel="noopener noreferrer"
            className="font-secondary inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition-opacity hover:opacity-90"
            style={{
              color: T.accentDark,
              backgroundColor: T.stepBg,
              border: `1px solid ${T.secondaryBtnBorder}`,
            }}
          >
            <ExternalLink className="h-4 w-4" />
            Pay invoice
          </a>
          {isDue ? (
            <button
              type="button"
              disabled={isMarking}
              onClick={() => onRequestMarkPaid(invoice)}
              className="font-secondary inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
              style={{ backgroundColor: T.accent }}
            >
              {isMarking ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : null}
              Mark as paid
            </button>
          ) : null}
        </div>
      </div>
    </PortalCard>
  );
}

export default function MudKitchenBillingPage({
  organizationId,
  initialInvoices,
}: MudKitchenBillingPageProps) {
  const T = usePortalTheme();
  const router = useRouter();
  const [invoices, setInvoices] = useState(initialInvoices);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [markingPaidId, setMarkingPaidId] = useState<string | null>(null);
  const [pendingConfirmInvoice, setPendingConfirmInvoice] =
    useState<OrganizationCustomerInvoice | null>(null);

  const refreshInvoices = useCallback(async () => {
    setLoading(true);
    setLoadError(null);

    const supabase = createClient();
    const { data, error } = await supabase
      .from("organization_customer_invoices")
      .select("*")
      .eq("organization_id", organizationId)
      .order("created_at", { ascending: false });

    if (error) {
      setLoadError(error.message);
      setLoading(false);
      return;
    }

    const normalized = (data ?? []).map((row) => normalizeCustomerInvoiceRow(row));
    normalized.sort((a, b) => {
      if (a.status !== b.status) {
        return a.status === "due" ? -1 : 1;
      }
      return (
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    });

    setInvoices(normalized);
    setLoading(false);
    router.refresh();
  }, [organizationId, router]);

  const handleConfirmMarkPaid = async () => {
    if (!pendingConfirmInvoice) return;

    const invoiceId = pendingConfirmInvoice.id;
    setMarkingPaidId(invoiceId);
    setLoadError(null);

    try {
      const response = await fetch(`/api/customer-invoices/${invoiceId}/mark-paid`, {
        method: "POST",
      });
      const payload = (await response.json()) as {
        invoice?: OrganizationCustomerInvoice;
        error?: string;
      };

      if (!response.ok || !payload.invoice) {
        throw new Error(payload.error ?? "Failed to mark invoice as paid.");
      }

      setPendingConfirmInvoice(null);
      await refreshInvoices();
    } catch (error) {
      setLoadError(
        error instanceof Error
          ? error.message
          : "Failed to mark invoice as paid.",
      );
    } finally {
      setMarkingPaidId(null);
    }
  };

  const dueInvoices = invoices.filter((invoice) => invoice.status === "due");
  const paidInvoices = invoices.filter((invoice) => invoice.status === "paid");

  return (
    <>
      <PortalConfirmDialog
        open={pendingConfirmInvoice !== null}
        eyebrow="Confirm payment"
        title="Mark invoice as paid?"
        description="Only confirm after you've completed payment through Stripe."
        confirmLabel="Yes, mark as paid"
        cancelLabel="Cancel"
        loading={
          pendingConfirmInvoice !== null &&
          markingPaidId === pendingConfirmInvoice.id
        }
        onConfirm={() => void handleConfirmMarkPaid()}
        onClose={() => {
          if (markingPaidId) return;
          setPendingConfirmInvoice(null);
        }}
      >
        {pendingConfirmInvoice ? (
          <div
            className="flex items-stretch overflow-hidden rounded-[10px] border"
            style={{
              backgroundColor: T.pageBg,
              borderColor: T.border,
            }}
          >
            <div
              className="w-[3px] shrink-0"
              style={{ backgroundColor: T.accent }}
              aria-hidden
            />
            <div className="flex min-w-0 flex-1 items-center justify-between gap-4 px-4 py-3.5">
              <div className="min-w-0">
                <p
                  className="font-secondary text-[10px] font-semibold uppercase tracking-[0.12em]"
                  style={{ color: T.textFaint }}
                >
                  Billing period
                </p>
                <p
                  className="font-heading mt-1 text-[1.05rem] font-medium leading-snug"
                  style={{ color: T.textPrimary }}
                >
                  {pendingConfirmInvoice.billing_period_label}
                </p>
              </div>
              <p
                className="font-heading shrink-0 text-[1.15rem] font-semibold tabular-nums"
                style={{ color: T.textPrimary }}
              >
                {formatCustomerInvoiceAmount(
                  pendingConfirmInvoice.amount_cents,
                  pendingConfirmInvoice.currency,
                )}
              </p>
            </div>
          </div>
        ) : null}
      </PortalConfirmDialog>

      <PortalPageHero
        eyebrow="Billing"
        title="Subscription & invoices"
        subtitle="Monthly MudKitchen subscription invoices appear here. Pay via Stripe, then mark as paid once complete."
      />

      <section className="px-6 pb-10 lg:px-16">
        <div className="mx-auto max-w-[760px] space-y-8">
          {loadError ? (
            <p className="font-secondary text-sm" style={{ color: T.clay }} role="alert">
              {loadError}
            </p>
          ) : null}

          {loading ? (
            <p
              className="font-secondary text-sm"
              style={{ color: T.textSecondary }}
            >
              Refreshing invoices…
            </p>
          ) : null}

          {invoices.length === 0 ? (
            <FadeInView>
              <PortalCard className="text-center">
                <p
                  className="font-secondary text-[11px] font-semibold uppercase tracking-widest"
                  style={{ color: T.textSecondary }}
                >
                  No invoices yet
                </p>
                <p
                  className="font-heading mt-4 text-xl font-medium"
                  style={{ color: T.textPrimary }}
                >
                  You&apos;re all caught up
                </p>
                <p
                  className="font-secondary mx-auto mt-4 max-w-md text-[15px] leading-relaxed"
                  style={{ color: T.textSecondary }}
                >
                  When a MudKitchen invoice is ready, it will show up here. Questions
                  in the meantime? Email us at{" "}
                  <a
                    href="mailto:support@trymudkitchen.com"
                    className="font-semibold underline-offset-2 hover:underline"
                    style={{ color: T.accent }}
                  >
                    support@trymudkitchen.com
                  </a>
                  .
                </p>
              </PortalCard>
            </FadeInView>
          ) : (
            <>
              {dueInvoices.length > 0 ? (
                <div className="space-y-4">
                  <PortalSectionHeader
                    eyebrow="Action needed"
                    title="Due invoices"
                    subtitle="Pay through Stripe, then mark the invoice as paid."
                  />
                  <div className="space-y-4">
                    {dueInvoices.map((invoice, index) => (
                      <FadeInView key={invoice.id} delay={index * 0.05}>
                        <InvoiceCard
                          invoice={invoice}
                          onRequestMarkPaid={setPendingConfirmInvoice}
                          markingPaidId={markingPaidId}
                        />
                      </FadeInView>
                    ))}
                  </div>
                </div>
              ) : null}

              {paidInvoices.length > 0 ? (
                <div className="space-y-4">
                  <PortalSectionHeader
                    eyebrow="History"
                    title="Paid invoices"
                    subtitle="A record of completed MudKitchen subscription payments."
                  />
                  <div className="space-y-4">
                    {paidInvoices.map((invoice, index) => (
                      <FadeInView key={invoice.id} delay={index * 0.05}>
                        <InvoiceCard
                          invoice={invoice}
                          onRequestMarkPaid={setPendingConfirmInvoice}
                          markingPaidId={markingPaidId}
                        />
                      </FadeInView>
                    ))}
                  </div>
                </div>
              ) : null}
            </>
          )}
        </div>
      </section>
    </>
  );
}
