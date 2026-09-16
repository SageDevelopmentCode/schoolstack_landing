"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { CheckCircle, Download } from "lucide-react";
import {
  PARENT_DEMO_STORY_COMPAT,
  PARENT_DEMO_STORY_THEME,
} from "@/components/demo/shared/parent-demo-runtime";
import type { DemoParentChildId } from "@/components/demo/shared/demo-parent-types";
import {
  DEMO_PARENT_CHILD_BILLING_META,
  DEMO_PARENT_CHILD_IDS,
  DEMO_PARENT_SCHOOL_YEAR_LABEL,
  DEMO_PARENT_SCHOOL_YEAR_MONTHS,
  DEMO_PARENT_SCHOOL_YEAR_MONTHS_PAID,
  DEMO_PARENT_TRANSACTIONS,
  EMMA_SCHOOL_YEAR_TX_ID,
  formatDemoMoney,
  getDemoOtherPaidTransactions,
  getDemoPaidTransactionsForMonth,
  getDemoPendingBanner,
  getDemoSchoolYearAmount,
  getDemoSchoolYearDescription,
  isDemoHomeschoolDropIn,
  isDemoSchoolYearTuition,
  LIAM_SCHOOL_YEAR_TX_ID,
  parseDemoAmount,
  resolveDemoBillingSubtitle,
  type DemoParentTransaction,
  type DemoPaymentPlan,
} from "@/components/demo/shared/demo-parent-billing-shared";
import ParentButton from "@/components/school-parent/ui/ParentButton";
import ParentCard from "@/components/school-parent/ui/ParentCard";
import ParentChip from "@/components/school-parent/ui/ParentChip";
import ParentDisplayHeading from "@/components/school-parent/ui/ParentDisplayHeading";
import ParentSectionKicker from "@/components/school-parent/ui/ParentSectionKicker";
import ParentStoryPillNav from "@/components/school-parent/ui/ParentStoryPillNav";

type DemoParentBillingPageProps = {
  paidInvoices: Set<string>;
  paymentPlan: DemoPaymentPlan;
  onOpenCheckout: (txIds: string[]) => void;
  onOpenInvoice: () => void;
  homeschoolSelections: Record<string, string[]>;
  paidHomeschoolDetails: Record<string, { amount: string; scheduleNote: string }>;
  onOpenHomeschoolPay: (childId: DemoParentChildId) => void;
};

function totalHomeschoolAmountForDemo(selections: Record<string, string[]>): number {
  return Object.values(selections).reduce((sum, days) => sum + days.length * 100, 0);
}

