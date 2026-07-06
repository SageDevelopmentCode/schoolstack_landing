"use client";

import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Loader2, X } from "lucide-react";
import ApplicationReadOnlyView from "@/components/admissions/ApplicationReadOnlyView";
import {
  applicationStatusBadgeStyle,
  applicationStatusLabel,
  FEE_STATUS_LABELS,
} from "@/lib/admissions/application-status-ui";
import {
  formatShortDate,
  formatSubmissionProgress,
  type AdminApplicationSubmission,
} from "@/lib/admissions/application-submissions";
import { loadApplicationDetail } from "@/lib/admissions/parent-portal-access";
import { buildAdminThemeTokens } from "@/lib/organization-settings/theme";
import type { OrganizationBranding } from "@/lib/organization-settings/types";
import { createClient } from "@/utils/supabase/client";

type ApplicationSubmissionDetailPanelProps = {
  submission: AdminApplicationSubmission;
  organizationId: string;
  branding: OrganizationBranding;
  schoolName: string;
  schoolSlug: string;
  onClose: () => void;
};

export default function ApplicationSubmissionDetailPanel({
  submission,
  organizationId,
  branding,
  schoolName,
  schoolSlug,
  onClose,
}: ApplicationSubmissionDetailPanelProps) {
  const C = buildAdminThemeTokens(branding);
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [detail, setDetail] = useState<Awaited<ReturnType<typeof loadApplicationDetail>>>(null);

  const loadDetail = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const row = await loadApplicationDetail(supabase, submission.id, organizationId);
      if (!row) {
        setError("Application not found.");
        setDetail(null);
        return;
      }
      setDetail(row);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load application.");
      setDetail(null);
    } finally {
      setLoading(false);
    }
  }, [organizationId, submission.id, supabase]);

  useEffect(() => {
    loadDetail();
  }, [loadDetail]);

  const statusStyle = applicationStatusBadgeStyle(submission.status, C);
  const familyLabel =
    submission.guardianName || submission.studentLabel || "Application";
  const contactLabel = submission.contactEmail ?? "No contact email";

  return (
    <motion.div
      initial={{ x: "100%", opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: "100%", opacity: 0 }}
      transition={{ type: "spring", damping: 28, stiffness: 300 }}
      className="absolute inset-y-0 right-0 flex w-[min(100%,44rem)] max-w-full flex-col overflow-hidden"
      style={{
        backgroundColor: C.surface,
        borderLeft: `1px solid ${C.border}`,
        boxShadow: C.shadowMedium,
        zIndex: 15,
      }}
    >
      <div
        className="flex flex-shrink-0 items-start justify-between gap-3 px-4 py-3 sm:px-5"
        style={{ borderBottom: `1px solid ${C.border}` }}
      >
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="truncate text-sm font-semibold" style={{ color: C.textPrimary }}>
              {familyLabel}
            </h3>
            <span
              className="rounded-full px-2 py-0.5 text-[11px] font-medium"
              style={statusStyle}
            >
              {applicationStatusLabel(submission.status)}
            </span>
          </div>
          <p className="mt-0.5 truncate text-xs" style={{ color: C.textTertiary }}>
            {submission.formTitle}
            {submission.programName ? (
              <>
                <span className="mx-1.5 opacity-50">·</span>
                {submission.programName}
              </>
            ) : null}
          </p>
          <p className="mt-1 truncate text-xs" style={{ color: C.textSecondary }}>
            {contactLabel}
            <span className="mx-1.5 opacity-50">·</span>
            Updated {formatShortDate(submission.updatedAt)}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="flex-shrink-0 rounded p-1"
          style={{ color: C.textTertiary }}
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-5 sm:px-5">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-5 w-5 animate-spin" style={{ color: C.textTertiary }} />
          </div>
        ) : error ? (
          <p className="text-sm" style={{ color: C.error }}>
            {error}
          </p>
        ) : detail ? (
          <ApplicationReadOnlyView
            branding={branding}
            schoolName={schoolName}
            schoolSlug={schoolSlug}
            application={detail}
            embedded
          />
        ) : null}
      </div>

      <div
        className="flex flex-shrink-0 flex-wrap gap-x-4 gap-y-1 px-4 py-3 text-xs sm:px-5"
        style={{ borderTop: `1px solid ${C.border}`, color: C.textTertiary }}
      >
        <span>Created {formatShortDate(submission.createdAt)}</span>
        {submission.submittedAt ? (
          <span>Submitted {formatShortDate(submission.submittedAt)}</span>
        ) : null}
        <span>{formatSubmissionProgress(submission)}</span>
        {submission.feeEnabled && submission.feeStatus !== "not_required" ? (
          <span>Fee {FEE_STATUS_LABELS[submission.feeStatus] ?? submission.feeStatus}</span>
        ) : null}
      </div>
    </motion.div>
  );
}
