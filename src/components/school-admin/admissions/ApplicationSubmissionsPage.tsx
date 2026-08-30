"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { AnimatePresence } from "framer-motion";
import { ExternalLink } from "lucide-react";
import { SchoolAdminTableSkeleton } from "@/components/school-admin/skeletons";
import { useSchoolAdminStoryTheme } from "@/components/school-admin/SchoolAdminStoryShell";
import AdminButton from "@/components/school-admin/ui/story/AdminButton";
import AdminCard from "@/components/school-admin/ui/story/AdminCard";
import AdminChip from "@/components/school-admin/ui/story/AdminChip";
import AdminMetricCard from "@/components/school-admin/ui/story/AdminMetricCard";
import ApplicationSubmissionDetailPanel from "./ApplicationSubmissionDetailPanel";
import SubmissionContactCell from "./SubmissionContactCell";
import SubmissionFeeBadges from "./SubmissionFeeBadges";
import SubmissionNextStepCell from "./SubmissionNextStepCell";
import SubmissionProgressCell from "./SubmissionProgressCell";
import {
  adminApplicationStatusLabel,
  applicationStatusChipTone,
  applicationSubmissionRowStyle,
  APPLICATION_STATUS_FILTER_ORDER,
  APPLICATION_STATUSES_EXCLUDED_FROM_DEFAULT_ALL,
} from "@/lib/admissions/application-status-ui";
import { submissionHasFeeBadges } from "@/lib/admissions/admin-submission-fee-badges";
import { enrollmentProgressBadgeStyle } from "@/lib/admissions/admin-enrollment-progress";
import { postSubmitSummaryBadgeStyle } from "@/lib/admissions/admin-post-submit-steps";
import {
  formatShortDate,
  listOrgApplicationSubmissions,
  type AdminApplicationSubmission,
} from "@/lib/admissions/application-submissions";
import { publicApplicationFormPath } from "@/lib/admissions/application-forms";
import type { ParentPortalLoginStatus } from "@/lib/admissions/parent-portal-login-status";
import { schoolAdminPath } from "@/lib/organization-settings/admin-routes";
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

