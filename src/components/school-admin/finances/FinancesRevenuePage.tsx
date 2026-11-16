"use client";

import Link from "next/link";
import { useMemo, useState, type ReactNode } from "react";
import { useSearchParams } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import {
  AlertTriangle,
  ArrowRight,
  ChevronRight,
  Clock,
  CreditCard,
  GraduationCap,
  MousePointerClick,
  RotateCcw,
  ScrollText,
  type LucideIcon,
} from "lucide-react";
import { GCard, GChip, gLinkSm, type GChipTone } from "@/components/school-parent/garden/ui";
import {
  AdminGardenPage,
  AdminGardenPageHeader,
  GardenEmptyState,
  GardenLoadError,
  GardenNotice,
  GardenStatTiles,
  ROW_INTERACTIVE,
  type GardenFilterOption,
  type GardenStat,
} from "@/components/school-admin/garden/kit";
import { GardenHint } from "@/components/school-admin/garden/blocks";
import { formatFeeAmount } from "@/lib/admissions/application-form-schema";
import { PAYMENT_TYPE_LABELS, type PaymentRecordDisplayRow } from "@/lib/admissions/payment-records";
import { buildParentThemeTokens } from "@/lib/organization-settings/parent-theme";
import type { OrganizationBranding } from "@/lib/organization-settings/types";
import { adminToast } from "@/lib/school-admin/admin-toast";
import type { PaymentStatus, PaymentType } from "@/lib/stripe/application-payments";
import {
  PAYMENT_STATUS_FILTERS,
  PAYMENT_TYPE_FILTERS,
  usePaymentsHistoryModel,
  type PaymentsHistoryModel,
} from "@/components/school-admin/admissions/payments/usePaymentsHistoryModel";
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
import { parseStatusParam, parseTypeParam, writeFilterParams } from "./useFinancesTransactionsModel";

type FinancesRevenuePageProps = {
  organizationId: string;
  slug: string;
  branding: OrganizationBranding;
  schoolName?: string;
  transactionsEnabled?: boolean;
};

const LEDGER_ID = "finances-revenue-ledger";
const REFRESH_TOAST = "finances-revenue-refresh";

/** Revenue defaults to Succeeded: no param = Succeeded, `status=all` = All. */
function parseRevenueStatus(value: string | null | undefined): "" | PaymentStatus {
  if (value === "all") return "";
  return parseStatusParam(value) || "succeeded";
}

function statusLine(model: PaymentsHistoryModel): string {
  if (model.loading) return "Adding up your payments…";
  if (model.error && model.rows.length === 0) return "We couldn't load revenue just now.";
  if (model.rows.length === 0) return "No payments yet · revenue adds up here as families pay";
  return `${formatFeeAmount(model.summary.collectedThisMonthCents)} collected this month · ${formatFeeAmount(
    model.summary.collectedYtdCents,
  )} so far this year`;
}

function ledgerTitle(status: "" | PaymentStatus, type: "" | PaymentType): string {
  const statusLabel = PAYMENT_STATUS_FILTERS.find((f) => f.value === status && f.value)?.label;
  const typeLabel = type ? PAYMENT_TYPE_LABELS[type] : null;
  const parts = [statusLabel, typeLabel].filter(Boolean);
  return parts.length ? `${parts.join(" · ")} payments` : "All payments";
}

const MIX: Array<{
  type: PaymentType;
  label: string;
  icon: LucideIcon;
  bar: string;
  chip: string;
  key: "applicationFeeCents" | "enrollmentCents" | "tuitionCents";
}> = [
  {
    type: "application_fee",
    label: "Application fees",
    icon: ScrollText,
    bar: "bg-[#d9a400]",
    chip: "bg-[var(--sf-butter)]",
    key: "applicationFeeCents",
  },
  {
    type: "enrollment_checklist",
    label: "Enrollment fees",
    icon: CreditCard,
    bar: "bg-[#5b8fc7]",
    chip: "bg-[var(--sf-sky)]",
    key: "enrollmentCents",
  },
  {
    type: "tuition",
    label: "Tuition",
    icon: GraduationCap,
    bar: "bg-[var(--sf-forest)]",
    chip: "bg-[var(--sf-mint)]",
    key: "tuitionCents",
  },
];

