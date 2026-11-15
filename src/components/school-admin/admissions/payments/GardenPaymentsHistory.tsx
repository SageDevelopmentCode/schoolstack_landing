"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { CreditCard, ExternalLink, RotateCw } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { GCard, GChip, GSkeleton, gLinkSm, type GChipTone } from "@/components/school-parent/garden/ui";
import { formatFeeAmount } from "@/lib/admissions/application-form-schema";
import {
  PAYMENT_METHOD_LABELS,
  PAYMENT_STATUS_LABELS,
  PAYMENT_TYPE_LABELS,
  type PaymentRecordDisplayRow,
} from "@/lib/admissions/payment-records";
import type { PaymentStatus } from "@/lib/stripe/application-payments";
import { adminToast } from "@/lib/school-admin/admin-toast";
import {
  GardenEmptyState,
  GardenFilterChips,
  GardenLoadError,
  GardenStatTiles,
  gIconBtn,
  useRelativeTime,
  type GardenStat,
} from "@/components/school-admin/garden/kit";
import {
  PAYMENT_STATUS_FILTERS,
  PAYMENT_TYPE_FILTERS,
  type PaymentsHistoryModel,
} from "./usePaymentsHistoryModel";

const STATUS_TONES: Record<PaymentStatus, GChipTone> = {
  succeeded: "success",
  pending: "warning",
  failed: "alert",
  refunded: "neutral",
};

function formatDateTime(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
}

function applicationHref(orgSlug: string, row: PaymentRecordDisplayRow) {
  return `/school/${orgSlug}/admin/admissions/submissions?application=${row.applicationId}`;
}

/**
 * Garden payment history for Admissions → Payments. Reads the same
 * usePaymentsHistoryModel as the story panel on Finances → Revenue.
 */
