"use client";

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { useRouter, useSearchParams } from "next/navigation";
import ApplicationFormSetupRequired from "@/components/admissions/ApplicationFormSetupRequired";
import ApplyFormRouteLoading, {
  ApplyFormRouteLoadingBrandingProvider,
} from "@/components/admissions/ApplyFormRouteLoading";
import PublicApplicationFormClient from "@/components/admissions/PublicApplicationFormClient";
import { buildApplyProgramOptions } from "@/components/admissions/ApplyProgramSelectStep";
import type { BootstrapApplicantResult } from "@/lib/admissions/applicant-bootstrap";
import type { ApplicationFormVersion } from "@/lib/admissions/application-form-schema";
import { isApplicationFormSummaryStub } from "@/lib/admissions/application-forms";
import { loadFullPublishedApplyForm } from "@/lib/admissions/load-full-apply-form";
import type { OrganizationBranding } from "@/lib/organization-settings/types";
import type { ApplyAuthEntryOption } from "@/lib/organization-settings/types";
import { buildAdminThemeTokens } from "@/lib/organization-settings/theme";

const ApplicationAuthGate = dynamic(
  () => import("@/components/admissions/ApplicationAuthGate"),
  { loading: () => <ApplyFormRouteLoading label="Loading sign in" /> },
);

type ServerAuthState = "unauthenticated" | "authenticated";

type CanonicalApplyEntryClientProps = {
  branding: OrganizationBranding;
  schoolName: string;
  schoolSlug: string;
  organizationId: string;
  forms: ApplicationFormVersion[];
  programsById: Map<string, string>;
  tourEntryOption?: ApplyAuthEntryOption | null;
  serverAuthState: ServerAuthState;
  hasGuardianForOrg?: boolean;
};

export default function CanonicalApplyEntryClient(
  props: CanonicalApplyEntryClientProps,
) {
  return (
    <ApplyFormRouteLoadingBrandingProvider branding={props.branding}>
      <CanonicalApplyEntryClientContent {...props} />
    </ApplyFormRouteLoadingBrandingProvider>
  );
}

function CanonicalApplyEntryClientContent({
  branding,
  schoolName,
  schoolSlug,
  organizationId,
  forms,
  programsById,
  tourEntryOption = null,
  serverAuthState,
  hasGuardianForOrg = false,
}: CanonicalApplyEntryClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const forceNew = searchParams.get("new") === "1";
  const C = useMemo(() => buildAdminThemeTokens(branding), [branding]);

  const [selectedForm, setSelectedForm] = useState<ApplicationFormVersion | null>(
    null,
  );
  const [loadingSelectedForm, setLoadingSelectedForm] = useState(false);
  const [formLoadError, setFormLoadError] = useState<string | null>(null);
  const [bootstrappedApplicationId, setBootstrappedApplicationId] = useState<
    string | null
  >(null);
  const [readyForForm, setReadyForForm] = useState(false);

  const programOptions = useMemo(
    () => buildApplyProgramOptions(forms, programsById),
    [forms, programsById],
  );

  const resolvedTourEntry = tourEntryOption;
  const useProgramOnlyFastPath =
    serverAuthState === "authenticated" && hasGuardianForOrg;

  const handleProgramSelected = (formVersionId: string) => {
    const summary = forms.find((row) => row.id === formVersionId) ?? null;
    if (!summary) {
      setFormLoadError("This program is no longer available. Please choose another.");
      setSelectedForm(null);
      return;
    }

    if (!isApplicationFormSummaryStub(summary)) {
      setSelectedForm(summary);
      setFormLoadError(null);
      return;
    }

    void (async () => {
      setLoadingSelectedForm(true);
      setFormLoadError(null);
      try {
        const full = await loadFullPublishedApplyForm(organizationId, formVersionId);
        if (!full) {
          setFormLoadError(
            "This program is no longer available. Please choose another.",
          );
          setSelectedForm(null);
          return;
        }
        setSelectedForm(full);
      } catch {
        setFormLoadError("Failed to load the application form. Please try again.");
        setSelectedForm(null);
      } finally {
        setLoadingSelectedForm(false);
      }
    })();
  };

  if (readyForForm) {
    if (loadingSelectedForm || (selectedForm && isApplicationFormSummaryStub(selectedForm))) {
      return (
        <ApplyFormRouteLoading
          label="Loading application form"
          branding={branding}
        />
      );
    }

    if (formLoadError) {
      return (
        <div
          className="flex min-h-dvh flex-col items-center justify-center px-6 py-12"
          style={{ backgroundColor: branding.colors.bg, color: C.textPrimary }}
        >
          <p className="max-w-md text-center text-sm" style={{ color: C.textSecondary }}>
            {formLoadError}
          </p>
        </div>
      );
    }

    if (selectedForm) {
      if (!selectedForm.program_id) {
        return (
          <ApplicationFormSetupRequired
            branding={branding}
            schoolName={schoolName}
            formTitle={selectedForm.title}
          />
        );
      }

      return (
        <PublicApplicationFormClient
          branding={branding}
          schoolName={schoolName}
          schoolSlug={schoolSlug}
          title={selectedForm.title}
          intro={selectedForm.intro}
          schema={selectedForm.schema}
          feeConfig={selectedForm.fee_config}
          organizationId={organizationId}
          formVersionId={selectedForm.id}
          serverAuthState="authenticated"
          initialApplicationId={bootstrappedApplicationId}
          tourEntryOption={resolvedTourEntry}
        />
      );
    }
  }

  return (
    <ApplicationAuthGate
      branding={branding}
      schoolName={schoolName}
      schoolSlug={schoolSlug}
      formTitle=""
      organizationId={organizationId}
      formVersionId=""
      forceNew={forceNew}
      genericEntry
      programOptions={programOptions}
      initialPhase={useProgramOnlyFastPath ? "program" : "choice"}
      programOnly={useProgramOnlyFastPath}
      tourEntryOption={resolvedTourEntry}
      onProgramSelected={handleProgramSelected}
      onBootstrapped={(result: BootstrapApplicantResult) => {
        if (result.applicationId) {
          setBootstrappedApplicationId(result.applicationId);
        }
      }}
      onAuthComplete={() => setReadyForForm(true)}
      onRedirectApplyDashboard={() => {
        router.replace(`/school/${schoolSlug}/apply`);
      }}
      onRedirectScheduleTour={() => {
        router.replace(`/school/${schoolSlug}/apply/schedule-tour`);
      }}
      onComplete={() => {
        // Form mount is driven by onAuthComplete after program selection.
      }}
    />
  );
}
