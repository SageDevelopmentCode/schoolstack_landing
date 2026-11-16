"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { reportPortalOperationalError } from "@/lib/portal-operational-errors";
import { adminToast, formatActionError } from "@/lib/school-admin/admin-toast";
import type {
  ConnectStatusChecklist,
  ConnectStatusNextStep,
  ConnectStatusResult,
} from "@/lib/stripe/connect-status";
import { STRIPE_DASHBOARD_LINK_SENTINEL } from "@/lib/stripe/connect-status";
import { openStripeConnectDashboard } from "@/lib/stripe/open-stripe-dashboard";

export type SetupPhase = "loading" | "not_started" | "in_progress" | "ready";
export type PaymentsTab = "setup" | "history";

const POLL_INTERVAL_MS = 60_000;
const MAX_POLLS = 20;

export const READY_NOTICE = "Stripe is connected. You're ready to collect application fees.";

/** Stripe Connect checklist rows, in order (existing product copy). */
export const PAYMENTS_SETUP_STEPS: Array<{
  key: keyof ConnectStatusChecklist;
  label: string;
  hint?: string;
}> = [
  { key: "accountCreated", label: "Stripe account connected" },
  { key: "detailsSubmitted", label: "Identity and business details submitted" },
  { key: "chargesEnabled", label: "Charges enabled", hint: "Required to collect application fees" },
  {
    key: "payoutsEnabled",
    label: "Payouts enabled",
    hint: "Informational — payouts go to your Stripe account",
  },
];

function getSetupPhase(loading: boolean, isReady: boolean, hasAccount: boolean): SetupPhase {
  if (loading) return "loading";
  if (isReady) return "ready";
  if (hasAccount) return "in_progress";
  return "not_started";
}

export function isFootnoteStep(step: ConnectStatusNextStep): boolean {
  const isDashboard = step.href === STRIPE_DASHBOARD_LINK_SENTINEL;
  const label = step.label.toLowerCase();
  return (
    !isDashboard &&
    (step.label.length > 55 || label.includes("managed in") || label.includes("payouts are"))
  );
}

/**
 * Payments setup view-model: Stripe Connect status, return handling
 * (?connected / ?refresh), visible-only polling while setup is in progress,
 * onboarding redirect and the Stripe dashboard link. `?tab=` keeps the
 * Setup / History choice in the URL.
 */