export default function FinancesRevenuePage({
  organizationId,
  slug,
  branding,
  schoolName,
  transactionsEnabled = false,
}: FinancesRevenuePageProps) {
  const theme = useMemo(() => buildParentThemeTokens(branding), [branding]);
  const searchParams = useSearchParams();
  const [initialFilters] = useState(() => ({
    status: parseRevenueStatus(searchParams?.get("status")),
    type: parseTypeParam(searchParams?.get("type")),
  }));
  const model = usePaymentsHistoryModel({
    organizationId,
    mode: "revenue",
    initialStatusFilter: initialFilters.status,
    initialTypeFilter: initialFilters.type,
  });
  const [selected, setSelected] = useState<PaymentRecordDisplayRow | null>(null);
  const reduce = useReducedMotion() === true;
  const { summary } = model;

  /* ---------------- actions + feedback ---------------- */

  const setFilters = (status: "" | PaymentStatus, type: "" | PaymentType, scroll = false) => {
    model.setStatusFilter(status);
    model.setTypeFilter(type);
    writeFilterParams({ status: status === "succeeded" ? null : status || "all", type });
    if (scroll) scrollToLedger(LEDGER_ID);
  };

  const handleRefresh = async () => {
    const shownAt = model.loadedAt;
    const ok = await model.reload({ silent: true });
    if (ok) {
      adminToast.dismiss(`${REFRESH_TOAST}-error`);
      adminToast.success("Revenue refreshed", {
        id: REFRESH_TOAST,
        description: "Totals and payments are up to date.",
      });
    } else {
      adminToast.error("Couldn't refresh revenue", {
        id: `${REFRESH_TOAST}-error`,
        description: `What's on screen is from ${shortTime(shownAt)}.`,
        action: { label: "Retry", onClick: () => void handleRefresh() },
      });
    }
  };

  /* ---------------- derived view data ---------------- */

  const succeededOnly = model.statusFilter === "succeeded";
  const stats: GardenStat[] = [
    {
      id: "month",
      label: "Collected this month",
      value: formatFeeAmount(summary.collectedThisMonthCents),
      accent: "forest",
      active: succeededOnly && model.typeFilter === "",
      onClick: () => setFilters("succeeded", "", true),
      testId: "revenue-stat-month",
    },
    {
      id: "ytd",
      label: "Collected YTD",
      value: formatFeeAmount(summary.collectedYtdCents),
      accent: "sky",
      hint: `Since Jan 1, ${new Date().getFullYear()}`,
      onClick: () => setFilters("succeeded", "", true),
      testId: "revenue-stat-ytd",
    },
    {
      id: "application-fees",
      label: "Application fees",
      value: formatFeeAmount(summary.applicationFeeCents),
      accent: "gold",
      hint: "All time",
      active: succeededOnly && model.typeFilter === "application_fee",
      onClick: () => setFilters("succeeded", "application_fee", true),
      testId: "revenue-stat-application",
    },
    {
      id: "enrollment-fees",
      label: "Enrollment fees",
      value: formatFeeAmount(summary.enrollmentCents),
      accent: "berry",
      hint: "All time",
      active: succeededOnly && model.typeFilter === "enrollment_checklist",
      onClick: () => setFilters("succeeded", "enrollment_checklist", true),
      testId: "revenue-stat-enrollment",
    },
  ];

  const statusOptions: GardenFilterOption[] = PAYMENT_STATUS_FILTERS.flatMap((filter) => {
    const count = filter.value ? model.statusCounts[filter.value] ?? 0 : model.rows.length;
    if (filter.value && count === 0 && filter.value !== model.statusFilter) return [];
    return [{ key: filter.value || "all", label: filter.label, count }];
  });
  const typeOptions: GardenFilterOption[] = PAYMENT_TYPE_FILTERS.flatMap((filter) => {
    const count = filter.value ? model.typeCounts[filter.value] ?? 0 : model.rows.length;
    if (filter.value && count === 0 && filter.value !== model.typeFilter) return [];
    return [{ key: filter.value || "all", label: filter.label, count }];
  });

  const mixTotal = summary.applicationFeeCents + summary.enrollmentCents + summary.tuitionCents;
  const outstanding = summary.pendingCount + summary.failedCount;
  const transactionsHref = (status?: PaymentStatus) =>
    `/school/${slug}/admin/finances/transactions${status ? `?status=${status}` : ""}`;

  const hasData = !model.loading && model.rows.length > 0;

  /* ---------------- ledger body ---------------- */

  let ledgerBody: ReactNode;
  if (model.loading) {
    ledgerBody = <LedgerSkeleton label="Loading payments" />;
  } else if (model.error && model.rows.length === 0) {
    ledgerBody = (
      <GardenLoadError
        title="Revenue didn't load"
        description={`${model.error.replace(/\.?\s*$/, ".")} Nothing has changed — try again in a moment.`}
        onRetry={() => void model.reload()}
        retrying={model.loading}
      />
    );
  } else if (model.rows.length === 0) {
    ledgerBody = (
      <GardenEmptyState
        icon={CreditCard}
        tint="bg-[var(--sf-mint)]"
        title="No payments recorded yet."
        description="Application, enrollment and tuition payments add up here as families pay."
        data-testid="finances-revenue-empty"
      />
    );
  } else if (model.filteredRows.length === 0) {
    ledgerBody = <LedgerNoMatch onReset={() => setFilters("", "")} />;
  } else {
    ledgerBody = (
      <>
        <GardenPaymentsLedger
          rows={model.filteredRows}
          orgSlug={slug}
          selectedId={selected?.id ?? null}
          onSelect={setSelected}
          refetching={model.reloading}
          caption={ledgerTitle(model.statusFilter, model.typeFilter)}
        />
        <p
          className="m-0 mt-4 border-t-[1.5px] border-dashed border-[var(--sf-ink)]/12 pt-4 text-[12.5px] font-semibold text-[var(--sf-soft)]"
          aria-live="polite"
        >
          Showing <span className="tabular-nums font-extrabold text-[var(--sf-ink)]/80">{model.filteredRows.length}</span>{" "}
          of <span className="tabular-nums font-extrabold text-[var(--sf-ink)]/80">{model.rows.length}</span>{" "}
          {model.rows.length === 1 ? "payment" : "payments"}
          {model.statusFilter !== "" || model.typeFilter !== "" ? (
            <>
              {" · "}
              <button type="button" onClick={() => setFilters("", "")} className={`${gLinkSm} !text-[12.5px]`}>
                Show all
              </button>
            </>
          ) : null}
        </p>
      </>
    );
  }

  return (
    <AdminGardenPage
      theme={theme}
      data-testid="admin-finances-revenue-page"
      overlays={
        <PaymentDetailDrawer theme={theme} row={selected} orgSlug={slug} onClose={() => setSelected(null)} />
      }
    >
      <AdminGardenPageHeader
        data-testid="finances-revenue-header"
        kicker={
          <>
            Finances{schoolName ? <span className="hidden sm:inline"> · {schoolName}</span> : null}
          </>
        }
        title={<span className="text-[var(--sf-clay)]">Revenue</span>}
        subtitle={statusLine(model)}
        refresh={
          model.loading || (model.error && model.rows.length === 0)
            ? undefined
            : {
                onRefresh: () => void handleRefresh(),
                refreshing: model.reloading,
                lastUpdatedAt: model.loadedAt,
                label: "Refresh revenue",
              }
        }
      />

      {model.loading ? <StatTilesSkeleton /> : hasData ? <GardenStatTiles stats={stats} ariaLabel="Revenue totals" valueClassName="text-[1.45rem] min-[420px]:text-[1.7rem] sm:text-[2rem] xl:text-[2.2rem]" /> : null}

      {hasData ? (
        <div className="grid items-start gap-5 lg:grid-cols-[1.55fr_1fr]">
          {/* Revenue mix */}
          <GCard index={2} kicker="Revenue mix" title="Where it comes from" data-testid="revenue-mix">
            {mixTotal === 0 ? (
              <p className="m-0 rounded-[16px] bg-[var(--sf-paper)] p-4 text-[14px] font-semibold text-[var(--sf-soft)]">
                Nothing collected yet. Collected payments show up here by type.
              </p>
            ) : (
              <>
                <div
                  className="mb-4 flex h-3.5 w-full overflow-hidden rounded-full border-[1.5px] border-[var(--sf-ink)] bg-white"
                  role="img"
                  aria-label={MIX.map(
                    (m) => `${m.label} ${Math.round((summary[m.key] / mixTotal) * 100)}%`,
                  ).join(", ")}
                >
                  {MIX.map((m, i) =>
                    summary[m.key] > 0 ? (
                      <motion.span
                        key={m.type}
                        className={`h-full ${m.bar} ${i > 0 ? "border-l-[1.5px] border-[var(--sf-ink)]" : ""}`}
                        initial={reduce ? false : { width: 0 }}
                        animate={{ width: `${(summary[m.key] / mixTotal) * 100}%` }}
                        transition={{ duration: 0.7, delay: 0.15 + i * 0.08 }}
                      />
                    ) : null,
                  )}
                </div>
                <ul className="m-0 flex list-none flex-col gap-0.5 p-0">
                  {MIX.map((m) => {
                    const cents = summary[m.key];
                    const pct = Math.round((cents / mixTotal) * 100);
                    const active = succeededOnly && model.typeFilter === m.type;
                    const Icon = m.icon;
                    return (
                      <li key={m.type}>
                        <button
                          type="button"
                          onClick={() => setFilters("succeeded", m.type, true)}
                          aria-pressed={active}
                          aria-label={`${m.label}: ${formatFeeAmount(cents)}, ${pct}% of collected. Show these payments`}
                          className={`${ROW_INTERACTIVE} ${active ? "bg-[var(--sf-accent-wash)]" : ""}`}
                        >
                          <span
                            aria-hidden
                            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-[12px] border-[1.5px] border-[var(--sf-ink)]/15 ${m.chip}`}
                          >
                            <Icon className="h-4 w-4 text-[var(--sf-ink)]/75" />
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="flex items-baseline justify-between gap-3">
                              <span className="truncate text-[14px] font-extrabold text-[var(--sf-ink)]">{m.label}</span>
                              <span className="shrink-0 text-[14.5px] font-extrabold tabular-nums text-[var(--sf-ink)]">
                                {formatFeeAmount(cents)}
                              </span>
                            </span>
                            <span className="mt-1.5 flex items-center gap-2.5">
                              <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-[var(--sf-ink)]/[0.07]">
                                <span className={`block h-full rounded-full ${m.bar}`} style={{ width: `${pct}%` }} />
                              </span>
                              <span className="w-9 shrink-0 text-right text-[12px] font-extrabold tabular-nums text-[var(--sf-soft)]">
                                {pct}%
                              </span>
                            </span>
                          </span>
                          <ChevronRight
                            className={`h-4 w-4 shrink-0 ${active ? "text-[var(--sf-clay-deep)]" : "text-[var(--sf-ink)]/30"}`}
                            aria-hidden
                          />
                        </button>
                      </li>
                    );
                  })}
                </ul>
                <div className="mt-3">
                  <GardenHint icon={MousePointerClick}>
                    Collected payments, all time. Pick a type to see its payments in the ledger below.
                  </GardenHint>
                </div>
              </>
            )}
          </GCard>

          {/* Needs a look */}
          <GCard
            index={3}
            kicker="Needs a look"
            title="Not collected yet"
            data-testid="revenue-needs-look"
            action={
              transactionsEnabled && outstanding > 0 ? (
                <Link
                  href={transactionsHref(summary.failedCount > 0 ? "failed" : "pending")}
                  className={gLinkSm}
                >
                  Follow up
                  <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                </Link>
              ) : undefined
            }
          >
            {outstanding === 0 ? (
              <GardenNotice tone="success" title="Nothing outstanding" className="mb-2">
                No pending or failed payments right now.
              </GardenNotice>
            ) : null}
            <ul className="m-0 flex list-none flex-col gap-0.5 p-0">
              {(
                [
                  {
                    status: "pending" as const,
                    label: "Pending",
                    icon: Clock,
                    tone: "warning" as GChipTone,
                    count: summary.pendingCount,
                    meta:
                      summary.pendingCount > 0
                        ? `${formatFeeAmount(summary.pendingCents)} waiting on Stripe or the bank`
                        : "Nothing waiting",
                  },
                  {
                    status: "failed" as const,
                    label: "Failed",
                    icon: AlertTriangle,
                    tone: "alert" as GChipTone,
                    count: summary.failedCount,
                    meta: summary.failedCount > 0 ? "Nothing collected · may need follow-up" : "None to chase",
                  },
                  {
                    status: "refunded" as const,
                    label: "Refunded",
                    icon: RotateCcw,
                    tone: "info" as GChipTone,
                    count: summary.refundedCount,
                    meta:
                      summary.refundedCount > 0
                        ? `${formatFeeAmount(summary.refundedCents)} returned to families`
                        : "No refunds",
                  },
                ] satisfies Array<{
                  status: PaymentStatus;
                  label: string;
                  icon: LucideIcon;
                  tone: GChipTone;
                  count: number;
                  meta: string;
                }>
              ).map((item) => {
                const Icon = item.icon;
                const active = model.statusFilter === item.status && model.typeFilter === "";
                return (
                  <li key={item.status}>
                    <button
                      type="button"
                      onClick={() => setFilters(item.status, "", true)}
                      disabled={item.count === 0}
                      aria-pressed={active}
                      aria-label={`${item.label}: ${item.count}. ${item.meta}. Show these payments`}
                      className={`${ROW_INTERACTIVE} disabled:cursor-default disabled:opacity-55 disabled:hover:bg-transparent ${
                        active ? "bg-[var(--sf-accent-wash)]" : ""
                      }`}
                    >
                      <span
                        aria-hidden
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[12px] border-[1.5px] border-[var(--sf-ink)]/15 bg-[var(--sf-paper)]"
                      >
                        <Icon className="h-4 w-4 text-[var(--sf-ink)]/70" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-[14px] font-extrabold text-[var(--sf-ink)]">{item.label}</span>
                        <span className="block truncate text-[12.5px] font-semibold text-[var(--sf-soft)]">{item.meta}</span>
                      </span>
                      <GChip tone={item.count > 0 ? item.tone : "neutral"} className="tabular-nums">
                        {item.count}
                      </GChip>
                      {item.count > 0 ? <ChevronRight className="h-4 w-4 shrink-0 text-[var(--sf-ink)]/30" aria-hidden /> : null}
                    </button>
                  </li>
                );
              })}
            </ul>
            {transactionsEnabled ? (
              <p className="m-0 mt-3 text-[12.5px] font-semibold text-[var(--sf-soft)]">
                Chasing a payment? Transactions has every attempt, newest first.{" "}
                <Link href={transactionsHref()} className={`${gLinkSm} !text-[12.5px]`}>
                  Open Transactions
                </Link>
              </p>
            ) : null}
          </GCard>
        </div>
      ) : null}

      <GCard
        id={LEDGER_ID}
        index={4}
        kicker="Payment ledger"
        title={ledgerTitle(model.statusFilter, model.typeFilter)}
        data-testid="finances-revenue-ledger"
        action={
          transactionsEnabled && hasData ? (
            <Link href={transactionsHref()} className={gLinkSm}>
              See every transaction
              <ArrowRight className="h-3.5 w-3.5" aria-hidden />
            </Link>
          ) : undefined
        }
      >
        {hasData ? (
          <div className="mb-4 flex flex-col gap-3 border-b-[1.5px] border-dashed border-[var(--sf-ink)]/12 pb-4">
            <LedgerFilters
              statusOptions={statusOptions}
              statusValue={model.statusFilter || "all"}
              onStatusChange={(key) => setFilters(key === "all" ? "" : (key as PaymentStatus), model.typeFilter)}
              typeOptions={typeOptions}
              typeValue={model.typeFilter || "all"}
              onTypeChange={(key) => setFilters(model.statusFilter, key === "all" ? "" : (key as PaymentType))}
            />
            <FinancesStatusGuide />
          </div>
        ) : null}
        {ledgerBody}
      </GCard>
    </AdminGardenPage>
  );
}
