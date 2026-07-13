"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertCircle,
  ArrowRight,
  Building2,
  CheckCircle2,
  Circle,
  CircleDot,
  CreditCard,
  ExternalLink,
  FileText,
  History,
  Link2,
  Loader2,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import {
  BUILDER_CARD_TONES,
  BuilderSectionIntro,
  type BuilderCardTone,
} from "@/components/school-admin/admissions/builder-question-card";
import { getAdminButtonStyle } from "@/lib/organization-settings/admin-button-styles";
import {
  buildAdminThemeTokens,
  type AdminThemeTokens,
} from "@/lib/organization-settings/theme";
import type { OrganizationBranding } from "@/lib/organization-settings/types";
import type {
  ConnectStatusChecklist,
  ConnectStatusNextStep,
  ConnectStatusResult,
} from "@/lib/stripe/connect-status";
import PaymentsHistoryPanel from "./PaymentsHistoryPanel";

type PaymentsSetupPageProps = {
  organizationId: string;
  orgSlug: string;
  branding: OrganizationBranding;
  schoolName: string;
};

type SetupPhase = "loading" | "not_started" | "in_progress" | "ready";

const SETUP_STEPS: Array<{
  key: keyof ConnectStatusChecklist;
  label: string;
  hint?: string;
}> = [
  { key: "accountCreated", label: "Account connected" },
  { key: "detailsSubmitted", label: "Details submitted" },
  { key: "chargesEnabled", label: "Charges enabled", hint: "Required to collect fees" },
  { key: "payoutsEnabled", label: "Payouts enabled", hint: "Funds go to your Stripe account" },
];

const HOW_IT_WORKS = [
  {
    icon: Link2,
    title: "Connect Stripe",
    description: "Complete secure onboarding with identity and payout details.",
    tone: "accent" as BuilderCardTone,
  },
  {
    icon: CreditCard,
    title: "Families pay at checkout",
    description: "Application and enrollment fees are collected when families apply.",
    tone: "info" as BuilderCardTone,
  },
  {
    icon: Building2,
    title: "Funds to your school",
    description: "Payments land directly in your school's Stripe account.",
    tone: "success" as BuilderCardTone,
  },
];

function getSetupPhase(loading: boolean, isReady: boolean, hasAccount: boolean): SetupPhase {
  if (loading) return "loading";
  if (isReady) return "ready";
  if (hasAccount) return "in_progress";
  return "not_started";
}

function getHeroCopy(phase: SetupPhase, schoolName: string) {
  switch (phase) {
    case "ready":
      return {
        title: "You're ready to collect fees",
        subtitle: `${schoolName} can accept application and enrollment fees online. Funds go to your school's Stripe account.`,
        pill: { label: "Active", tone: "success" as const },
      };
    case "in_progress":
      return {
        title: "Finish Stripe setup",
        subtitle: `A few more steps and ${schoolName} can start collecting fees from families.`,
        pill: { label: "In progress", tone: "warning" as const },
      };
    case "not_started":
      return {
        title: "Connect payments",
        subtitle: `Set up Stripe so ${schoolName} can collect application and enrollment fees online.`,
        pill: { label: "Not connected", tone: "neutral" as const },
      };
    default:
      return {
        title: "Checking payment status",
        subtitle: "Syncing with Stripe…",
        pill: { label: "Loading", tone: "neutral" as const },
      };
  }
}

function StatusPill({
  label,
  tone,
  C,
}: {
  label: string;
  tone: "success" | "warning" | "neutral";
  C: AdminThemeTokens;
}) {
  const style =
    tone === "success"
      ? { backgroundColor: C.successBg, color: C.success, border: `1px solid ${C.successBorder}` }
      : tone === "warning"
        ? { backgroundColor: C.warningBg, color: C.warning, border: `1px solid ${C.warningBorder}` }
        : { backgroundColor: C.elevated, color: C.textSecondary, border: `1px solid ${C.border}` };

  return (
    <span className="shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-medium" style={style}>
      {label}
    </span>
  );
}

