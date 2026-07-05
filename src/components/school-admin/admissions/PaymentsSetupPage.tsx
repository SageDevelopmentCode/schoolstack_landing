"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, CreditCard, Loader2, AlertCircle } from "lucide-react";
import { buildAdminThemeTokens } from "@/lib/organization-settings/theme";
import type { OrganizationBranding } from "@/lib/organization-settings/types";
import type { OrganizationPaymentAccount } from "@/lib/stripe/organization-payment-account";
import { createClient } from "@/utils/supabase/client";

type PaymentsSetupPageProps = {
  organizationId: string;
  orgSlug: string;
  branding: OrganizationBranding;
  schoolName: string;
};

function accountFromRow(row: Record<string, unknown>): OrganizationPaymentAccount {
  return {
    organizationId: String(row.organization_id),
    stripeConnectAccountId:
      typeof row.stripe_connect_account_id === "string"
        ? row.stripe_connect_account_id
        : null,
    onboardingStatus: row.onboarding_status as OrganizationPaymentAccount["onboardingStatus"],
    chargesEnabled: Boolean(row.charges_enabled),
    payoutsEnabled: Boolean(row.payouts_enabled),
  };
}

export default function PaymentsSetupPage({
  organizationId,
  orgSlug,
  branding,
  schoolName,
}: PaymentsSetupPageProps) {
  const C = useMemo(() => buildAdminThemeTokens(branding), [branding]);
  const supabase = useMemo(() => createClient(), []);
  const searchParams = useSearchParams();

  const [account, setAccount] = useState<OrganizationPaymentAccount | null>(null);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const loadAccount = useCallback(async () => {
    setLoading(true);
    setError(null);

    const { data, error: loadError } = await supabase
      .from("organization_payment_accounts")
      .select(
        "organization_id, stripe_connect_account_id, onboarding_status, charges_enabled, payouts_enabled",
      )
      .eq("organization_id", organizationId)
      .maybeSingle();

    if (loadError) {
      setError(loadError.message);
      setAccount(null);
    } else {
      setAccount(data ? accountFromRow(data as Record<string, unknown>) : null);
    }

    setLoading(false);
  }, [organizationId, supabase]);

  useEffect(() => {
    void loadAccount();
  }, [loadAccount]);

  useEffect(() => {
    const connected = searchParams.get("connected");
    if (connected === "1") {
      setNotice("Stripe setup updated. If payments are not ready yet, finish any remaining steps in Stripe.");
      void loadAccount();
    } else if (connected === "0") {
      setError("We could not confirm your Stripe setup. Please try again.");
    }
  }, [loadAccount, searchParams]);

  const isReady = Boolean(
    account?.stripeConnectAccountId && account.chargesEnabled,
  );

  const statusLabel = loading
    ? "Checking status…"
    : isReady
      ? "Ready to accept payments"
      : account?.stripeConnectAccountId
        ? "Setup in progress"
        : "Not connected";

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
    <div className="mx-auto max-w-2xl space-y-6 p-6">
      <div>
        <h1 className="text-xl font-semibold" style={{ color: C.textPrimary }}>
          Payments
        </h1>
        <p className="mt-1 text-sm" style={{ color: C.textSecondary }}>
          Connect Stripe so {schoolName} can collect application fees online. Funds
          go to your school&apos;s Stripe account; {schoolName} facilitates checkout
          for families.
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
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" style={{ color: C.accent }} />
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
            <p className="mt-0.5 text-xs" style={{ color: C.textTertiary }}>
              {statusLabel}
            </p>
          </div>
          {isReady ? (
            <CheckCircle2 className="h-5 w-5 shrink-0" style={{ color: "#16A34A" }} />
          ) : null}
        </div>

        <ul className="space-y-2 text-sm" style={{ color: C.textSecondary }}>
          <li>Application fees from your enrollment flows are collected at checkout.</li>
          <li>You will complete identity and payout details in Stripe&apos;s secure flow.</li>
          <li>Publishing a fee-enabled form requires payments to be ready.</li>
        </ul>

        <button
          type="button"
          onClick={handleConnect}
          disabled={connecting || loading}
          className="inline-flex items-center gap-2 rounded-md px-4 py-2.5 text-sm font-semibold text-white transition enabled:hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          style={{ backgroundColor: C.accent }}
        >
          {connecting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Opening Stripe…
            </>
          ) : account?.stripeConnectAccountId ? (
            "Continue Stripe setup"
          ) : (
            "Connect Stripe"
          )}
        </button>
      </div>
    </div>
  );
}
