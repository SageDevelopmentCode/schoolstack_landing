import type { AuditEnvironment } from "@/lib/performance/types";

export type BulkRunProgress = {
  runId?: string;
  environment: AuditEnvironment;
  status: "running" | "queued" | "completed" | "failed";
  completed: number;
  total: number;
  currentLabel?: string;
  errorMessage?: string;
};

function getProgressMessage(progress: BulkRunProgress) {
  if (progress.status === "failed") {
    return progress.errorMessage ?? "Audit run failed.";
  }

  if (progress.status === "completed") {
    return `Completed ${progress.completed} of ${progress.total}`;
  }

  if (progress.status === "queued") {
    return "Queued — waiting for Lighthouse runner";
  }

  const activeIndex = Math.min(progress.completed + 1, progress.total);
  const labelSuffix = progress.currentLabel ? ` — ${progress.currentLabel}` : "";

  if (progress.environment === "production") {
    return `Auditing ${activeIndex} of ${progress.total}${labelSuffix}`;
  }

  return `Processing ${progress.completed} of ${progress.total}${labelSuffix}`;
}

export function PerformanceRunProgressBanner({
  progress,
  onDismiss,
}: {
  progress: BulkRunProgress;
  onDismiss?: () => void;
}) {
  const percent =
    progress.total > 0
      ? Math.round((progress.completed / progress.total) * 100)
      : 0;

  const isFailed = progress.status === "failed";
  const isComplete = progress.status === "completed";

  return (
    <div
      className={`border-b px-4 py-3 ${
        isFailed
          ? "border-admin-accent/30 bg-admin-accent-soft"
          : isComplete
            ? "border-emerald-200 bg-emerald-50/50"
            : "border-admin-border bg-admin-neutral-bg"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1 space-y-2">
          <p
            className={`text-sm font-medium ${
              isFailed ? "text-admin-accent" : isComplete ? "text-emerald-800" : "text-admin-text"
            }`}
          >
            {getProgressMessage(progress)}
          </p>
          {!isComplete && !isFailed ? (
            <div className="h-1.5 overflow-hidden rounded-admin-md bg-border">
              <div
                className="h-full rounded-admin-md bg-admin-accent transition-all duration-300"
                style={{ width: `${percent}%` }}
              />
            </div>
          ) : null}
          {progress.status === "queued" ? (
            <p className="text-xs text-admin-faint">
              Start the runner with{" "}
              <code className="rounded bg-admin-bg px-1 py-0.5">npm run performance:audit:watch</code>{" "}
              while your dev server is running.
            </p>
          ) : null}
        </div>
        {onDismiss && (isComplete || isFailed) ? (
          <button
            type="button"
            onClick={onDismiss}
            className="shrink-0 rounded-admin-sm border border-admin-border px-2 py-1 text-xs text-admin-muted hover:bg-admin-bg"
          >
            Dismiss
          </button>
        ) : null}
      </div>
    </div>
  );
}

export function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
