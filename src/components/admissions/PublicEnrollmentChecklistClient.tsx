"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import ApplyPortalPageShell from "@/components/admissions/ApplyPortalPageShell";
import EnrollmentChecklistExperience from "@/components/admissions/EnrollmentChecklistExperience";
import EnrollmentCompleteModal from "@/components/admissions/EnrollmentCompleteModal";
import {
  enrollmentPaymentPollSucceeded,
  loadEnrollmentChecklistInstances,
  type LoadedEnrollmentChecklist,
} from "@/lib/admissions/enrollment-checklist-materialization";
import type { FamilyUserProfile } from "@/lib/admissions/parent-portal-access";
import { resolveEnrollmentChecklistInitialItemId } from "@/lib/admissions/enrollment-checklist-progress";
import {
  clearPaymentReturnQuery,
  hasPaymentPollStarted,
  markPaymentPollStarted,
  PAYMENT_POLL_INTERVAL_MS,
  PAYMENT_POLL_MAX_ATTEMPTS,
  readPaymentReturnPending,
  sleep,
} from "@/lib/admissions/payment-return-polling";
import { buildAdminThemeTokens } from "@/lib/organization-settings/theme";
import type { OrganizationBranding } from "@/lib/organization-settings/types";
import { createClient } from "@/utils/supabase/client";

type PublicEnrollmentChecklistClientProps = {
  branding: OrganizationBranding;
  schoolName: string;
  schoolSlug: string;
  organizationId: string;
  checklist: LoadedEnrollmentChecklist;
  parentPortalHref?: string;
  previewMode?: boolean;
  backHref?: string;
  userProfile?: FamilyUserProfile;
};

function celebrationStorageKey(checklistId: string) {
  return `enrollment-celebration:${checklistId}`;
}

function paymentPollScope(checklistId: string) {
  return `enrollment:${checklistId}`;
}

