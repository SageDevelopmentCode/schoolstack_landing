"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AnimatePresence } from "framer-motion";
import { ExternalLink, Loader2 } from "lucide-react";
import ApplicationSubmissionDetailPanel from "./ApplicationSubmissionDetailPanel";
import {
  applicationStatusBadgeStyle,
  applicationStatusLabel,
  APPLICATION_STATUS_FILTER_ORDER,
  FEE_STATUS_LABELS,
} from "@/lib/admissions/application-status-ui";
import { enrollmentProgressBadgeStyle } from "@/lib/admissions/admin-enrollment-progress";
import { postSubmitSummaryBadgeStyle } from "@/lib/admissions/admin-post-submit-steps";
import {
  formatShortDate,
  formatSubmissionProgress,
  listOrgApplicationSubmissions,
  type AdminApplicationSubmission,
} from "@/lib/admissions/application-submissions";
import { publicApplicationFormPath } from "@/lib/admissions/application-forms";
import { schoolAdminPath } from "@/lib/organization-settings/admin-routes";
import { buildAdminThemeTokens } from "@/lib/organization-settings/theme";
import type { OrganizationBranding } from "@/lib/organization-settings/types";
import { createClient } from "@/utils/supabase/client";

type ApplicationSubmissionsPageProps = {
  organizationId: string;
  branding: OrganizationBranding;
  schoolName: string;
  slug: string;
};

type StatusFilter = "all" | string;
type FormFilter = "all" | string;

function FilterChip({
  active,
  label,
  count,
  onClick,
  C,
}: {
  active: boolean;
  label: string;
  count?: number;
  onClick: () => void;
  C: ReturnType<typeof buildAdminThemeTokens>;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-colors"
      style={{
        backgroundColor: active ? C.accentLight : C.elevated,
        color: active ? C.accent : C.textSecondary,
        border: `1px solid ${active ? C.accent : C.border}`,
      }}
    >
      {label}
      {count != null ? (
        <span
          className="rounded-full px-1.5 py-0.5 text-[10px] font-semibold"
          style={{
            backgroundColor: active ? C.surface : C.bg,
            color: active ? C.accent : C.textTertiary,
          }}
        >
          {count}
        </span>
      ) : null}
    </button>
  );
}

