"use client";

import { AnimatePresence, motion } from "framer-motion";
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
    <AnimatePresence>
      {open ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: "rgba(0,0,0,0.4)" }}
          role="presentation"
        >
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ type: "spring", damping: 28, stiffness: 320 }}
            className="flex w-full max-w-3xl max-h-[90vh] flex-col"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="Edit rate plan setup"
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
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
