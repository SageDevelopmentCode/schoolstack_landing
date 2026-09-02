"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ExternalLink, Loader2 } from "lucide-react";
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
import { SubmissionsPageContext } from "./submissions-page-context";
import {
  adminApplicationStatusLabel,
  applicationStatusChipTone,
  applicationSubmissionRowStyle,
  APPLICATION_STATUS_FILTER_ORDER,
} from "@/lib/admissions/application-status-ui";
import { submissionHasFeeBadges } from "@/lib/admissions/admin-submission-fee-badges";
import { enrollmentProgressBadgeStyle } from "@/lib/admissions/admin-enrollment-progress";
import { postSubmitSummaryBadgeStyle } from "@/lib/admissions/admin-post-submit-steps";
import {
  formatShortDate,
  type AdminApplicationSubmission,
  type ApplicationSubmissionEnrichmentPatch,
} from "@/lib/admissions/application-submissions";
import { publicApplicationFormPath } from "@/lib/admissions/application-forms";
import type { ParentPortalLoginStatus } from "@/lib/admissions/parent-portal-login-status";
import type { ApplicationSubmissionsApiResponse } from "@/app/api/school-admin/admissions/submissions/route";
import type { ApplicationSubmissionsPageMeta } from "@/lib/school-admin/load-submissions-page-data";
import type { ApplicationSubmissionsTableData } from "@/lib/school-admin/load-submissions-table-data";
import { schoolAdminPath } from "@/lib/organization-settings/admin-routes";
import type { OrganizationBranding } from "@/lib/organization-settings/types";

type ApplicationSubmissionsPageShellProps = {
  organizationId: string;
  branding: OrganizationBranding;
  schoolName: string;
  slug: string;
  initialMeta: ApplicationSubmissionsPageMeta;
  initialTableData?: ApplicationSubmissionsTableData;
  initialLoginStatusByGuardianId?: Record<string, ParentPortalLoginStatus>;
  children?: ReactNode;
};

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

function mergeEnrichment(
  submissions: AdminApplicationSubmission[],
  enrichment: Record<string, ApplicationSubmissionEnrichmentPatch>,
): AdminApplicationSubmission[] {
  if (Object.keys(enrichment).length === 0) return submissions;

  return submissions.map((submission) => {
    const patch = enrichment[submission.id];
    if (!patch) return submission;
    return { ...submission, ...patch };
  });
}

function visibleGuardianIds(submissions: AdminApplicationSubmission[]): string[] {
  return [
    ...new Set(
      submissions
        .map((submission) => submission.primaryGuardianId)
        .filter((id): id is string => Boolean(id)),
    ),
  ].slice(0, 50);
}

