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
          ? "border-clay/30 bg-clay/5"
          : isComplete
            ? "border-emerald-200 bg-emerald-50/50"
            : "border-border bg-surface-soft"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1 space-y-2">
          <p
            className={`text-sm font-medium ${
              isFailed ? "text-clay" : isComplete ? "text-emerald-800" : "text-text"
            }`}
          >
            {getProgressMessage(progress)}
          </p>
          {!isComplete && !isFailed ? (
            <div className="h-1.5 overflow-hidden rounded-full bg-border">
              <div
                className="h-full rounded-full bg-clay transition-all duration-300"
                style={{ width: `${percent}%` }}
              />
            </div>
          ) : null}
          {progress.status === "queued" ? (
            <p className="text-xs text-text-faint">
              Start the runner with{" "}
              <code className="rounded bg-bg px-1 py-0.5">npm run performance:audit:watch</code>{" "}
              while your dev server is running.
            </p>
          ) : null}
        </div>
        {onDismiss && (isComplete || isFailed) ? (
          <button
            type="button"
            onClick={onDismiss}
            className="shrink-0 rounded-md border border-border px-2 py-1 text-xs text-text-muted hover:bg-bg"
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
