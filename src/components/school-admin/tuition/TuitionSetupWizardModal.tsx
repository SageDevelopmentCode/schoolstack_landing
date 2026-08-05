"use client";

import SchoolAdminModalShell from "@/components/school-admin/ui/SchoolAdminModalShell";
import TuitionSetupWizard from "@/components/school-admin/tuition/TuitionSetupWizard";
import type { OrganizationBranding } from "@/lib/organization-settings/types";

type TuitionSetupWizardModalProps = {
  open: boolean;
  organizationId: string;
  branding: OrganizationBranding;
  editRatePlanId: string;
  initialStepIndex?: number;
  onClose: () => void;
  onComplete: () => void;
};

export default function TuitionSetupWizardModal({
  open,
  organizationId,
  branding,
  editRatePlanId,
  initialStepIndex,
  onClose,
  onComplete,
}: TuitionSetupWizardModalProps) {
  return (
    <SchoolAdminModalShell
      open={open}
      onClose={onClose}
      maxWidth="3xl"
      ariaLabel="Edit rate plan setup"
      panelClassName="flex max-h-[90vh] flex-col"
    >
      <TuitionSetupWizard
        layout="modal"
        organizationId={organizationId}
        branding={branding}
        editRatePlanId={editRatePlanId}
        initialStepIndex={initialStepIndex}
        onCancelEdit={onClose}
        onComplete={onComplete}
      />
    </SchoolAdminModalShell>
  );
}
