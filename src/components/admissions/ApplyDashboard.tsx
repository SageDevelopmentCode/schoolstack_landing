"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";
import { ArrowRight, FileText, Plus } from "lucide-react";
import EnrolledFamilyBanner from "@/components/admissions/EnrolledFamilyBanner";
import ApplyRequiredActionsSection from "@/components/admissions/ApplyRequiredActionsSection";
import ApplyPortalNavbar from "@/components/admissions/ApplyPortalNavbar";
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
import { getAdminButtonStyle } from "@/lib/organization-settings/admin-button-styles";
import type { OrganizationBranding } from "@/lib/organization-settings/types";

type ApplyDashboardProps = {
  branding: OrganizationBranding;
  schoolName: string;
  schoolSlug: string;
  timezone: string;
  applications: FamilyApplication[];
  applicationsWithTasks: FamilyApplication[];
  hasEnrolledAccess: boolean;
  parentPortalEnabled: boolean;
  enrollmentProgressByApplicationId: Record<string, EnrollmentProgressSummary>;
  userProfile: FamilyUserProfile;
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
): { label: string; href: string } {
  if (application.status === "draft" && application.publicSlug) {
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
      href: `/school/${schoolSlug}/apply/${application.id}/enrollment`,
    };
  }

  if (application.status === "enrolling") {
    const hasStarted = (enrollmentProgress?.completed ?? 0) > 0;
    return {
      label: hasStarted ? "Continue enrollment" : "Start enrollment",
      href: `/school/${schoolSlug}/apply/${application.id}/enrollment`,
    };
  }

  return {
    label: "View",
    href: `/school/${schoolSlug}/apply/${application.id}`,
  };
}

function enrolledCelebrationStorageKey(schoolSlug: string) {
  return `apply-dashboard-enrolled-celebration-v2:${schoolSlug}`;
}

export default function ApplyDashboard({
  branding,
  schoolName,
  schoolSlug,
  timezone,
  applications,
  applicationsWithTasks,
  hasEnrolledAccess,
  parentPortalEnabled,
  enrollmentProgressByApplicationId,
  userProfile,
}: ApplyDashboardProps) {
  const router = useRouter();
  const C = useMemo(() => buildAdminThemeTokens(branding), [branding]);
  const pageBg = branding.colors.bg;

  useEffect(() => {
    if (!hasEnrolledAccess) return;
    if (typeof window === "undefined") return;
    const storageKey = enrolledCelebrationStorageKey(schoolSlug);
    if (sessionStorage.getItem(storageKey)) return;

    sessionStorage.setItem(storageKey, "1");
    fireEnrollmentConfetti();
  }, [hasEnrolledAccess, schoolSlug]);

  return (
    <div className="flex min-h-dvh flex-col" style={{ color: C.textPrimary }}>
      <ApplyPortalNavbar
        branding={branding}
        schoolName={schoolName}
        schoolSlug={schoolSlug}
        userEmail={userProfile.email}
        userDisplayName={userProfile.displayName}
      />
      <main
        className="flex-1 px-4 py-8 sm:px-6 sm:py-10"
        style={{ backgroundColor: pageBg }}
      >
        <div className="mx-auto max-w-3xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold sm:text-3xl" style={{ color: C.accentDark }}>
              Your applications
            </h1>
            <p className="mt-2 text-sm leading-relaxed" style={{ color: C.textSecondary }}>
              Track submitted applications and continue drafts for {schoolName}.
            </p>
          </div>
          <Link
            href={`/school/${schoolSlug}/forms/apply?new=1`}
            className="inline-flex items-center justify-center gap-2 rounded-md px-4 py-2.5 text-sm font-medium text-white transition hover:opacity-90"
            style={getAdminButtonStyle(C, "primary")}
          >
            <Plus className="h-4 w-4" />
            New application
          </Link>
        </div>

        {hasEnrolledAccess && parentPortalEnabled ? (
          <EnrolledFamilyBanner
            C={C}
            schoolName={schoolName}
            schoolSlug={schoolSlug}
          />
        ) : null}

        {applications.length === 0 ? (
          <div
            className="mt-8 rounded-md border px-6 py-10 text-center"
            style={{ borderColor: C.border, backgroundColor: "#FFFFFF" }}
          >
            <FileText className="mx-auto h-8 w-8" style={{ color: C.accent }} />
            <h2 className="mt-4 text-lg font-semibold" style={{ color: C.accentDark }}>
              No applications yet
            </h2>
            <p className="mt-2 text-sm leading-relaxed" style={{ color: C.textSecondary }}>
              Start an application to apply to {schoolName}.
            </p>
            <Link
              href={`/school/${schoolSlug}/forms/apply?new=1`}
              className="mt-6 inline-flex items-center gap-2 rounded-md px-4 py-2.5 text-sm font-medium text-white transition hover:opacity-90"
              style={getAdminButtonStyle(C, "primary")}
            >
              Start application
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        ) : (
          <div className="mt-8 space-y-3">
            {applications.map((application) => {
              const enrollmentProgress =
                enrollmentProgressByApplicationId[application.id];
              const action = applicationAction(
                application,
                schoolSlug,
                enrollmentProgress,
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
                  className="rounded-md border px-5 py-4"
                  style={{ borderColor: C.border, backgroundColor: "#FFFFFF" }}
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
                      <div className="flex flex-wrap items-center gap-2">
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
                      className="inline-flex shrink-0 items-center justify-center rounded-md border px-4 py-2 text-sm font-medium transition hover:opacity-90"
                      style={getAdminButtonStyle(C, "secondary")}
                    >
                      {action.label}
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {applicationsWithTasks.length > 0 ? (
          <ApplyRequiredActionsSection
            C={C}
            timezone={timezone}
            applications={applicationsWithTasks}
            onBooked={() => router.refresh()}
          />
        ) : null}
        </div>
      </main>
    </div>
  );
}
