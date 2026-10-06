"use client";

import SchoolAdminModalShell from "@/components/school-admin/ui/SchoolAdminModalShell";
import TuitionSetupWizard from "@/components/school-admin/tuition/TuitionSetupWizard";
import type { OrganizationBranding } from "@/lib/organization-settings/types";

type TuitionSetupWizardModalProps = {
  open: boolean;
  organizationId: string;
  branding: OrganizationBranding;
  editRatePlanId?: string | null;
  draftRatePlanId?: string | null;
  initialStepIndex?: number;
  onClose: () => void;
  onComplete: () => void;
};

export default function TuitionSetupWizardModal({
  open,
  organizationId,
  branding,
  editRatePlanId,
  draftRatePlanId,
  initialStepIndex,
  onClose,
  onComplete,
}: TuitionSetupWizardModalProps) {
  const isEditMode = Boolean(editRatePlanId);

  return (
    <SchoolAdminModalShell
      open={open}
      onClose={onClose}
      maxWidth="3xl"
      ariaLabel={isEditMode ? "Edit rate plan setup" : "Create rate plan setup"}
      panelClassName="flex max-h-[90vh] flex-col"
    >
      <TuitionSetupWizard
        layout="modal"
        organizationId={organizationId}
        branding={branding}
        editRatePlanId={editRatePlanId ?? undefined}
        draftRatePlanId={draftRatePlanId ?? undefined}
        initialStepIndex={initialStepIndex}
        onCancelEdit={onClose}
        onComplete={onComplete}
      />
    </SchoolAdminModalShell>
  );
}
