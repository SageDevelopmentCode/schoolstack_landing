"use client";

import TuitionSetupWizard from "@/components/school-admin/tuition/TuitionSetupWizard";
import type { OrganizationBranding } from "@/lib/organization-settings/types";

type TuitionSetupWizardModalProps = {
  open: boolean;
  organizationId: string;
  branding: OrganizationBranding;
  editRatePlanId: string;
  onClose: () => void;
  onComplete: () => void;
};

export default function TuitionSetupWizardModal({
  open,
  organizationId,
  branding,
  editRatePlanId,
  onClose,
  onComplete,
}: TuitionSetupWizardModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div className="w-full max-w-3xl max-h-[90vh] flex flex-col">
        <TuitionSetupWizard
          layout="modal"
          organizationId={organizationId}
          branding={branding}
          editRatePlanId={editRatePlanId}
          onCancelEdit={onClose}
          onComplete={onComplete}
        />
      </div>
    </div>
  );
}
