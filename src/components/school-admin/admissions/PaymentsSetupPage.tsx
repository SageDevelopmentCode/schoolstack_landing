"use client";

import Link from "next/link";
import { useMemo, type ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  CreditCard,
  ExternalLink,
  FileText,
  History,
  Link2,
  Loader2,
  ShieldCheck,
  Wallet,
  X,
  type LucideIcon,
} from "lucide-react";
import { PORTAL_EASE, useCelebrate } from "@/components/school-parent/garden/motion";
import {
  GCard,
  GChip,
  GSkeleton,
  gBtnOutlineSm,
  gBtnPopSm,
  gLinkSm,
} from "@/components/school-parent/garden/ui";
import {
  AdminGardenPage,
  AdminGardenPageHeader,
  BusyLabel,
  GardenLoadError,
  GardenNotice,
  GardenSteps,
  LiveDot,
  ROW_INTERACTIVE,
  gIconBtn,
  useRelativeTime,
  type GardenStep,
} from "@/components/school-admin/garden/kit";
import { buildParentThemeTokens } from "@/lib/organization-settings/parent-theme";
import type { OrganizationBranding } from "@/lib/organization-settings/types";
import type { ConnectStatusNextStep } from "@/lib/stripe/connect-status";
import { STRIPE_DASHBOARD_LINK_SENTINEL } from "@/lib/stripe/connect-status";
import GardenPaymentsHistory from "./payments/GardenPaymentsHistory";
import { usePaymentsHistoryModel } from "./payments/usePaymentsHistoryModel";
import {
  PAYMENTS_SETUP_STEPS,
  READY_NOTICE,
  usePaymentsSetupModel,
  type PaymentsSetupModel,
  type PaymentsTab,
} from "./payments/usePaymentsSetupModel";

type PaymentsSetupPageProps = {
  organizationId: string;
  orgSlug: string;
  branding: OrganizationBranding;
  schoolName: string;
};

const HOW_IT_WORKS: Array<{ icon: LucideIcon; title: string; description: string; tint: string }> = [
  {
    icon: Link2,
    title: "Connect Stripe",
    description: "Complete secure onboarding with identity and payout details.",
    tint: "bg-[var(--sf-peach)]",
  },
  {
    icon: CreditCard,
    title: "Families pay at checkout",
    description: "Application and enrollment fees are collected when families apply.",
    tint: "bg-[var(--sf-sky)]",
  },
  {
    icon: Building2,
    title: "Funds to your school",
    description: "Payments land directly in your school's Stripe account.",
    tint: "bg-[var(--sf-mint)]",
  },
];

const GOOD_TO_KNOW = [
  "Fees from enrollment flows are collected at checkout.",
  "Identity and payout details are handled securely by Stripe.",
  "Publishing a fee-enabled form requires payments to be ready.",
];

function getNextStepMeta(step: ConnectStatusNextStep): {
  icon: LucideIcon;
  description: string;
  isDashboard: boolean;
} {
  const isDashboard = step.href === STRIPE_DASHBOARD_LINK_SENTINEL;
  const label = step.label.toLowerCase();
  if (isDashboard && label.includes("open your stripe")) {
    return { icon: Wallet, description: "View balance, payouts, and bank account settings.", isDashboard: true };
  }
  if (label.includes("publish")) {
    return { icon: FileText, description: "Make your form live so families can apply and pay.", isDashboard: false };
  }
  if (label.includes("test")) {
    return { icon: ExternalLink, description: "Walk through the apply flow as a family would.", isDashboard: false };
  }
  if (step.href.startsWith("http")) {
    return { icon: Wallet, description: "View payouts and account settings in Stripe.", isDashboard: false };
  }
  return { icon: ArrowRight, description: step.label, isDashboard };
}

