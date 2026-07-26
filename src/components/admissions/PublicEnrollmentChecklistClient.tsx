"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import ApplyPortalPageShell from "@/components/admissions/ApplyPortalPageShell";
import EnrollmentChecklistExperience from "@/components/admissions/EnrollmentChecklistExperience";
import EnrollmentCompleteModal from "@/components/admissions/EnrollmentCompleteModal";
import type { LoadedEnrollmentChecklist } from "@/lib/admissions/enrollment-checklist-materialization";
import type { FamilyUserProfile } from "@/lib/admissions/parent-portal-access";
import { buildAdminThemeTokens } from "@/lib/organization-settings/theme";
import type { OrganizationBranding } from "@/lib/organization-settings/types";
import { resolveEnrollmentChecklistInitialItemId } from "@/lib/admissions/enrollment-checklist-progress";

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

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
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
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [instances, setInstances] = useState(checklist.instances);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [pollingPayment, setPollingPayment] = useState(false);
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
    router.replace(pathname);
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
    if (previewMode || searchParams.get("payment") !== "success") return;

    let cancelled = false;

    async function pollForPaymentCompletion() {
      setPollingPayment(true);
      for (let attempt = 0; attempt < 5; attempt += 1) {
        if (cancelled) return;
        router.refresh();
        if (attempt < 4) {
          await sleep(1000);
        }
      }
      setPollingPayment(false);
    }

    queueMicrotask(() => {
      void pollForPaymentCompletion();
    });

    return () => {
      cancelled = true;
    };
  }, [previewMode, router, searchParams]);

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
