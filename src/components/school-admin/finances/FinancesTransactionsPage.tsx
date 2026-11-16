"use client";

import Link from "next/link";
import { useMemo, useState, type ReactNode } from "react";
import { AlertTriangle, ArrowRight, Clock, CreditCard } from "lucide-react";
import { GCard, GChip, gBtnOutlineSm, gLinkSm } from "@/components/school-parent/garden/ui";
import {
  AdminGardenPage,
  AdminGardenPageHeader,
  BusyLabel,
  GardenEmptyState,
  GardenLoadError,
  GardenNotice,
  GardenStatTiles,
  type GardenFilterOption,
  type GardenStat,
} from "@/components/school-admin/garden/kit";
import { GardenLeadStrip } from "@/components/school-admin/garden/blocks";
import { formatFeeAmount } from "@/lib/admissions/application-form-schema";
import { PAYMENT_TYPE_LABELS, type PaymentRecordDisplayRow } from "@/lib/admissions/payment-records";
import { buildParentThemeTokens } from "@/lib/organization-settings/parent-theme";
import type { OrganizationBranding } from "@/lib/organization-settings/types";
import { adminToast } from "@/lib/school-admin/admin-toast";
import type { PaymentStatus, PaymentType } from "@/lib/stripe/application-payments";
import FinancesStatusGuide from "./garden/FinancesStatusGuide";
import GardenPaymentsLedger from "./garden/GardenPaymentsLedger";
import PaymentDetailDrawer from "./garden/PaymentDetailDrawer";
import {
  LedgerFilters,
  LedgerNoMatch,
  LedgerSkeleton,
  StatTilesSkeleton,
  scrollToLedger,
  shortTime,
} from "./garden/ledger-parts";
import { pluralize } from "./garden/payment-display";
import {
  TRANSACTION_STATUS_FILTERS,
  TRANSACTION_TYPE_FILTERS,
  useFinancesTransactionsModel,
  type FinancesTransactionsModel,
} from "./useFinancesTransactionsModel";

type FinancesTransactionsPageProps = {
  organizationId: string;
  slug: string;
  branding: OrganizationBranding;
  schoolName?: string;
  revenueEnabled?: boolean;
};

const LEDGER_ID = "finances-transactions-ledger";
const REFRESH_TOAST = "finances-transactions-refresh";
const FILTER_ERROR_TOAST = "finances-transactions-filter-error";
const MORE_ERROR_TOAST = "finances-transactions-more-error";

function statusLine(model: FinancesTransactionsModel): string {
  if (model.loading && !model.meta) return "Loading payments…";
  if (model.error && model.rows.length === 0) return "We couldn't load payments just now.";
  if (!model.meta) return `${pluralize(model.totalCount, "payment")} shown`;
  const { failedCount, pendingCount } = model.summary;
  if (model.metaTotalCount === 0) return "No payments yet · they show up here as soon as families pay";
  const parts: string[] = [];
  if (failedCount > 0) {
    parts.push(`${pluralize(failedCount, "failed payment")} ${failedCount === 1 ? "needs" : "need"} follow-up`);
  }
  if (pendingCount > 0) parts.push(`${pendingCount} pending`);
  if (parts.length === 0) parts.push("Nothing needs follow-up");
  parts.push(`${pluralize(model.metaTotalCount, "payment")} recorded`);
  return parts.join(" · ");
}

function ledgerTitle(status: "" | PaymentStatus, type: "" | PaymentType): string {
  const statusLabel = TRANSACTION_STATUS_FILTERS.find((f) => f.value === status && f.value)?.label;
  const typeLabel = type ? PAYMENT_TYPE_LABELS[type] : null;
  const parts = [statusLabel, typeLabel].filter(Boolean);
  return parts.length ? `${parts.join(" · ")} payments` : "All payments";
}