function statusLine(model: PaymentsSetupModel): string {
  if (model.loading) return "Checking your Stripe status…";
  if (model.loadFailed) return "We couldn't check your Stripe status just now.";
  if (model.isReady) return "Stripe connected · families can pay fees when they apply";
  if (model.hasAccount) {
    const left = PAYMENTS_SETUP_STEPS.length - model.completedSteps;
    return `${model.completedSteps} of ${PAYMENTS_SETUP_STEPS.length} Stripe steps done · ${left} to go before you can collect fees`;
  }
  return "Not connected yet · connect Stripe to collect application and enrollment fees";
}

export default function PaymentsSetupPage({
  organizationId,
  orgSlug,
  branding,
  schoolName,
}: PaymentsSetupPageProps) {
  const theme = useMemo(() => buildParentThemeTokens(branding), [branding]);
  const model = usePaymentsSetupModel({ organizationId, orgSlug });
  const history = usePaymentsHistoryModel({ organizationId, mode: "admissions" });
  const reduce = useReducedMotion() === true;

  useCelebrate(model.justConnected && model.isReady, theme, "admin-payments-stripe-connected");

  const phaseChip =
    model.phase === "ready" ? (
      <GChip tone="success">● Active</GChip>
    ) : model.phase === "in_progress" ? (
      <GChip tone="warning">● In progress</GChip>
    ) : model.phase === "not_started" ? (
      <GChip tone="neutral">Not connected</GChip>
    ) : null;

  return (
    <AdminGardenPage theme={theme} data-testid="admin-payments-page">
      <AdminGardenPageHeader
        kicker={
          <>
            Admissions<span className="hidden sm:inline"> · {schoolName}</span>
          </>
        }
        title={
          <>
            <span className="text-[var(--sf-clay)]">Payments</span>{" "}
            &amp; fees
          </>
        }
        subtitle={
          <span className="inline-flex flex-wrap items-center gap-2">
            {phaseChip}
            <span>{statusLine(model)}</span>
          </span>
        }
        refresh={
          model.activeTab === "setup" && !model.loading && !model.loadFailed
            ? {
                onRefresh: () => void model.checkStatusNow(),
                refreshing: model.refreshing,
                lastUpdatedAt: model.lastCheckedAt,
                label: "Check Stripe status",
              }
            : undefined
        }
        tabs={{
          items: [
            { key: "setup", label: "Setup", icon: <CreditCard className="h-3.5 w-3.5" aria-hidden /> },
            {
              key: "history",
              label: "History",
              icon: <History className="h-3.5 w-3.5" aria-hidden />,
              suffix:
                !history.loading && history.rows.length > 0 ? (
                  <span className="rounded-full bg-[var(--sf-ink)]/10 px-1.5 text-[11px] tabular-nums">
                    {history.rows.length}
                  </span>
                ) : undefined,
            },
          ],
          activeKey: model.activeTab,
          onChange: (key) => model.setActiveTab(key as PaymentsTab),
          ariaLabel: "Payments sections",
          "data-testid": "payments-tab-bar",
        }}
      />

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={model.activeTab}
          role="tabpanel"
          aria-label={model.activeTab === "setup" ? "Setup" : "History"}
          initial={reduce ? false : { opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduce ? undefined : { opacity: 0, y: -4 }}
          transition={{ duration: 0.24, ease: PORTAL_EASE }}
        >
          {model.activeTab === "history" ? (
            <GardenPaymentsHistory
              model={history}
              orgSlug={orgSlug}
              isReady={model.isReady}
              onSwitchToSetup={() => model.setActiveTab("setup")}
            />
          ) : (
            <SetupPanel model={model} schoolName={schoolName} />
          )}
        </motion.div>
      </AnimatePresence>
    </AdminGardenPage>
  );
}

/* ------------------------------------------------------------------ */
/* Setup tab                                                           */
/* ------------------------------------------------------------------ */

function SetupPanel({ model, schoolName }: { model: PaymentsSetupModel; schoolName: string }) {
  if (model.loadFailed && !model.status) {
    return (
      <GardenLoadError
        title="Payment setup didn't load"
        description={model.error ?? "Check your connection and try again."}
        onRetry={model.retryLoad}
        retrying={model.loading}
      />
    );
  }

  return (
    <div className="grid items-start gap-5 lg:grid-cols-[1.55fr_1fr]">
      <div className="flex min-w-0 flex-col gap-5">
        <Banners model={model} />
        <StripeConnectCard model={model} schoolName={schoolName} />
        {model.isReady && model.actionableSteps.length > 0 ? <WhatsNextCard model={model} /> : null}
      </div>
      <div className="flex min-w-0 flex-col gap-5">
        <HowItWorksCard done={model.isReady} />
        {!model.isReady && !model.loading ? (
          <GCard index={3} tone="paper" kicker="Good to know" headingLevel="h2" title="Before families pay">
            <ul className="m-0 flex list-none flex-col gap-2.5 p-0">
              {GOOD_TO_KNOW.map((line) => (
                <li key={line} className="flex items-start gap-2.5 text-[13.5px] font-semibold leading-snug text-[var(--sf-ink)]/80">
                  <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[var(--sf-forest)]" aria-hidden />
                  {line}
                </li>
              ))}
            </ul>
          </GCard>
        ) : null}
      </div>
    </div>
  );
}

function Banners({ model }: { model: PaymentsSetupModel }) {
  const reduce = useReducedMotion() === true;
  const motionProps = {
    initial: reduce ? false : { opacity: 0, y: -6 },
    animate: { opacity: 1, y: 0 },
    exit: reduce ? undefined : { opacity: 0, y: -6 },
    transition: { duration: 0.22, ease: PORTAL_EASE },
  } as const;
  return (
    <AnimatePresence initial={false}>
      {model.notice ? (
        <motion.div key="notice" {...motionProps}>
          <GardenNotice
            tone={model.notice === READY_NOTICE ? "success" : "info"}
            title="Setup updated"
            role="status"
            action={
              <button type="button" onClick={model.dismissNotice} className={gIconBtn} aria-label="Dismiss">
                <X className="h-4 w-4" aria-hidden />
              </button>
            }
          >
            {model.notice}
          </GardenNotice>
        </motion.div>
      ) : null}
      {model.error && model.status ? (
        <motion.div key="error" {...motionProps}>
          <GardenNotice
            tone="alert"
            title="Something went wrong"
            role="alert"
            action={
              <>
                <button
                  type="button"
                  onClick={() => void model.handleConnect()}
                  disabled={model.connecting}
                  className={gBtnOutlineSm}
                >
                  <BusyLabel busy={model.connecting} busyLabel="Opening Stripe…">
                    Try again in Stripe
                  </BusyLabel>
                </button>
                <button type="button" onClick={model.dismissError} className={gIconBtn} aria-label="Dismiss">
                  <X className="h-4 w-4" aria-hidden />
                </button>
              </>
            }
          >
            {model.error}
          </GardenNotice>
        </motion.div>
      ) : null}
      {!model.loading && model.status?.isTestMode && !model.isReady ? (
        <motion.div key="test-mode" {...motionProps}>
          <GardenNotice tone="warning" title="Stripe test mode">
            Verification can take a few minutes. Use{" "}
            <a
              href="https://docs.stripe.com/testing"
              target="_blank"
              rel="noopener noreferrer"
              className={`${gLinkSm} !text-[13.5px]`}
            >
              Stripe test cards
            </a>{" "}
            when testing checkout.
          </GardenNotice>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

function StripeConnectCard({ model, schoolName }: { model: PaymentsSetupModel; schoolName: string }) {
  const lastChecked = useRelativeTime(model.lastCheckedAt);
  const { status, phase } = model;

  const title =
    phase === "ready"
      ? "Payments are live"
      : phase === "in_progress"
        ? "Finish Stripe setup"
        : phase === "not_started"
          ? "Connect your school account"
          : "Checking payment status";

  const intro =
    phase === "ready"
      ? `${schoolName} can accept application and enrollment fees online. Funds go to your school's Stripe account.`
      : phase === "in_progress"
        ? status?.pendingMessage ?? `A few more steps and ${schoolName} can start collecting fees from families.`
        : phase === "not_started"
          ? "Secure onboarding takes a few minutes. You'll verify identity and payout details in Stripe."
          : "Syncing with Stripe…";

  const primaryCta = (
    <button
      type="button"
      onClick={() => void model.handleConnect()}
      disabled={model.connecting}
      aria-busy={model.connecting || undefined}
      className={gBtnPopSm}
      data-testid="payments-connect-stripe"
    >
      <BusyLabel busy={model.connecting} busyLabel="Opening Stripe…" icon={<ExternalLink className="h-4 w-4" aria-hidden />}>
        {model.hasAccount ? "Continue in Stripe" : "Connect Stripe"}
      </BusyLabel>
    </button>
  );

  const steps: GardenStep[] = PAYMENTS_SETUP_STEPS.map((step, index) => {
    const done = Boolean(status?.checklist[step.key]);
    const current = !model.isReady && index === (model.activeChecklistIndex < 0 ? 0 : model.activeChecklistIndex);
    let detail: ReactNode = null;
    if (current && !model.loading) {
      detail = (
        <span className="flex flex-col gap-3">
          {model.hasAccount && status && status.requirementsDue.length > 0 ? (
            <span className="block rounded-[14px] border-[1.5px] border-[var(--sf-ink)]/10 bg-white px-3.5 py-3">
              <span className="block text-[13px] font-extrabold text-[var(--sf-ink)]">
                Stripe needs a few more details
              </span>
              <span className="mt-1.5 flex flex-wrap gap-1.5">
                {status.requirementsDue.map((requirement) => (
                  <GChip key={requirement} tone="warning">
                    {requirement}
                  </GChip>
                ))}
              </span>
            </span>
          ) : null}
          <span className="flex flex-wrap items-center gap-2.5">{primaryCta}</span>
        </span>
      );
    }
    return {
      id: step.key,
      title: step.label,
      description: step.hint,
      status: done ? "done" : current ? "current" : "todo",
      detail,
    };
  });

  return (
    <GCard
      index={1}
      kicker="Stripe Connect"
      title={title}
      action={
        model.hasAccount && !model.loading ? (
          <button
            type="button"
            onClick={() => void model.checkStatusNow()}
            disabled={model.refreshing}
            aria-busy={model.refreshing || undefined}
            className={gLinkSm}
          >
            {model.refreshing ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
                Checking…
              </>
            ) : (
              "Check status"
            )}
          </button>
        ) : null
      }
      data-testid="payments-stripe-card"
    >
      <div className="mb-4 flex items-start gap-3">
        <span
          aria-hidden
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] border-[1.5px] border-[var(--sf-ink)]/15 ${
            model.isReady ? "bg-[var(--sf-mint)]" : "bg-[var(--sf-peach)]"
          }`}
        >
          {model.isReady ? (
            <CheckCircle2 className="h-5 w-5 text-[var(--sf-forest)]" />
          ) : (
            <CreditCard className="h-5 w-5 text-[var(--sf-clay-deep)]" />
          )}
        </span>
        <p className="m-0 text-[14px] font-semibold leading-relaxed text-[var(--sf-ink)]/80">{intro}</p>
      </div>

      {model.loading ? (
        <div className="flex flex-col gap-2" role="status" aria-label="Loading payment status">
          {[0, 1, 2, 3].map((i) => (
            <GSkeleton key={i} className="h-11 !rounded-[14px]" />
          ))}
        </div>
      ) : (
        <GardenSteps
          steps={steps}
          progressLabel="Stripe setup progress"
          data-testid="payments-setup-steps"
        />
      )}

      {!model.loading && model.hasAccount ? (
        <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1.5 border-t-[1.5px] border-dashed border-[var(--sf-ink)]/12 pt-3 text-[12.5px] font-semibold text-[var(--sf-soft)]">
          <span aria-live="polite">
            Last checked {lastChecked}
            {model.refreshing ? " · checking…" : ""}
          </span>
          {model.isPolling && !model.pollExhausted ? (
            <span className="inline-flex items-center gap-1.5">
              <LiveDot />
              Watching for updates from Stripe
            </span>
          ) : null}
        </div>
      ) : null}

      {!model.loading && model.hasAccount && !model.isReady && model.isPolling && model.pollExhausted ? (
        <p className="m-0 mt-3 text-[13px] font-semibold text-[var(--sf-soft)]">
          Still verifying? Continue in Stripe or contact support if this takes longer than expected.
        </p>
      ) : null}
    </GCard>
  );
}

function WhatsNextCard({ model }: { model: PaymentsSetupModel }) {
  return (
    <GCard index={2} kicker="What's next" title="Put payments to work">
      <ul className="m-0 flex list-none flex-col gap-1 p-0">
        {model.actionableSteps.map((step) => {
          const meta = getNextStepMeta(step);
          const Icon = meta.icon;
          const busy = meta.isDashboard && model.openingDashboard;
          const inner = (
            <>
              <span
                aria-hidden
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[12px] border-[1.5px] border-[var(--sf-ink)]/12 bg-[var(--sf-sky)]"
              >
                {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Icon className="h-4 w-4 text-[var(--sf-ink)]/75" />}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[14px] font-extrabold text-[var(--sf-ink)]">
                  {busy ? "Opening Stripe…" : step.label}
                </span>
                <span className="block text-[12.5px] font-semibold text-[var(--sf-soft)]">{meta.description}</span>
              </span>
              <ArrowRight
                className="h-4 w-4 shrink-0 text-[var(--sf-ink)]/40 transition-transform group-hover:translate-x-0.5 group-hover:text-[var(--sf-clay-deep)]"
                aria-hidden
              />
            </>
          );
          return (
            <li key={`${step.label}-${step.href}`}>
              {meta.isDashboard ? (
                <button
                  type="button"
                  onClick={() => void model.handleOpenDashboard()}
                  disabled={model.openingDashboard}
                  aria-busy={busy || undefined}
                  className={`${ROW_INTERACTIVE} disabled:cursor-wait`}
                >
                  {inner}
                </button>
              ) : step.href.startsWith("http") ? (
                <a href={step.href} target="_blank" rel="noopener noreferrer" className={`${ROW_INTERACTIVE} no-underline`}>
                  {inner}
                </a>
              ) : (
                <Link href={step.href} className={`${ROW_INTERACTIVE} no-underline`}>
                  {inner}
                </Link>
              )}
            </li>
          );
        })}
      </ul>
      {model.footnoteSteps.length > 0 ? (
        <div className="mt-3 flex flex-col gap-1 border-t-[1.5px] border-dashed border-[var(--sf-ink)]/12 pt-3">
          {model.footnoteSteps.map((step) => (
            <p key={step.label} className="m-0 text-[12.5px] font-semibold text-[var(--sf-soft)]">
              {step.label}
            </p>
          ))}
        </div>
      ) : null}
    </GCard>
  );
}

function HowItWorksCard({ done }: { done: boolean }) {
  return (
    <GCard index={2} kicker="How it works" title="Three steps to online fees">
      <ol className="m-0 flex list-none flex-col gap-2 p-0">
        {HOW_IT_WORKS.map((item, index) => {
          const Icon = item.icon;
          const active = !done && index === 0;
          return (
            <li
              key={item.title}
              className={`flex items-start gap-3 rounded-[14px] px-3 py-2.5 ${
                active ? "bg-[var(--sf-accent-wash)] ring-[1.5px] ring-[var(--sf-clay)]/25" : ""
              }`}
            >
              <span
                aria-hidden
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-[12px] border-[1.5px] border-[var(--sf-ink)]/12 ${item.tint}`}
              >
                <Icon className="h-4 w-4 text-[var(--sf-ink)]/75" />
              </span>
              <span className="min-w-0">
                <span className="block text-[14px] font-extrabold text-[var(--sf-ink)]">
                  <span className="mr-1 tabular-nums text-[var(--sf-soft)]">{index + 1}.</span>
                  {item.title}
                </span>
                <span className="block text-[12.5px] font-semibold leading-snug text-[var(--sf-soft)]">
                  {item.description}
                </span>
              </span>
            </li>
          );
        })}
      </ol>
    </GCard>
  );
}
