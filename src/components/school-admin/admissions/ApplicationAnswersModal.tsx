"use client";

import { useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import ApplicationReadOnlyView from "@/components/admissions/ApplicationReadOnlyView";
import ApplicationPdfDownloadButton from "@/components/school-admin/admissions/ApplicationPdfDownloadButton";
import {
  applicationStatusBadgeStyle,
  applicationStatusLabel,
} from "@/lib/admissions/application-status-ui";
import type { ApplicationDetail } from "@/lib/admissions/parent-portal-access";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";
import type { OrganizationBranding } from "@/lib/organization-settings/types";

type ApplicationAnswersModalProps = {
  C: AdminThemeTokens;
  branding: OrganizationBranding;
  schoolName: string;
  schoolSlug: string;
  open: boolean;
  detail: ApplicationDetail;
  downloadLabel: string;
  onClose: () => void;
};

export default function ApplicationAnswersModal({
  C,
  branding,
  schoolName,
  schoolSlug,
  open,
  detail,
  downloadLabel,
  onClose,
}: ApplicationAnswersModalProps) {
  const printRef = useRef<HTMLDivElement>(null);

  const statusStyle = applicationStatusBadgeStyle(detail.status, C);

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-[130] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div
            className="absolute inset-0"
            style={{ backgroundColor: "rgba(0,0,0,0.45)" }}
            onClick={onClose}
            aria-hidden="true"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.98, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: 8 }}
            className="relative z-10 flex max-h-[min(90vh,900px)] w-full max-w-4xl flex-col overflow-hidden rounded-lg"
            style={{
              backgroundColor: C.surface,
              border: `1px solid ${C.border}`,
              boxShadow: C.shadowMedium,
            }}
            onClick={(event) => event.stopPropagation()}
          >
            <div
              className="flex flex-shrink-0 items-start justify-between gap-3 border-b px-5 py-3.5"
              style={{ borderColor: C.border }}
            >
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-base font-semibold" style={{ color: C.textPrimary }}>
                    Application answers
                  </h3>
                  <span
                    className="rounded-full px-2 py-0.5 text-[11px] font-medium"
                    style={statusStyle}
                  >
                    {applicationStatusLabel(detail.status)}
                  </span>
                </div>
                <p className="mt-0.5 truncate text-xs" style={{ color: C.textTertiary }}>
                  {detail.formTitle}
                </p>
              </div>
              <div className="flex shrink-0 items-start gap-2">
                <ApplicationPdfDownloadButton
                  C={C}
                  downloadLabel={downloadLabel}
                  getElement={() => printRef.current}
                  errorClassName="max-w-[160px] text-right text-xs"
                />
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded p-1"
                  style={{ color: C.textTertiary }}
                  aria-label="Close"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto">
              <div ref={printRef} id="application-answers-print">
                <ApplicationReadOnlyView
                  branding={branding}
                  schoolName={schoolName}
                  schoolSlug={schoolSlug}
                  application={detail}
                  layout="page"
                  view="full"
                  hideBackLink
                  standalone={false}
                />
              </div>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