function HowItWorksExplainer({ C }: { C: AdminThemeTokens }) {
  return (
    <div className="space-y-3">
      <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: C.accentDark }}>
        How it works
      </p>
      <div className="grid gap-3 sm:grid-cols-3">
        {HOW_IT_WORKS.map((item) => {
          const tone = BUILDER_CARD_TONES[item.tone](C);
          const Icon = item.icon;
          return (
            <div
              key={item.title}
              className="rounded-lg border p-4"
              style={{ backgroundColor: tone.bg, borderColor: tone.border }}
            >
              <div
                className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg"
                style={{ backgroundColor: C.surface, color: C.accent }}
              >
                <Icon className="h-4 w-4" aria-hidden />
              </div>
              <p className="text-sm font-semibold" style={{ color: C.textPrimary }}>
                {item.title}
              </p>
              <p className="mt-1 text-xs leading-relaxed" style={{ color: C.textTertiary }}>
                {item.description}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ChecklistRow({
  done,
  label,
  hint,
  isActive,
  C,
}: {
  done: boolean;
  label: string;
  hint?: string;
  isActive?: boolean;
  C: AdminThemeTokens;
}) {
  const statusLabel = done ? "Done" : isActive ? "In progress" : "Pending";
  const statusColor = done ? C.success : isActive ? C.info : C.textTertiary;

  return (
    <li
      className="flex items-start gap-3 border-b px-4 py-3 last:border-b-0"
      style={{ borderColor: C.border }}
    >
      {done ? (
        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" style={{ color: C.success }} aria-hidden />
      ) : isActive ? (
        <CircleDot className="mt-0.5 h-4 w-4 shrink-0" style={{ color: C.info }} aria-hidden />
      ) : (
        <Circle className="mt-0.5 h-4 w-4 shrink-0" style={{ color: C.textTertiary }} aria-hidden />
      )}
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium" style={{ color: C.textPrimary }}>
          {label}
        </p>
        {hint ? (
          <p className="mt-0.5 text-xs" style={{ color: C.textTertiary }}>
            {hint}
          </p>
        ) : null}
      </div>
      <span className="text-xs font-medium" style={{ color: statusColor }}>
        {statusLabel}
      </span>
    </li>
  );
}

function getNextStepMeta(step: ConnectStatusNextStep): {
  icon: LucideIcon;
  description: string;
  isFootnote: boolean;
} {
  const isFootnote =
    step.label.length > 55 ||
    step.label.toLowerCase().includes("managed in") ||
    step.label.toLowerCase().includes("payouts are");

  if (step.label.toLowerCase().includes("publish")) {
    return {
      icon: FileText,
      description: "Make your form live so families can apply and pay.",
      isFootnote,
    };
  }
  if (step.label.toLowerCase().includes("test")) {
    return {
      icon: ExternalLink,
      description: "Walk through the apply flow as a family would.",
      isFootnote,
    };
  }
  if (step.href.startsWith("http")) {
    return {
      icon: Wallet,
      description: "View payouts and account settings in Stripe.",
      isFootnote,
    };
  }
  return {
    icon: ArrowRight,
    description: step.label,
    isFootnote,
  };
}

function NextStepTile({
  step,
  C,
}: {
  step: ConnectStatusNextStep;
  C: AdminThemeTokens;
}) {
  const meta = getNextStepMeta(step);
  const Icon = meta.icon;
  const isExternal = step.href.startsWith("http");

  const content = (
    <>
      <div
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
        style={{ backgroundColor: C.accentLight, color: C.accent }}
      >
        <Icon className="h-4 w-4" aria-hidden />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold" style={{ color: C.textPrimary }}>
          {step.label}
        </p>
        <p className="mt-0.5 text-xs" style={{ color: C.textTertiary }}>
          {meta.description}
        </p>
      </div>
      <ArrowRight
        className="h-4 w-4 shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
        style={{ color: C.accent }}
        aria-hidden
      />
    </>
  );

  const className =
    "group flex items-center gap-3 rounded-lg border p-4 text-left transition-colors hover:opacity-95";

  if (isExternal) {
    return (
      <a
        href={step.href}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
        style={{ backgroundColor: C.elevated, borderColor: C.border }}
      >
        {content}
      </a>
    );
  }

  return (
    <Link
      href={step.href}
      className={className}
      style={{ backgroundColor: C.elevated, borderColor: C.border }}
    >
      {content}
    </Link>
  );
}

function PaymentsTabBar({
  activeTab,
  onChange,
  C,
}: {
  activeTab: "setup" | "history";
  onChange: (tab: "setup" | "history") => void;
  C: AdminThemeTokens;
}) {
  const tabs = [
    { id: "setup" as const, label: "Setup", icon: CreditCard },
    { id: "history" as const, label: "History", icon: History },
  ];

  return (
    <div className="flex flex-shrink-0 px-4 py-3 sm:px-5" style={{ borderBottom: `1px solid ${C.border}` }}>
      <div
        className="inline-flex rounded-lg p-1"
        style={{ backgroundColor: C.elevated, border: `1px solid ${C.border}` }}
        role="tablist"
        aria-label="Payments sections"
      >
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => onChange(tab.id)}
              className="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors"
              style={{
                backgroundColor: isActive ? C.accentLight : "transparent",
                color: isActive ? C.accent : C.textSecondary,
              }}
            >
              <Icon className="h-3.5 w-3.5" aria-hidden />
              {tab.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function PaymentsSetupPage({
  organizationId,
  orgSlug,
  branding,
  schoolName,
}: PaymentsSetupPageProps) {
  const C = useMemo(() => buildAdminThemeTokens(branding), [branding]);
  const router = useRouter();
  const searchParams = useSearchParams();

  const [status, setStatus] = useState<ConnectStatusResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const returnHandledRef = useRef(false);
  const [activeTab, setActiveTab] = useState<"setup" | "history">("setup");

  const loadStatus = useCallback(
    async (options?: { handleReturn?: boolean }) => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `/api/stripe/connect/status?organizationId=${encodeURIComponent(organizationId)}`,
        );
        const payload = (await response.json()) as ConnectStatusResult & {
          error?: string;
        };

        if (!response.ok) {
          throw new Error(
            payload.error ?? "Failed to load payment setup status.",
          );
        }

        setStatus(payload);

        if (options?.handleReturn) {
          const connected = searchParams.get("connected");
          if (connected === "1") {
            if (payload.isReady) {
              setNotice(
                "Stripe is connected. You're ready to collect application fees.",
              );
            } else if (payload.pendingMessage) {
              setNotice(payload.pendingMessage);
            } else {
              setNotice(
                "Stripe setup updated. Finish any remaining steps below.",
              );
            }
          } else if (connected === "0") {
            setError("We could not confirm your Stripe setup. Please try again.");
          }
        }

        return payload;
      } catch (loadError) {
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Failed to load payment setup status.",
        );
        setStatus(null);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [organizationId, searchParams],
  );

  useEffect(() => {
    const connected = searchParams.get("connected");

    if (
      (connected === "1" || connected === "0") &&
      !returnHandledRef.current
    ) {
      returnHandledRef.current = true;
      void loadStatus({ handleReturn: true }).then(() => {
        router.replace(`/school/${orgSlug}/admin/admissions/payments`, {
          scroll: false,
        });
      });
      return;
    }

    void loadStatus();
  }, [loadStatus, orgSlug, router, searchParams]);

  const isReady = Boolean(status?.isReady);
  const hasAccount = Boolean(status?.checklist.accountCreated);
  const phase = getSetupPhase(loading, isReady, hasAccount);
  const hero = getHeroCopy(phase, schoolName);

  const activeChecklistIndex = status
    ? SETUP_STEPS.findIndex((step) => !status.checklist[step.key])
    : -1;

  const actionableSteps =
    status?.nextSteps.filter((step) => !getNextStepMeta(step).isFootnote) ?? [];
  const footnoteSteps =
    status?.nextSteps.filter((step) => getNextStepMeta(step).isFootnote) ?? [];

  const handleConnect = async () => {
    setConnecting(true);
    setError(null);
    setNotice(null);

    try {
      const response = await fetch("/api/stripe/connect/onboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ organizationId, orgSlug }),
      });

      const payload = (await response.json()) as { url?: string; error?: string };

      if (!response.ok || !payload.url) {
        throw new Error(payload.error ?? "Failed to start Stripe onboarding.");
      }

      window.location.href = payload.url;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to start Stripe onboarding.",
      );
      setConnecting(false);
    }
  };

  return (
    <div
      className="relative flex h-full min-h-0 flex-col"
      style={{ backgroundColor: C.surface }}
    >
      <PaymentsTabBar activeTab={activeTab} onChange={setActiveTab} C={C} />

      {activeTab === "history" ? (
        <div className="min-h-0 flex-1 overflow-hidden">
          <PaymentsHistoryPanel
            organizationId={organizationId}
            orgSlug={orgSlug}
            branding={branding}
            isReady={isReady}
            onSwitchToSetup={() => setActiveTab("setup")}
          />
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto px-4 py-5 sm:px-5">
          <div className="mx-auto max-w-3xl space-y-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <BuilderSectionIntro
                C={C}
                eyebrow="Payments"
                title={hero.title}
                subtitle={hero.subtitle}
              />
              <StatusPill label={hero.pill.label} tone={hero.pill.tone} C={C} />
            </div>

            <AnimatePresence mode="wait">
              {notice ? (
                <motion.div
                  key="notice"
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  className="flex items-start gap-3 rounded-lg border px-4 py-3"
                  style={{
                    borderColor: C.successBorder,
                    backgroundColor: C.successBg,
                  }}
                >
                  <CheckCircle2
                    className="mt-0.5 h-4 w-4 shrink-0"
                    style={{ color: C.success }}
                  />
                  <div className="text-sm" style={{ color: C.textPrimary }}>
                    <p className="font-semibold">Setup updated</p>
                    <p className="mt-0.5" style={{ color: C.textSecondary }}>
                      {notice}
                    </p>
                  </div>
                </motion.div>
              ) : null}
            </AnimatePresence>

            <AnimatePresence mode="wait">
              {error ? (
                <motion.div
                  key="error"
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  className="flex items-start gap-3 rounded-lg border px-4 py-3"
                  style={{
                    borderColor: C.errorBorder,
                    backgroundColor: C.errorBg,
                    color: C.error,
                  }}
                  role="alert"
                >
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  <div className="text-sm">
                    <p className="font-semibold">Something went wrong</p>
                    <p className="mt-0.5">{error}</p>
                  </div>
                </motion.div>
              ) : null}
            </AnimatePresence>

            {!loading && phase === "not_started" ? (
              <HowItWorksExplainer C={C} />
            ) : null}

            <motion.div
              initial={phase === "ready" ? { opacity: 0, y: 8 } : false}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden rounded-lg border"
              style={{
                borderColor: C.border,
                backgroundColor: C.surface,
              }}
            >
              <div className="p-5">
                <div className="flex items-start gap-3">
                  <div
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full"
                    style={{
                      backgroundColor: phase === "ready" ? C.successBg : C.accentGlow,
                      color: phase === "ready" ? C.success : C.accent,
                    }}
                  >
                    {phase === "ready" ? (
                      <CheckCircle2 className="h-5 w-5" aria-hidden />
                    ) : (
                      <CreditCard className="h-5 w-5" aria-hidden />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium uppercase tracking-wide" style={{ color: C.textTertiary }}>
                      Stripe Connect
                    </p>
                    <p className="mt-0.5 text-base font-semibold" style={{ color: C.textPrimary }}>
                      {phase === "ready"
                        ? "Payments are live"
                        : phase === "in_progress"
                          ? "Complete your setup"
                          : "Connect your school account"}
                    </p>
                    <p className="mt-1 text-sm" style={{ color: C.textSecondary }}>
                      {loading
                        ? "Syncing with Stripe…"
                        : isReady
                          ? "Families can pay application fees when they apply."
                          : hasAccount
                            ? status?.pendingMessage ??
                              "Complete the remaining steps to start accepting payments."
                            : "Secure onboarding takes a few minutes. You'll verify identity and payout details in Stripe."}
                    </p>
                  </div>
                </div>

                {loading ? (
                  <div
                    className="mt-4 flex items-center gap-2 text-sm"
                    style={{ color: C.textTertiary }}
                  >
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading payment status…
                  </div>
                ) : null}

                {!loading && hasAccount && status ? (
                  <ul
                    className="mt-5 overflow-hidden rounded-lg border"
                    style={{ borderColor: C.border, backgroundColor: C.surface }}
                  >
                    <ChecklistRow
                      done={status.checklist.accountCreated}
                      label="Stripe account connected"
                      isActive={activeChecklistIndex === 0}
                      C={C}
                    />
                    <ChecklistRow
                      done={status.checklist.detailsSubmitted}
                      label="Identity and business details submitted"
                      isActive={activeChecklistIndex === 1}
                      C={C}
                    />
                    <ChecklistRow
                      done={status.checklist.chargesEnabled}
                      label="Charges enabled"
                      hint="Required to collect application fees"
                      isActive={activeChecklistIndex === 2}
                      C={C}
                    />
                    <ChecklistRow
                      done={status.checklist.payoutsEnabled}
                      label="Payouts enabled"
                      hint="Informational — payouts go to your Stripe account"
                      isActive={activeChecklistIndex === 3}
                      C={C}
                    />
                  </ul>
                ) : null}

                {!loading && !hasAccount ? (
                  <ul className="mt-4 space-y-2 text-sm" style={{ color: C.textSecondary }}>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0" style={{ color: C.accent }} aria-hidden />
                      Fees from enrollment flows are collected at checkout.
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0" style={{ color: C.accent }} aria-hidden />
                      Identity and payout details are handled securely by Stripe.
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0" style={{ color: C.accent }} aria-hidden />
                      Publishing a fee-enabled form requires payments to be ready.
                    </li>
                  </ul>
                ) : null}

                {!isReady && !loading ? (
                  <button
                    type="button"
                    onClick={handleConnect}
                    disabled={connecting}
                    className="mt-5 inline-flex items-center gap-2 rounded-md px-4 py-2.5 text-sm font-semibold transition enabled:hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                    style={getAdminButtonStyle(C, "primary")}
                  >
                    {connecting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Opening Stripe…
                      </>
                    ) : hasAccount ? (
                      "Continue in Stripe"
                    ) : (
                      "Connect Stripe"
                    )}
                  </button>
                ) : null}
              </div>
            </motion.div>

            {isReady && !loading && status && actionableSteps.length > 0 ? (
              <div className="space-y-3">
                <p className="text-sm font-semibold" style={{ color: C.textPrimary }}>
                  What&apos;s next
                </p>
                <div className="grid gap-3 sm:grid-cols-2">
                  {actionableSteps.map((step) => (
                    <NextStepTile key={step.href} step={step} C={C} />
                  ))}
                </div>
                {footnoteSteps.map((step) => (
                  <p key={step.href} className="text-xs" style={{ color: C.textTertiary }}>
                    {step.label}
                  </p>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
