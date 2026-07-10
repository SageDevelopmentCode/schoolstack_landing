"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo } from "react";
import { ArrowRight, FileText, Plus } from "lucide-react";
import ApplyRequiredActionsSection from "@/components/admissions/ApplyRequiredActionsSection";
import SchoolDemoWordmark from "@/components/demo/SchoolDemoWordmark";
import {
  applicationStatusBadgeStyle,
  applicationStatusLabel,
} from "@/lib/admissions/application-status-ui";
import { type FamilyApplication } from "@/lib/admissions/parent-portal-access";
import { formatInstantInTimezone } from "@/lib/admissions/admissions-availability";
import { buildAdminThemeTokens } from "@/lib/organization-settings/theme";
import type { OrganizationBranding } from "@/lib/organization-settings/types";

type ApplyDashboardProps = {
  branding: OrganizationBranding;
  schoolName: string;
  schoolSlug: string;
  timezone: string;
  applications: FamilyApplication[];
  applicationsWithTasks: FamilyApplication[];
  hasEnrolledAccess: boolean;
};

function formatApplicationDate(
  value: string | null,
  timezone: string,
): string | null {
  if (!value) return null;
  return formatInstantInTimezone(value, timezone);
}

function applicationAction(
  application: FamilyApplication,
  schoolSlug: string,
): { label: string; href: string } {
  if (application.status === "draft" && application.publicSlug) {
    return {
      label: "Continue",
      href: `/school/${schoolSlug}/forms/${application.publicSlug}`,
    };
  }

  if (application.status === "enrolling") {
    return {
      label: "Start enrollment",
      href: `/school/${schoolSlug}/apply/${application.id}/enrollment`,
    };
  }

  return {
    label: "View",
    href: `/school/${schoolSlug}/apply/${application.id}`,
  };
}

export default function ApplyDashboard({
  branding,
  schoolName,
  schoolSlug,
  timezone,
  applications,
  applicationsWithTasks,
  hasEnrolledAccess,
}: ApplyDashboardProps) {
  const router = useRouter();
  const C = useMemo(() => buildAdminThemeTokens(branding), [branding]);
  const pageBg = branding.colors.bg;

  return (
    <div
      className="min-h-dvh px-4 py-8 sm:px-6 sm:py-10"
      style={{ backgroundColor: pageBg, color: C.textPrimary }}
    >
      <div className="mx-auto max-w-3xl">
        <SchoolDemoWordmark
          logo={{
            src: branding.logo.src,
            alt: branding.logo.alt || schoolName,
            width: branding.logo.width,
            height: branding.logo.height,
            text: branding.logo.src ? undefined : schoolName,
          }}
          className="mb-8 h-8 w-auto max-w-[200px] object-contain"
        />

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
            style={{ backgroundColor: C.accent }}
          >
            <Plus className="h-4 w-4" />
            New application
          </Link>
        </div>

        {hasEnrolledAccess ? (
          <div
            className="mt-6 rounded-lg border px-4 py-3 text-sm"
            style={{ borderColor: C.border, backgroundColor: "#FFFFFF" }}
          >
            <span style={{ color: C.textSecondary }}>
              Your family is enrolled.{" "}
            </span>
            <Link
              href={`/school/${schoolSlug}/parent`}
              className="inline-flex items-center gap-1 font-medium underline-offset-2 hover:underline"
              style={{ color: C.accent }}
            >
              Go to parent portal
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        ) : null}

        {applications.length === 0 ? (
          <div
            className="mt-8 rounded-lg border px-6 py-10 text-center"
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
              style={{ backgroundColor: C.accent }}
            >
              Start application
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        ) : (
          <div className="mt-8 space-y-3">
            {applications.map((application) => {
              const action = applicationAction(application, schoolSlug);
              const submittedLabel = formatApplicationDate(application.submittedAt, timezone);
              const createdLabel = formatApplicationDate(application.createdAt, timezone);
              const dateLabel =
                submittedLabel ?? (application.status === "draft" ? `Started ${createdLabel}` : null);

              return (
                <div
                  key={application.id}
                  className="rounded-lg border px-5 py-4"
                  style={{ borderColor: C.border, backgroundColor: "#FFFFFF" }}
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-base font-semibold" style={{ color: C.accentDark }}>
                          {application.formTitle}
                        </h2>
                        <span
                          className="rounded-full px-2.5 py-0.5 text-xs font-medium"
                          style={applicationStatusBadgeStyle(application.status, C)}
                        >
                          {applicationStatusLabel(application.status)}
                        </span>
                      </div>
                      {application.studentName ? (
                        <p className="mt-1 text-sm" style={{ color: C.textSecondary }}>
                          {application.studentName}
                        </p>
                      ) : null}
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
                      {application.status === "enrolling" ? (
                        <p className="mt-2 text-sm" style={{ color: C.textSecondary }}>
                          Your enrollment checklist is ready. Complete the remaining steps to
                          finish enrollment.
                        </p>
                      ) : null}
                    </div>
                    <Link
                      href={action.href}
                      className="inline-flex shrink-0 items-center justify-center rounded-md border px-4 py-2 text-sm font-medium transition hover:opacity-90"
                      style={{
                        borderColor: C.border,
                        color: C.accent,
                        backgroundColor: pageBg,
                      }}
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
    </div>
  );
}
