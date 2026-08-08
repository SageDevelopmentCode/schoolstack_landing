"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { PerformanceCategoryDrawer } from "@/components/admin/PerformanceCategoryDrawer";
import { PerformanceDetailDrawer } from "@/components/admin/PerformanceDetailDrawer";
import {
  PerformanceRunProgressBanner,
  sleep,
  type BulkRunProgress,
} from "@/components/admin/PerformanceRunProgressBanner";
import type { PerformanceResultDetail } from "@/components/admin/PerformanceResultsPanel";
import { AdminPageState } from "@/components/admin/ui/AdminPageState";
import ButtonLoadingLabel from "@/components/ui/ButtonLoadingLabel";
import {
  performanceScoreClassName,
  statusBadgeClassName,
} from "@/lib/performance/score-styles";
import {
  BULK_AUDIT_FORM_FACTORS,
  PERFORMANCE_PAGE_CATEGORIES,
  type AuditEnvironment,
  type AuditFormFactor,
  type PageCategory,
} from "@/lib/performance/types";
import { CANONICAL_SCHOOL_SLUG } from "@/lib/performance/page-manifest";

type LatestResultSummary = {
  id: string;
  runId: string;
  status: string;
  skipReason: string | null;
  errorMessage: string | null;
  performanceScore: number | null;
  fcpMs: number | null;
  lcpMs: number | null;
  tbtMs: number | null;
  cls: number | null;
  speedIndexMs: number | null;
  createdAt: string;
};

type PerformancePageRow = {
  id: string;
  category: PageCategory;
  label: string;
  path: string;
  requiresAuth: string;
  url: string;
  latestResult: LatestResultSummary | null;
};

const PSI_THROTTLE_MS = 2000;
const LOCAL_POLL_INTERVAL_MS = 2000;

type BulkPassProgress = Pick<
  BulkRunProgress,
  "formFactor" | "formFactorPass" | "formFactorPasses"
>;

function bulkPassProgress(passIndex: number, formFactor: AuditFormFactor): BulkPassProgress {
  return {
    formFactor,
    formFactorPass: passIndex + 1,
    formFactorPasses: BULK_AUDIT_FORM_FACTORS.length,
  };
}

function formatMs(value: number | null) {
  if (value === null || Number.isNaN(value)) return "—";
  if (value >= 1000) return `${(value / 1000).toFixed(1)}s`;
  return `${Math.round(value)}ms`;
}

function formatScore(value: number | null) {
  if (value === null || Number.isNaN(value)) return "—";
  return String(value);
}

function formatCategoryLabel(category: PageCategory) {
  return category.replace(/_/g, " ");
}

function truncateError(message: string, maxLength = 80) {
  if (message.length <= maxLength) return message;
  return `${message.slice(0, maxLength - 1)}…`;
}

function resolveBulkTargets(
  pages: PerformancePageRow[],
  pageIds: string[] | undefined,
  environment: AuditEnvironment,
): PerformancePageRow[] {
  if (pageIds?.length) {
    return pages.filter((page) => pageIds.includes(page.id));
  }

  if (environment === "local") {
    return pages;
  }

  return pages.filter((page) => page.requiresAuth === "none");
}

