"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { submissionHasFeeBadges } from "@/lib/admissions/admin-submission-fee-badges";
import {
  matchesSubmissionListFilters,
  type AdminApplicationSubmission,
  type ApplicationSubmissionEnrichmentPatch,
} from "@/lib/admissions/application-submissions";
import { canonicalApplyFormPublicPath } from "@/lib/admissions/application-forms";
import type { ParentPortalLoginStatus } from "@/lib/admissions/parent-portal-login-status";
import type { ApplicationSubmissionsApiResponse } from "@/app/api/school-admin/admissions/submissions/route";
import type { ApplicationSubmissionsPageMeta } from "@/lib/school-admin/load-submissions-page-data";
import type { ApplicationSubmissionsTableData } from "@/lib/school-admin/load-submissions-table-data";
import { schoolAdminPath } from "@/lib/organization-settings/admin-routes";
import { reportPortalOperationalError } from "@/lib/portal-operational-errors";
import { adminToast } from "@/lib/school-admin/admin-toast";

/*
 * Submissions view-model: table hydrate, refetch, load more, enrichment,
 * parent login status, filters, selection and the ?application= deep link.
 * The Garden page reads it; logic lives only here.
 */

export type StatusFilter = "all" | string;
type FormFilter = "all" | string;

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


const FLASH_MS = 1600;