export default function FinancesTransactionsPage({
  organizationId,
  slug,
  branding,
  schoolName,
  revenueEnabled = false,
}: FinancesTransactionsPageProps) {
  const theme = useMemo(() => buildParentThemeTokens(branding), [branding]);
  const model = useFinancesTransactionsModel({ organizationId });
  const [selected, setSelected] = useState<PaymentRecordDisplayRow | null>(null);
  const { summary } = model;

  /* ---------------- actions + feedback ---------------- */

  const handleRefresh = async () => {
    const result = await model.refresh();
    if (result === "ok") {
      adminToast.dismiss(`${REFRESH_TOAST}-error`);
      const snap = model.getSnapshot();
      const s = snap.meta?.summary;
      const bits = [pluralize(snap.meta?.totalCount ?? snap.totalCount, "payment")];
      if (s?.failedCount) bits.push(`${s.failedCount} failed`);
      if (s?.pendingCount) bits.push(`${s.pendingCount} pending`);
      adminToast.success("Transactions refreshed", {
        id: REFRESH_TOAST,
        description: `You're seeing the latest: ${bits.join(" · ")}.`,
      });
    } else if (result === "error") {
      adminToast.error("Couldn't refresh transactions", {
        id: `${REFRESH_TOAST}-error`,
        description: `What's on screen is from ${shortTime(model.loadedAt)}.`,
        action: { label: "Retry", onClick: () => void handleRefresh() },
      });
    }
  };

  const handleFilters = async (status: "" | PaymentStatus, type: "" | PaymentType, scroll = false) => {
    if (scroll) scrollToLedger(LEDGER_ID);
    const hadRows = model.rows.length > 0;
    const result = await model.applyFilters(status, type);
    if (result === "ok") {
      adminToast.dismiss(FILTER_ERROR_TOAST);
    } else if (result === "error" && hadRows) {
      adminToast.error("Couldn't filter payments", {
        id: FILTER_ERROR_TOAST,
        description: "You're still seeing the previous list.",
        action: { label: "Retry", onClick: () => void handleFilters(status, type) },
      });
    }
  };

  const handleLoadMore = async () => {
    const shown = model.rows.length;
    const result = await model.loadMore();
    if (result === "ok") {
      adminToast.dismiss(MORE_ERROR_TOAST);
    } else if (result === "error") {
      adminToast.error("Couldn't load more payments", {
        id: MORE_ERROR_TOAST,
        description: `The ${pluralize(shown, "payment")} already shown are still here.`,
        action: { label: "Retry", onClick: () => void handleLoadMore() },
      });
    }
  };

  const handleDismissAttention = () => {
    const variant = model.dismissAttention();
    if (!variant) return;
    adminToast.success("Payment alert hidden", {
      id: "finances-transactions-attention-hidden",
      description: `It stays hidden on this device until the ${variant} payments clear.`,
      duration: 8000,
      action: { label: "Undo", onClick: () => model.undoDismissAttention(variant) },
    });
  };

  /* ---------------- derived view data ---------------- */


  const stats: GardenStat[] = [
    {
      id: "month",
      label: "Collected this month",
      value: formatFeeAmount(summary.collectedThisMonthCents),
      accent: "forest",
      active: model.statusFilter === "succeeded",
      hint: `${formatFeeAmount(summary.collectedYtdCents)} this year`,
      onClick: () => void handleFilters("succeeded", model.typeFilter, true),
      testId: "finances-stat-month",
    },
    {
      id: "pending",
      label: "Pending",
      value: String(summary.pendingCount),
      accent: "gold",
      active: model.statusFilter === "pending",
      hint: summary.pendingCount > 0 ? `${formatFeeAmount(summary.pendingCents)} waiting to clear` : "Nothing waiting",
      onClick: () => void handleFilters("pending", model.typeFilter, true),
      testId: "finances-stat-pending",
    },
    {
      id: "failed",
      label: "Failed",
      value: String(summary.failedCount),
      accent: "berry",
      active: model.statusFilter === "failed",
      hint: summary.failedCount > 0 ? "May need follow-up" : "None to chase",
      onClick: () => void handleFilters("failed", model.typeFilter, true),
      testId: "finances-stat-failed",
    },
    {
      id: "refunded",
      label: "Refunded",
      value: String(summary.refundedCount),
      accent: "sky",
      active: model.statusFilter === "refunded",
      hint: summary.refundedCount > 0 ? `${formatFeeAmount(summary.refundedCents)} returned to families` : "No refunds",
      onClick: () => void handleFilters("refunded", model.typeFilter, true),
      testId: "finances-stat-refunded",
    },
  ];

  const hasMeta = model.meta != null;
  const statusOptions: GardenFilterOption[] = TRANSACTION_STATUS_FILTERS.flatMap((filter) => {
    const count = hasMeta ? (filter.value ? model.statusCounts[filter.value] ?? 0 : model.metaTotalCount) : undefined;
    if (hasMeta && filter.value && count === 0 && filter.value !== model.statusFilter) return [];
    return [{ key: filter.value || "all", label: filter.label, count }];
  });
  const typeOptions: GardenFilterOption[] = TRANSACTION_TYPE_FILTERS.flatMap((filter) => {
    const count = hasMeta ? (filter.value ? model.typeCounts[filter.value] ?? 0 : model.metaTotalCount) : undefined;
    if (hasMeta && filter.value && count === 0 && filter.value !== model.typeFilter) return [];
    return [{ key: filter.value || "all", label: filter.label, count }];
  });

  const variant = model.attentionVariant;
  const attention =
    variant && model.showAttention ? (
      <div className="flex flex-col gap-1.5">
        <GardenLeadStrip
          icon={variant === "failed" ? AlertTriangle : Clock}
          title={
            variant === "failed"
              ? `${pluralize(summary.failedCount, "payment")} failed and may need follow-up.`
              : `${pluralize(summary.pendingCount, "payment")} ${summary.pendingCount === 1 ? "is" : "are"} still pending.`
          }
          meta={
            variant === "failed"
              ? "Nothing was collected for these. Open one to see what happened."
              : `${formatFeeAmount(summary.pendingCents)} waiting on Stripe or the family's bank.`
          }
          cta={variant === "failed" ? "View failed" : "View pending"}
          busy={model.isRefetching && model.statusFilter === variant}
          onClick={() => {
            if (model.statusFilter === variant) scrollToLedger(LEDGER_ID);
            else void handleFilters(variant, model.typeFilter, true);
          }}
          data-testid="finances-attention-strip"
        />
        <div className="flex justify-end">
          <button
            type="button"
            onClick={handleDismissAttention}
            aria-label="Dismiss payment alert"
            className={`${gLinkSm} !text-[12.5px] !text-[var(--sf-soft)]`}
          >
            Dismiss
          </button>
        </div>
      </div>
    ) : null;

  const caughtUp =
    hasMeta && model.metaTotalCount > 0 && summary.failedCount === 0 && summary.pendingCount === 0 ? (
      <GardenNotice tone="success" title="Nothing needs follow-up" role="status" data-testid="finances-caught-up">
        No failed or pending payments right now.{" "}
        <span aria-hidden="true" className="sf-hand ml-1 text-[17px] text-[var(--sf-forest)]">
          enjoy the quiet ✿
        </span>
      </GardenNotice>
    ) : null;

  let ledgerBody: ReactNode;
  if (model.loading) {
    ledgerBody = <LedgerSkeleton label="Loading transactions" />;
  } else if (model.error && model.rows.length === 0) {
    ledgerBody = (
      <GardenLoadError
        title="Transactions didn't load"
        description={`${model.error.replace(/\.?\s*$/, ".")} Nothing has changed — try again in a moment.`}
        onRetry={() => void model.retryLoad()}
        retrying={model.loading || model.isRefetching}
      />
    );
  } else if (model.rows.length === 0) {
    if (model.hasFilters && model.metaTotalCount > 0) {
      ledgerBody = <LedgerNoMatch onReset={() => void handleFilters("", "")} />;
    } else if (model.metaTotalCount === 0) {
      ledgerBody = (
        <GardenEmptyState
          icon={CreditCard}
          tint="bg-[var(--sf-mint)]"
          title="No payments yet"
          description="When families pay application, enrollment, or tuition fees, they will appear here."
          data-testid="finances-transactions-empty"
        />
      );
    } else {
      ledgerBody = (
        <p className="m-0 rounded-[16px] bg-[var(--sf-paper)] p-4 text-[14px] font-semibold text-[var(--sf-soft)]">
          No payments recorded yet.
        </p>
      );
    }
  } else {
    ledgerBody = (
      <>
        <GardenPaymentsLedger
          rows={model.rows}
          orgSlug={slug}
          selectedId={selected?.id ?? null}
          onSelect={setSelected}
          refetching={model.isRefetching || model.refreshing}
          caption={ledgerTitle(model.statusFilter, model.typeFilter)}
        />
        <div className="mt-4 flex flex-col items-center gap-3 border-t-[1.5px] border-dashed border-[var(--sf-ink)]/12 pt-4 sm:flex-row sm:justify-between">
          <p className="m-0 text-[12.5px] font-semibold text-[var(--sf-soft)]" aria-live="polite">
            Showing <span className="tabular-nums font-extrabold text-[var(--sf-ink)]/80">{model.rows.length}</span> of{" "}
            <span className="tabular-nums font-extrabold text-[var(--sf-ink)]/80">{model.totalCount}</span>{" "}
            {model.totalCount === 1 ? "payment" : "payments"}
            {model.hasFilters ? (
              <>
                {" · "}
                <button
                  type="button"
                  onClick={() => void handleFilters("", "")}
                  className={`${gLinkSm} !text-[12.5px]`}
                >
                  Clear filters
                </button>
              </>
            ) : null}
            {!model.hasMore && model.rows.length > 0 ? <> · That&rsquo;s everything</> : null}
          </p>
          {model.hasMore ? (
            <button
              type="button"
              onClick={() => void handleLoadMore()}
              disabled={model.loadingMore}
              aria-busy={model.loadingMore || undefined}
              className={gBtnOutlineSm}
              data-testid="finances-show-more"
            >
              <BusyLabel busy={model.loadingMore} busyLabel="Loading more…">
                Show more <span className="tabular-nums">({model.remainingCount} remaining)</span>
              </BusyLabel>
            </button>
          ) : null}
        </div>
      </>
    );
  }

  const showFilters = !model.loading && !(model.error && model.rows.length === 0) && model.metaTotalCount > 0;

  return (
    <AdminGardenPage
      theme={theme}
      data-testid="admin-finances-transactions-page"
      overlays={
        <PaymentDetailDrawer theme={theme} row={selected} orgSlug={slug} onClose={() => setSelected(null)} />
      }
    >
      <AdminGardenPageHeader
        data-testid="finances-transactions-header"
        kicker={
          <>
            Finances{schoolName ? <span className="hidden sm:inline"> · {schoolName}</span> : null}
          </>
        }
        title={<span className="text-[var(--sf-clay)]">Transactions</span>}
        subtitle={
          <span className="inline-flex flex-wrap items-center gap-2">
            {hasMeta && summary.failedCount > 0 ? (
              <GChip tone="alert">● Follow-up</GChip>
            ) : hasMeta && model.metaTotalCount > 0 ? (
              <GChip tone="success">● Up to date</GChip>
            ) : null}
            <span>{statusLine(model)}</span>
          </span>
        }
        refresh={
          (model.loading && !model.meta) || (model.error && model.rows.length === 0)
            ? undefined
            : {
                onRefresh: () => void handleRefresh(),
                refreshing: model.refreshing,
                lastUpdatedAt: model.loadedAt,
                label: "Refresh transactions",
              }
        }
      />

      {model.loading && !model.meta ? (
        <StatTilesSkeleton />
      ) : model.metaTotalCount > 0 ? (
        <GardenStatTiles stats={stats} ariaLabel="Payment totals" valueClassName="text-[1.45rem] min-[420px]:text-[1.7rem] sm:text-[2rem] xl:text-[2.2rem]" />
      ) : null}

      {attention ?? caughtUp}

      <GCard
        id={LEDGER_ID}
        index={3}
        kicker="Payment ledger"
        title={ledgerTitle(model.statusFilter, model.typeFilter)}
        data-testid="finances-transactions-ledger"
        action={
          revenueEnabled ? (
            <Link href={`/school/${slug}/admin/finances/revenue`} className={gLinkSm}>
              Revenue overview
              <ArrowRight className="h-3.5 w-3.5" aria-hidden />
            </Link>
          ) : undefined
        }
      >
        {showFilters ? (
          <div className="mb-4 flex flex-col gap-3 border-b-[1.5px] border-dashed border-[var(--sf-ink)]/12 pb-4">
            <LedgerFilters
              statusOptions={statusOptions}
              statusValue={model.statusFilter || "all"}
              onStatusChange={(key) =>
                void handleFilters(key === "all" ? "" : (key as PaymentStatus), model.typeFilter)
              }
              typeOptions={typeOptions}
              typeValue={model.typeFilter || "all"}
              onTypeChange={(key) =>
                void handleFilters(model.statusFilter, key === "all" ? "" : (key as PaymentType))
              }
              busy={model.isRefetching}
            />
            <FinancesStatusGuide />
          </div>
        ) : null}
        {ledgerBody}
      </GCard>
    </AdminGardenPage>
  );
}