export default function AdminPerformancePage() {
  const [environment, setEnvironment] = useState<AuditEnvironment>("production");
  const [formFactor, setFormFactor] = useState<AuditFormFactor>("mobile");
  const [selectedCategories, setSelectedCategories] = useState<Set<PageCategory>>(
    () => new Set(),
  );
  const [categoryDrawerOpen, setCategoryDrawerOpen] = useState(false);
  const [pages, setPages] = useState<PerformancePageRow[]>([]);
  const [pendingLocalRuns, setPendingLocalRuns] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [runningPageId, setRunningPageId] = useState<string | null>(null);
  const [runningAll, setRunningAll] = useState(false);
  const [bulkProgress, setBulkProgress] = useState<BulkRunProgress | null>(null);
  const [selectedPageId, setSelectedPageId] = useState<string | null>(null);
  const [selectedDetail, setSelectedDetail] = useState<PerformanceResultDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);
  const selectedPageIdRef = useRef<string | null>(null);

  const closeDetailDrawer = useCallback(() => {
    selectedPageIdRef.current = null;
    setSelectedPageId(null);
    setSelectedDetail(null);
    setDetailLoading(false);
    setDetailError(null);
  }, []);

  const selectedPage = useMemo(() => {
    if (!selectedPageId) return null;
    const page = pages.find((entry) => entry.id === selectedPageId);
    if (!page) return null;
    return {
      label: page.label,
      category: page.category,
      url: page.url,
    };
  }, [pages, selectedPageId]);

  const loadPages = useCallback(async (options?: { silent?: boolean }) => {
    if (!options?.silent) {
      setLoading(true);
      setError(null);
    }

    try {
      const response = await fetch(
        `/api/admin/performance/pages?environment=${environment}&formFactor=${formFactor}`,
      );

      if (!response.ok) {
        let message = "Failed to load performance pages.";
        try {
          const payload = (await response.json()) as { error?: string };
          if (payload.error?.trim()) message = payload.error.trim();
        } catch {
          // ignore
        }
        if (!options?.silent) setError(message);
        return;
      }

      const payload = (await response.json()) as {
        pages?: PerformancePageRow[];
        pendingLocalRuns?: number;
      };

      setPages(payload.pages ?? []);
      setPendingLocalRuns(payload.pendingLocalRuns ?? 0);
    } catch {
      if (!options?.silent) setError("Failed to load performance pages.");
    } finally {
      if (!options?.silent) setLoading(false);
    }
  }, [environment, formFactor]);

  useEffect(() => {
    queueMicrotask(() => {
      void loadPages();
    });
  }, [loadPages]);

  useEffect(() => {
    if (bulkProgress?.status !== "completed") return;

    const timer = setTimeout(() => {
      setBulkProgress(null);
    }, 3000);

    return () => clearTimeout(timer);
  }, [bulkProgress?.status]);

  const categoryCounts = useMemo(() => {
    const counts = Object.fromEntries(
      PERFORMANCE_PAGE_CATEGORIES.map((category) => [category, 0]),
    ) as Record<PageCategory, number>;

    for (const page of pages) {
      counts[page.category] += 1;
    }

    return counts;
  }, [pages]);

  const filteredPages = useMemo(() => {
    if (selectedCategories.size === 0) return pages;
    return pages.filter((page) => selectedCategories.has(page.category));
  }, [pages, selectedCategories]);

  const bulkPageIds = useMemo(() => {
    if (selectedCategories.size === 0) return undefined;
    return filteredPages.map((page) => page.id);
  }, [selectedCategories, filteredPages]);

  const runButtonLabel = useMemo(() => {
    const formFactorSuffix =
      environment === "ci" ? "" : ", mobile + desktop";

    if (selectedCategories.size === 0) {
      return environment === "ci" ? "Run all" : "Run all (mobile + desktop)";
    }
    if (selectedCategories.size === 1) {
      const category = [...selectedCategories][0];
      const count = categoryCounts[category] ?? filteredPages.length;
      return `Run ${formatCategoryLabel(category)} (${count}${formFactorSuffix})`;
    }
    return `Run selected (${filteredPages.length}${formFactorSuffix})`;
  }, [categoryCounts, environment, filteredPages.length, selectedCategories]);

  const canRunBulk =
    selectedCategories.size === 0 || filteredPages.length > 0;

  const showCiDesktopEmptyNote = useMemo(() => {
    if (environment !== "ci" || formFactor !== "desktop") return false;
    return !pages.some((page) => page.latestResult?.status === "success");
  }, [environment, formFactor, pages]);

  const runProductionBulk = useCallback(
    async (
      targets: PerformancePageRow[],
      bulkFormFactor: AuditFormFactor,
      passIndex: number,
    ) => {
      let completed = 0;
      let firstError: string | null = null;
      const passProgress = bulkPassProgress(passIndex, bulkFormFactor);

      setBulkProgress({
        environment: "production",
        status: "running",
        completed: 0,
        total: targets.length,
        ...passProgress,
      });

      for (const [index, target] of targets.entries()) {
        setRunningPageId(target.id);
        setBulkProgress({
          environment: "production",
          status: "running",
          completed,
          total: targets.length,
          currentLabel: target.label,
          ...passProgress,
        });

        try {
          const response = await fetch("/api/admin/performance/run", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              environment: "production",
              pageIds: [target.id],
              formFactor: bulkFormFactor,
            }),
          });

          if (!response.ok) {
            let message = "Audit request failed.";
            try {
              const payload = (await response.json()) as { error?: string };
              if (payload.error?.trim()) message = payload.error.trim();
            } catch {
              // ignore
            }
            if (!firstError) firstError = message;
          }
        } catch {
          if (!firstError) firstError = "Audit request failed.";
        }

        completed += 1;
        setBulkProgress({
          environment: "production",
          status: "running",
          completed,
          total: targets.length,
          currentLabel: target.label,
          ...passProgress,
        });

        await loadPages({ silent: true });

        if (index < targets.length - 1) {
          await sleep(PSI_THROTTLE_MS);
        }
      }

      setBulkProgress({
        environment: "production",
        status: firstError && completed === 0 ? "failed" : "completed",
        completed,
        total: targets.length,
        errorMessage: firstError ?? undefined,
        ...passProgress,
      });
    },
    [loadPages],
  );

  const pollLocalRun = useCallback(
    async (runId: string, total: number, passProgress?: BulkPassProgress) => {
      while (true) {
        const response = await fetch(`/api/admin/performance/runs/${runId}?summary=1`);

        if (!response.ok) {
          setBulkProgress({
            runId,
            environment: "local",
            status: "failed",
            completed: 0,
            total,
            errorMessage: "Failed to load audit run status.",
            ...passProgress,
          });
          return false;
        }

        const payload = (await response.json()) as {
          run?: {
            status?: string;
            completed_count?: number;
            error_message?: string | null;
          };
          results?: Array<{ label?: string }>;
        };

        const run = payload.run;
        const results = payload.results ?? [];
        const lastResult = results[results.length - 1];
        const runStatus = run?.status ?? "pending";

        let progressStatus: BulkRunProgress["status"] = "queued";
        if (runStatus === "running") progressStatus = "running";
        else if (runStatus === "completed") progressStatus = "completed";
        else if (runStatus === "failed") progressStatus = "failed";

        setBulkProgress({
          runId,
          environment: "local",
          status: progressStatus,
          completed: run?.completed_count ?? 0,
          total,
          currentLabel:
            typeof lastResult?.label === "string" ? lastResult.label : undefined,
          errorMessage: run?.error_message ?? undefined,
          ...passProgress,
        });

        await loadPages({ silent: true });

        if (runStatus === "completed") {
          return true;
        }

        if (runStatus === "failed") {
          return false;
        }

        await sleep(LOCAL_POLL_INTERVAL_MS);
      }
    },
    [loadPages],
  );

  const runAudit = useCallback(
    async (pageIds?: string[]) => {
      const isBulkRun = !pageIds?.length || pageIds.length > 1;

      if (isBulkRun) {
        setRunningAll(true);
        try {
          const targets = resolveBulkTargets(pages, pageIds, environment);

          if (!targets.length) {
            alert("No pages selected for audit.");
            return;
          }

          const targetIds = targets.map((target) => target.id);

          if (environment === "production") {
            for (const [passIndex, bulkFormFactor] of BULK_AUDIT_FORM_FACTORS.entries()) {
              await runProductionBulk(targets, bulkFormFactor, passIndex);
            }
          } else {
            for (const [passIndex, bulkFormFactor] of BULK_AUDIT_FORM_FACTORS.entries()) {
              const passProgress = bulkPassProgress(passIndex, bulkFormFactor);

              const response = await fetch("/api/admin/performance/enqueue", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ pageIds: targetIds, formFactor: bulkFormFactor }),
              });

              if (!response.ok) {
                let message = "Failed to enqueue local audit.";
                try {
                  const payload = (await response.json()) as { error?: string };
                  if (payload.error?.trim()) message = payload.error.trim();
                } catch {
                  // ignore
                }
                setBulkProgress({
                  environment: "local",
                  status: "failed",
                  completed: 0,
                  total: targets.length,
                  errorMessage: message,
                  ...passProgress,
                });
                return;
              }

              const payload = (await response.json()) as {
                run?: { id?: string; page_ids?: string[] };
              };
              const runId = payload.run?.id;
              const total = payload.run?.page_ids?.length ?? targets.length;

              if (!runId) {
                setBulkProgress({
                  environment: "local",
                  status: "failed",
                  completed: 0,
                  total,
                  errorMessage: "Enqueue succeeded but no run id was returned.",
                  ...passProgress,
                });
                return;
              }

              setBulkProgress({
                runId,
                environment: "local",
                status: "queued",
                completed: 0,
                total,
                ...passProgress,
              });

              const succeeded = await pollLocalRun(runId, total, passProgress);
              if (!succeeded) {
                return;
              }
            }
          }

          await loadPages({ silent: true });
        } finally {
          setRunningAll(false);
          setRunningPageId(null);
        }
        return;
      }

      setRunningPageId(pageIds[0]);

      try {
        const endpoint =
          environment === "production"
            ? "/api/admin/performance/run"
            : "/api/admin/performance/enqueue";

        const response = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            environment,
            pageIds,
            formFactor,
          }),
        });

        if (!response.ok) {
          let message = "Audit request failed.";
          try {
            const payload = (await response.json()) as { error?: string };
            if (payload.error?.trim()) message = payload.error.trim();
          } catch {
            // ignore
          }
          alert(message);
          return;
        }

        if (environment === "production") {
          const payload = (await response.json()) as {
            results?: Array<Record<string, unknown>>;
          };
          const first = payload.results?.[0];
          if (first) {
            const detail = mapResultRow(first);
            selectedPageIdRef.current = detail.pageId;
            setSelectedPageId(detail.pageId);
            setSelectedDetail(detail);
            setDetailError(null);
          }
        } else {
          const payload = (await response.json()) as {
            run?: { id?: string; page_ids?: string[] };
          };
          const runId = payload.run?.id;
          const total = payload.run?.page_ids?.length ?? 1;

          if (runId) {
            setBulkProgress({
              runId,
              environment: "local",
              status: "queued",
              completed: 0,
              total,
            });
            await pollLocalRun(runId, total);
          }
        }

        await loadPages({ silent: true });
      } finally {
        setRunningPageId(null);
      }
    },
    [environment, formFactor, loadPages, pages, pollLocalRun, runProductionBulk],
  );

  const viewLatestResult = useCallback(async (page: PerformancePageRow) => {
    const latest = page.latestResult;
    if (!latest) return;

    const pageId = page.id;
    selectedPageIdRef.current = pageId;
    setSelectedPageId(pageId);
    setSelectedDetail(null);
    setDetailError(null);
    setDetailLoading(true);

    try {
      const response = await fetch(
        `/api/admin/performance/runs/${latest.runId}?resultId=${latest.id}`,
      );
      if (!response.ok) {
        if (selectedPageIdRef.current !== pageId) return;
        setDetailError("Failed to load audit details.");
        return;
      }

      const payload = (await response.json()) as {
        results?: Array<Record<string, unknown>>;
      };

      if (selectedPageIdRef.current !== pageId) return;

      const match = (payload.results ?? []).find(
        (row) => row.page_id === page.id || row.id === latest.id,
      );

      if (match) {
        setSelectedDetail(mapResultRow(match));
      } else {
        setDetailError("Audit result not found for this page.");
      }
    } catch {
      if (selectedPageIdRef.current !== pageId) return;
      setDetailError("Failed to load audit details.");
    } finally {
      if (selectedPageIdRef.current === pageId) {
        setDetailLoading(false);
      }
    }
  }, []);

  if (loading) return <AdminPageState variant="loading" />;
  if (error) return <AdminPageState variant="error" message={error} />;

  return (
    <div className="flex h-[calc(100vh-3rem)] flex-col overflow-hidden">
      <div className="flex flex-wrap items-center gap-3 border-b border-admin-border bg-admin-surface px-4 py-3">
        <div className="flex items-center gap-1 rounded-admin-md border border-admin-border p-1">
          {(["production", "local", "ci"] as const).map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setEnvironment(value)}
              className={`rounded-admin-sm px-3 py-1.5 text-sm uppercase transition-colors ${
                environment === value
                  ? "bg-admin-accent-soft text-admin-accent font-medium"
                  : "text-admin-muted hover:text-admin-text"
              }`}
            >
              {value}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1 rounded-admin-md border border-admin-border p-1">
          {(["mobile", "desktop"] as const).map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setFormFactor(value)}
              className={`rounded-admin-sm px-3 py-1.5 text-sm capitalize transition-colors ${
                formFactor === value
                  ? "bg-admin-accent-soft text-admin-accent font-medium"
                  : "text-admin-muted hover:text-admin-text"
              }`}
            >
              {value}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={() => setCategoryDrawerOpen(true)}
          className={`rounded-admin-md border px-3 py-2 text-sm transition-colors ${
            selectedCategories.size > 0
              ? "border-admin-accent/40 bg-admin-accent-soft text-admin-accent font-medium"
              : "border-admin-border bg-admin-bg text-admin-text hover:bg-admin-neutral-bg"
          }`}
        >
          Categories
          {selectedCategories.size > 0 ? ` · ${selectedCategories.size}` : ""}
        </button>

        <button
          type="button"
          disabled={environment === "ci" || runningAll || !canRunBulk}
          onClick={() => void runAudit(bulkPageIds)}
          className="rounded-admin-md bg-admin-accent px-3 py-2 text-sm font-medium text-white hover:bg-admin-accent-hover disabled:opacity-60"
        >
          <ButtonLoadingLabel loading={runningAll} loadingLabel="Running…">
            {runButtonLabel}
          </ButtonLoadingLabel>
        </button>

        <span className="rounded-admin-md border border-admin-border bg-admin-bg px-2.5 py-1 text-xs text-admin-muted">
          {environment === "ci"
            ? "GitHub Actions PR audits"
            : environment === "local"
              ? pendingLocalRuns > 0
                ? `${pendingLocalRuns} pending local run${pendingLocalRuns === 1 ? "" : "s"}`
                : "Runner idle"
              : "PSI synchronous"}
        </span>

        {environment === "ci" ? (
          <p className="w-full text-xs text-admin-faint">
            CI results are uploaded automatically from pull request Lighthouse runs
            (mobile and desktop). Marketing and admissions pages are public; school
            admin and parent portal pages are audited with E2E session cookies (not
            login redirects) for {CANONICAL_SCHOOL_SLUG}.
            {showCiDesktopEmptyNote
              ? " Desktop CI data will appear after the next PR Lighthouse run."
              : null}
          </p>
        ) : environment === "local" ? (
          <p className="w-full text-xs text-admin-faint">
            Auth-gated school pages use E2E session cookies. Run{" "}
            <code className="rounded bg-admin-bg px-1 py-0.5">npm run performance:ci:prepare</code>{" "}
            once (with local Supabase + dev server) before auditing admin/parent routes
            locally.
          </p>
        ) : null}
      </div>

      <PerformanceCategoryDrawer
        open={categoryDrawerOpen}
        onClose={() => setCategoryDrawerOpen(false)}
        categories={PERFORMANCE_PAGE_CATEGORIES}
        categoryCounts={categoryCounts}
        selected={selectedCategories}
        onChange={setSelectedCategories}
        environment={environment}
      />

      {bulkProgress ? (
        <PerformanceRunProgressBanner
          progress={bulkProgress}
          onDismiss={() => setBulkProgress(null)}
        />
      ) : null}

      <div className="flex min-h-0 flex-1 overflow-hidden">
        <div className="min-w-0 flex-1 overflow-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="sticky top-0 z-10 border-b border-admin-border bg-admin-surface text-xs uppercase tracking-wide text-admin-faint">
              <tr>
                <th className="px-4 py-3 font-medium">Page</th>
                <th className="px-4 py-3 font-medium">Category</th>
                <th className="px-4 py-3 font-medium">Score</th>
                <th className="px-4 py-3 font-medium">LCP</th>
                <th className="px-4 py-3 font-medium">FCP</th>
                <th className="px-4 py-3 font-medium">TBT</th>
                <th className="px-4 py-3 font-medium">Last run</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPages.map((page) => {
                const latest = page.latestResult;
                const isRunning = runningPageId === page.id;
                const isSelected = selectedPageId === page.id;
                const canView = Boolean(latest);

                return (
                  <tr
                    key={page.id}
                    onClick={() => {
                      if (canView) void viewLatestResult(page);
                    }}
                    className={`border-b border-admin-border transition-colors ${
                      isRunning
                        ? "bg-admin-accent-soft/60"
                        : isSelected
                          ? "bg-admin-accent-soft/40"
                          : canView
                            ? "cursor-pointer hover:bg-admin-bg/50"
                            : "hover:bg-admin-bg/50"
                    }`}
                  >
                    <td className="px-4 py-3">
                      <div className="font-medium text-admin-text">{page.label}</div>
                      <div className="max-w-xs truncate text-xs text-admin-faint">
                        {page.url}
                      </div>
                    </td>
                    <td className="px-4 py-3 capitalize text-admin-muted">
                      {page.category.replace(/_/g, " ")}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`font-semibold tabular-nums ${performanceScoreClassName(latest?.performanceScore ?? null)}`}
                      >
                        {formatScore(latest?.performanceScore ?? null)}
                      </span>
                    </td>
                    <td className="px-4 py-3">{formatMs(latest?.lcpMs ?? null)}</td>
                    <td className="px-4 py-3">{formatMs(latest?.fcpMs ?? null)}</td>
                    <td className="px-4 py-3">{formatMs(latest?.tbtMs ?? null)}</td>
                    <td className="px-4 py-3 text-admin-muted">
                      {latest ? new Date(latest.createdAt).toLocaleString() : "—"}
                    </td>
                    <td className="px-4 py-3 text-admin-muted">
                      {latest ? (
                        <div className="space-y-1">
                          <span
                            className={`inline-flex rounded-admin-md border px-2 py-0.5 text-xs font-medium capitalize ${statusBadgeClassName(latest.status)}`}
                          >
                            {latest.status}
                          </span>
                          {latest.skipReason ? (
                            <div className="text-xs text-admin-faint">
                              {latest.skipReason.replace(/_/g, " ")}
                            </div>
                          ) : null}
                          {latest.status === "failed" && latest.errorMessage ? (
                            <div
                              className="text-xs text-admin-accent"
                              title={latest.errorMessage}
                            >
                              {truncateError(latest.errorMessage)}
                            </div>
                          ) : null}
                        </div>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="px-4 py-3" onClick={(event) => event.stopPropagation()}>
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          disabled={environment === "ci" || isRunning || runningAll}
                          onClick={() => void runAudit([page.id])}
                          className="rounded-admin-sm border border-admin-border px-2 py-1 text-xs hover:bg-admin-neutral-bg disabled:opacity-60"
                        >
                          <ButtonLoadingLabel loading={isRunning} loadingLabel="…">
                            Run
                          </ButtonLoadingLabel>
                        </button>
                        <button
                          type="button"
                          disabled={!latest}
                          onClick={() => void viewLatestResult(page)}
                          className="rounded-admin-sm border border-admin-border px-2 py-1 text-xs hover:bg-admin-neutral-bg disabled:opacity-60"
                        >
                          View
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <PerformanceDetailDrawer
        open={selectedPageId !== null}
        loading={detailLoading}
        error={detailError}
        preview={selectedPage}
        result={selectedDetail}
        onClose={closeDetailDrawer}
      />
    </div>
  );
}

function mapResultRow(row: Record<string, unknown>): PerformanceResultDetail {
  return {
    id: String(row.id),
    runId: String(row.run_id),
    pageId: String(row.page_id),
    label: String(row.label),
    category: String(row.category),
    url: String(row.url),
    status: String(row.status),
    skipReason: typeof row.skip_reason === "string" ? row.skip_reason : null,
    performanceScore:
      typeof row.performance_score === "number" ? row.performance_score : null,
    fcpMs: typeof row.fcp_ms === "number" ? row.fcp_ms : null,
    lcpMs: typeof row.lcp_ms === "number" ? row.lcp_ms : null,
    tbtMs: typeof row.tbt_ms === "number" ? row.tbt_ms : null,
    cls: typeof row.cls === "number" ? row.cls : null,
    speedIndexMs:
      typeof row.speed_index_ms === "number" ? row.speed_index_ms : null,
    totalByteWeight:
      typeof row.total_byte_weight === "number" ? row.total_byte_weight : null,
    opportunities: Array.isArray(row.opportunities)
      ? (row.opportunities as PerformanceResultDetail["opportunities"])
      : [],
    errorMessage:
      typeof row.error_message === "string" ? row.error_message : null,
    createdAt: String(row.created_at),
    rawReport: row.raw_report,
  };
}