export default function DemoParentBillingPage({
  paidInvoices,
  paymentPlan,
  onOpenCheckout,
  onOpenInvoice,
  homeschoolSelections,
  paidHomeschoolDetails,
  onOpenHomeschoolPay,
}: DemoParentBillingPageProps) {
  const theme = PARENT_DEMO_STORY_THEME;
  const [childFilter, setChildFilter] = useState<DemoParentChildId | "all">("all");
  const [selectedHistoryMonthId, setSelectedHistoryMonthId] = useState(
    DEMO_PARENT_SCHOOL_YEAR_MONTHS[DEMO_PARENT_SCHOOL_YEAR_MONTHS_PAID - 1].id,
  );

  const emmaTuitionPaid = paidInvoices.has(EMMA_SCHOOL_YEAR_TX_ID);
  const liamTuitionPaid = paidInvoices.has(LIAM_SCHOOL_YEAR_TX_ID);
  const fullTimeTuitionPaid = emmaTuitionPaid && liamTuitionPaid;

  const getDisplayAmount = (t: DemoParentTransaction): string => {
    if (paidHomeschoolDetails[t.id]) return paidHomeschoolDetails[t.id].amount;
    if (isDemoHomeschoolDropIn(t)) {
      return formatDemoMoney(totalHomeschoolAmountForDemo(homeschoolSelections));
    }
    if (isDemoSchoolYearTuition(t)) {
      if (t.status === "paid") return t.amount;
      return formatDemoMoney(getDemoSchoolYearAmount(paymentPlan));
    }
    return t.amount;
  };

  const getDisplayDescription = (t: DemoParentTransaction): string => {
    if (isDemoSchoolYearTuition(t) && t.status === "pending") {
      return getDemoSchoolYearDescription(paymentPlan);
    }
    if (isDemoSchoolYearTuition(t)) return t.desc;
    return t.desc;
  };

  const getListScheduleNote = (t: DemoParentTransaction): string | undefined => {
    if (isDemoHomeschoolDropIn(t) || isDemoSchoolYearTuition(t)) return undefined;
    return t.scheduleNote;
  };

  const handlePayClick = (t: DemoParentTransaction) => {
    if (isDemoHomeschoolDropIn(t)) {
      onOpenHomeschoolPay(t.childId);
      return;
    }
    onOpenCheckout([t.id]);
  };

  const filteredTx =
    childFilter === "all"
      ? DEMO_PARENT_TRANSACTIONS
      : DEMO_PARENT_TRANSACTIONS.filter((t) => t.childId === childFilter);

  const pending = filteredTx.filter(
    (t) => t.status === "pending" && !paidInvoices.has(t.id),
  );
  const paid = filteredTx.filter(
    (t) => t.status === "paid" || paidInvoices.has(t.id),
  );

  const totalDue = pending.reduce(
    (sum, t) => sum + parseDemoAmount(getDisplayAmount(t)),
    0,
  );
  const nextDue = pending.length > 0 ? pending[0].date : null;

  const monthsPaidCount =
    DEMO_PARENT_SCHOOL_YEAR_MONTHS_PAID + (fullTimeTuitionPaid ? 1 : 0);

  const getMonthStatus = (
    monthIndex: number,
  ): "paid" | "current" | "upcoming" => {
    if (monthIndex < monthsPaidCount) return "paid";
    if (monthIndex === monthsPaidCount) return "current";
    return "upcoming";
  };

  const selectedHistoryMonth = DEMO_PARENT_SCHOOL_YEAR_MONTHS.find(
    (m) => m.id === selectedHistoryMonthId,
  );
  const checkoutPaidMonthId =
    fullTimeTuitionPaid && monthsPaidCount > 0
      ? DEMO_PARENT_SCHOOL_YEAR_MONTHS[monthsPaidCount - 1].id
      : undefined;
  const monthFilteredPaid = getDemoPaidTransactionsForMonth(
    paid,
    selectedHistoryMonthId,
    checkoutPaidMonthId,
  );
  const otherPaid = getDemoOtherPaidTransactions(paid);

  const firstSchoolYearPendingIdx = pending.findIndex(
    (tx) => !isDemoHomeschoolDropIn(tx),
  );

  const prevMonthsPaidRef = useRef(monthsPaidCount);
  useEffect(() => {
    if (monthsPaidCount > prevMonthsPaidRef.current) {
      setSelectedHistoryMonthId(
        DEMO_PARENT_SCHOOL_YEAR_MONTHS[monthsPaidCount - 1].id,
      );
    }
    prevMonthsPaidRef.current = monthsPaidCount;
  }, [monthsPaidCount]);

  const navItems = useMemo(() => {
    return [
      {
        key: "all",
        label: "Family view",
        testId: "parent-billing-summary-nav",
      },
      ...DEMO_PARENT_CHILD_IDS.map((childId) => {
        const meta = DEMO_PARENT_CHILD_BILLING_META[childId];
        const childPendingCount = DEMO_PARENT_TRANSACTIONS.filter(
          (t) =>
            t.childId === childId &&
            t.status === "pending" &&
            !paidInvoices.has(t.id),
        ).length;
        return {
          key: childId,
          label: meta.name,
          testId: `parent-billing-child-summary-${childId}`,
          suffix:
            childPendingCount > 0 ? (
              <span
                className="inline-flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[9px] font-bold text-white"
                style={{ backgroundColor: theme.warning }}
              >
                {childPendingCount}
              </span>
            ) : undefined,
        };
      }),
    ];
  }, [paidInvoices, theme.warning]);

  const activeChildMeta =
    childFilter === "all" ? null : DEMO_PARENT_CHILD_BILLING_META[childFilter];
  const title =
    childFilter === "all"
      ? "Family tuition"
      : `${activeChildMeta?.name ?? "Child"}'s tuition`;
  const subtitle = resolveDemoBillingSubtitle(pending.length, totalDue);

  return (
    <div className="mx-auto flex min-h-0 w-full max-w-[1250px] flex-1 flex-col px-4 py-6 sm:py-8 md:px-9">
      <div className="mb-5">
        <ParentSectionKicker theme={theme}>Tuition &amp; billing</ParentSectionKicker>
        <ParentDisplayHeading theme={theme} as="h1" size="section" className="mt-1">
          {title}
        </ParentDisplayHeading>
        <p className="mt-1 text-sm" style={{ color: theme.muted }}>
          {subtitle}
        </p>
        <div className="mt-4">
          <ParentStoryPillNav
            theme={theme}
            items={navItems}
            activeKey={childFilter}
            onChange={(key) => setChildFilter(key as DemoParentChildId | "all")}
            ariaLabel="Billing child tabs"
            data-testid="parent-billing-nav"
          />
        </div>
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 lg:grid-cols-[1.3fr_0.75fr]">
        <ParentCard theme={theme} variant="today" className="!p-6">
          <ParentSectionKicker theme={theme}>Next payment</ParentSectionKicker>
          <p
            className="font-heading text-[clamp(2rem,5vw,2.5rem)] font-semibold leading-[0.95] tracking-[-0.04em]"
            style={{ fontFamily: theme.fontDisplay, color: theme.ink }}
          >
            {formatDemoMoney(totalDue)}
          </p>
          {nextDue ? (
            <p className="mb-4 mt-1 text-[13px]" style={{ color: theme.muted }}>
              Due {nextDue}
              {childFilter === "all" && totalDue > 0 ? " · Family total due" : ""}
            </p>
          ) : (
            <p className="mb-4 mt-1 text-[13px]" style={{ color: theme.muted }}>
              No payment due right now
            </p>
          )}
          {totalDue === 0 ? (
            <ParentChip theme={theme} tone="success">
              All paid
            </ParentChip>
          ) : childFilter === "all" && pending.length > 0 ? (
            <ParentButton
              theme={theme}
              variant="primary"
              onClick={() => onOpenCheckout(pending.map((t) => t.id))}
            >
              Pay all
            </ParentButton>
          ) : pending[0] ? (
            <ParentButton
              theme={theme}
              variant="primary"
              onClick={() => handlePayClick(pending[0])}
            >
              Pay now
            </ParentButton>
          ) : null}
        </ParentCard>

        <ParentCard theme={theme}>
          <p className="text-sm font-semibold" style={{ color: theme.ink }}>
            {DEMO_PARENT_SCHOOL_YEAR_LABEL}
          </p>
          <p className="mt-1 text-xs" style={{ color: theme.muted }}>
            {monthsPaidCount} of {DEMO_PARENT_SCHOOL_YEAR_MONTHS.length} months paid
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {DEMO_PARENT_SCHOOL_YEAR_MONTHS.map((m, monthIndex) => {
              const status = getMonthStatus(monthIndex);
              const isSelected = m.id === selectedHistoryMonthId;
              return (
                <button
                  key={m.id}
                  type="button"
                  title={m.label}
                  onClick={() => setSelectedHistoryMonthId(m.id)}
                  className="flex min-h-[64px] min-w-[68px] flex-col items-center justify-center gap-1.5 rounded-lg border px-3.5 py-3 transition-all"
                  style={{
                    borderColor:
                      status === "paid"
                        ? theme.successBg
                        : status === "current"
                          ? theme.warningBg
                          : theme.line,
                    backgroundColor:
                      status === "paid"
                        ? theme.successBg
                        : status === "current"
                          ? theme.warningBg
                          : theme.white,
                    boxShadow: isSelected ? `0 0 0 2px ${theme.primary}` : undefined,
                  }}
                >
                  <span
                    className="text-sm font-semibold leading-none"
                    style={{
                      color:
                        status === "paid"
                          ? theme.success
                          : status === "current"
                            ? theme.warning
                            : theme.muted,
                    }}
                  >
                    {m.short}
                  </span>
                  <span
                    className="rounded-full px-2 py-0.5 text-[10px] font-medium leading-none"
                    style={{
                      backgroundColor:
                        status === "paid"
                          ? theme.successBg
                          : status === "current"
                            ? theme.warningBg
                            : theme.line,
                      color:
                        status === "paid"
                          ? theme.success
                          : status === "current"
                            ? theme.warning
                            : theme.muted,
                    }}
                  >
                    {status === "paid" ? "Paid" : status === "current" ? "Current" : "Upcoming"}
                  </span>
                </button>
              );
            })}
          </div>
        </ParentCard>
      </div>

      <section className="mt-6">
        <div className="mb-3 flex items-center justify-between">
          <ParentDisplayHeading theme={theme} as="h2" size="section">
            Pending
          </ParentDisplayHeading>
          {pending.length > 0 ? (
            <span className="text-xs font-semibold" style={{ color: theme.warning }}>
              {pending.length} invoice{pending.length > 1 ? "s" : ""}
            </span>
          ) : null}
        </div>

        {pending.length === 0 ? (
          <ParentCard theme={theme} className="!p-4">
            <div className="flex items-center gap-2 text-sm" style={{ color: theme.success }}>
              <CheckCircle className="h-4 w-4" />
              <span>
                No pending invoices
                {childFilter !== "all" && activeChildMeta
                  ? ` for ${activeChildMeta.name}`
                  : ""}
              </span>
            </div>
          </ParentCard>
        ) : (
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            {pending.map((t, tIdx) => {
              const isHomeschool = isDemoHomeschoolDropIn(t);
              const meta = DEMO_PARENT_CHILD_BILLING_META[t.childId];
              const isTourTarget =
                !isHomeschool && tIdx === firstSchoolYearPendingIdx;
              const isInvoiceClickable = isTourTarget;

              return (
                <ParentCard key={t.id} theme={theme} className="!p-0 overflow-hidden">
                  <article
                    data-tour-id={isTourTarget ? "billing-pending-invoice" : undefined}
                    onClick={isInvoiceClickable ? onOpenInvoice : undefined}
                    className={`flex h-full flex-col ${isInvoiceClickable ? "cursor-pointer" : ""}`}
                  >
                    <div className="relative h-32 shrink-0 overflow-hidden">
                      <img
                        src={getDemoPendingBanner(t)}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                      <span className="absolute bottom-2.5 left-3 text-xs font-semibold text-white/90">
                        {isHomeschool ? "Homeschool Drop-In" : "Virtual Academy"}
                      </span>
                    </div>
                    <div className="flex flex-1 flex-col gap-3 p-4">
                      <div className="flex min-w-0 items-start gap-3">
                        <div
                          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                          style={{ backgroundColor: meta.color }}
                        >
                          {meta.initials}
                        </div>
                        <div className="min-w-0">
                          <p className="text-base font-medium leading-snug" style={{ color: theme.ink }}>
                            {getDisplayDescription(t)}
                          </p>
                          <p className="mt-1 text-xs leading-snug" style={{ color: theme.muted }}>
                            Due {t.date} · {meta.name}
                          </p>
                        </div>
                      </div>
                      <div className="mt-auto flex items-center justify-between gap-3 pt-1">
                        <span
                          className="text-base font-semibold tabular-nums"
                          style={{ color: theme.ink }}
                        >
                          {getDisplayAmount(t)}
                        </span>
                        <ParentButton
                          theme={theme}
                          variant="primary"
                          className="px-3 py-1.5 text-xs"
                          onClick={(event) => {
                            event.stopPropagation();
                            handlePayClick(t);
                          }}
                        >
                          {isHomeschool ? "Select days" : "Pay"}
                        </ParentButton>
                      </div>
                    </div>
                  </article>
                </ParentCard>
              );
            })}
          </div>
        )}
      </section>

      {paid.length > 0 ? (
        <section className="mt-8">
          <ParentDisplayHeading theme={theme} as="h2" size="section" className="mb-3">
            Payment history
            {selectedHistoryMonth ? ` — ${selectedHistoryMonth.label}` : ""}
          </ParentDisplayHeading>
          {monthFilteredPaid.length === 0 ? (
            <p className="py-4 text-center text-sm" style={{ color: theme.muted }}>
              No payments for {selectedHistoryMonth?.label ?? "this month"}
            </p>
          ) : (
            <div className="space-y-2">
              {monthFilteredPaid.map((t) => (
                <ParentCard key={t.id} theme={theme} className="!p-4">
                  <div className="flex items-center gap-4">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium" style={{ color: theme.ink }}>
                        {getDisplayDescription(t)}
                      </p>
                      <p className="mt-0.5 text-xs" style={{ color: theme.muted }}>
                        {t.date} · {DEMO_PARENT_CHILD_BILLING_META[t.childId].name}
                        {getListScheduleNote(t) ? ` · ${getListScheduleNote(t)}` : ""}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-3">
                      <span
                        className="text-sm font-semibold tabular-nums"
                        style={{ color: theme.ink }}
                      >
                        {getDisplayAmount(t)}
                      </span>
                      <ParentChip theme={theme} tone="success">
                        Paid
                      </ParentChip>
                      <button
                        type="button"
                        className="transition-opacity hover:opacity-70"
                        style={{ color: theme.muted }}
                        title="Download receipt"
                      >
                        <Download className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </ParentCard>
              ))}
            </div>
          )}

          {otherPaid.length > 0 ? (
            <div className="mt-5">
              <p
                className="mb-2 text-xs font-semibold uppercase tracking-wide"
                style={{ color: theme.muted }}
              >
                Other payments
              </p>
              <div className="space-y-2">
                {otherPaid.map((t) => (
                  <ParentCard key={t.id} theme={theme} className="!p-4">
                    <div className="flex items-center gap-4">
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium" style={{ color: theme.ink }}>
                          {getDisplayDescription(t)}
                        </p>
                        <p className="mt-0.5 text-xs" style={{ color: theme.muted }}>
                          {t.date} · {DEMO_PARENT_CHILD_BILLING_META[t.childId].name}
                          {getListScheduleNote(t) ? ` · ${getListScheduleNote(t)}` : ""}
                        </p>
                      </div>
                      <div className="flex shrink-0 items-center gap-3">
                        <span
                          className="text-sm font-semibold tabular-nums"
                          style={{ color: theme.ink }}
                        >
                          {getDisplayAmount(t)}
                        </span>
                        <ParentChip theme={theme} tone="success">
                          Paid
                        </ParentChip>
                      </div>
                    </div>
                  </ParentCard>
                ))}
              </div>
            </div>
          ) : null}
        </section>
      ) : null}
    </div>
  );
}
