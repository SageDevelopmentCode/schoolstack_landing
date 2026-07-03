"use client";

import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import ApplicationFormExperience from "@/components/admissions/ApplicationFormExperience";
import type {
  ApplicationFormFeeConfig,
  ApplicationFormSchema,
} from "@/lib/admissions/application-form-schema";
import { buildAdminThemeTokens } from "@/lib/organization-settings/theme";
import type { OrganizationBranding } from "@/lib/organization-settings/types";

type ApplicationFormPreviewProps = {
  open: boolean;
  onClose: () => void;
  branding: OrganizationBranding;
  schoolName: string;
  slug: string;
  title: string;
  intro: string | null;
  schema: ApplicationFormSchema;
  feeConfig: ApplicationFormFeeConfig;
};

export default function ApplicationFormPreview({
  open,
  onClose,
  branding,
  schoolName,
  slug,
  title,
  intro,
  schema,
  feeConfig,
}: ApplicationFormPreviewProps) {
  const C = buildAdminThemeTokens(branding);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[10000] flex flex-col"
          style={{ backgroundColor: branding.colors.bg }}
        >
          <div
            className="flex shrink-0 items-center justify-between border-b px-4 py-3 sm:px-6"
            style={{
              borderColor: C.border,
              backgroundColor: C.surface,
            }}
          >
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span
                  className="rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide"
                  style={{ backgroundColor: C.accentLight, color: C.accent }}
                >
                  Preview
                </span>
                <span className="truncate text-sm" style={{ color: C.textTertiary }}>
                  {slug}/apply
                </span>
              </div>
              <p className="mt-0.5 truncate text-xs" style={{ color: C.textSecondary }}>
                This is how families will see your application form.
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="flex items-center gap-1.5 rounded-md border px-3 py-2 text-sm font-medium shrink-0"
              style={{
                borderColor: C.border,
                color: C.textSecondary,
                backgroundColor: C.bg,
              }}
            >
              <X className="h-4 w-4" />
              Close
            </button>
          </div>

          <div className="min-h-0 flex-1">
            <ApplicationFormExperience
              branding={branding}
              schoolName={schoolName}
              title={title}
              intro={intro}
              schema={schema}
              feeConfig={feeConfig}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
