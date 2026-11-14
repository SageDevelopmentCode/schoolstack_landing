"use client";

import Link from "next/link";
import { ArrowRight, Check, Loader2 } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { PortalIsland } from "@/components/school-parent/garden/ParentGardenFrame";
import { gFade } from "@/components/school-parent/garden/motion";
import {
  GCard,
  GChip,
  GProgress,
  G_FOCUS,
  gBtnButterSm,
} from "@/components/school-parent/garden/ui";
import AdminDashboardStaffHoursSection from "@/components/school-admin/dashboard/AdminDashboardStaffHoursSection";
import type { OrganizationPlan } from "@/lib/organization-settings/plans";
import type { AdminDashboardToday, DashboardMetric } from "@/lib/school-admin/dashboard-summary";
import { METRIC_BARS, metricHref } from "./shared";

/* ------------------------------------------------------------------ */
/* Setup progress                                                      */
/* ------------------------------------------------------------------ */

export function shouldShowSetup(plan: OrganizationPlan, today: AdminDashboardToday): boolean {
  return plan !== "free" && !today.setupComplete;
}

/**
 * Go-live setup as numbered steps (current step on the accent wash). Each step
 * links to where it's done. Stripe shows a live "checking" state while the
 * dashboard polls Connect status.
 */
export function GardenSetupProgress({
  today,
  stripeChecking,
  index = 2,
  compact = false,
}: {
  today: AdminDashboardToday;
  stripeChecking: boolean;
  index?: number;
  compact?: boolean;
}) {
  const { steps, completedCount, totalCount, firstIncompleteStepId } = today.setupStatus;
  const remaining = totalCount - completedCount;
  return (
    <GCard
      index={index}
      kicker="Setup progress"
      title={`${remaining} step${remaining === 1 ? "" : "s"} to go-live`}
      data-testid="dashboard-setup-progress"
    >
      <div className="mb-4 flex items-center gap-3">
        <GProgress
          value={completedCount}
          total={totalCount}
          label="Setup progress"
          done={remaining === 0}
        />
        <span className="shrink-0 text-[13px] font-extrabold tabular-nums text-[var(--sf-ink)]/70">
          {completedCount}/{totalCount}
        </span>
      </div>
      <ol className="m-0 flex list-none flex-col gap-1.5 p-0">
        {steps.map((step, i) => {
          const done = step.status === "completed";
          const current = step.id === firstIncompleteStepId;
          const checking = step.id === "stripe" && stripeChecking;
          return (
            <li key={step.id}>
              <Link
                href={step.href}
                className={`group flex items-start gap-3 rounded-[14px] px-3 py-2.5 no-underline transition-colors ${
                  current ? "bg-[var(--sf-accent-wash)] ring-[1.5px] ring-[var(--sf-clay)]/30" : "hover:bg-[var(--sf-ink)]/[0.03]"
                } ${G_FOCUS} focus-visible:ring-inset`}
                aria-current={current ? "step" : undefined}
              >
                <span
                  aria-hidden="true"
                  className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-[1.5px] text-[12px] font-extrabold tabular-nums ${
                    done
                      ? "border-[var(--sf-forest)] bg-[var(--sf-forest)] text-white"
                      : current
                        ? "border-[var(--sf-ink)] bg-[var(--sf-clay)] text-white"
                        : "border-[var(--sf-ink)]/25 bg-white text-[var(--sf-ink)]/60"
                  }`}
                >
                  {done ? <Check className="h-3.5 w-3.5" strokeWidth={3} /> : i + 1}
                </span>
                <span className="min-w-0 flex-1">
                  <span
                    className={`block text-[14px] font-extrabold leading-snug ${
                      done ? "text-[var(--sf-ink)]/55 line-through decoration-[var(--sf-ink)]/25" : "text-[var(--sf-ink)]"
                    }`}
                  >
                    {step.title}
                  </span>
                  {!compact && !done ? (
                    <span className="block text-[12.5px] font-semibold leading-snug text-[var(--sf-soft)]">
                      {step.description}
                    </span>
                  ) : null}
                  {checking ? (
                    <span className="mt-1 inline-flex items-center gap-1.5 text-[12px] font-extrabold text-[var(--sf-clay-deep)]">
                      <Loader2 className="h-3 w-3 animate-spin" aria-hidden />
                      Checking Stripe status…
                    </span>
                  ) : null}
                </span>
                {done ? (
                  <span className="sr-only">Done</span>
                ) : current ? (
                  <GChip tone="alert" className="mt-0.5">Next</GChip>
                ) : null}
              </Link>
            </li>
          );
        })}
      </ol>
    </GCard>
  );
}

/* ------------------------------------------------------------------ */
/* Metrics                                                             */
/* ------------------------------------------------------------------ */

/**
 * KPI tiles. Each tile links to the page behind the number. `strip` is a
 * slim single card with dividers (for the run sheet / workspace variants).
 */
export function GardenMetricTiles({
  slug,
  metrics,
  layout = "tiles",
  index = 3,
}: {
  slug: string;
  metrics: DashboardMetric[];
  layout?: "tiles" | "strip";
  index?: number;
}) {
  const reduce = useReducedMotion() === true;
  if (metrics.length === 0) return null;

  if (layout === "strip") {
    return (
      <motion.section
        {...gFade(index, reduce)}
        aria-label="Key numbers"
        className="grid grid-cols-2 overflow-hidden rounded-[22px] border-[1.5px] border-[var(--sf-ink)]/12 bg-white shadow-[0_3px_0_0_rgba(43,36,29,0.08)] lg:grid-cols-4"
        data-testid="dashboard-metrics"
      >
        {metrics.map((metric, i) => (
          <MetricLink
            key={metric.id}
            slug={slug}
            metric={metric}
            className={`px-4 py-3 ${i % 2 === 1 ? "border-l-[1.5px]" : ""} ${i >= 2 ? "border-t-[1.5px] lg:border-t-0" : ""} ${
              i > 0 ? "lg:border-l-[1.5px]" : ""
            } border-[var(--sf-ink)]/[0.08]`}
            valueClass="text-[1.6rem]"
          />
        ))}
      </motion.section>
    );
  }

  return (
    <section
      aria-label="Key numbers"
      className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4"
      data-testid="dashboard-metrics"
    >
      {metrics.map((metric, i) => (
        <motion.div key={metric.id} {...gFade(index + i * 0.5, reduce)} className="min-w-0">
          <MetricLink
            slug={slug}
            metric={metric}
            className="h-full rounded-[22px] border-[1.5px] border-[var(--sf-ink)]/12 bg-white px-4 py-4 shadow-[0_3px_0_0_rgba(43,36,29,0.08)] hover:-translate-y-0.5 sm:px-5"
            valueClass="text-[2rem] sm:text-[2.4rem]"
            showBar
          />
        </motion.div>
      ))}
    </section>
  );
}

function MetricLink({
  slug,
  metric,
  className,
  valueClass,
  showBar = false,
}: {
  slug: string;
  metric: DashboardMetric;
  className: string;
  valueClass: string;
  showBar?: boolean;
}) {
  const href = metricHref(slug, metric);
  const inner = (
    <>
      {showBar ? (
        <span aria-hidden="true" className={`mb-3 block h-1.5 w-8 rounded-full ${METRIC_BARS[metric.accent]}`} />
      ) : null}
      <span className={`sf-display block leading-none tabular-nums text-[var(--sf-ink)] ${valueClass}`}>
        {metric.value}
      </span>
      <span className="mt-1.5 flex items-center justify-between gap-2 text-[13px] font-extrabold text-[var(--sf-ink)]/65 group-hover:text-[var(--sf-ink)]">
        <span className="min-w-0">{metric.label}</span>
        {href ? (
          <ArrowRight
            className="h-3.5 w-3.5 shrink-0 opacity-0 transition-all duration-200 group-hover:translate-x-0.5 group-hover:opacity-100"
            aria-hidden
          />
        ) : null}
      </span>
    </>
  );
  const base = `group block min-w-0 text-left no-underline transition-all duration-200 ${className}`;
  if (!href) return <div className={base}>{inner}</div>;
  return (
    <Link
      href={href}
      className={`${base} hover:bg-[var(--sf-accent-wash)] ${G_FOCUS} focus-visible:ring-inset`}
      aria-label={`${metric.label}: ${metric.value}. Open`}
      data-testid={`dashboard-metric-${metric.id}`}
    >
      {inner}
    </Link>
  );
}

/* ------------------------------------------------------------------ */
/* School signal                                                       */
/* ------------------------------------------------------------------ */

/** The page's one dark card. Falls back to the existing empty-state copy. */
export function GardenSignalCard({
  today,
  plan,
  index = 2,
  className = "",
}: {
  today: AdminDashboardToday;
  plan: OrganizationPlan;
  index?: number;
  className?: string;
}) {
  const signal = today.signal;
  if (!signal) {
    return (
      <GCard index={index} kicker="School signal" tone="paper" className={className}>
        <p className="m-0 text-[14px] font-semibold text-[var(--sf-soft)]">
          {plan === "free"
            ? "You're all set for today."
            : "Activity will appear here as families apply and enroll."}
        </p>
      </GCard>
    );
  }
  return (
    <GCard
      index={index}
      tone="dark"
      kicker="School signal"
      title={signal.headline}
      className={className}
      data-testid="dashboard-signal"
    >
      <p className="m-0 text-[14px] font-semibold leading-relaxed text-white/85">{signal.body}</p>
      <div className="mt-auto pt-5">
        <Link href={signal.href} className={gBtnButterSm}>
          {signal.ctaLabel.replace(/\s*[→>]+\s*$/u, "")} <ArrowRight className="h-4 w-4" aria-hidden />
        </Link>
      </div>
    </GCard>
  );
}

/* ------------------------------------------------------------------ */
/* Staff hours                                                         */
/* ------------------------------------------------------------------ */

/** Staff hours keeps its own component (not yet migrated) inside a PortalIsland. */
export function GardenStaffHoursCard({
  slug,
  today,
  index = 5,
}: {
  slug: string;
  today: AdminDashboardToday;
  index?: number;
}) {
  if (!today.staffHoursToday) return null;
  return (
    <GCard index={index} data-testid="dashboard-staff-hours">
      <PortalIsland>
        <AdminDashboardStaffHoursSection slug={slug} data={today.staffHoursToday} />
      </PortalIsland>
    </GCard>
  );
}
