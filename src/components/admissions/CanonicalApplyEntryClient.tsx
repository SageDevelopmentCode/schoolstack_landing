"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import ApplicationAuthGate from "@/components/admissions/ApplicationAuthGate";
import ApplicationFormSetupRequired from "@/components/admissions/ApplicationFormSetupRequired";
import PublicApplicationFormClient from "@/components/admissions/PublicApplicationFormClient";
import { buildApplyProgramOptions } from "@/components/admissions/ApplyProgramSelectStep";
import type { BootstrapApplicantResult } from "@/lib/admissions/applicant-bootstrap";
import type { ApplicationFormVersion } from "@/lib/admissions/application-form-schema";
import type { OrganizationBranding } from "@/lib/organization-settings/types";
import type { ApplyAuthEntryOption } from "@/lib/organization-settings/types";

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

export default function CanonicalApplyEntryClient({
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

  const [selectedForm, setSelectedForm] = useState<ApplicationFormVersion | null>(null);
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

  if (readyForForm && selectedForm) {
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
      onProgramSelected={(formVersionId) => {
        const form = forms.find((row) => row.id === formVersionId) ?? null;
        setSelectedForm(form);
      }}
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
