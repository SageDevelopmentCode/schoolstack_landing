"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { PerformanceCategoryDrawer } from "@/components/admin/PerformanceCategoryDrawer";
import { PerformanceDetailDrawer } from "@/components/admin/PerformanceDetailDrawer";
import {
  PerformanceRunProgressBanner,
  sleep,
  type BulkRunProgress,
} from "@/components/admin/PerformanceRunProgressBanner";
import type { PerformanceResultDetail } from "@/components/admin/PerformanceResultsPanel";
import ButtonLoadingLabel from "@/components/ui/ButtonLoadingLabel";
import {
  performanceScoreClassName,
  statusBadgeClassName,
} from "@/lib/performance/score-styles";
import {
  PERFORMANCE_PAGE_CATEGORIES,
  type AuditEnvironment,
  type AuditFormFactor,
  type PageCategory,
} from "@/lib/performance/types";

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
  pageIds?: string[],
): PerformancePageRow[] {
  if (pageIds?.length) {
    return pages.filter((page) => pageIds.includes(page.id));
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
  const [selectedDetail, setSelectedDetail] = useState<PerformanceResultDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const loadPages = useCallback(async (options?: { silent?: boolean }) => {
    if (!options?.silent) {
      setLoading(true);
      setError(null);
    }

    try {
      const response = await fetch(
        `/api/admin/performance/pages?environment=${environment}`,
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
  }, [environment]);

  useEffect(() => {
    void loadPages();
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
    if (selectedCategories.size === 0) return "Run all";
    if (selectedCategories.size === 1) {
      const category = [...selectedCategories][0];
      const count = categoryCounts[category] ?? filteredPages.length;
      return `Run ${formatCategoryLabel(category)} (${count})`;
    }
    return `Run selected (${filteredPages.length})`;
  }, [categoryCounts, filteredPages.length, selectedCategories]);

  const canRunBulk =
    selectedCategories.size === 0 || filteredPages.length > 0;

  const runProductionBulk = useCallback(
    async (targets: PerformancePageRow[]) => {
      let completed = 0;
      let firstError: string | null = null;

      setBulkProgress({
        environment: "production",
        status: "running",
        completed: 0,
        total: targets.length,
      });

      for (const [index, target] of targets.entries()) {
        setRunningPageId(target.id);
        setBulkProgress({
          environment: "production",
          status: "running",
          completed,
          total: targets.length,
          currentLabel: target.label,
        });

        try {
          const response = await fetch("/api/admin/performance/run", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              environment: "production",
              pageIds: [target.id],
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
      });
    },
    [formFactor, loadPages],
  );

  const pollLocalRun = useCallback(
    async (runId: string, total: number) => {
      while (true) {
        const response = await fetch(`/api/admin/performance/runs/${runId}`);

        if (!response.ok) {
          setBulkProgress({
            runId,
            environment: "local",
            status: "failed",
            completed: 0,
            total,
            errorMessage: "Failed to load audit run status.",
          });
          return;
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
        });

        await loadPages({ silent: true });

        if (runStatus === "completed" || runStatus === "failed") {
          return;
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
          const targets = resolveBulkTargets(pages, pageIds);

          if (!targets.length) {
            alert("No pages selected for audit.");
            return;
          }

          if (environment === "production") {
            await runProductionBulk(targets);
          } else {
            const response = await fetch("/api/admin/performance/enqueue", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ pageIds, formFactor }),
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
              });
              return;
            }

            setBulkProgress({
              runId,
              environment: "local",
              status: "queued",
              completed: 0,
              total,
            });

            await pollLocalRun(runId, total);
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
            setSelectedDetail(mapResultRow(first));
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

    setDetailLoading(true);
    try {
      const response = await fetch(`/api/admin/performance/runs/${latest.runId}`);
      if (!response.ok) {
        alert("Failed to load audit details.");
        return;
      }

      const payload = (await response.json()) as {
        results?: Array<Record<string, unknown>>;
      };

      const match = (payload.results ?? []).find(
        (row) => row.page_id === page.id || row.id === latest.id,
      );

      if (match) {
        setSelectedDetail(mapResultRow(match));
      }
    } finally {
      setDetailLoading(false);
    }
  }, []);

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-3rem)] items-center justify-center text-sm font-secondary text-text-faint">
        Loading…
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-[calc(100vh-3rem)] items-center justify-center text-sm font-secondary text-clay">
        {error}
      </div>
    );
  }

  return (
    <div
      className="flex h-[calc(100vh-3rem)] flex-col overflow-hidden"
      style={{ fontFamily: "var(--font-poppins), Poppins, sans-serif" }}
    >
      <div className="flex flex-wrap items-center gap-3 border-b border-border bg-surface px-4 py-3">
        <div className="flex items-center gap-1 rounded-lg border border-border p-1">
          {(["production", "local"] as const).map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setEnvironment(value)}
              className={`rounded-md px-3 py-1.5 text-sm capitalize transition-colors ${
                environment === value
                  ? "bg-clay-soft text-clay font-medium"
                  : "text-text-muted hover:text-text"
              }`}
            >
              {value}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1 rounded-lg border border-border p-1">
          {(["mobile", "desktop"] as const).map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setFormFactor(value)}
              className={`rounded-md px-3 py-1.5 text-sm capitalize transition-colors ${
                formFactor === value
                  ? "bg-clay-soft text-clay font-medium"
                  : "text-text-muted hover:text-text"
              }`}
            >
              {value}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={() => setCategoryDrawerOpen(true)}
          className={`rounded-lg border px-3 py-2 text-sm transition-colors ${
            selectedCategories.size > 0
              ? "border-clay/40 bg-clay-soft text-clay font-medium"
              : "border-border bg-bg text-text hover:bg-surface-soft"
          }`}
        >
          Categories
          {selectedCategories.size > 0 ? ` · ${selectedCategories.size}` : ""}
        </button>

        <button
          type="button"
          disabled={runningAll || !canRunBulk}
          onClick={() => void runAudit(bulkPageIds)}
          className="rounded-lg bg-clay px-3 py-2 text-sm font-medium text-white hover:bg-clay/90 disabled:opacity-60"
        >
          <ButtonLoadingLabel loading={runningAll} loadingLabel="Running…">
            {runButtonLabel}
          </ButtonLoadingLabel>
        </button>

        <span className="rounded-full border border-border bg-bg px-2.5 py-1 text-xs text-text-muted">
          {environment === "local"
            ? pendingLocalRuns > 0
              ? `${pendingLocalRuns} pending local run${pendingLocalRuns === 1 ? "" : "s"}`
              : "Runner idle"
            : "PSI synchronous"}
        </span>

        {environment === "local" ? (
          <p className="w-full text-xs text-text-faint">
            Auth-gated school pages audit the login screen locally until Phase 2 adds
            Playwright login.
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
            <thead className="sticky top-0 z-10 border-b border-border bg-surface text-xs uppercase tracking-wide text-text-faint">
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
                const isSelected = selectedDetail?.pageId === page.id;
                const canView = Boolean(latest);

                return (
                  <tr
                    key={page.id}
                    onClick={() => {
                      if (canView) void viewLatestResult(page);
                    }}
                    className={`border-b border-border transition-colors ${
                      isRunning
                        ? "bg-clay-soft/60"
                        : isSelected
                          ? "bg-clay-soft/40"
                          : canView
                            ? "cursor-pointer hover:bg-bg/50"
                            : "hover:bg-bg/50"
                    }`}
                  >
                    <td className="px-4 py-3">
                      <div className="font-medium text-text">{page.label}</div>
                      <div className="max-w-xs truncate text-xs text-text-faint">
                        {page.url}
                      </div>
                    </td>
                    <td className="px-4 py-3 capitalize text-text-muted">
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
                    <td className="px-4 py-3 text-text-muted">
                      {latest ? new Date(latest.createdAt).toLocaleString() : "—"}
                    </td>
                    <td className="px-4 py-3 text-text-muted">
                      {latest ? (
                        <div className="space-y-1">
                          <span
                            className={`inline-flex rounded-full border px-2 py-0.5 text-xs font-medium capitalize ${statusBadgeClassName(latest.status)}`}
                          >
                            {latest.status}
                          </span>
                          {latest.skipReason ? (
                            <div className="text-xs text-text-faint">
                              {latest.skipReason.replace(/_/g, " ")}
                            </div>
                          ) : null}
                          {latest.status === "failed" && latest.errorMessage ? (
                            <div
                              className="text-xs text-clay"
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
                          disabled={isRunning || runningAll}
                          onClick={() => void runAudit([page.id])}
                          className="rounded-md border border-border px-2 py-1 text-xs hover:bg-surface-soft disabled:opacity-60"
                        >
                          <ButtonLoadingLabel loading={isRunning} loadingLabel="…">
                            Run
                          </ButtonLoadingLabel>
                        </button>
                        <button
                          type="button"
                          disabled={!latest || detailLoading}
                          onClick={() => void viewLatestResult(page)}
                          className="rounded-md border border-border px-2 py-1 text-xs hover:bg-surface-soft disabled:opacity-60"
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
        open={Boolean(selectedDetail)}
        result={selectedDetail}
        onClose={() => setSelectedDetail(null)}
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
