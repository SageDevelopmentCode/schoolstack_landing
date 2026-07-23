"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import ApplyPortalPageShell from "@/components/admissions/ApplyPortalPageShell";
import EnrollmentChecklistExperience from "@/components/admissions/EnrollmentChecklistExperience";
import EnrollmentCompleteModal from "@/components/admissions/EnrollmentCompleteModal";
import EnrollmentTuitionPlanStep from "@/components/admissions/EnrollmentTuitionPlanStep";
import type { LoadedEnrollmentChecklist } from "@/lib/admissions/enrollment-checklist-materialization";
import type { FamilyUserProfile } from "@/lib/admissions/parent-portal-access";
import {
  getEnrollmentTuitionSelectionContext,
  type EnrollmentTuitionSelectionContext,
} from "@/lib/tuition/enrollment-selection";
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
  const [tuitionContext, setTuitionContext] =
    useState<EnrollmentTuitionSelectionContext | null>(null);
  const supabase = useMemo(() => createClient(), []);

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

  const loadTuitionSelection = useCallback(async () => {
    if (previewMode) {
      setTuitionContext(null);
      return;
    }

    const { data: enrollment, error } = await supabase
      .from("enrollments")
      .select("program_id")
      .eq("id", checklist.enrollmentId)
      .maybeSingle();

    if (error || !enrollment?.program_id) {
      setTuitionContext(null);
      return;
    }

    const context = await getEnrollmentTuitionSelectionContext(supabase, {
      organizationId,
      enrollmentId: checklist.enrollmentId,
      programId: String(enrollment.program_id),
    });
    setTuitionContext(context);
  }, [
    checklist.enrollmentId,
    organizationId,
    previewMode,
    supabase,
  ]);

  const handleAllRequiredComplete = useCallback(() => {
    maybeShowCelebration("completed", checklist.checklistId);
    window.setTimeout(() => {
      void loadTuitionSelection();
      router.refresh();
    }, 500);
  }, [checklist.checklistId, loadTuitionSelection, maybeShowCelebration, router]);

  useEffect(() => {
    void loadTuitionSelection();
  }, [loadTuitionSelection, instances, checklist.status]);

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
        onInstancesChange={previewMode ? undefined : setInstances}
        onAllRequiredComplete={previewMode ? undefined : handleAllRequiredComplete}
        mode={previewMode ? "preview" : "live"}
        backLink={{
          href: backHref ?? `/school/${schoolSlug}/apply`,
          label: "Back to applications",
        }}
        tuitionSelectionSlot={
          tuitionContext ? (
            <EnrollmentTuitionPlanStep
              C={C}
              context={tuitionContext}
              onComplete={() => {
                void loadTuitionSelection();
                router.refresh();
              }}
            />
          ) : null
        }
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
