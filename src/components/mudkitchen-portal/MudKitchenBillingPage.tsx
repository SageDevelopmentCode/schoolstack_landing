"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ExternalLink, Loader2, RotateCw } from "lucide-react";
import { Tick } from "@/components/garden/ui";
import { ILLUSTRATIONS } from "@/components/home-garden/assets";
import PortalGardenHeader from "@/components/mudkitchen-portal/garden/PortalGardenHeader";
import PortalGardenConfirmDialog from "@/components/mudkitchen-portal/garden/PortalGardenConfirmDialog";
import PortalEmptyState from "@/components/mudkitchen-portal/garden/PortalEmptyState";
import PortalReveal from "@/components/mudkitchen-portal/garden/PortalReveal";
import {
  btnSmForestOutline,
  btnSmOutline,
  btnSmPop,
  textLink,
} from "@/components/mudkitchen-portal/garden/buttons";
import {
  BILLING_COPY as COPY,
  MUDKITCHEN_SUPPORT_EMAIL,
} from "@/components/mudkitchen-portal/garden/portal-copy";
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

const GARDEN_CONFETTI = ["#A05C45", "#FFE58A", "#DDEBD5", "#E3EDFB", "#ECE2F3"];

function formatTimestamp(value: string) {
  return new Date(value).toLocaleString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatShortDate(value: string) {
  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function SectionHeading({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="mb-6">
      <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-[var(--sf-soft)]">{eyebrow}</p>
      <h2 className="sf-display mt-2 text-4xl leading-none text-[var(--sf-ink)] md:text-[2.75rem]">{title}</h2>
      <p className="mt-3 max-w-xl text-[16px] leading-relaxed text-[var(--sf-soft)]">{subtitle}</p>
    </div>
  );
}

/** A due invoice as a ticket: details on the left, the amount on a perforated stub. */
function DueInvoiceTicket({
  invoice,
  onRequestMarkPaid,
  markingPaidId,
}: {
  invoice: OrganizationCustomerInvoice;
  onRequestMarkPaid: (invoice: OrganizationCustomerInvoice) => void;
  markingPaidId: string | null;
}) {
  const isMarking = markingPaidId === invoice.id;
  const amount = formatCustomerInvoiceAmount(invoice.amount_cents, invoice.currency);

  return (
    <article className="overflow-hidden rounded-[28px] border-2 border-[var(--sf-ink)] bg-[var(--sf-paper)] shadow-[0_6px_0_0_var(--sf-ink)]">
      <div className="flex flex-col sm:flex-row">
        <div className="flex-1 p-6 sm:p-7">
          <span className="inline-flex items-center rounded-full border border-[var(--sf-ink)]/15 bg-[var(--sf-butter)] px-3 py-1 text-xs font-extrabold uppercase tracking-[0.14em] text-[var(--sf-clay-deep)]">
            {COPY.dueChip}
          </span>
          <h3 className="sf-display mt-4 text-[1.9rem] leading-[1.05] text-[var(--sf-ink)]">
            {COPY.invoiceDueFor(invoice.billing_period_label)}
          </h3>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <a
              href={invoice.stripe_invoice_url}
              target="_blank"
              rel="noopener noreferrer"
              className={btnSmPop}
            >
              <ExternalLink className="h-4 w-4" strokeWidth={2.6} aria-hidden="true" />
              {COPY.payInvoice}
              <span className="sr-only"> (opens Stripe in a new tab)</span>
            </a>
            <button
              type="button"
              disabled={isMarking}
              onClick={() => onRequestMarkPaid(invoice)}
              className={btnSmForestOutline}
            >
              {isMarking ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : null}
              {COPY.markAsPaid}
            </button>
          </div>
        </div>

        {/* Stub: dashed perforation, then the amount. */}
        <div className="flex items-center justify-between gap-4 border-t-2 border-dashed border-[var(--sf-ink)]/20 bg-[var(--sf-butter)]/35 px-6 py-5 sm:w-56 sm:flex-col sm:items-start sm:justify-center sm:border-l-2 sm:border-t-0 sm:px-7">
          <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[var(--sf-soft)]">
            {invoice.billing_period_label}
          </p>
          <p className="sf-display text-[2.4rem] leading-none tabular-nums text-[var(--sf-ink)] sm:mt-2">
            {amount}
          </p>
        </div>
      </div>
    </article>
  );
}

function PaidInvoiceRow({ invoice }: { invoice: OrganizationCustomerInvoice }) {
  return (
    <li className="grid grid-cols-[1fr_auto] items-start gap-x-4 gap-y-1.5 px-5 py-4 sm:grid-cols-[minmax(0,1.4fr)_auto_minmax(0,1.2fr)_auto] sm:items-center sm:px-6">
      <div className="min-w-0">
        <h3 className="truncate text-[16px] font-extrabold text-[var(--sf-ink)]">{invoice.billing_period_label}</h3>
        {invoice.paid_by_email ? (
          <p className="truncate text-[13px] text-[var(--sf-soft)]">{COPY.markedBy(invoice.paid_by_email)}</p>
        ) : null}
      </div>
      <p className="text-right text-[16px] font-extrabold tabular-nums text-[var(--sf-ink)] sm:text-left">
        {formatCustomerInvoiceAmount(invoice.amount_cents, invoice.currency)}
      </p>
      <div className="flex items-center gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--sf-mint)] py-0.5 pl-1 pr-2.5 text-xs font-extrabold text-[var(--sf-forest)]">
          <Tick className="h-5 w-5" />
          {COPY.paidChip}
        </span>
        {invoice.paid_at ? (
          <time className="text-[13px] text-[var(--sf-soft)]" dateTime={invoice.paid_at} title={formatTimestamp(invoice.paid_at)}>
            {formatShortDate(invoice.paid_at)}
          </time>
        ) : null}
      </div>
      <a
        href={invoice.stripe_invoice_url}
        target="_blank"
        rel="noopener noreferrer"
        className={`${textLink} justify-self-end text-[14px]`}
      >
        {COPY.viewInvoice}
        <ExternalLink className="h-3.5 w-3.5" strokeWidth={2.6} aria-hidden="true" />
        <span className="sr-only"> for {invoice.billing_period_label} (opens Stripe in a new tab)</span>
      </a>
    </li>
  );
}

/** Sticker-style success chip that pops in after marking an invoice paid. */
function MarkedPaidSticker({ show }: { show: boolean }) {
  const reduce = useReducedMotion();

  return (
    <div aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-6 z-50 flex justify-center px-4">
      <AnimatePresence>
        {show ? (
          <motion.div
            key="marked-paid"
            initial={reduce ? false : { opacity: 0, y: 24, scale: 0.85, rotate: -4 }}
            animate={{ opacity: 1, y: 0, scale: 1, rotate: -1.5 }}
            exit={reduce ? undefined : { opacity: 0, y: 12, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 380, damping: 18 }}
            className="inline-flex items-center gap-2.5 rounded-md bg-[var(--sf-mint)] px-5 py-3 text-[15px] font-extrabold text-[var(--sf-forest)] shadow-[0_14px_30px_-16px_rgba(43,36,29,0.5)] ring-2 ring-[var(--sf-forest)]/20"
          >
            <Tick className="h-6 w-6" />
            {COPY.markedPaid}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

function celebrate() {
  if (typeof window === "undefined") return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  void import("canvas-confetti").then(({ default: confetti }) => {
    confetti({
      particleCount: 80,
      spread: 70,
      startVelocity: 38,
      origin: { y: 0.75 },
      colors: GARDEN_CONFETTI,
      disableForReducedMotion: true,
    });
  });
}

export default function MudKitchenBillingPage({
  organizationId,
  initialInvoices,
}: MudKitchenBillingPageProps) {
  const router = useRouter();
  const [invoices, setInvoices] = useState(initialInvoices);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [markingPaidId, setMarkingPaidId] = useState<string | null>(null);
  const [pendingConfirmInvoice, setPendingConfirmInvoice] =
    useState<OrganizationCustomerInvoice | null>(null);
  const [showMarkedPaid, setShowMarkedPaid] = useState(false);

  useEffect(() => {
    if (!showMarkedPaid) return;
    const timer = window.setTimeout(() => setShowMarkedPaid(false), 3200);
    return () => window.clearTimeout(timer);
  }, [showMarkedPaid]);

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

    const normalized = ((data as Record<string, unknown>[]) ?? []).map((row) =>
      normalizeCustomerInvoiceRow(row),
    );
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
        throw new Error(payload.error ?? COPY.markFailed);
      }

      setPendingConfirmInvoice(null);
      setShowMarkedPaid(true);
      celebrate();
      await refreshInvoices();
    } catch (error) {
      setPendingConfirmInvoice(null);
      setLoadError(error instanceof Error ? error.message : COPY.markFailed);
    } finally {
      setMarkingPaidId(null);
    }
  };

  const dueInvoices = invoices.filter((invoice) => invoice.status === "due");
  const paidInvoices = invoices.filter((invoice) => invoice.status === "paid");

  return (
    <>
      <PortalGardenConfirmDialog
        open={pendingConfirmInvoice !== null}
        eyebrow={COPY.confirm.eyebrow}
        title={COPY.confirm.title}
        description={COPY.confirm.description}
        confirmLabel={COPY.confirm.confirmLabel}
        cancelLabel={COPY.confirm.cancelLabel}
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
          <div className="flex items-center justify-between gap-4 rounded-2xl border-2 border-dashed border-[var(--sf-ink)]/20 bg-[var(--sf-butter)]/35 px-4 py-3.5">
            <div className="min-w-0">
              <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-[var(--sf-soft)]">
                {COPY.confirm.periodLabel}
              </p>
              <p className="mt-1 truncate text-[16px] font-extrabold text-[var(--sf-ink)]">
                {pendingConfirmInvoice.billing_period_label}
              </p>
            </div>
            <p className="sf-display shrink-0 text-[1.6rem] leading-none tabular-nums text-[var(--sf-ink)]">
              {formatCustomerInvoiceAmount(
                pendingConfirmInvoice.amount_cents,
                pendingConfirmInvoice.currency,
              )}
            </p>
          </div>
        ) : null}
      </PortalGardenConfirmDialog>

      <MarkedPaidSticker show={showMarkedPaid} />

      <PortalGardenHeader
        width="narrow"
        pill={COPY.pill}
        tint="clay"
        title={COPY.title}
        subtitle={<p>{COPY.subtitle}</p>}
      />

      <div className="mx-auto max-w-[880px] space-y-14 px-6 pb-20 pt-12 sm:px-10 lg:pb-28 lg:pt-14">
        {loadError || loading ? (
          <div className="space-y-3">
            {loadError ? (
              <div
                role="alert"
                className="flex flex-col gap-3 rounded-2xl border-2 border-[var(--sf-clay)]/30 bg-[var(--sf-peach)]/60 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <p className="text-[15px] font-bold text-[var(--sf-clay-deep)]">{loadError}</p>
                <button
                  type="button"
                  onClick={() => void refreshInvoices()}
                  disabled={loading}
                  className={`${btnSmOutline} shrink-0 self-start sm:self-auto`}
                >
                  <RotateCw className="h-4 w-4" strokeWidth={2.6} aria-hidden="true" />
                  {COPY.retry}
                </button>
              </div>
            ) : null}
            <p aria-live="polite" className="text-sm font-bold text-[var(--sf-soft)]">
              {loading ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                  {COPY.refreshing}
                </span>
              ) : null}
            </p>
          </div>
        ) : null}

        {invoices.length === 0 ? (
          <PortalReveal>
            <PortalEmptyState
              illustration={ILLUSTRATIONS.basket}
              eyebrow={COPY.emptyEyebrow}
              title={COPY.emptyTitle}
              body={
                <p>
                  {COPY.emptyBodyLead}{" "}
                  <a href={`mailto:${MUDKITCHEN_SUPPORT_EMAIL}`} className={textLink}>
                    {MUDKITCHEN_SUPPORT_EMAIL}
                  </a>
                  .
                </p>
              }
              hand={COPY.emptyHand}
            />
          </PortalReveal>
        ) : (
          <>
            {dueInvoices.length > 0 ? (
              <PortalReveal as="section" delay={0.05}>
                <SectionHeading eyebrow={COPY.dueEyebrow} title={COPY.dueTitle} subtitle={COPY.dueSubtitle} />
                <div className="space-y-6">
                  {dueInvoices.map((invoice) => (
                    <DueInvoiceTicket
                      key={invoice.id}
                      invoice={invoice}
                      onRequestMarkPaid={setPendingConfirmInvoice}
                      markingPaidId={markingPaidId}
                    />
                  ))}
                </div>
              </PortalReveal>
            ) : null}

            {paidInvoices.length > 0 ? (
              <PortalReveal as="section" delay={0.1}>
                <SectionHeading eyebrow={COPY.paidEyebrow} title={COPY.paidTitle} subtitle={COPY.paidSubtitle} />
                <ul className="divide-y-2 divide-dashed divide-[var(--sf-ink)]/10 overflow-hidden rounded-[26px] border-2 border-[var(--sf-ink)]/15 bg-[var(--sf-paper)]">
                  {paidInvoices.map((invoice) => (
                    <PaidInvoiceRow key={invoice.id} invoice={invoice} />
                  ))}
                </ul>
              </PortalReveal>
            ) : null}
          </>
        )}
      </div>
    </>
  );
}
