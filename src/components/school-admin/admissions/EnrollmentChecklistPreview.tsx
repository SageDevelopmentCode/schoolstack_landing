"use client";

import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import EnrollmentChecklistExperience from "@/components/admissions/EnrollmentChecklistExperience";
import ApplicationFormPageShell from "@/components/admissions/ApplicationFormPageShell";
import { publicEnrollmentChecklistPath } from "@/lib/admissions/enrollment-checklist-templates";
import type { EnrollmentChecklistItem } from "@/lib/admissions/enrollment-checklist-schema";
import { buildAdminThemeTokens } from "@/lib/organization-settings/theme";
import { getAdminButtonStyle } from "@/lib/organization-settings/admin-button-styles";
import type { OrganizationBranding } from "@/lib/organization-settings/types";

type EnrollmentChecklistPreviewProps = {
  open: boolean;
  onClose: () => void;
  branding: OrganizationBranding;
  schoolName: string;
  slug: string;
  enrollmentPath: string;
  title: string;
  items: EnrollmentChecklistItem[];
  initialItemId?: string;
};

export default function EnrollmentChecklistPreview({
  open,
  onClose,
  branding,
  schoolName,
  slug,
  enrollmentPath,
  title,
  items,
  initialItemId,
}: EnrollmentChecklistPreviewProps) {
  const C = buildAdminThemeTokens(branding);
  const previewPath = publicEnrollmentChecklistPath(slug, enrollmentPath);

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
                  {previewPath}
                </span>
              </div>
              <p className="mt-0.5 truncate text-xs" style={{ color: C.textSecondary }}>
                This is how families will see your enrollment checklist.
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="flex shrink-0 items-center gap-1.5 rounded-md border px-3 py-2 text-sm font-medium"
              style={getAdminButtonStyle(C, "neutral")}
            >
              <X className="h-4 w-4" />
              Close
            </button>
          </div>

          <div className="min-h-0 flex-1 overflow-hidden">
            <ApplicationFormPageShell branding={branding} fillParent>
              <EnrollmentChecklistExperience
                branding={branding}
                schoolName={schoolName}
                title={title}
                items={items}
                mode="preview"
                initialItemId={initialItemId}
              />
            </ApplicationFormPageShell>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