export function useApplicationSubmissionsModel({
  organizationId,
  slug,
  initialMeta,
  initialTableData,
  initialLoginStatusByGuardianId,
  hasStreamedTable,
}: {
  organizationId: string;
  slug: string;
  initialMeta: ApplicationSubmissionsPageMeta;
  initialTableData?: ApplicationSubmissionsTableData;
  initialLoginStatusByGuardianId?: Record<string, ParentPortalLoginStatus>;
  /** A Suspense loader will hydrate the table (children of the shell). */
  hasStreamedTable: boolean;
}) {
  const searchParams = useSearchParams();
  const deepLinkApplicationId = searchParams.get("application");
  const hasInitialTable = initialTableData !== undefined;

  const [loadedSubmissions, setLoadedSubmissions] = useState<AdminApplicationSubmission[]>(
    initialTableData?.submissions ?? [],
  );
  const [unfilteredTotalCount, setUnfilteredTotalCount] = useState(
    initialTableData?.totalCount ?? 0,
  );
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
  const [tableReady, setTableReady] = useState(hasInitialTable);
  const [lastUpdatedAt, setLastUpdatedAt] = useState(() => Date.now());
  const [flashId, setFlashId] = useState<string | null>(null);
  const flashTimerRef = useRef<number | null>(null);
  const loadedSubmissionsLengthRef = useRef(loadedSubmissions.length);
  useEffect(() => {
    loadedSubmissionsLengthRef.current = loadedSubmissions.length;
  }, [loadedSubmissions.length]);
  const enrichedIdsRef = useRef(new Set<string>());

  const filteredSubmissions = useMemo(
    () =>
      loadedSubmissions.filter((row) =>
        matchesSubmissionListFilters(row, {
          statusFilter,
          formKey: formFilter,
        }),
      ),
    [formFilter, loadedSubmissions, statusFilter],
  );

  const flowsPath = schoolAdminPath(slug, "admissions", "flows");
  const showMetrics =
    activeSubmissionsCount > 0 ||
    unfilteredTotalCount > 0 ||
    Object.keys(statusCounts).length > 0;

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
        setLoadedSubmissions((prev) => mergeEnrichment(prev, enrichment));
      } catch (err) {
        void reportPortalOperationalError("school_admin", {
          organizationId,
          operation: "admissions.submissions.enrich",
          error: "",
        }, err);
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
      } catch (err) {
        void reportPortalOperationalError("school_admin", {
          organizationId,
          operation: "admissions.submissions.login_status",
          error: "",
        }, err);
        setLoginStatusByGuardianId({});
      } finally {
        setLoginStatusLoading(false);
      }
    },
    [organizationId],
  );

  const applyTableData = useCallback(
    (tableData: ApplicationSubmissionsTableData, { append = false } = {}) => {
      setLoadedSubmissions((prev) => {
        const next = append ? [...prev, ...tableData.submissions] : tableData.submissions;
        queueMicrotask(() => {
          void loadEnrichment(append ? tableData.submissions : next);
          void loadLoginStatus(append ? tableData.submissions : next);
        });
        return next;
      });
      setUnfilteredTotalCount(tableData.totalCount);
      setPageSize(tableData.pageSize);
      setTableReady(true);
      setInitialLoading(false);
      setLastUpdatedAt(Date.now());
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
        status: "all",
        formKey: "all",
      });
      if (includeMeta) {
        params.set("includeMeta", "1");
      }

      const response = await fetch(
        `/api/school-admin/admissions/submissions?${params.toString()}`,
      );
      const body = (await response.json()) as ApplicationSubmissionsApiResponse & {
        error?: string;
        code?: string;
      };
      if (!response.ok) {
        throw Object.assign(
          new Error(body.error?.trim() || "Failed to load submissions."),
          { code: body.code },
        );
      }

      if (body.meta) {
        setStatusCounts(body.meta.statusCounts);
        setActiveSubmissionsCount(body.meta.activeSubmissionsCount);
        setLatestSubmitted(body.meta.latestSubmitted);
        setFormOptions(body.meta.formOptions);
      }

      if (append) {
        setLoadedSubmissions((prev) => [...prev, ...body.submissions]);
        setUnfilteredTotalCount(body.totalCount);
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
    [applyTableData, loadEnrichment, loadLoginStatus, organizationId, pageSize],
  );

  const loadSubmissions = useCallback(
    async ({
      append = false,
      offset,
    }: { append?: boolean; offset?: number } = {}) => {
      const requestOffset = offset ?? (append ? loadedSubmissionsLengthRef.current : 0);

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
        return true;
      } catch (err) {
        void reportPortalOperationalError("school_admin", {
          organizationId,
          operation: "admissions.submissions.load",
          error: "",
        }, err);
        const message = err instanceof Error ? err.message : "Failed to load submissions.";
        if (!append && !tableReady) {
          setError(message);
          setLoginStatusByGuardianId({});
        }
        return false;
      } finally {
        setInitialLoading(false);
        setIsRefetching(false);
        setLoadingMore(false);
      }
    },
    [fetchSubmissionsPage, tableReady],
  );

  const flashRow = useCallback((id: string | null) => {
    if (!id) return;
    setFlashId(id);
    if (flashTimerRef.current) window.clearTimeout(flashTimerRef.current);
    flashTimerRef.current = window.setTimeout(() => setFlashId(null), FLASH_MS);
  }, []);

  useEffect(
    () => () => {
      if (flashTimerRef.current) window.clearTimeout(flashTimerRef.current);
    },
    [],
  );

  const handleSubmissionUpdated = useCallback(
    (update?: { status: AdminApplicationSubmission["status"] }) => {
      flashRow(selectedId);
      if (update && selectedId) {
        setLoadedSubmissions((prev) =>
          prev.map((row) =>
            row.id === selectedId ? { ...row, status: update.status } : row,
          ),
        );
        return;
      }
      void loadSubmissions();
    },
    [flashRow, loadSubmissions, selectedId],
  );

  /** Manual refresh: toasts its result (background refetches stay quiet). */
  const refresh = useCallback(() => {
    const run = async (): Promise<void> => {
      const ok = await loadSubmissions();
      if (ok) {
        adminToast.dismiss("submissions-refresh-error");
        adminToast.success("Submissions refreshed", {
          id: "submissions-refresh",
          description: "You're looking at the latest applications.",
        });
      } else {
        adminToast.error("Couldn't refresh submissions", {
          id: "submissions-refresh-error",
          description: "The list on screen is from your last refresh.",
          action: { label: "Retry", onClick: () => void run() },
        });
      }
    };
    return run();
  }, [loadSubmissions]);

  function changeStatusFilter(next: StatusFilter) {
    setStatusFilter(next);
    setSelectedId(null);
  }

  function changeFormFilter(next: FormFilter) {
    setFormFilter(next);
    setSelectedId(null);
  }

  useEffect(() => {
    if (hasInitialTable) {
      queueMicrotask(() => {
        void loadEnrichment(initialTableData.submissions);
        void loadLoginStatus(initialTableData.submissions);
      });
    }
  }, [hasInitialTable, initialTableData, loadEnrichment, loadLoginStatus]);

  useEffect(() => {
    if (!deepLinkApplicationId || initialLoading) return;
    const match = loadedSubmissions.find((row) => row.id === deepLinkApplicationId);
    if (match) {
      queueMicrotask(() => {
        if (match.status === "withdrawn") {
          setStatusFilter("withdrawn");
        }
        setSelectedId(match.id);
      });
    }
  }, [deepLinkApplicationId, initialLoading, loadedSubmissions]);

  const draftCount = statusCounts.draft ?? 0;
  const submittedCount = statusCounts.submitted ?? 0;
  const enrolledCount = statusCounts.enrolled ?? 0;

  const selectedSubmission =
    filteredSubmissions.find((row) => row.id === selectedId) ??
    loadedSubmissions.find((row) => row.id === selectedId) ??
    null;

  const hasMoreSubmissions = loadedSubmissions.length < unfilteredTotalCount;

  const showFormColumn = formOptions.length > 1;
  const showFeesColumn = loadedSubmissions.some((row) => submissionHasFeeBadges(row));
  const showPostSubmitColumn =
    enrichmentLoading || loadedSubmissions.some((row) => row.hasPostSubmitActions);
  const showEnrollmentColumn =
    enrichmentLoading || loadedSubmissions.some((row) => row.enrollmentSummary !== null);

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

  const applyPublicPath =
    formOptions.length > 0 ? canonicalApplyFormPublicPath(slug) : null;

  const hasAnyApplications =
    activeSubmissionsCount + (statusCounts.withdrawn ?? 0) > 0;

  const showEmptyFilteredState =
    tableReady &&
    !initialLoading &&
    filteredSubmissions.length === 0 &&
    loadedSubmissions.length > 0 &&
    hasAnyApplications &&
    (statusFilter !== "all" || formFilter !== "all");

  return {
    // data
    loadedSubmissions,
    filteredSubmissions,
    unfilteredTotalCount,
    statusCounts,
    activeSubmissionsCount,
    latestSubmitted,
    formOptions,
    loginStatusByGuardianId,
    loginStatusLoading,
    draftCount,
    submittedCount,
    enrolledCount,
    selectedSubmission,
    // state
    initialLoading,
    isRefetching,
    enrichmentLoading,
    loadingMore,
    error,
    tableReady,
    lastUpdatedAt,
    flashId,
    statusFilter,
    formFilter,
    selectedId,
    setSelectedId,
    // derived layout
    flowsPath,
    showMetrics,
    hasMoreSubmissions,
    showFormColumn,
    showFeesColumn,
    showPostSubmitColumn,
    showEnrollmentColumn,
    tableColumnCount,
    tableMinWidth,
    tableHeadings,
    applyPublicPath,
    showEmptyFilteredState,
    hasStreamedTable,
    // actions
    hydrateTable,
    loadSubmissions,
    refresh,
    loadMore: () => void loadSubmissions({ append: true }),
    retry: () => void loadSubmissions(),
    handleSubmissionUpdated,
    changeStatusFilter,
    changeFormFilter,
  };
}

export type ApplicationSubmissionsModel = ReturnType<typeof useApplicationSubmissionsModel>;
