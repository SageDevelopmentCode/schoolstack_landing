"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, CheckCircle2, LayoutDashboard } from "lucide-react";
import DetailPanelProgressBar from "@/components/school-admin/admissions/DetailPanelProgressBar";
import DetailPanelStepTimeline, {
  type DetailPanelStepTimelineItem,
} from "@/components/school-admin/admissions/DetailPanelStepTimeline";
import { AdmissionsFamilyAccessGuideButton } from "@/components/school-admin/admissions/AdmissionsFamilyAccessGuide";
import { getAdminButtonStyle } from "@/lib/organization-settings/admin-button-styles";
import { buildAdminThemeTokens } from "@/lib/organization-settings/theme";
import type { OrganizationBranding } from "@/lib/organization-settings/types";
import type {
  AdmissionsSetupStatus,
  AdmissionsSetupStep,
} from "@/lib/school-admin/admissions-setup-status";
import { fetchAdmissionsSetupStatus } from "@/lib/school-admin/admissions-setup-status";
import { createClient } from "@/utils/supabase/client";

type AdminDashboardPageProps = {
  organizationId: string;
  slug: string;
  branding: OrganizationBranding;
  schoolName: string;
  initialStatus: AdmissionsSetupStatus;
};

function stepMeta(step: AdmissionsSetupStep): string | undefined {
  if (step.status === "completed") return "Complete";
  if (step.status === "in_progress") return "In progress";
  return undefined;
}

function heroCopy(status: AdmissionsSetupStatus, schoolName: string) {
  if (status.completedCount === status.totalCount) {
    return {
      title: "You're all set",
      subtitle: `${schoolName} is ready to accept applications and guide families through enrollment.`,
    };
  }

  const nextStep = status.steps.find((step) => step.id === status.firstIncompleteStepId);
  if (!nextStep) {
    return {
      title: "Getting started",
      subtitle: `Complete these steps to launch admissions for ${schoolName}.`,
    };
  }

  return {
    title: "Getting started",
    subtitle: `Next up: ${nextStep.title.toLowerCase()}.`,
  };
}

export default function AdminDashboardPage({
  organizationId,
  slug,
  branding,
  schoolName,
  initialStatus,
}: AdminDashboardPageProps) {
  const C = useMemo(() => buildAdminThemeTokens(branding), [branding]);
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const [status, setStatus] = useState(initialStatus);

  useEffect(() => {
    setStatus(initialStatus);
  }, [initialStatus]);

  const refreshStatus = useCallback(async () => {
    try {
      const nextStatus = await fetchAdmissionsSetupStatus(
        supabase,
        organizationId,
        slug,
      );
      setStatus(nextStatus);
    } catch {
      // Keep the last known status if a background refresh fails.
    }
  }, [organizationId, slug, supabase]);

  useEffect(() => {
    const onFocus = () => {
      void refreshStatus();
    };

    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [refreshStatus]);

  const stripeStep = status.steps.find((step) => step.id === "stripe");
  useEffect(() => {
    if (stripeStep?.status !== "in_progress") return;

    let cancelled = false;
    const pollStripe = async () => {
      try {
        await fetch("/api/stripe/connect/status");
        if (!cancelled) {
          await refreshStatus();
        }
      } catch {
        // Ignore polling errors; the dashboard still shows the last known status.
      }
    };

    void pollStripe();
    const intervalId = window.setInterval(() => {
      void pollStripe();
    }, 60_000);

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
    };
  }, [refreshStatus, stripeStep?.status]);

  const timelineItems: DetailPanelStepTimelineItem[] = useMemo(
    () =>
      status.steps.map((step) => ({
        id: step.id,
        title: step.title,
        status: step.status,
        kindLabel: step.description,
        meta: stepMeta(step),
        onClick: () => router.push(step.href),
      })),
    [router, status.steps],
  );

  const hero = heroCopy(status, schoolName);
  const nextStep =
    status.steps.find((step) => step.id === status.firstIncompleteStepId) ?? null;
  const allComplete = status.completedCount === status.totalCount;
  const applyFormPublished = status.applyFormPublicPath !== null;

  return (
    <div className="mx-auto flex h-full w-full max-w-3xl flex-col px-6 py-8">
      <div className="mb-6 flex items-start gap-4">
        <div
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg"
          style={{ backgroundColor: C.accentGlow }}
        >
          {allComplete ? (
            <CheckCircle2 className="h-5 w-5" style={{ color: C.success }} />
          ) : (
            <LayoutDashboard className="h-5 w-5" style={{ color: C.accent }} />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <h1
            className="text-xl font-semibold tracking-tight"
            style={{ color: C.textPrimary }}
          >
            {hero.title}
          </h1>
          <p className="mt-1 text-sm leading-relaxed" style={{ color: C.textSecondary }}>
            {hero.subtitle}
          </p>
        </div>
      </div>

      <div
        className="rounded-lg border p-5"
        style={{ backgroundColor: C.surface, borderColor: C.border }}
      >
        <DetailPanelProgressBar
          C={C}
          completed={status.completedCount}
          total={status.totalCount}
          label="Setup progress"
          subtitle={
            allComplete
              ? "All admissions setup steps are complete."
              : `${status.totalCount - status.completedCount} step${
                  status.totalCount - status.completedCount === 1 ? "" : "s"
                } remaining.`
          }
        />

        <DetailPanelStepTimeline
          C={C}
          items={timelineItems}
          activeItemId={status.firstIncompleteStepId}
          showStatusText
        />
      </div>

      {nextStep ? (
        <div
          className="mt-5 rounded-lg border p-5"
          style={{ backgroundColor: C.surface, borderColor: C.border }}
        >
          <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: C.textTertiary }}>
            Next step
          </p>
          <p className="mt-1 text-sm font-semibold" style={{ color: C.textPrimary }}>
            {nextStep.title}
          </p>
          <p className="mt-1 text-sm leading-relaxed" style={{ color: C.textSecondary }}>
            {nextStep.description}
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <Link
              href={nextStep.href}
              className="inline-flex items-center gap-2 rounded-sm px-4 py-2 text-xs font-semibold text-white"
              style={getAdminButtonStyle(C, "primary")}
            >
              Continue setup
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
            {nextStep.id === "go_live" ? (
              <AdmissionsFamilyAccessGuideButton
                variant="apply"
                C={C}
                schoolSlug={slug}
                publicPath={status.applyFormPublicPath}
                isPublished={applyFormPublished}
              />
            ) : null}
          </div>
        </div>
      ) : (
        <div
          className="mt-5 rounded-lg border p-5"
          style={{ backgroundColor: C.surface, borderColor: C.border }}
        >
          <p className="text-sm font-semibold" style={{ color: C.textPrimary }}>
            Admissions is live
          </p>
          <p className="mt-1 text-sm leading-relaxed" style={{ color: C.textSecondary }}>
            Review submissions, share your apply link, and manage enrollment from Admissions.
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <Link
              href={status.steps.find((step) => step.id === "go_live")?.href ?? "#"}
              className="inline-flex items-center gap-2 rounded-sm px-4 py-2 text-xs font-semibold text-white"
              style={getAdminButtonStyle(C, "primary")}
            >
              View submissions
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
            <AdmissionsFamilyAccessGuideButton
              variant="apply"
              C={C}
              schoolSlug={slug}
              publicPath={status.applyFormPublicPath}
              isPublished={applyFormPublished}
            />
          </div>
        </div>
      )}
    </div>
  );
}
