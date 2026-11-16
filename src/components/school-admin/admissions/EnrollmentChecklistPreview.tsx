"use client";

import { SkinPortalScope } from "@/components/school-admin/garden/skin";
import { createPortal } from "react-dom";
import { DetailButton } from "@/components/school-admin/admissions/detail-garden";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { EnrollmentChecklistPreviewContent } from "./EnrollmentChecklistPreviewContent";
import type { EnrollmentChecklistItem } from "@/lib/admissions/enrollment-checklist-schema";
import { buildAdminThemeTokens } from "@/lib/organization-settings/theme";
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
  allItems?: EnrollmentChecklistItem[];
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
  allItems,
  initialItemId,
}: EnrollmentChecklistPreviewProps) {
  const C = buildAdminThemeTokens(branding);

  if (typeof document === "undefined") {
    return null;
  }

  return createPortal(
<SkinPortalScope>
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[10000] flex flex-col"
          style={{ backgroundColor: branding.colors.bg }}
        >
          <EnrollmentChecklistPreviewContent
            branding={branding}
            schoolName={schoolName}
            slug={slug}
            enrollmentPath={enrollmentPath}
            title={title}
            items={items}
            allItems={allItems}
            initialItemId={initialItemId}
            headerAction={
              <DetailButton
 kind="neutral"
 C={C}
                type="button"
                onClick={onClose}
                storyClassName="flex shrink-0 items-center gap-1.5 rounded-md border px-3 py-2 text-sm font-medium"
              >
                <X className="h-4 w-4" />
                Close
              </DetailButton>
            }
          />
        </motion.div>
      )}
    </AnimatePresence></SkinPortalScope>,
    document.body,
  );
}