export default function ApplicationSubmissionsPageShell({
  organizationId,
  branding,
  schoolName,
  slug,
  initialMeta,
  initialTableData,
  initialLoginStatusByGuardianId,
  children,
}: ApplicationSubmissionsPageShellProps) {
  const { theme, C } = useSchoolAdminStoryTheme();
  const searchParams = useSearchParams();
  const deepLinkApplicationId = searchParams.get("application");
  const hasInitialTable = initialTableData !== undefined;

  const [submissions, setSubmissions] = useState<AdminApplicationSubmission[]>(
    initialTableData?.submissions ?? [],
  );
  const [totalCount, setTotalCount] = useState(initialTableData?.totalCount ?? 0);
  const [statusCounts, setStatusCounts] = useState<Record<string, number>>(
    initialMeta.statusCounts,
  );
  const [activeSubmissionsCount, setActiveSubmissionsCount] = useState(
    initialMeta.activeSubmissionsCount,
  );
  const [latestSubmitted, setLatestSubmitted] = useState(initialMeta.latestSubmitted);
  const [formOptions, setFormOptions] = useState(initialMeta.formOptions);
  const [pageSize, setPageSize] = useState(
    initialTableData?.pageSize ?? 50,
  );
  const [loginStatusByGuardianId, setLoginStatusByGuardianId] = useState<
    Record<string, ParentPortalLoginStatus>
  >(initialLoginStatusByGuardianId ?? {});
  const [loginStatusLoading, setLoginStatusLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(!hasInitialTable);
  const [isRefetching, setIsRefetching] = useState(false);
  const [enrichmentLoading, setEnrichmentLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [formFilter, setFormFilter] = useState<FormFilter>("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [tableReady, setTableReady] = useState(hasInitialTable);
  const submissionsLengthRef = useRef(submissions.length);
  submissionsLengthRef.current = submissions.length;
  const enrichedIdsRef = useRef(new Set<string>());

  const flowsPath = schoolAdminPath(slug, "admissions", "flows");
  const showMetrics = activeSubmissionsCount > 0 || totalCount > 0 || Object.keys(statusCounts).length > 0;

  const loadEnrichment = useCallback(
    async (rows: AdminApplicationSubmission[]) => {
      const pendingIds = rows
        .map((row) => row.id)
        .filter((id) => !enrichedIdsRef.current.has(id));
      if (pendingIds.length === 0) return;

      setEnrichmentLoading(true);
      try {
        const response = await fetch(
          "/api/school-admin/admissions/submissions/enrichment",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              organizationId,
              applicationIds: pendingIds,
            }),
          },
        );
        if (!response.ok) return;

        const body = (await response.json()) as {
          enrichment?: Record<string, ApplicationSubmissionEnrichmentPatch>;
        };
        const enrichment = body.enrichment ?? {};
        for (const id of Object.keys(enrichment)) {
          enrichedIdsRef.current.add(id);
        }
        setSubmissions((prev) => mergeEnrichment(prev, enrichment));
      } catch {
        // Keep lean rows when enrichment fails.
      } finally {
        setEnrichmentLoading(false);
      }
    },
    [organizationId],
  );

  const loadLoginStatus = useCallback(
    async (rows: AdminApplicationSubmission[]) => {
      const guardianIds = visibleGuardianIds(rows);
      if (guardianIds.length === 0) {
        setLoginStatusByGuardianId({});
        return;
      }

      setLoginStatusLoading(true);
      try {
        const params = new URLSearchParams({
          guardianIds: guardianIds.join(","),
        });
        const loginResponse = await fetch(
          `/api/admissions/organizations/${organizationId}/parent-login-status?${params.toString()}`,
        );
        if (!loginResponse.ok) {
          setLoginStatusByGuardianId({});
          return;
        }
        const loginBody = (await loginResponse.json()) as {
          statuses?: ParentPortalLoginStatus[];
        };
        setLoginStatusByGuardianId((prev) => ({
          ...prev,
          ...Object.fromEntries(
            (loginBody.statuses ?? []).map((status) => [status.guardianId, status]),
          ),
        }));
      } catch {
        setLoginStatusByGuardianId({});
      } finally {
        setLoginStatusLoading(false);
      }
    },
    [organizationId],
  );

  const applyTableData = useCallback(
    (tableData: ApplicationSubmissionsTableData, { append = false } = {}) => {
      setSubmissions((prev) => {
        const next = append ? [...prev, ...tableData.submissions] : tableData.submissions;
        queueMicrotask(() => {
          void loadEnrichment(append ? tableData.submissions : next);
          void loadLoginStatus(append ? tableData.submissions : next);
        });
        return next;
      });
      setTotalCount(tableData.totalCount);
      setPageSize(tableData.pageSize);
      setTableReady(true);
      setInitialLoading(false);
    },
    [loadEnrichment, loadLoginStatus],
  );

  const hydrateTable = useCallback(
    (tableData: ApplicationSubmissionsTableData) => {
      applyTableData(tableData);
    },
    [applyTableData],
  );

  const fetchSubmissionsPage = useCallback(
    async ({
      offset,
      append,
      includeMeta,
    }: {
      offset: number;
      append: boolean;
      includeMeta?: boolean;
    }) => {
      const params = new URLSearchParams({
        organizationId,
        offset: String(offset),
        limit: String(pageSize),
        status: statusFilter,
        formKey: formFilter,
      });
      if (includeMeta) {
        params.set("includeMeta", "1");
      }

      const response = await fetch(
        `/api/school-admin/admissions/submissions?${params.toString()}`,
      );
      if (!response.ok) {
        throw new Error("Failed to load submissions.");
      }

      const body = (await response.json()) as ApplicationSubmissionsApiResponse;

      if (body.meta) {
        setStatusCounts(body.meta.statusCounts);
        setActiveSubmissionsCount(body.meta.activeSubmissionsCount);
        setLatestSubmitted(body.meta.latestSubmitted);
        setFormOptions(body.meta.formOptions);
      }

      if (append) {
        setSubmissions((prev) => [...prev, ...body.submissions]);
        setTotalCount(body.totalCount);
        setPageSize(body.pageSize);
        void loadEnrichment(body.submissions);
        void loadLoginStatus(body.submissions);
      } else {
        enrichedIdsRef.current = new Set();
        applyTableData({
          submissions: body.submissions,
          totalCount: body.totalCount,
          pageSize: body.pageSize,
        });
      }
    },
    [applyTableData, formFilter, loadEnrichment, loadLoginStatus, organizationId, pageSize, statusFilter],
  );

  const loadSubmissions = useCallback(
    async ({
      append = false,
      offset,
    }: { append?: boolean; offset?: number } = {}) => {
      const requestOffset = offset ?? (append ? submissionsLengthRef.current : 0);

      if (append) {
        setLoadingMore(true);
      } else if (tableReady) {
        setIsRefetching(true);
      } else {
        setInitialLoading(true);
      }
      setError(null);

      try {
        await fetchSubmissionsPage({
          offset: requestOffset,
          append,
          includeMeta: !append,
        });
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to load submissions.";
        if (!append && !tableReady) {
          setError(message);
          setLoginStatusByGuardianId({});
        }
      } finally {
        setInitialLoading(false);
        setIsRefetching(false);
        setLoadingMore(false);
      }
    },
    [fetchSubmissionsPage, tableReady],
  );

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

  function changeStatusFilter(next: StatusFilter) {
    setStatusFilter(next);
    setSelectedId(null);
  }

  function changeFormFilter(next: FormFilter) {
    setFormFilter(next);
    setSelectedId(null);
  }

  const skipFilterFetchRef = useRef(true);

  useEffect(() => {
    if (hasInitialTable) {
      queueMicrotask(() => {
        void loadEnrichment(initialTableData.submissions);
        void loadLoginStatus(initialTableData.submissions);
      });
    }
  }, [hasInitialTable, initialTableData, loadEnrichment, loadLoginStatus]);

  useEffect(() => {
    if (skipFilterFetchRef.current) {
      skipFilterFetchRef.current = false;
      return;
    }
    queueMicrotask(() => {
      void loadSubmissions({ offset: 0 });
    });
  }, [formFilter, loadSubmissions, statusFilter]);

  useEffect(() => {
    if (!deepLinkApplicationId || initialLoading) return;
    const match = submissions.find((row) => row.id === deepLinkApplicationId);
    if (match) {
      queueMicrotask(() => {
        if (match.status === "withdrawn") {
          setStatusFilter("withdrawn");
        }
        setSelectedId(match.id);
      });
    }
  }, [deepLinkApplicationId, initialLoading, submissions]);

  const draftCount = statusCounts.draft ?? 0;
  const submittedCount = statusCounts.submitted ?? 0;
  const enrolledCount = statusCounts.enrolled ?? 0;

  const selectedSubmission =
    submissions.find((row) => row.id === selectedId) ?? null;

  const hasMoreSubmissions = submissions.length < totalCount;

  const showFormColumn = formOptions.length > 1;
  const showFeesColumn = submissions.some((row) => submissionHasFeeBadges(row));
  const showPostSubmitColumn =
    enrichmentLoading || submissions.some((row) => row.hasPostSubmitActions);
  const showEnrollmentColumn =
    enrichmentLoading || submissions.some((row) => row.enrollmentSummary !== null);

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

  const applyFormSlug = useMemo(() => {
    const withSlug = formOptions.find((option) => option.key.includes("-"));
    return withSlug?.key ?? formOptions[0]?.key ?? null;
  }, [formOptions]);

  const applyPublicPath = applyFormSlug
    ? publicApplicationFormPath(slug, applyFormSlug)
    : null;

  const hasAnyApplications =
    activeSubmissionsCount + (statusCounts.withdrawn ?? 0) > 0;

  const showEmptyFilteredState =
    tableReady &&
    !initialLoading &&
    submissions.length === 0 &&
    totalCount === 0 &&
    hasAnyApplications &&
    (statusFilter !== "all" || formFilter !== "all");

  const tableFallback = (
    <>
      {initialLoading ? (
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
      ) : showEmptyFilteredState ? (
        <AdminCard theme={theme} padding="canvas">
          <p className="text-sm" style={{ color: theme.muted }}>
            No submissions match the current filters.
          </p>
        </AdminCard>
      ) : totalCount === 0 ? (
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
      ) : null}
    </>
  );

  const tableCardContent = (
    <AdminCard theme={theme} padding="none" className="relative overflow-hidden">
      {isRefetching ? (
        <div
          className="pointer-events-none absolute inset-0 z-10 flex items-start justify-center bg-white/55 pt-16"
          aria-hidden="true"
        >
          <Loader2
            className="h-5 w-5 animate-spin"
            style={{ color: theme.primary }}
          />
        </div>
      ) : null}
      <div
        className="overflow-x-auto transition-opacity duration-200"
        style={{ opacity: isRefetching ? 0.55 : 1 }}
      >
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
          <motion.tbody
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            {submissions.map((submission) => {
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
                      loginStatusLoading={loginStatusLoading}
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
                      {enrichmentLoading && !submission.enrollmentSummary ? (
                        <span
                          className="inline-block h-4 w-16 animate-pulse rounded-full"
                          style={{ backgroundColor: "#EDF1ED" }}
                        />
                      ) : submission.enrollmentSummary ? (
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
                      {enrichmentLoading && !submission.postSubmitSummary ? (
                        <span
                          className="inline-block h-4 w-20 animate-pulse rounded-full"
                          style={{ backgroundColor: "#EDF1ED" }}
                        />
                      ) : submission.postSubmitSummary ? (
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
          </motion.tbody>
        </table>
      </div>
      {hasMoreSubmissions ? (
        <div
          className="flex justify-center border-t px-4 py-3"
          style={{ borderColor: "#EDF1ED" }}
        >
          <button
            type="button"
            disabled={loadingMore}
            onClick={() => void loadSubmissions({ append: true })}
            className="text-[11px] font-extrabold disabled:opacity-60"
            style={{ color: theme.primary }}
          >
            {loadingMore
              ? "Loading more..."
              : `Show more (${totalCount - submissions.length} remaining) →`}
          </button>
        </div>
      ) : null}
    </AdminCard>
  );

  const tableSection =
    error && !tableReady ? (
      <AdminCard theme={theme} padding="canvas">
        <p className="text-sm" style={{ color: C.error }}>
          {error}
        </p>
      </AdminCard>
    ) : tableReady && showEmptyFilteredState ? (
      <AdminCard theme={theme} padding="canvas">
        <p className="text-sm" style={{ color: theme.muted }}>
          No submissions match the current filters.
        </p>
      </AdminCard>
    ) : tableReady && totalCount === 0 ? (
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
    ) : tableReady ? (
      tableCardContent
    ) : children == null ? (
      tableFallback
    ) : null;

  return (
    <SubmissionsPageContext.Provider value={{ hydrateTable }}>
      <div className="relative flex h-full min-h-0 flex-col">
        <div className="min-h-0 flex-1 overflow-y-auto">
          <div className="mx-auto max-w-[1350px] px-[clamp(25px,4vw,56px)] py-[30px] pb-14">
            {showMetrics ? (
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
                {isRefetching ? (
                  <Loader2
                    className="h-3.5 w-3.5 animate-spin"
                    style={{ color: theme.primary }}
                    aria-label="Updating submissions"
                  />
                ) : null}
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
                {formOptions.map((option) => (
                  <StoryFilterPill
                    key={option.key}
                    active={formFilter === option.key}
                    label={option.title}
                    onClick={() => changeFormFilter(option.key)}
                    theme={theme}
                  />
                ))}
              </div>
            ) : null}

            {children}
            {tableSection}
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
    </SubmissionsPageContext.Provider>
  );
}
