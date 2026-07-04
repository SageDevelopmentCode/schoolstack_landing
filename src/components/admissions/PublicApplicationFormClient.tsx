"use client";

import { useState } from "react";
import ApplicationAuthGate from "@/components/admissions/ApplicationAuthGate";
import ApplicationFormExperience from "@/components/admissions/ApplicationFormExperience";
import ApplicationFormPageShell from "@/components/admissions/ApplicationFormPageShell";
import type { BootstrapApplicantResult } from "@/lib/admissions/applicant-bootstrap";
import type {
  ApplicationFormFeeConfig,
  ApplicationFormSchema,
} from "@/lib/admissions/application-form-schema";
import type { OrganizationBranding } from "@/lib/organization-settings/types";

type PublicApplicationFormClientProps = {
  branding: OrganizationBranding;
  schoolName: string;
  title: string;
  intro: string | null;
  schema: ApplicationFormSchema;
  feeConfig: ApplicationFormFeeConfig;
  organizationId: string;
  formVersionId: string;
};

export default function PublicApplicationFormClient({
  branding,
  schoolName,
  title,
  intro,
  schema,
  feeConfig,
  organizationId,
  formVersionId,
}: PublicApplicationFormClientProps) {
  const [authComplete, setAuthComplete] = useState(false);
  // Held for Phase 3: wire ApplicationFormExperience to load/save responses.
  const [, setApplicationId] = useState<string | null>(null);

  const handleBootstrapped = (result: BootstrapApplicantResult) => {
    setApplicationId(result.applicationId);
  };

  return authComplete ? (
    <ApplicationFormPageShell branding={branding}>
      <ApplicationFormExperience
        branding={branding}
        schoolName={schoolName}
        title={title}
        intro={intro}
        schema={schema}
        feeConfig={feeConfig}
        mode="live"
      />
    </ApplicationFormPageShell>
  ) : (
    <ApplicationAuthGate
      branding={branding}
      schoolName={schoolName}
      formTitle={title}
      organizationId={organizationId}
      formVersionId={formVersionId}
      onBootstrapped={handleBootstrapped}
      onComplete={() => setAuthComplete(true)}
    />
  );
}
