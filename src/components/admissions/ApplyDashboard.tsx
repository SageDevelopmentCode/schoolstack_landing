"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";
import { ArrowRight, FileText, Plus } from "lucide-react";
import EnrolledFamilyBanner from "@/components/admissions/EnrolledFamilyBanner";
import ApplyPortalPageShell from "@/components/admissions/ApplyPortalPageShell";
import ApplyRequiredActionsSection from "@/components/admissions/ApplyRequiredActionsSection";
import {
  applicationStatusBadgeStyle,
  applicationStatusLabel,
} from "@/lib/admissions/application-status-ui";
import {
  type FamilyApplication,
  type FamilyUserProfile,
} from "@/lib/admissions/parent-portal-access";
import type { EnrollmentProgressSummary } from "@/lib/admissions/enrollment-checklist-materialization";
import { formatInstantInTimezone } from "@/lib/admissions/admissions-availability";
import { fireEnrollmentConfetti } from "@/lib/enrollment-confetti";
import { buildAdminThemeTokens } from "@/lib/organization-settings/theme";
import type { OrganizationBranding } from "@/lib/organization-settings/types";

type ApplyDashboardProps = {
  branding: OrganizationBranding;
  schoolName: string;
  schoolSlug: string;
  organizationId?: string;
  timezone: string;
  applications: FamilyApplication[];
  applicationsWithTasks: FamilyApplication[];
  hasEnrolledAccess: boolean;
  parentPortalEnabled: boolean;
  parentPortalHref?: string;
  enrollmentProgressByApplicationId: Record<string, EnrollmentProgressSummary>;
  userProfile: FamilyUserProfile;
  previewMode?: boolean;
  previewBasePath?: string;
  focusApplicationId?: string | null;
};

function formatApplicationDate(
  value: string | null,
  timezone: string,
): string | null {
  if (!value) return null;
  return formatInstantInTimezone(value, timezone);
}

function studentInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0][0] ?? ""}${parts[parts.length - 1][0] ?? ""}`.toUpperCase();
  }
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return "?";
}

function displayApplicationStatus(
  application: FamilyApplication,
  enrollmentProgress?: EnrollmentProgressSummary,
): string {
  if (application.status === "enrolled") return "enrolled";
  if (
    application.status === "enrolling" &&
    enrollmentProgress?.checklistStatus === "completed"
  ) {
    return "enrolled";
  }
  return application.status;
}

function isEnrollmentComplete(
  application: FamilyApplication,
  enrollmentProgress?: EnrollmentProgressSummary,
): boolean {
  return displayApplicationStatus(application, enrollmentProgress) === "enrolled";
}

function applicationAction(
  application: FamilyApplication,
  schoolSlug: string,
  enrollmentProgress?: EnrollmentProgressSummary,
  previewBasePath?: string,
): { label: string; href: string } {
  if (application.status === "draft" && application.publicSlug) {
    if (previewBasePath) {
      return {
        label: "View draft",
        href: `${previewBasePath}/apply/${application.id}`,
      };
    }
    return {
      label: "Continue",
      href: `/school/${schoolSlug}/forms/${application.publicSlug}`,
    };
  }

  if (
    application.status === "enrolled" ||
    isEnrollmentComplete(application, enrollmentProgress)
  ) {
    return {
      label: "View enrollment",
      href: previewBasePath
        ? `${previewBasePath}/apply/${application.id}/enrollment`
        : `/school/${schoolSlug}/apply/${application.id}/enrollment`,
    };
  }

  if (application.status === "enrolling") {
    const hasStarted = (enrollmentProgress?.completed ?? 0) > 0;
    return {
      label: hasStarted ? "Continue enrollment" : "Start enrollment",
      href: previewBasePath
        ? `${previewBasePath}/apply/${application.id}/enrollment`
        : `/school/${schoolSlug}/apply/${application.id}/enrollment`,
    };
  }

  return {
    label: "View",
    href: previewBasePath
      ? `${previewBasePath}/apply/${application.id}`
      : `/school/${schoolSlug}/apply/${application.id}`,
  };
}

function enrolledCelebrationStorageKey(schoolSlug: string) {
  return `apply-dashboard-enrolled-celebration-v2:${schoolSlug}`;
}

export default function ApplyDashboard({
  branding,
  schoolName,
  schoolSlug,
  organizationId,
  timezone,
  applications,
  applicationsWithTasks,
  hasEnrolledAccess,
  parentPortalEnabled,
  parentPortalHref,
  enrollmentProgressByApplicationId,
  userProfile,
  previewMode = false,
  previewBasePath,
  focusApplicationId = null,
}: ApplyDashboardProps) {
  const router = useRouter();
  const C = useMemo(() => buildAdminThemeTokens(branding), [branding]);
  const previewHomeHref = previewBasePath ?? undefined;

  useEffect(() => {
    if (!focusApplicationId || typeof window === "undefined") return;
    const element = document.getElementById("preview-focus");
    element?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [focusApplicationId]);

  useEffect(() => {
    if (previewMode || !hasEnrolledAccess) return;
    if (typeof window === "undefined") return;
    const storageKey = enrolledCelebrationStorageKey(schoolSlug);
    if (sessionStorage.getItem(storageKey)) return;

    sessionStorage.setItem(storageKey, "1");
    fireEnrollmentConfetti();
  }, [hasEnrolledAccess, previewMode, schoolSlug]);

  return (
    <ApplyPortalPageShell
      branding={branding}
      schoolName={schoolName}
      schoolSlug={schoolSlug}
      organizationId={organizationId}
      userEmail={userProfile.email}
      userDisplayName={userProfile.displayName}
      previewMode={previewMode}
      previewHomeHref={previewHomeHref}
    >
        {hasEnrolledAccess && parentPortalEnabled && parentPortalHref ? (
          <EnrolledFamilyBanner
            C={C}
            schoolName={schoolName}
            parentPortalHref={parentPortalHref}
          />
        ) : null}

        <section className={hasEnrolledAccess && parentPortalEnabled ? "mt-8" : ""}>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-2xl font-semibold sm:text-3xl" style={{ color: C.accentDark }}>
                Your applications
              </h1>
              <p className="mt-2 text-sm leading-relaxed" style={{ color: C.textSecondary }}>
                Track submitted applications and continue drafts for {schoolName}.
              </p>
            </div>
            {!previewMode ? (
            <Link
              href={`/school/${schoolSlug}/forms/apply?new=1`}
              className="inline-flex w-full shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-md border border-dashed px-4 py-2.5 text-sm font-medium transition hover:opacity-90 sm:w-auto"
              style={{
                color: C.accent,
                borderColor: `color-mix(in srgb, ${C.accent} 30%, transparent)`,
                backgroundColor: "transparent",
              }}
            >
              <Plus className="h-4 w-4 shrink-0" />
              New application
            </Link>
            ) : null}
          </div>

        {applications.length === 0 ? (
          <div
            className="mt-4 rounded-md border px-6 py-10 text-center"
            style={{ borderColor: C.border, backgroundColor: "#FFFFFF" }}
          >
            <FileText className="mx-auto h-8 w-8" style={{ color: C.accent }} />
            <h2 className="mt-4 text-lg font-semibold" style={{ color: C.accentDark }}>
              No applications yet
            </h2>
            <p className="mt-2 text-sm leading-relaxed" style={{ color: C.textSecondary }}>
              Start an application to apply to {schoolName}.
            </p>
          </div>
        ) : (
          <div className="mt-4 space-y-3">
            {applications.map((application) => {
              const enrollmentProgress =
                enrollmentProgressByApplicationId[application.id];
              const action = applicationAction(
                application,
                schoolSlug,
                enrollmentProgress,
                previewBasePath,
              );
              const statusForDisplay = displayApplicationStatus(
                application,
                enrollmentProgress,
              );
              const submittedLabel = formatApplicationDate(application.submittedAt, timezone);
              const createdLabel = formatApplicationDate(application.createdAt, timezone);
              const dateLabel =
                submittedLabel ?? (application.status === "draft" ? `Started ${createdLabel}` : null);

              return (
                <div
                  key={application.id}
                  id={focusApplicationId === application.id ? "preview-focus" : undefined}
                  className="rounded-md border px-5 py-5"
                  style={{
                    borderColor:
                      focusApplicationId === application.id ? C.accent : C.border,
                    backgroundColor: "#FFFFFF",
                    boxShadow:
                      focusApplicationId === application.id
                        ? `0 0 0 1px ${C.accent}33`
                        : undefined,
                  }}
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0 flex-1">
                      {application.studentName ? (
                        <div className="mb-2 flex items-center gap-2.5">
                          <span
                            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold"
                            style={{ backgroundColor: C.accentLight, color: C.accent }}
                          >
                            {studentInitials(application.studentName)}
                          </span>
                          <span className="text-sm" style={{ color: C.textSecondary }}>
                            {application.studentName}
                          </span>
                        </div>
                      ) : null}
                      <div className="flex flex-col items-start gap-2">
                        <h2 className="text-base font-semibold" style={{ color: C.accentDark }}>
                          {application.formTitle}
                        </h2>
                        <span
                          className="rounded-full px-2.5 py-0.5 text-xs font-medium"
                          style={applicationStatusBadgeStyle(statusForDisplay, C)}
                        >
                          {applicationStatusLabel(statusForDisplay)}
                        </span>
                      </div>
                      {dateLabel ? (
                        <p className="mt-1 text-sm" style={{ color: C.textSecondary }}>
                          {application.status === "draft" ? dateLabel : `Submitted ${submittedLabel}`}
                        </p>
                      ) : null}
                      {application.status === "accepted" ? (
                        <p className="mt-2 text-sm" style={{ color: C.textSecondary }}>
                          Congratulations — your application was accepted. The school will
                          start your enrollment checklist soon.
                        </p>
                      ) : null}
                    </div>
                    <Link
                      href={action.href}
                      className="inline-flex shrink-0 items-center gap-1.5 self-end text-sm font-medium underline-offset-2 transition hover:underline sm:self-center"
                      style={{ color: C.accent }}
                    >
                      {action.label}
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        </section>

        {applicationsWithTasks.length > 0 ? (
          <ApplyRequiredActionsSection
            C={C}
            timezone={timezone}
            applications={applicationsWithTasks}
            onBooked={() => router.refresh()}
            previewMode={previewMode}
          />
        ) : null}
    </ApplyPortalPageShell>
  );
}