export default function GardenPaymentsHistory({
  model,
  orgSlug,
  isReady,
  onSwitchToSetup,
}: {
  model: PaymentsHistoryModel;
  orgSlug: string;
  isReady: boolean;
  onSwitchToSetup: () => void;
}) {
  const reduce = useReducedMotion() === true;
  const updated = useRelativeTime(model.loadedAt);
  const { summary } = model;

  const stats: GardenStat[] = [
    {
      id: "month",
      label: "Collected this month",
      value: formatFeeAmount(summary.collectedThisMonthCents),
      accent: "forest",
      active: model.statusFilter === "succeeded" && model.typeFilter === "",
      onClick: () => {
        model.setStatusFilter("succeeded");
        model.setTypeFilter("");
      },
    },
    {
      id: "ytd",
      label: "Collected YTD",
      value: formatFeeAmount(summary.collectedYtdCents),
      accent: "sky",
      onClick: () => {
        model.setStatusFilter("succeeded");
        model.setTypeFilter("");
      },
    },
    {
      id: "application-fees",
      label: "Application fees",
      value: formatFeeAmount(summary.applicationFeeCents),
      accent: "gold",
      active: model.statusFilter === "succeeded" && model.typeFilter === "application_fee",
      onClick: () => {
        model.setStatusFilter("succeeded");
        model.setTypeFilter("application_fee");
      },
    },
    {
      id: "pending",
      label: "Pending",
      value:
        summary.pendingCount > 0
          ? `${summary.pendingCount} · ${formatFeeAmount(summary.pendingCents)}`
          : "0",
      accent: "berry",
      active: model.statusFilter === "pending",
      onClick: () => {
        model.setStatusFilter("pending");
        model.setTypeFilter("");
      },
    },
  ];

  const statusOptions = PAYMENT_STATUS_FILTERS.filter(
    (filter) => filter.value === "" || (model.statusCounts[filter.value] ?? 0) > 0,
  ).map((filter) => ({
    key: filter.value || "all",
    label: filter.label,
    count: filter.value ? model.statusCounts[filter.value] ?? 0 : model.rows.length,
  }));
  const typeOptions = PAYMENT_TYPE_FILTERS.filter(
    (filter) => filter.value === "" || (model.typeCounts[filter.value] ?? 0) > 0,
  ).map((filter) => ({
    key: filter.value || "all",
    label: filter.label,
    count: filter.value ? model.typeCounts[filter.value] ?? 0 : model.rows.length,
  }));

  const handleRefresh = async () => {
    const ok = await model.reload({ silent: true });
    if (ok) {
      adminToast.dismiss("payments-history-refresh-error");
      adminToast.success("Payment history refreshed", {
        id: "payments-history-refresh",
        description: "You're looking at the latest payments from Stripe.",
      });
    } else {
      adminToast.error("Couldn't refresh payment history", {
        id: "payments-history-refresh-error",
        description: "The payments on screen are from your last refresh.",
        action: { label: "Retry", onClick: () => void handleRefresh() },
      });
    }
  };

  const refreshButton = (
    <div className="flex items-center gap-2">
      <span className="hidden text-[12px] font-bold text-[var(--sf-soft)] sm:inline" aria-live="polite">
        {model.reloading ? "Refreshing…" : `Updated ${updated}`}
      </span>
      <button
        type="button"
        onClick={() => void handleRefresh()}
        disabled={model.reloading || model.loading}
        aria-busy={model.reloading || undefined}
        aria-label="Refresh payment history"
        title="Refresh payment history"
        className={gIconBtn}
      >
        <RotateCw className={`h-4 w-4 ${model.reloading ? "animate-spin" : ""}`} aria-hidden />
      </button>
    </div>
  );

  let body: ReactNode;
  if (model.loading) {
    body = (
      <div className="flex flex-col gap-2" role="status" aria-live="polite">
        <span className="sr-only">Loading payments</span>
        {[0, 1, 2, 3, 4].map((i) => (
          <GSkeleton key={i} className="h-14 !rounded-[14px]" />
        ))}
      </div>
    );
  } else if (model.error && model.rows.length === 0) {
    body = (
      <GardenLoadError
        title="Payment history didn't load"
        description={model.error}
        onRetry={() => void model.reload()}
        retrying={model.loading}
      />
    );
  } else if (model.rows.length === 0) {
    body = (
      <GardenEmptyState
        icon={CreditCard}
        tint="bg-[var(--sf-mint)]"
        title="No payments yet"
        description={
          isReady
            ? "When families pay application or enrollment fees, they'll appear here."
            : "Connect Stripe on the Setup tab to start collecting fees from families."
        }
        action={
          !isReady ? (
            <button type="button" onClick={onSwitchToSetup} className={gLinkSm}>
              Go to Setup →
            </button>
          ) : null
        }
      />
    );
  } else if (model.filteredRows.length === 0) {
    body = (
      <div className="rounded-[16px] bg-[var(--sf-paper)] p-4 text-[14px] font-semibold text-[var(--sf-soft)]">
        No payments match the current filters.{" "}
        <button type="button" onClick={model.clearFilters} className={gLinkSm}>
          Show all payments
        </button>
      </div>
    );
  } else {
    body = (
      <div className={`transition-opacity duration-200 ${model.reloading ? "opacity-60" : ""}`}>
        {/* Phones: stacked rows */}
        <ul className="m-0 flex list-none flex-col gap-2 p-0 md:hidden">
          {model.filteredRows.map((row) => (
            <li
              key={row.id}
              className="rounded-[16px] border-[1.5px] border-[var(--sf-ink)]/10 bg-white px-4 py-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="m-0 truncate text-[14px] font-extrabold text-[var(--sf-ink)]">
                    {row.label ?? "Payment"}
                  </p>
                  <p className="m-0 mt-0.5 text-[12.5px] font-semibold text-[var(--sf-soft)]">
                    {formatDateTime(row.paidAt ?? row.createdAt)} · {PAYMENT_TYPE_LABELS[row.paymentType]}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="m-0 text-[15px] font-extrabold tabular-nums text-[var(--sf-ink)]">
                    {formatFeeAmount(row.amountCents)}
                  </p>
                  <GChip tone={STATUS_TONES[row.status] ?? "neutral"} className="mt-1">
                    {PAYMENT_STATUS_LABELS[row.status]}
                  </GChip>
                </div>
              </div>
              <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-[12.5px] font-semibold text-[var(--sf-soft)]">
                <span className="min-w-0 truncate">{row.payerEmail ?? row.applicantLabel ?? "—"}</span>
                <Link href={applicationHref(orgSlug, row)} className={`${gLinkSm} !text-[12.5px]`}>
                  {row.applicantLabel ?? "View application"} →
                </Link>
              </div>
            </li>
          ))}
        </ul>
        {/* Tablet and up: table, scrolling inside the card */}
        <div className="-mx-1 hidden overflow-x-auto md:block">
          <table className="w-full min-w-[920px] border-separate border-spacing-0 text-left">
            <thead>
              <tr>
                {["Date", "Label", "Type", "School amount", "Charged", "Method", "Status", "Payer", "Application"].map(
                  (heading) => (
                    <th
                      key={heading}
                      scope="col"
                      className="border-b-[1.5px] border-[var(--sf-ink)]/10 px-3 pb-2.5 text-[11px] font-extrabold uppercase tracking-[0.14em] text-[var(--sf-soft)]"
                    >
                      {heading}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <motion.tbody
              initial={reduce ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2 }}
            >
              {model.filteredRows.map((row) => (
                <tr key={row.id} className="transition-colors hover:bg-[var(--sf-accent-wash)]">
                  <td className="whitespace-nowrap border-b border-[var(--sf-ink)]/[0.06] px-3 py-3 text-[13px] font-semibold text-[var(--sf-ink)]/80">
                    {formatDateTime(row.paidAt ?? row.createdAt)}
                  </td>
                  <td className="border-b border-[var(--sf-ink)]/[0.06] px-3 py-3 text-[14px] font-extrabold text-[var(--sf-ink)]">
                    {row.label ?? "Payment"}
                  </td>
                  <td className="whitespace-nowrap border-b border-[var(--sf-ink)]/[0.06] px-3 py-3 text-[13px] font-semibold text-[var(--sf-soft)]">
                    {PAYMENT_TYPE_LABELS[row.paymentType]}
                  </td>
                  <td className="whitespace-nowrap border-b border-[var(--sf-ink)]/[0.06] px-3 py-3 text-[14px] font-extrabold tabular-nums text-[var(--sf-ink)]">
                    {formatFeeAmount(row.amountCents)}
                  </td>
                  <td className="whitespace-nowrap border-b border-[var(--sf-ink)]/[0.06] px-3 py-3 text-[13px] font-semibold tabular-nums text-[var(--sf-ink)]/80">
                    {formatFeeAmount(row.chargedAmountCents ?? row.amountCents)}
                    {row.processingFeeCents ? (
                      <span className="block text-[11.5px] text-[var(--sf-soft)]">
                        +{formatFeeAmount(row.processingFeeCents)} fee
                      </span>
                    ) : null}
                  </td>
                  <td className="whitespace-nowrap border-b border-[var(--sf-ink)]/[0.06] px-3 py-3 text-[13px] font-semibold text-[var(--sf-soft)]">
                    {row.paymentMethodType ? PAYMENT_METHOD_LABELS[row.paymentMethodType] : "—"}
                  </td>
                  <td className="border-b border-[var(--sf-ink)]/[0.06] px-3 py-3">
                    <GChip tone={STATUS_TONES[row.status] ?? "neutral"}>
                      {PAYMENT_STATUS_LABELS[row.status]}
                    </GChip>
                  </td>
                  <td className="max-w-[14rem] truncate border-b border-[var(--sf-ink)]/[0.06] px-3 py-3 text-[13px] font-semibold text-[var(--sf-soft)]">
                    {row.payerEmail ?? row.applicantLabel ?? "—"}
                  </td>
                  <td className="border-b border-[var(--sf-ink)]/[0.06] px-3 py-3">
                    <Link href={applicationHref(orgSlug, row)} className={`${gLinkSm} !text-[13px]`}>
                      {row.applicantLabel ?? "View application"}
                      <ExternalLink className="h-3 w-3" aria-hidden />
                    </Link>
                  </td>
                </tr>
              ))}
            </motion.tbody>
          </table>
        </div>
        <p className="m-0 mt-3 text-[12.5px] font-semibold text-[var(--sf-soft)]" aria-live="polite">
          Showing <span className="tabular-nums">{model.filteredRows.length}</span> of{" "}
          <span className="tabular-nums">{model.rows.length}</span> payments
          {model.hasFilters ? (
            <>
              {" · "}
              <button type="button" onClick={model.clearFilters} className={`${gLinkSm} !text-[12.5px]`}>
                Clear filters
              </button>
            </>
          ) : null}
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5" data-testid="payments-history">
      {model.loading ? (
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <GSkeleton key={i} className="h-[104px]" />
          ))}
        </div>
      ) : model.rows.length > 0 ? (
        <GardenStatTiles stats={stats} ariaLabel="Payment totals" />
      ) : null}

      <GCard
        index={2}
        kicker="Payment history"
        title="Fees collected through Stripe"
        action={refreshButton}
      >
        {!model.loading && model.rows.length > 0 ? (
          <div className="mb-4 flex flex-col gap-2.5 border-b-[1.5px] border-dashed border-[var(--sf-ink)]/12 pb-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="w-12 text-[11px] font-extrabold uppercase tracking-[0.16em] text-[var(--sf-soft)]">
                Status
              </span>
              <GardenFilterChips
                ariaLabel="Filter by status"
                options={statusOptions}
                value={model.statusFilter || "all"}
                onChange={(key) => model.setStatusFilter(key === "all" ? "" : (key as PaymentStatus))}
              />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="w-12 text-[11px] font-extrabold uppercase tracking-[0.16em] text-[var(--sf-soft)]">
                Type
              </span>
              <GardenFilterChips
                ariaLabel="Filter by type"
                options={typeOptions}
                value={model.typeFilter || "all"}
                onChange={(key) =>
                  model.setTypeFilter(
                    key === "all" ? "" : (key as Exclude<typeof model.typeFilter, "">),
                  )
                }
                busy={model.reloading}
              />
            </div>
          </div>
        ) : null}
        {body}
      </GCard>
    </div>
  );
}