export default function PublicEnrollmentChecklistClient({
  branding,
  schoolName,
  schoolSlug,
  organizationId,
  checklist,
  parentPortalHref,
  previewMode = false,
  backHref,
  userProfile,
}: PublicEnrollmentChecklistClientProps) {
  const C = useMemo(() => buildAdminThemeTokens(branding), [branding]);
  const supabase = useMemo(() => createClient(), []);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [instances, setInstances] = useState(checklist.instances);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [pollingPayment, setPollingPayment] = useState(false);
  const [paymentReturnPending, setPaymentReturnPending] = useState(() =>
    readPaymentReturnPending(searchParams),
  );
  const activeItemPersistTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [resolvedInitialItemId] = useState(() =>
    resolveEnrollmentChecklistInitialItemId(checklist.items, checklist.instances, {
      lastActiveTemplateItemId: checklist.metadata.lastActiveTemplateItemId,
    }),
  );

  const persistActiveItem = useCallback(
    (templateItemId: string) => {
      if (previewMode) return;

      if (activeItemPersistTimeoutRef.current) {
        clearTimeout(activeItemPersistTimeoutRef.current);
      }

      activeItemPersistTimeoutRef.current = setTimeout(() => {
        void fetch(`/api/admissions/enrollment-checklists/${checklist.checklistId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ lastActiveTemplateItemId: templateItemId }),
        });
      }, 300);
    },
    [checklist.checklistId, previewMode],
  );

  useEffect(() => {
    return () => {
      if (activeItemPersistTimeoutRef.current) {
        clearTimeout(activeItemPersistTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (previewMode || !resolvedInitialItemId) return;
    persistActiveItem(resolvedInitialItemId);
  }, [persistActiveItem, previewMode, resolvedInitialItemId]);

  const clearPaymentQueryParams = useCallback(() => {
    clearPaymentReturnQuery(router, pathname);
  }, [pathname, router]);

  const maybeShowCelebration = useCallback(
    (checklistStatus: string, checklistId: string) => {
      if (checklistStatus !== "completed") return;
      if (typeof window === "undefined") return;
      if (sessionStorage.getItem(celebrationStorageKey(checklistId))) return;

      sessionStorage.setItem(celebrationStorageKey(checklistId), "1");
      setShowCompleteModal(true);
    },
    [],
  );

  useEffect(() => {
    queueMicrotask(() => setInstances(checklist.instances));
  }, [checklist.instances]);

  useEffect(() => {
    if (previewMode || !paymentReturnPending) return;

    const scope = paymentPollScope(checklist.checklistId);
    if (hasPaymentPollStarted(scope)) {
      queueMicrotask(() => setPaymentReturnPending(false));
      return;
    }

    let cancelled = false;
    let previousInstances = instances;

    async function pollForPaymentCompletion() {
      markPaymentPollStarted(scope);
      clearPaymentReturnQuery(router, pathname);
      setPollingPayment(true);

      let attempts = 0;
      let previousInstances = instances;

      while (!cancelled && attempts < PAYMENT_POLL_MAX_ATTEMPTS) {
        attempts += 1;

        try {
          const nextInstances = await loadEnrollmentChecklistInstances(
            supabase,
            checklist.checklistId,
          );

          if (cancelled) return;

          if (enrollmentPaymentPollSucceeded(previousInstances, nextInstances)) {
            setInstances(nextInstances);
            setPaymentReturnPending(false);
            setPollingPayment(false);
            return;
          }

          previousInstances = nextInstances;
          setInstances(nextInstances);
        } catch {
          // Keep polling briefly while webhook processes.
        }

        if (attempts < PAYMENT_POLL_MAX_ATTEMPTS) {
          await sleep(PAYMENT_POLL_INTERVAL_MS);
        }
      }

      if (!cancelled) {
        setPaymentReturnPending(false);
        setPollingPayment(false);
      }
    }

    queueMicrotask(() => {
      void pollForPaymentCompletion();
    });

    return () => {
      cancelled = true;
    };
  }, [
    checklist.checklistId,
    pathname,
    paymentReturnPending,
    previewMode,
    router,
    supabase,
  ]);

  useEffect(() => {
    if (checklist.status !== "completed") return;
    if (searchParams.get("payment") === "success") {
      queueMicrotask(() => {
        maybeShowCelebration(checklist.status, checklist.checklistId);
        clearPaymentQueryParams();
      });
      return;
    }
  }, [
    checklist.checklistId,
    checklist.status,
    clearPaymentQueryParams,
    maybeShowCelebration,
    searchParams,
  ]);

  const liveChecklist = useMemo(
    () => ({
      ...checklist,
      instances,
    }),
    [checklist, instances],
  );

  const handleAllRequiredComplete = useCallback(() => {
    maybeShowCelebration("completed", checklist.checklistId);
  }, [checklist.checklistId, maybeShowCelebration]);

  const resolvedProfile = userProfile ?? {
    email: "",
    displayName: "Preview",
  };

  return (
    <ApplyPortalPageShell
      branding={branding}
      schoolName={schoolName}
      schoolSlug={schoolSlug}
      userEmail={resolvedProfile.email}
      userDisplayName={resolvedProfile.displayName}
      previewMode={previewMode}
      previewHomeHref={backHref}
      fullBleed
      fillHeight
    >
      <EnrollmentChecklistExperience
        branding={branding}
        schoolName={schoolName}
        title={liveChecklist.title}
        items={liveChecklist.items}
        instances={liveChecklist.instances}
        organizationId={organizationId}
        checklistId={liveChecklist.checklistId}
        applicationId={liveChecklist.applicationId}
        initialItemId={resolvedInitialItemId ?? undefined}
        onInstancesChange={previewMode ? undefined : setInstances}
        onActiveItemChange={previewMode ? undefined : persistActiveItem}
        onAllRequiredComplete={previewMode ? undefined : handleAllRequiredComplete}
        mode={previewMode ? "preview" : "live"}
        backLink={{
          href: backHref ?? `/school/${schoolSlug}/apply`,
          label: "Back to applications",
        }}
      />

      {pollingPayment && !previewMode ? (
        <p className="sr-only" aria-live="polite">
          Updating payment status…
        </p>
      ) : null}

      <EnrollmentCompleteModal
        C={C}
        open={!previewMode && showCompleteModal}
        schoolName={schoolName}
        parentPortalHref={
          parentPortalHref ?? `/school/${schoolSlug}/parent/portal`
        }
        onClose={() => setShowCompleteModal(false)}
      />
    </ApplyPortalPageShell>
  );
}
