"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  AlertCircle,
  CheckCircle2,
  Circle,
  CreditCard,
  Loader2,
} from "lucide-react";
import { buildAdminThemeTokens } from "@/lib/organization-settings/theme";
import type { OrganizationBranding } from "@/lib/organization-settings/types";
import type { ConnectStatusResult } from "@/lib/stripe/connect-status";
import PaymentsHistoryPanel from "./PaymentsHistoryPanel";

type PaymentsSetupPageProps = {
  organizationId: string;
  orgSlug: string;
  branding: OrganizationBranding;
  schoolName: string;
};

function ChecklistRow({
  done,
  label,
  hint,
  C,
}: {
  done: boolean;
  label: string;
  hint?: string;
  C: ReturnType<typeof buildAdminThemeTokens>;
}) {
  return (
    <li className="flex items-start gap-2.5">
      {done ? (
        <CheckCircle2
          className="mt-0.5 h-4 w-4 shrink-0"
          style={{ color: "#16A34A" }}
          aria-hidden
        />
      ) : (
        <Circle
          className="mt-0.5 h-4 w-4 shrink-0"
          style={{ color: C.textTertiary }}
          aria-hidden
        />
      )}
      <div>
        <span className="text-sm" style={{ color: C.textPrimary }}>
          {label}
        </span>
        {hint ? (
          <p className="mt-0.5 text-xs" style={{ color: C.textTertiary }}>
            {hint}
          </p>
        ) : null}
      </div>
    </li>
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

  const stateHeading = loading
    ? "Checking status…"
    : isReady
      ? "Ready to accept payments"
      : hasAccount
        ? "Almost there"
        : "Connect Stripe to collect application fees";

  const stateSubtext = loading
    ? "Syncing with Stripe…"
    : isReady
      ? "Families can pay application fees when they apply."
      : hasAccount
        ? status?.pendingMessage ??
          "Complete the remaining steps to start accepting payments."
        : "Application fees are collected at checkout when families apply.";

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
    <div className="mx-auto max-w-5xl space-y-6 p-6">
      <div>
        <h1 className="text-xl font-semibold" style={{ color: C.textPrimary }}>
          Payments
        </h1>
        <p className="mt-1 text-sm" style={{ color: C.textSecondary }}>
          Connect Stripe and review admissions payments collected online.
        </p>
      </div>

      <div className="flex gap-2 border-b" style={{ borderColor: C.border }}>
        {[
          { id: "setup" as const, label: "Setup" },
          { id: "history" as const, label: "History" },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className="px-3 py-2 text-sm font-medium"
            style={{
              color: activeTab === tab.id ? C.accent : C.textSecondary,
              borderBottom:
                activeTab === tab.id
                  ? `2px solid ${C.accent}`
                  : "2px solid transparent",
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "history" ? (
        <PaymentsHistoryPanel
          organizationId={organizationId}
          orgSlug={orgSlug}
          branding={branding}
        />
      ) : (
        <>
      <div>
        <p className="text-sm" style={{ color: C.textSecondary }}>
          Connect Stripe so {schoolName} can collect application and enrollment
          fees online. Funds go to your school&apos;s Stripe account.
        </p>
      </div>

      {notice ? (
        <div
          className="flex items-start gap-3 rounded-lg border px-4 py-3 text-sm"
          style={{
            borderColor: C.secondaryBtnBorder,
            backgroundColor: C.accentLight,
            color: C.textPrimary,
          }}
        >
          <CheckCircle2
            className="mt-0.5 h-4 w-4 shrink-0"
            style={{ color: C.accent }}
          />
          <span>{notice}</span>
        </div>
      ) : null}

      {error ? (
        <div
          className="flex items-start gap-3 rounded-lg border px-4 py-3 text-sm"
          style={{
            borderColor: C.errorBorder,
            backgroundColor: C.errorBg,
            color: C.error,
          }}
          role="alert"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      ) : null}

      <div
        className="rounded-lg border p-5 space-y-4"
        style={{ borderColor: C.border, backgroundColor: C.surface }}
      >
        <div className="flex items-start gap-3">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-lg"
            style={{ backgroundColor: C.accentLight, color: C.accent }}
          >
            <CreditCard className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold" style={{ color: C.textPrimary }}>
              Stripe Connect
            </p>
            <p
              className="mt-0.5 text-sm font-medium"
              style={{ color: isReady ? "#16A34A" : C.textPrimary }}
            >
              {stateHeading}
            </p>
            <p className="mt-1 text-xs" style={{ color: C.textSecondary }}>
              {stateSubtext}
            </p>
          </div>
          {isReady && !loading ? (
            <CheckCircle2
              className="h-5 w-5 shrink-0"
              style={{ color: "#16A34A" }}
            />
          ) : null}
        </div>

        {loading ? (
          <div
            className="flex items-center gap-2 text-sm"
            style={{ color: C.textTertiary }}
          >
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading payment status…
          </div>
        ) : hasAccount && status ? (
          <ul className="space-y-3 border-t pt-4" style={{ borderColor: C.border }}>
            <ChecklistRow
              done={status.checklist.accountCreated}
              label="Stripe account connected"
              C={C}
            />
            <ChecklistRow
              done={status.checklist.detailsSubmitted}
              label="Identity and business details submitted"
              C={C}
            />
            <ChecklistRow
              done={status.checklist.chargesEnabled}
              label="Charges enabled"
              hint="Required to collect application fees"
              C={C}
            />
            <ChecklistRow
              done={status.checklist.payoutsEnabled}
              label="Payouts enabled"
              hint="Informational — payouts go to your Stripe account"
              C={C}
            />
          </ul>
        ) : !hasAccount ? (
          <ul className="space-y-2 text-sm" style={{ color: C.textSecondary }}>
            <li>
              Application fees from your enrollment flows are collected at
              checkout.
            </li>
            <li>
              You will complete identity and payout details in Stripe&apos;s
              secure flow.
            </li>
            <li>Publishing a fee-enabled form requires payments to be ready.</li>
          </ul>
        ) : null}

        {!isReady && !loading ? (
          <button
            type="button"
            onClick={handleConnect}
            disabled={connecting}
            className="inline-flex items-center gap-2 rounded-md px-4 py-2.5 text-sm font-semibold text-white transition enabled:hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            style={{ backgroundColor: C.accent }}
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

        {isReady && !loading && status && status.nextSteps.length > 0 ? (
          <div
            className="space-y-3 border-t pt-4"
            style={{ borderColor: C.border }}
          >
            <p className="text-sm font-semibold" style={{ color: C.textPrimary }}>
              What&apos;s next
            </p>
            <ul className="space-y-2">
              {status.nextSteps.map((step) => {
                const isExternal = step.href.startsWith("http");

                return (
                  <li key={step.href}>
                    {isExternal ? (
                      <a
                        href={step.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm underline-offset-2 hover:underline"
                        style={{ color: C.accent }}
                      >
                        {step.label}
                      </a>
                    ) : (
                      <Link
                        href={step.href}
                        className="text-sm underline-offset-2 hover:underline"
                        style={{ color: C.accent }}
                      >
                        {step.label}
                      </Link>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        ) : null}
      </div>
        </>
      )}
    </div>
  );
}
