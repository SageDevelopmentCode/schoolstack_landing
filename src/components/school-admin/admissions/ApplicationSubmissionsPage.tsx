"use client";

import { useCallback, useEffect, useMemo, useState, type CSSProperties } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { AnimatePresence } from "framer-motion";
import { ExternalLink } from "lucide-react";
import ParentPortalLoginBadge from "@/components/admissions/ParentPortalLoginBadge";
import { SchoolAdminTableSkeleton } from "@/components/school-admin/skeletons";
import ApplicationSubmissionDetailPanel from "./ApplicationSubmissionDetailPanel";
import SubmissionFeeBadges from "./SubmissionFeeBadges";
import {
  applicationStatusBadgeStyle,
  adminApplicationStatusLabel,
  APPLICATION_STATUS_FILTER_ORDER,
  APPLICATION_STATUSES_EXCLUDED_FROM_DEFAULT_ALL,
} from "@/lib/admissions/application-status-ui";
import { submissionHasFeeBadges } from "@/lib/admissions/admin-submission-fee-badges";
import { enrollmentProgressBadgeStyle } from "@/lib/admissions/admin-enrollment-progress";
import { postSubmitSummaryBadgeStyle } from "@/lib/admissions/admin-post-submit-steps";
import {
  formatShortDate,
  formatSubmissionProgress,
  listOrgApplicationSubmissions,
  type AdminApplicationSubmission,
} from "@/lib/admissions/application-submissions";
import { publicApplicationFormPath } from "@/lib/admissions/application-forms";
import type { ParentPortalLoginStatus } from "@/lib/admissions/parent-portal-login-status";
import { schoolAdminPath } from "@/lib/organization-settings/admin-routes";
import {
  buildAdminThemeTokens,
  type AdminThemeTokens,
} from "@/lib/organization-settings/theme";
import { getAdminButtonStyle } from "@/lib/organization-settings/admin-button-styles";
import type { OrganizationBranding } from "@/lib/organization-settings/types";
import { createClient } from "@/utils/supabase/client";

type ApplicationSubmissionsPageProps = {
  organizationId: string;
  branding: OrganizationBranding;
  schoolName: string;
  slug: string;
  initialSubmissions?: AdminApplicationSubmission[];
  initialLoginStatusByGuardianId?: Record<string, ParentPortalLoginStatus>;
};

const SUBMISSIONS_PAGE_SIZE = 50;

type StatusFilter = "all" | string;
type FormFilter = "all" | string;

function columnDividerStyle(C: AdminThemeTokens, isLast: boolean): CSSProperties {
  return isLast ? {} : { borderRight: `1px solid ${C.border}` };
}