function StoryFilterPill({
  active,
  label,
  count,
  onClick,
  theme,
}: {
  active: boolean;
  label: string;
  count?: number;
  onClick: () => void;
  theme: ReturnType<typeof useSchoolAdminStoryTheme>["theme"];
}) {
  const displayLabel = count != null ? `${label} · ${count}` : label;

  return (
    <button
      type="button"
      onClick={onClick}
      className="cursor-pointer rounded-[9px] border px-2.5 py-2 text-[11px] font-medium transition-colors"
      style={
        active
          ? {
              backgroundColor: "#E9F2EA",
              color: theme.primary,
              borderColor: "#BCD4C1",
              fontWeight: 700,
            }
          : {
              backgroundColor: theme.white,
              color: "#5D6D73",
              borderColor: "#DCE4DC",
            }
      }
    >
      {displayLabel}
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
  const { theme, C } = useSchoolAdminStoryTheme();
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

  const handleSubmissionUpdated = useCallback(
    (update?: { status: AdminApplicationSubmission["status"] }) => {
      if (update && selectedId) {
        setSubmissions((prev) =>
          prev.map((row) =>
            row.id === selectedId ? { ...row, status: update.status } : row,
          ),
        );
        return;
      }
      void loadSubmissions();
    },
    [loadSubmissions, selectedId],
  );

  useEffect(() => {
    if (hasInitialData) {
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

  const draftCount = statusCounts.draft ?? 0;
  const submittedCount = statusCounts.submitted ?? 0;
  const enrolledCount = statusCounts.enrolled ?? 0;

  const latestSubmitted = useMemo(
    () => submissions.find((row) => row.status === "submitted") ?? null,
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
    5 +
    (showEnrollmentColumn ? 1 : 0) +
    (showPostSubmitColumn ? 1 : 0) +
    (showFeesColumn ? 1 : 0);

  const tableMinWidth = showFormColumn ? "min-w-[980px]" : "min-w-[900px]";

  const tableHeadings = [
    ...(showFormColumn ? ["Form"] : []),
    "Contact",
    "Student",
    "Status",
    ...(showEnrollmentColumn ? ["Enrollment"] : []),
    ...(showPostSubmitColumn ? ["Post-submit"] : []),
    "Progress",
    "Next step",
    ...(showFeesColumn ? ["Fees"] : []),
  ];

  const applyFormSlug = submissions.find((row) => row.formSlug)?.formSlug ?? null;
  const applyPublicPath = applyFormSlug
    ? publicApplicationFormPath(slug, applyFormSlug)
    : null;

  return (
    <div className="relative flex h-full min-h-0 flex-col">
      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto max-w-[1350px] px-[clamp(25px,4vw,56px)] py-[30px] pb-14">
          {!loading && submissions.length > 0 ? (
            <>
              <div className="mb-[19px] grid grid-cols-1 gap-[13px] sm:grid-cols-2 xl:grid-cols-4">
                <AdminMetricCard
                  theme={theme}
                  value={String(activeSubmissionsCount)}
                  label="All applications"
                  accent="forest"
                />
                <AdminMetricCard
                  theme={theme}
                  value={String(draftCount)}
                  label="In progress"
                  accent="sky"
                />
                <AdminMetricCard
                  theme={theme}
                  value={String(submittedCount)}
                  label="Ready to review"
                  accent="gold"
                />
                <AdminMetricCard
                  theme={theme}
                  value={String(enrolledCount)}
                  label="Enrolled learners"
                  accent="berry"
                />
              </div>

              {latestSubmitted ? (
                <div
                  className="mb-[15px] flex flex-col items-start justify-between gap-3 rounded-[12px] border px-4 py-3.5 sm:flex-row sm:items-center"
                  style={{
                    backgroundColor: "#EAF4EB",
                    borderColor: "#C7DFCB",
                    color: "#42694F",
                  }}
                >
                  <span className="text-xs">
                    <b>Needs attention:</b>{" "}
                    {latestSubmitted.guardianName ?? "A family"}&apos;s completed application
                    is ready for your review
                    {latestSubmitted.submittedAt
                      ? ` · Submitted ${formatShortDate(latestSubmitted.submittedAt)}`
                      : ""}
                    .
                  </span>
                  <AdminButton
                    theme={theme}
                    variant="soft"
                    onClick={() => setSelectedId(latestSubmitted.id)}
                  >
                    Review {latestSubmitted.guardianName?.split(" ")[0] ?? "family"} →
                  </AdminButton>
                </div>
              ) : null}
            </>
          ) : null}

          <div className="mb-[15px] flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <StoryFilterPill
                active={statusFilter === "all"}
                label="All"
                count={activeSubmissionsCount}
                onClick={() => changeStatusFilter("all")}
                theme={theme}
              />
              {APPLICATION_STATUS_FILTER_ORDER.filter((status) => statusCounts[status]).map(
                (status) => (
                  <StoryFilterPill
                    key={status}
                    active={statusFilter === status}
                    label={adminApplicationStatusLabel(status)}
                    count={statusCounts[status]}
                    onClick={() => changeStatusFilter(status)}
                    theme={theme}
                  />
                ),
              )}
            </div>
            {applyPublicPath ? (
              <a
                href={applyPublicPath}
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0"
              >
                <AdminButton theme={theme} variant="primary">
                  Public apply link
                  <ExternalLink className="h-3.5 w-3.5" />
                </AdminButton>
              </a>
            ) : null}
          </div>

          {formOptions.length > 1 ? (
            <div className="mb-[15px] flex flex-wrap items-center gap-2">
              <StoryFilterPill
                active={formFilter === "all"}
                label="All forms"
                onClick={() => changeFormFilter("all")}
                theme={theme}
              />
              {formOptions.map(([key, title]) => (
                <StoryFilterPill
                  key={key}
                  active={formFilter === key}
                  label={title}
                  onClick={() => changeFormFilter(key)}
                  theme={theme}
                />
              ))}
            </div>
          ) : null}

          {loading ? (
            <AdminCard theme={theme} padding="none">
              <SchoolAdminTableSkeleton
                C={C}
                rows={8}
                columns={tableColumnCount}
                showFilters={false}
                label="Loading submissions"
              />
            </AdminCard>
          ) : error ? (
            <AdminCard theme={theme} padding="canvas">
              <p className="text-sm" style={{ color: C.error }}>
                {error}
              </p>
            </AdminCard>
          ) : submissions.length === 0 ? (
            <AdminCard theme={theme} padding="canvas">
              <p className="text-sm leading-relaxed" style={{ color: theme.muted }}>
                No applications yet. Publish an enrollment flow and share your public apply
                link with families.
              </p>
              <Link
                href={flowsPath}
                className="mt-3 inline-block text-sm font-extrabold"
                style={{ color: theme.primary }}
              >
                Go to Enrollment Flows →
              </Link>
            </AdminCard>
          ) : filteredSubmissions.length === 0 ? (
            <AdminCard theme={theme} padding="canvas">
              <p className="text-sm" style={{ color: theme.muted }}>
                No submissions match the current filters.
              </p>
            </AdminCard>
          ) : (
            <AdminCard theme={theme} padding="none" className="overflow-hidden">
              <div className="overflow-x-auto">
                <table className={`w-full ${tableMinWidth} border-collapse text-left`}>
                  <thead style={{ backgroundColor: "#FBFCFB" }}>
                    <tr>
                      {tableHeadings.map((heading) => (
                        <th
                          key={heading}
                          className="px-[15px] py-2.5 text-left text-[10px] font-extrabold uppercase tracking-[0.08em]"
                          style={{ color: "#8B9699" }}
                        >
                          {heading}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {visibleSubmissions.map((submission) => {
                      const isSelected = submission.id === selectedId;
                      const isHovered = hoveredId === submission.id;
                      const rowStyle = applicationSubmissionRowStyle(submission.status, C, {
                        isSelected,
                        isHovered,
                      });

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
                            ...rowStyle,
                            borderTop: "1px solid #EDF1ED",
                          }}
                        >
                          {showFormColumn ? (
                            <td className="px-[15px] py-3">
                              <div className="text-xs font-semibold" style={{ color: theme.ink }}>
                                {submission.formTitle}
                              </div>
                              {submission.programName ? (
                                <div className="mt-0.5 text-[11px]" style={{ color: theme.muted }}>
                                  {submission.programName}
                                </div>
                              ) : null}
                            </td>
                          ) : null}
                          <td className="px-[15px] py-3">
                            <SubmissionContactCell
                              guardianName={submission.guardianName}
                              contactEmail={submission.contactEmail}
                              primaryGuardianId={submission.primaryGuardianId}
                              loginStatusByGuardianId={loginStatusByGuardianId}
                              C={C}
                              theme={theme}
                            />
                          </td>
                          <td
                            className="px-[15px] py-3 text-xs"
                            style={{ color: "#607078" }}
                          >
                            {submission.studentLabel ?? "—"}
                          </td>
                          <td className="px-[15px] py-3">
                            <AdminChip
                              theme={theme}
                              tone={applicationStatusChipTone(submission.status)}
                            >
                              {adminApplicationStatusLabel(submission.status)}
                            </AdminChip>
                          </td>
                          {showEnrollmentColumn ? (
                            <td className="px-[15px] py-3">
                              {submission.enrollmentSummary ? (
                                <span
                                  className="inline-flex rounded-full px-2 py-0.5 text-[10px] font-extrabold"
                                  style={enrollmentProgressBadgeStyle(
                                    submission.enrollmentSummary.tone,
                                    C,
                                  )}
                                  title={submission.enrollmentSummary.label}
                                >
                                  {submission.enrollmentSummary.label}
                                </span>
                              ) : (
                                <span style={{ color: theme.muted }}>—</span>
                              )}
                            </td>
                          ) : null}
                          {showPostSubmitColumn ? (
                            <td className="px-[15px] py-3">
                              {submission.postSubmitSummary ? (
                                <span
                                  className="inline-flex max-w-[12rem] truncate rounded-full px-2 py-0.5 text-[10px] font-extrabold"
                                  style={postSubmitSummaryBadgeStyle(
                                    submission.postSubmitSummary.tone,
                                    C,
                                  )}
                                  title={submission.postSubmitSummary.label}
                                >
                                  {submission.postSubmitSummary.label}
                                </span>
                              ) : (
                                <span style={{ color: theme.muted }}>—</span>
                              )}
                            </td>
                          ) : null}
                          <td className="px-[15px] py-3">
                            <SubmissionProgressCell submission={submission} theme={theme} />
                          </td>
                          <td className="px-[15px] py-3">
                            <SubmissionNextStepCell submission={submission} theme={theme} />
                          </td>
                          {showFeesColumn ? (
                            <td className="px-[15px] py-3">
                              <SubmissionFeeBadges submission={submission} C={C} />
                            </td>
                          ) : null}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              {hasMoreSubmissions ? (
                <div
                  className="flex justify-center border-t px-4 py-3"
                  style={{ borderColor: "#EDF1ED" }}
                >
                  <button
                    type="button"
                    onClick={() =>
                      setVisibleCount((count) => count + SUBMISSIONS_PAGE_SIZE)
                    }
                    className="text-[11px] font-extrabold"
                    style={{ color: theme.primary }}
                  >
                    Show more ({filteredSubmissions.length - visibleSubmissions.length}{" "}
                    remaining) →
                  </button>
                </div>
              ) : null}
            </AdminCard>
          )}
        </div>
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
            onSubmissionUpdated={handleSubmissionUpdated}
            onSelectSubmission={setSelectedId}
          />
        ) : null}
      </AnimatePresence>
    </div>
  );
}