export default function ApplicationSubmissionsPage({
  organizationId,
  branding,
  schoolName,
  slug,
}: ApplicationSubmissionsPageProps) {
  const C = useMemo(() => buildAdminThemeTokens(branding), [branding]);
  const supabase = useMemo(() => createClient(), []);

  const [submissions, setSubmissions] = useState<AdminApplicationSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [formFilter, setFormFilter] = useState<FormFilter>("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const flowsPath = schoolAdminPath(slug, "admissions", "flows");

  const loadSubmissions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const rows = await listOrgApplicationSubmissions(supabase, organizationId);
      setSubmissions(rows);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load submissions.");
    } finally {
      setLoading(false);
    }
  }, [organizationId, supabase]);

  useEffect(() => {
    loadSubmissions();
  }, [loadSubmissions]);

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const submission of submissions) {
      counts[submission.status] = (counts[submission.status] ?? 0) + 1;
    }
    return counts;
  }, [submissions]);

  const formOptions = useMemo(() => {
    const map = new Map<string, string>();
    for (const submission of submissions) {
      const key = submission.formSlug ?? submission.formTitle;
      if (!map.has(key)) {
        map.set(key, submission.formTitle);
      }
    }
    return [...map.entries()].sort((a, b) => a[1].localeCompare(b[1]));
  }, [submissions]);

  const filteredSubmissions = useMemo(() => {
    return submissions.filter((submission) => {
      if (statusFilter !== "all" && submission.status !== statusFilter) {
        return false;
      }
      if (formFilter !== "all") {
        const key = submission.formSlug ?? submission.formTitle;
        if (key !== formFilter) return false;
      }
      return true;
    });
  }, [formFilter, statusFilter, submissions]);

  const selectedSubmission =
    filteredSubmissions.find((row) => row.id === selectedId) ??
    submissions.find((row) => row.id === selectedId) ??
    null;

  const showFeeColumn = submissions.some(
    (row) => row.feeEnabled && row.feeStatus !== "not_required",
  );

  const showPostSubmitColumn = submissions.some((row) => row.hasPostSubmitActions);

  const showEnrollmentColumn = submissions.some((row) => row.enrollmentSummary !== null);

  const applyFormSlug = submissions.find((row) => row.formSlug)?.formSlug ?? null;
  const applyPublicPath = applyFormSlug
    ? publicApplicationFormPath(slug, applyFormSlug)
    : null;

  return (
    <div className="relative flex h-full min-h-0 flex-col">
      <div
        className="flex h-14 flex-shrink-0 items-center justify-between px-4 sm:px-5"
        style={{ borderBottom: `1px solid ${C.border}` }}
      >
        <div>
          <h1 className="text-sm font-semibold" style={{ color: C.textPrimary }}>
            Submissions
          </h1>
          <p className="text-xs" style={{ color: C.textTertiary }}>
            Every application from draft through decision
          </p>
        </div>
        {applyPublicPath ? (
          <a
            href={applyPublicPath}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-sm px-3 py-1.5 text-xs font-semibold"
            style={{ backgroundColor: C.elevated, color: C.textSecondary }}
          >
            Public apply link
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        ) : null}
      </div>

      <div
        className="flex flex-shrink-0 flex-col gap-3 px-4 py-3 sm:px-5"
        style={{ borderBottom: `1px solid ${C.border}` }}
      >
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: C.textQuaternary }}>
            Status
          </span>
          <FilterChip
            active={statusFilter === "all"}
            label="All"
            count={submissions.length}
            onClick={() => setStatusFilter("all")}
            C={C}
          />
          {APPLICATION_STATUS_FILTER_ORDER.filter((status) => statusCounts[status]).map(
            (status) => (
              <FilterChip
                key={status}
                active={statusFilter === status}
                label={applicationStatusLabel(status)}
                count={statusCounts[status]}
                onClick={() => setStatusFilter(status)}
                C={C}
              />
            ),
          )}
        </div>

        {formOptions.length > 1 ? (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: C.textQuaternary }}>
              Form
            </span>
            <FilterChip
              active={formFilter === "all"}
              label="All forms"
              onClick={() => setFormFilter("all")}
              C={C}
            />
            {formOptions.map(([key, title]) => (
              <FilterChip
                key={key}
                active={formFilter === key}
                label={title}
                onClick={() => setFormFilter(key)}
                C={C}
              />
            ))}
          </div>
        ) : null}
      </div>

      <div className="relative min-h-0 flex-1 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-5 w-5 animate-spin" style={{ color: C.textTertiary }} />
          </div>
        ) : error ? (
          <p className="px-4 py-8 text-sm sm:px-5" style={{ color: C.error }}>
            {error}
          </p>
        ) : submissions.length === 0 ? (
          <div className="px-4 py-10 sm:px-5">
            <p className="text-sm leading-relaxed" style={{ color: C.textSecondary }}>
              No applications yet. Publish an enrollment flow and share your public apply link
              with families.
            </p>
            <Link
              href={flowsPath}
              className="mt-3 inline-block text-sm font-medium underline-offset-2 hover:underline"
              style={{ color: C.accent }}
            >
              Go to Enrollment Flows
            </Link>
          </div>
        ) : filteredSubmissions.length === 0 ? (
          <p className="px-4 py-8 text-sm sm:px-5" style={{ color: C.textSecondary }}>
            No submissions match the current filters.
          </p>
        ) : (
          <div className="h-full overflow-auto">
            <table className="w-full min-w-[1020px] border-collapse text-left text-sm">
              <thead
                className="sticky top-0 z-[1]"
                style={{ backgroundColor: C.bg, borderBottom: `1px solid ${C.border}` }}
              >
                <tr>
                  {[
                    "Form",
                    "Contact",
                    "Student",
                    "Status",
                    ...(showEnrollmentColumn ? ["Enrollment"] : []),
                    ...(showPostSubmitColumn ? ["Post-submit"] : []),
                    "Progress",
                    ...(showFeeColumn ? ["Fee"] : []),
                    "Updated",
                  ].map((heading) => (
                    <th
                      key={heading}
                      className="px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wide sm:px-5"
                      style={{ color: C.textQuaternary }}
                    >
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredSubmissions.map((submission) => {
                  const isSelected = submission.id === selectedId;
                  const statusStyle = applicationStatusBadgeStyle(submission.status, C);

                  return (
                    <tr
                      key={submission.id}
                      onClick={() =>
                        setSelectedId((prev) =>
                          prev === submission.id ? null : submission.id,
                        )
                      }
                      className="cursor-pointer transition-colors"
                      style={{
                        backgroundColor: isSelected ? C.accentLight : "transparent",
                        borderBottom: `1px solid ${C.border}`,
                      }}
                    >
                      <td className="px-4 py-3 sm:px-5" style={{ color: C.textPrimary }}>
                        <div className="font-medium">{submission.formTitle}</div>
                        {submission.programName ? (
                          <div className="mt-0.5 text-xs" style={{ color: C.textTertiary }}>
                            {submission.programName}
                          </div>
                        ) : null}
                      </td>
                      <td className="px-4 py-3 sm:px-5" style={{ color: C.textSecondary }}>
                        {submission.contactEmail ?? "—"}
                      </td>
                      <td className="px-4 py-3 sm:px-5" style={{ color: C.textSecondary }}>
                        {submission.studentLabel ?? "—"}
                      </td>
                      <td className="px-4 py-3 sm:px-5">
                        <span
                          className="inline-flex rounded-full px-2 py-0.5 text-xs font-medium"
                          style={statusStyle}
                        >
                          {applicationStatusLabel(submission.status)}
                        </span>
                      </td>
                      {showEnrollmentColumn ? (
                        <td className="px-4 py-3 sm:px-5">
                          {submission.enrollmentSummary ? (
                            <span
                              className="inline-flex rounded-full px-2 py-0.5 text-xs font-medium"
                              style={enrollmentProgressBadgeStyle(
                                submission.enrollmentSummary.tone,
                                C,
                              )}
                              title={submission.enrollmentSummary.label}
                            >
                              {submission.enrollmentSummary.label}
                            </span>
                          ) : (
                            <span style={{ color: C.textTertiary }}>—</span>
                          )}
                        </td>
                      ) : null}
                      {showPostSubmitColumn ? (
                        <td className="px-4 py-3 sm:px-5">
                          {submission.postSubmitSummary ? (
                            <span
                              className="inline-flex max-w-[12rem] truncate rounded-full px-2 py-0.5 text-xs font-medium"
                              style={postSubmitSummaryBadgeStyle(
                                submission.postSubmitSummary.tone,
                                C,
                              )}
                              title={submission.postSubmitSummary.label}
                            >
                              {submission.postSubmitSummary.label}
                            </span>
                          ) : (
                            <span style={{ color: C.textTertiary }}>—</span>
                          )}
                        </td>
                      ) : null}
                      <td className="px-4 py-3 sm:px-5" style={{ color: C.textSecondary }}>
                        {formatSubmissionProgress(submission)}
                      </td>
                      {showFeeColumn ? (
                        <td className="px-4 py-3 sm:px-5" style={{ color: C.textSecondary }}>
                          {submission.feeEnabled && submission.feeStatus !== "not_required"
                            ? FEE_STATUS_LABELS[submission.feeStatus] ?? submission.feeStatus
                            : "—"}
                        </td>
                      ) : null}
                      <td className="px-4 py-3 sm:px-5" style={{ color: C.textSecondary }}>
                        {formatShortDate(submission.updatedAt)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

      </div>

      <AnimatePresence>
        {selectedSubmission ? (
          <ApplicationSubmissionDetailPanel
            key={selectedSubmission.id}
            submission={selectedSubmission}
            organizationId={organizationId}
            branding={branding}
            schoolName={schoolName}
            schoolSlug={slug}
            onClose={() => setSelectedId(null)}
            onSubmissionUpdated={loadSubmissions}
          />
        ) : null}
      </AnimatePresence>
    </div>
  );
}