function submissionColumnHeaderBadgeStyle(
  heading: string,
  C: AdminThemeTokens,
): CSSProperties {
  switch (heading) {
    case "Status":
      return { backgroundColor: C.accentLight, color: C.accent };
    case "Enrollment":
      return { backgroundColor: C.infoBg, color: C.info };
    case "Post-submit":
      return { backgroundColor: C.successBg, color: C.success };
    case "Fee":
    case "Fees":
      return { backgroundColor: C.warningBg, color: C.warning };
    case "Parent sign-in":
      return { backgroundColor: C.infoBg, color: C.info };
    default:
      return {
        backgroundColor: C.bg,
        color: C.textTertiary,
        border: `1px solid ${C.border}`,
      };
  }
}

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
      style={
        active ? getAdminButtonStyle(C, "secondary") : getAdminButtonStyle(C, "neutral")
      }
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
  initialSubmissions,
  initialLoginStatusByGuardianId,
}: ApplicationSubmissionsPageProps) {
  const C = useMemo(() => buildAdminThemeTokens(branding), [branding]);
  const supabase = useMemo(() => createClient(), []);
  const searchParams = useSearchParams();
  const deepLinkApplicationId = searchParams.get("application");
  const hasInitialData = initialSubmissions !== undefined;

  const [submissions, setSubmissions] = useState<AdminApplicationSubmission[]>(
    initialSubmissions ?? [],
  );
  const [loginStatusByGuardianId, setLoginStatusByGuardianId] = useState<
    Record<string, ParentPortalLoginStatus>
  >(initialLoginStatusByGuardianId ?? {});
  const [loading, setLoading] = useState(!hasInitialData);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [formFilter, setFormFilter] = useState<FormFilter>("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState(SUBMISSIONS_PAGE_SIZE);

  function changeStatusFilter(next: StatusFilter) {
    setStatusFilter(next);
    setVisibleCount(SUBMISSIONS_PAGE_SIZE);
  }

  function changeFormFilter(next: FormFilter) {
    setFormFilter(next);
    setVisibleCount(SUBMISSIONS_PAGE_SIZE);
  }

  const flowsPath = schoolAdminPath(slug, "admissions", "flows");

  const loadLoginStatus = useCallback(async () => {
    try {
      const loginResponse = await fetch(
        `/api/admissions/organizations/${organizationId}/parent-login-status`,
      );
      if (!loginResponse.ok) {
        setLoginStatusByGuardianId({});
        return;
      }
      const loginBody = (await loginResponse.json()) as {
        statuses?: ParentPortalLoginStatus[];
      };
      setLoginStatusByGuardianId(
        Object.fromEntries(
          (loginBody.statuses ?? []).map((status) => [status.guardianId, status]),
        ),
      );
    } catch {
      setLoginStatusByGuardianId({});
    }
  }, [organizationId]);

  const loadSubmissions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [rows] = await Promise.all([
        listOrgApplicationSubmissions(supabase, organizationId, { limit: 500 }),
        loadLoginStatus(),
      ]);

      setSubmissions(rows);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load submissions.");
      setLoginStatusByGuardianId({});
    } finally {
      setLoading(false);
    }
  }, [loadLoginStatus, organizationId, supabase]);

  useEffect(() => {
    if (hasInitialData) {
      // Defer Auth Admin fan-out so SSR TTFB stays lean.
      queueMicrotask(() => {
        void loadLoginStatus();
      });
      return;
    }
    queueMicrotask(() => {
      void loadSubmissions();
    });
  }, [hasInitialData, loadLoginStatus, loadSubmissions]);

  useEffect(() => {
    if (!deepLinkApplicationId || loading) return;
    const match = submissions.find((row) => row.id === deepLinkApplicationId);
    if (match) {
      queueMicrotask(() => {
        if (match.status === "withdrawn") {
          setStatusFilter("withdrawn");
        }
        setSelectedId(match.id);
      });
    }
  }, [deepLinkApplicationId, loading, submissions]);

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const submission of submissions) {
      counts[submission.status] = (counts[submission.status] ?? 0) + 1;
    }
    return counts;
  }, [submissions]);

  const activeSubmissionsCount = useMemo(
    () =>
      submissions.filter(
        (submission) =>
          !APPLICATION_STATUSES_EXCLUDED_FROM_DEFAULT_ALL.some(
            (excluded) => excluded === submission.status,
          ),
      ).length,
    [submissions],
  );

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
      if (statusFilter === "all") {
        if (
          APPLICATION_STATUSES_EXCLUDED_FROM_DEFAULT_ALL.some(
            (excluded) => excluded === submission.status,
          )
        ) {
          return false;
        }
      } else if (submission.status !== statusFilter) {
        return false;
      }
      if (formFilter !== "all") {
        const key = submission.formSlug ?? submission.formTitle;
        if (key !== formFilter) return false;
      }
      return true;
    });
  }, [formFilter, statusFilter, submissions]);

  const visibleSubmissions = useMemo(
    () => filteredSubmissions.slice(0, visibleCount),
    [filteredSubmissions, visibleCount],
  );

  const hasMoreSubmissions = visibleSubmissions.length < filteredSubmissions.length;

  const selectedSubmission =
    filteredSubmissions.find((row) => row.id === selectedId) ??
    submissions.find((row) => row.id === selectedId) ??
    null;

  const showFormColumn = formOptions.length > 1;

  const showFeesColumn = submissions.some((row) => submissionHasFeeBadges(row));

  const showPostSubmitColumn = submissions.some((row) => row.hasPostSubmitActions);

  const showEnrollmentColumn = submissions.some((row) => row.enrollmentSummary !== null);

  const tableColumnCount =
    (showFormColumn ? 1 : 0) +
    4 +
    (showEnrollmentColumn ? 1 : 0) +
    (showPostSubmitColumn ? 1 : 0) +
    (showFeesColumn ? 1 : 0) +
    2;

  const tableMinWidth = showFormColumn ? "min-w-[1020px]" : "min-w-[940px]";

  const applyFormSlug = submissions.find((row) => row.formSlug)?.formSlug ?? null;
  const applyPublicPath = applyFormSlug
    ? publicApplicationFormPath(slug, applyFormSlug)
    : null;

  return (
    <div
      className="relative flex h-full min-h-0 flex-col"
      style={{ backgroundColor: C.surface }}
    >
      <div
        className="flex flex-shrink-0 flex-col gap-3 px-4 py-3 sm:px-5"
        style={{ borderBottom: `1px solid ${C.border}` }}
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: C.accentDark }}>
              Status
            </span>
            <FilterChip
              active={statusFilter === "all"}
              label="All"
              count={activeSubmissionsCount}
              onClick={() => changeStatusFilter("all")}
              C={C}
            />
            {APPLICATION_STATUS_FILTER_ORDER.filter((status) => statusCounts[status]).map(
              (status) => (
                <FilterChip
                  key={status}
                  active={statusFilter === status}
                  label={adminApplicationStatusLabel(status)}
                  count={statusCounts[status]}
                  onClick={() => changeStatusFilter(status)}
                  C={C}
                />
              ),
            )}
          </div>
          {applyPublicPath ? (
            <a
              href={applyPublicPath}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-sm px-3 py-1.5 text-xs font-semibold text-white transition-colors"
              style={{ backgroundColor: C.accent, boxShadow: C.shadowCard }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = C.accentDark;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = C.accent;
              }}
            >
              Public apply link
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          ) : null}
        </div>

        {formOptions.length > 1 ? (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: C.accentDark }}>
              Form
            </span>
            <FilterChip
              active={formFilter === "all"}
              label="All forms"
              onClick={() => changeFormFilter("all")}
              C={C}
            />
            {formOptions.map(([key, title]) => (
              <FilterChip
                key={key}
                active={formFilter === key}
                label={title}
                onClick={() => changeFormFilter(key)}
                C={C}
              />
            ))}
          </div>
        ) : null}
      </div>

      <div className="relative min-h-0 flex-1 overflow-hidden">
        {loading ? (
          <SchoolAdminTableSkeleton
            C={C}
            rows={8}
            columns={tableColumnCount}
            showFilters={false}
            label="Loading submissions"
          />
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
          <div className="h-full overflow-auto" style={{ backgroundColor: C.surface }}>
            <table className={`w-full ${tableMinWidth} border-collapse text-left text-sm`}>
              <thead
                className="sticky top-0 z-[1]"
                style={{
                  backgroundColor: C.surface,
                  borderBottom: `2px solid ${C.border}`,
                }}
              >
                <tr>
                  {[
                    ...(showFormColumn ? ["Form"] : []),
                    "Contact",
                    "Student",
                    "Status",
                    ...(showEnrollmentColumn ? ["Enrollment"] : []),
                    ...(showPostSubmitColumn ? ["Post-submit"] : []),
                    "Progress",
                    ...(showFeesColumn ? ["Fees"] : []),
                    "Parent sign-in",
                    "Updated",
                  ].map((heading, index, headings) => {
                    const isLast = index === headings.length - 1;
                    return (
                      <th
                        key={heading}
                        className="px-3 py-2.5 sm:px-4"
                        style={columnDividerStyle(C, isLast)}
                      >
                        <span
                          className="inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide"
                          style={submissionColumnHeaderBadgeStyle(heading, C)}
                        >
                          {heading}
                        </span>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {visibleSubmissions.map((submission) => {
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
                      onMouseEnter={() => setHoveredId(submission.id)}
                      onMouseLeave={() => setHoveredId(null)}
                      className="cursor-pointer transition-colors"
                      style={{
                        backgroundColor: isSelected
                          ? C.accentLight
                          : hoveredId === submission.id
                            ? C.elevated
                            : C.surface,
                        borderBottom: `1px solid ${C.border}`,
                        borderLeft: `3px solid ${isSelected ? C.accent : "transparent"}`,
                      }}
                    >
                      {showFormColumn ? (
                        <td
                          className="px-3 py-3 sm:px-4"
                          style={{ color: C.textPrimary, ...columnDividerStyle(C, false) }}
                        >
                          <div className="font-medium">{submission.formTitle}</div>
                          {submission.programName ? (
                            <div className="mt-0.5 text-xs" style={{ color: C.textTertiary }}>
                              {submission.programName}
                            </div>
                          ) : null}
                        </td>
                      ) : null}
                      <td
                        className="px-3 py-3 sm:px-4"
                        style={{ color: C.textSecondary, ...columnDividerStyle(C, false) }}
                      >
                        <div className="font-medium" style={{ color: C.textPrimary }}>
                          {submission.guardianName ?? "—"}
                        </div>
                        {submission.contactEmail ? (
                          <div
                            className="mt-0.5 max-w-[14rem] truncate text-xs"
                            style={{ color: C.textTertiary }}
                          >
                            {submission.contactEmail}
                          </div>
                        ) : null}
                      </td>
                      <td
                        className="px-3 py-3 sm:px-4"
                        style={{ color: C.textSecondary, ...columnDividerStyle(C, false) }}
                      >
                        {submission.studentLabel ?? "—"}
                      </td>
                      <td
                        className="px-3 py-3 sm:px-4"
                        style={columnDividerStyle(C, false)}
                      >
                        <span
                          className="inline-flex rounded-full px-2 py-0.5 text-xs font-medium"
                          style={statusStyle}
                        >
                          {adminApplicationStatusLabel(submission.status)}
                        </span>
                      </td>
                      {showEnrollmentColumn ? (
                        <td
                          className="px-3 py-3 sm:px-4"
                          style={columnDividerStyle(C, false)}
                        >
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
                        <td
                          className="px-3 py-3 sm:px-4"
                          style={columnDividerStyle(C, false)}
                        >
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
                      <td
                        className="px-3 py-3 sm:px-4"
                        style={{ color: C.textSecondary, ...columnDividerStyle(C, false) }}
                      >
                        {formatSubmissionProgress(submission)}
                      </td>
                      {showFeesColumn ? (
                        <td
                          className="px-3 py-3 sm:px-4"
                          style={columnDividerStyle(C, false)}
                        >
                          <SubmissionFeeBadges submission={submission} C={C} />
                        </td>
                      ) : null}
                      <td
                        className="px-3 py-3 sm:px-4"
                        style={columnDividerStyle(C, false)}
                      >
                        <ParentPortalLoginBadge
                          C={C}
                          compact
                          status={
                            submission.primaryGuardianId
                              ? loginStatusByGuardianId[submission.primaryGuardianId]
                              : null
                          }
                        />
                      </td>
                      <td
                        className="px-3 py-3 sm:px-4"
                        style={{ color: C.textSecondary, ...columnDividerStyle(C, true) }}
                      >
                        {formatShortDate(submission.updatedAt)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {hasMoreSubmissions ? (
              <div className="flex justify-center border-t px-4 py-3 sm:px-5" style={{ borderColor: C.border }}>
                <button
                  type="button"
                  onClick={() =>
                    setVisibleCount((count) => count + SUBMISSIONS_PAGE_SIZE)
                  }
                  className="text-xs font-medium underline-offset-2 hover:underline"
                  style={{ color: C.accent }}
                >
                  Show more ({filteredSubmissions.length - visibleSubmissions.length} remaining)
                </button>
              </div>
            ) : null}
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
            onSelectSubmission={setSelectedId}
          />
        ) : null}
      </AnimatePresence>
    </div>
  );
}