export function usePaymentsSetupModel({
  organizationId,
  orgSlug,
}: {
  organizationId: string;
  orgSlug: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [status, setStatus] = useState<ConnectStatusResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [openingDashboard, setOpeningDashboard] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadFailed, setLoadFailed] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [pollExhausted, setPollExhausted] = useState(false);
  const [lastCheckedAt, setLastCheckedAt] = useState(() => Date.now());
  const [justConnected, setJustConnected] = useState(false);
  const returnHandledRef = useRef(false);
  const refreshHandledRef = useRef(false);
  const wasReadyRef = useRef(false);
  const pollCountRef = useRef(0);
  const wasLoadedRef = useRef(false);

  const tabParam = searchParams.get("tab");
  const activeTab: PaymentsTab = tabParam === "history" ? "history" : "setup";

  const setActiveTab = useCallback(
    (tab: PaymentsTab) => {
      const params = new URLSearchParams(searchParams.toString());
      if (tab === "setup") params.delete("tab");
      else params.set("tab", tab);
      const query = params.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  const loadStatus = useCallback(
    async (options?: {
      silent?: boolean;
      handleReturn?: boolean;
      connected?: string | null;
      refresh?: string | null;
    }) => {
      if (options?.silent) setRefreshing(true);
      else setLoading(true);
      if (!options?.silent) {
        setError(null);
        setLoadFailed(false);
      }

      try {
        const response = await fetch(
          `/api/stripe/connect/status?organizationId=${encodeURIComponent(organizationId)}`,
        );
        const payload = (await response.json()) as ConnectStatusResult & { error?: string };

        if (!response.ok) {
          throw new Error(payload.error ?? "Failed to load payment setup status.");
        }

        if (options?.silent && !wasReadyRef.current && payload.isReady) {
          setNotice(READY_NOTICE);
          setJustConnected(true);
          adminToast.success("Stripe is connected", {
            id: "payments-stripe-ready",
            description: "Families can now pay application and enrollment fees when they apply.",
          });
        }

        wasReadyRef.current = payload.isReady;
        setStatus(payload);
        setLastCheckedAt(Date.now());

        if (options?.handleReturn) {
          const connected = options.connected ?? null;
          const refresh = options.refresh ?? null;
          if (connected === "1") {
            if (payload.isReady) {
              setNotice(READY_NOTICE);
              setJustConnected(true);
              adminToast.success("Stripe is connected", {
                id: "payments-stripe-ready",
                description: "Families can now pay application and enrollment fees when they apply.",
              });
            } else if (payload.pendingMessage) {
              setNotice(payload.pendingMessage);
              adminToast.info("Stripe setup updated", {
                id: "payments-stripe-return",
                description: payload.pendingMessage,
              });
            } else {
              setNotice("Stripe setup updated. Finish any remaining steps below.");
              adminToast.info("Stripe setup updated", {
                id: "payments-stripe-return",
                description: "Finish any remaining steps on this page.",
              });
            }
          } else if (connected === "0") {
            setError("We could not confirm your Stripe setup. Please try again.");
          } else if (refresh === "1") {
            setNotice("Continue setup in Stripe to finish connecting payments.");
          }
        }

        return payload;
      } catch (loadError) {
        void reportPortalOperationalError(
          "school_admin",
          { organizationId, operation: "payments.setup.load", error: "" },
          loadError,
        );
        if (!options?.silent) {
          setError(
            loadError instanceof Error ? loadError.message : "Failed to load payment setup status.",
          );
          setLoadFailed(true);
          setStatus(null);
        }
        return null;
      } finally {
        if (options?.silent) setRefreshing(false);
        else setLoading(false);
      }
    },
    [organizationId],
  );

  const connected = searchParams.get("connected");
  const refresh = searchParams.get("refresh");

  useEffect(() => {
    const paymentsPath = `/school/${orgSlug}/admin/admissions/payments`;
    if ((connected === "1" || connected === "0") && !returnHandledRef.current) {
      returnHandledRef.current = true;
      void loadStatus({ handleReturn: true, connected, refresh }).then(() => {
        router.replace(paymentsPath, { scroll: false });
      });
      return;
    }

    if (refresh === "1" && !refreshHandledRef.current) {
      refreshHandledRef.current = true;
      void loadStatus({ handleReturn: true, connected, refresh }).then(() => {
        router.replace(paymentsPath, { scroll: false });
      });
      return;
    }

    // Tab switches change searchParams too: only load once per page visit.
    if (returnHandledRef.current || refreshHandledRef.current || wasLoadedRef.current) return;
    wasLoadedRef.current = true;
    void loadStatus();
  }, [connected, loadStatus, orgSlug, refresh, router]);

  const isReady = Boolean(status?.isReady);
  const hasAccount = Boolean(status?.checklist.accountCreated);
  const phase = getSetupPhase(loading, isReady, hasAccount);
  const isPolling = phase === "in_progress" && !isReady;

  useEffect(() => {
    if (!isPolling) return;

    pollCountRef.current = 0;
    let intervalId = 0;

    const poll = () => {
      if (document.visibilityState !== "visible") return;
      pollCountRef.current += 1;
      if (pollCountRef.current > MAX_POLLS) {
        setPollExhausted(true);
        window.clearInterval(intervalId);
        return;
      }
      void loadStatus({ silent: true });
    };

    intervalId = window.setInterval(poll, POLL_INTERVAL_MS);

    const onVisibilityChange = () => {
      if (document.visibilityState === "visible" && isPolling) {
        void loadStatus({ silent: true });
      }
    };

    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      window.clearInterval(intervalId);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      pollCountRef.current = 0;
    };
  }, [isPolling, loadStatus]);

  /** Manual "Check status": toasts its result (focus/poll refreshes stay silent). */
  const checkStatusNow = useCallback(() => {
    const run = async (): Promise<void> => {
      const before = wasReadyRef.current;
      const payload = await loadStatus({ silent: true });
      if (!payload) {
        adminToast.error("Couldn't reach Stripe", {
          id: "payments-check-status-error",
          description: "Your setup status on screen is from the last check.",
          action: { label: "Retry", onClick: () => void run() },
        });
        return;
      }
      adminToast.dismiss("payments-check-status-error");
      if (payload.isReady && !before) return; // the "Stripe is connected" toast already fired
      const doneCount = PAYMENTS_SETUP_STEPS.filter((step) => payload.checklist[step.key]).length;
      adminToast.success(payload.isReady ? "Stripe status is up to date" : "Status checked", {
        id: "payments-check-status",
        description: payload.isReady
          ? "Payments are live. Nothing else to do here."
          : `${doneCount} of ${PAYMENTS_SETUP_STEPS.length} Stripe steps done.${
              payload.requirementsDue.length > 0 ? " Stripe still needs a few details." : ""
            }`,
      });
    };
    return run();

  }, [loadStatus]);

  const retryLoad = useCallback(() => {
    void loadStatus();
  }, [loadStatus]);

  const handleOpenDashboard = useCallback(() => {
    const run = async (): Promise<void> => {
      setOpeningDashboard(true);
      setError(null);
      try {
        await openStripeConnectDashboard(organizationId);
        adminToast.dismiss("payments-open-dashboard-error");
        adminToast.success("Stripe dashboard opened", {
          id: "payments-open-dashboard",
          description: "It opened in a new tab. Balance, payouts and bank details live there.",
        });
      } catch (err) {
        void reportPortalOperationalError(
          "school_admin",
          { organizationId, operation: "payments.setup.open_dashboard", error: "" },
          err,
        );
        const message = formatActionError(err, "Failed to open Stripe dashboard.");
        setError(message);
        adminToast.error("Couldn't open the Stripe dashboard", {
          id: "payments-open-dashboard-error",
          description: message,
          action: { label: "Retry", onClick: () => void run() },
        });
      } finally {
        setOpeningDashboard(false);
      }
    };
    return run();

  }, [organizationId]);

  const handleConnect = useCallback(() => {
    const run = async (): Promise<void> => {
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

        adminToast.dismiss("payments-connect-error");
        adminToast.loading("Opening Stripe…", {
          id: "payments-connect",
          description: "You'll come back here when you're done in Stripe.",
        });
        window.location.href = payload.url;
      } catch (err) {
        void reportPortalOperationalError(
          "school_admin",
          { organizationId, operation: "payments.setup.start_onboarding", error: "" },
          err,
        );
        const message = formatActionError(err, "Failed to start Stripe onboarding.");
        setError(message);
        adminToast.error("Couldn't open Stripe", {
          id: "payments-connect-error",
          description: `${message} Your setup hasn't changed.`,
          action: { label: "Retry", onClick: () => void run() },
        });
        setConnecting(false);
      }
    };
    return run();

  }, [organizationId, orgSlug]);

  const activeChecklistIndex = status
    ? PAYMENTS_SETUP_STEPS.findIndex((step) => !status.checklist[step.key])
    : -1;
  const completedSteps = status
    ? PAYMENTS_SETUP_STEPS.filter((step) => status.checklist[step.key]).length
    : 0;
  const actionableSteps = status?.nextSteps.filter((step) => !isFootnoteStep(step)) ?? [];
  const footnoteSteps = status?.nextSteps.filter((step) => isFootnoteStep(step)) ?? [];

  return {
    status,
    loading,
    loadFailed,
    refreshing,
    connecting,
    openingDashboard,
    error,
    dismissError: () => setError(null),
    notice,
    dismissNotice: () => setNotice(null),
    pollExhausted,
    lastCheckedAt,
    justConnected,
    isReady,
    hasAccount,
    phase,
    isPolling,
    activeTab,
    setActiveTab,
    activeChecklistIndex,
    completedSteps,
    actionableSteps,
    footnoteSteps,
    checkStatusNow,
    retryLoad,
    handleConnect,
    handleOpenDashboard,
  };
}

export type PaymentsSetupModel = ReturnType<typeof usePaymentsSetupModel>;
