"use client";

import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import ProgramParentPortalPreviewFrame from "./ProgramParentPortalPreviewFrame";
import type { ProgramParentPortalEditorState } from "@/lib/admissions/program-parent-portal";
import { getAdminButtonStyle } from "@/lib/organization-settings/admin-button-styles";
import { buildAdminThemeTokens } from "@/lib/organization-settings/theme";
import type {
  OrganizationBranding,
  OrganizationFeatures,
} from "@/lib/organization-settings/types";

type ProgramParentPortalPreviewModalProps = {
  open: boolean;
  onClose: () => void;
  branding: OrganizationBranding;
  orgFeatures: OrganizationFeatures;
  editor: ProgramParentPortalEditorState;
  schoolSlug: string;
  schoolName: string;
  organizationId: string;
  programName: string;
  portalSlug: string | null;
  isolationAllowed: boolean;
};

export default function ProgramParentPortalPreviewModal({
  open,
  onClose,
  branding,
  orgFeatures,
  editor,
  schoolSlug,
  schoolName,
  organizationId,
  programName,
  portalSlug,
  isolationAllowed,
}: ProgramParentPortalPreviewModalProps) {
  const C = buildAdminThemeTokens(branding);

  if (typeof document === "undefined") {
    return null;
  }

  return createPortal(
    <AnimatePresence>
      {open ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[10000] flex flex-col"
          style={{ backgroundColor: branding.colors.bg }}
        >
          <div
            className="flex shrink-0 items-start justify-between gap-4 border-b px-4 py-4 sm:px-6"
            style={{ borderColor: C.border, backgroundColor: C.surface }}
          >
            <div className="min-w-0">
              <h2
                className="text-lg font-semibold"
                style={{ color: C.textPrimary }}
              >
                Parent portal preview
              </h2>
              <p className="mt-1 text-sm" style={{ color: C.textSecondary }}>
                {programName.trim() || "Program"} — reflects current toggles.
                Save to publish.
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

          <div className="flex min-h-0 flex-1 flex-col p-3 sm:p-4">
            <div className="mx-auto flex h-full min-h-0 w-full max-w-[1440px] flex-1 flex-col">
              <ProgramParentPortalPreviewFrame
                branding={branding}
                orgFeatures={orgFeatures}
                editor={editor}
                schoolSlug={schoolSlug}
                schoolName={schoolName}
                organizationId={organizationId}
                programName={programName}
                portalSlug={portalSlug}
                isolationAllowed={isolationAllowed}
              />
            </div>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>,
    document.body,
  );
}
