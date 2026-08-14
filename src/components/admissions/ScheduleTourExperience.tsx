"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import AdmissionsDateTimePicker from "@/components/admissions/AdmissionsDateTimePicker";
import ApplyPortalPageShell from "@/components/admissions/ApplyPortalPageShell";
import { formatOrganizationTimezoneLabel } from "@/lib/admissions/admissions-availability";
import { POST_SUBMIT_ACTION_TEMPLATES } from "@/lib/admissions/post-submit-templates";
import { buildAdminThemeTokens } from "@/lib/organization-settings/theme";
import type { OrganizationBranding } from "@/lib/organization-settings/types";
import type { SchoolPortalOption } from "@/lib/auth/portal-switcher-types";
import type { FamilyUserProfile } from "@/lib/admissions/parent-portal-access";

type ScheduleTourExperienceProps = {
  branding: OrganizationBranding;
  schoolName: string;
  schoolSlug: string;
  organizationId: string;
  timezone: string;
  userProfile: FamilyUserProfile;
  portalOptions?: SchoolPortalOption[];
  previewMode?: boolean;
  previewBasePath?: string;
  tourLabel?: string;
  tourDescription?: string;
};

export default function ScheduleTourExperience({
  branding,
  schoolName,
  schoolSlug,
  organizationId,
  timezone,
  userProfile,
  portalOptions = [],
  previewMode = false,
  previewBasePath,
  tourLabel,
  tourDescription,
}: ScheduleTourExperienceProps) {
  const router = useRouter();
  const C = useMemo(() => buildAdminThemeTokens(branding), [branding]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const timezoneLabel = formatOrganizationTimezoneLabel(timezone);
  const title =
    tourLabel ?? POST_SUBMIT_ACTION_TEMPLATES.schedule_campus_tour.label;
  const description =
    tourDescription ??
    POST_SUBMIT_ACTION_TEMPLATES.schedule_campus_tour.defaultInstructions;

  async function handleConfirm() {
    if (!selectedDate || !selectedTime) return;

    setSubmitting(true);
    setError(null);

    if (previewMode) {
      router.replace(previewBasePath ?? `/school/${schoolSlug}/apply`);
      return;
    }

    try {
      const response = await fetch("/api/admissions/family-tours/schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          organizationId,
          scheduledDate: selectedDate,
          startTimeSlot: selectedTime,
        }),
      });

      const payload = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(payload.error ?? "Failed to schedule tour.");
      }

      router.replace(`/school/${schoolSlug}/apply`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to schedule tour.");
      setSubmitting(false);
    }
  }

  const canConfirm = Boolean(selectedDate && selectedTime);

  return (
    <ApplyPortalPageShell
      branding={branding}
      schoolName={schoolName}
      schoolSlug={schoolSlug}
      organizationId={organizationId}
      userEmail={userProfile.email}
      userDisplayName={userProfile.displayName}
      profilePhotoUrl={userProfile.profilePhotoUrl}
      portalOptions={portalOptions}
      previewMode={previewMode}
      previewHomeHref={previewBasePath}
    >
      <div className="mx-auto max-w-3xl">
        <h1 className="text-2xl font-semibold sm:text-3xl" style={{ color: C.accentDark }}>
          {title}
        </h1>
        <p className="mt-2 text-sm leading-relaxed" style={{ color: C.textSecondary }}>
          {description}
        </p>

        <div className="mt-8">
          <AdmissionsDateTimePicker
            C={C}
            availabilityEndpointBuilder={(start, end) =>
              `/api/admissions/family-tours/availability?organizationId=${encodeURIComponent(
                organizationId,
              )}&start=${encodeURIComponent(start)}&end=${encodeURIComponent(end)}`
            }
            timezone={timezone}
            timezoneLabel={timezoneLabel}
            selectedDate={selectedDate}
            selectedTime={selectedTime}
            onDateChange={setSelectedDate}
            onTimeChange={setSelectedTime}
          />
        </div>

        {error ? (
          <p
            className="mt-4 rounded-md border px-3 py-2.5 text-sm"
            style={{
              borderColor: C.border,
              backgroundColor: C.errorBg,
              color: C.error,
            }}
            role="alert"
          >
            {error}
          </p>
        ) : null}

        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            disabled={previewMode}
            onClick={() =>
              router.push(
                previewMode && previewBasePath
                  ? previewBasePath
                  : `/school/${schoolSlug}/apply`,
              )
            }
            className="rounded-md border px-4 py-2.5 text-sm font-medium disabled:opacity-50"
            style={{ borderColor: C.border, color: C.textSecondary }}
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!canConfirm || submitting}
            onClick={() => void handleConfirm()}
            className="rounded-md px-4 py-2.5 text-sm font-medium text-white transition disabled:opacity-60"
            style={{ backgroundColor: C.accent }}
          >
            {submitting ? "Scheduling…" : "Confirm tour time"}
          </button>
        </div>
      </div>
    </ApplyPortalPageShell>
  );
}
