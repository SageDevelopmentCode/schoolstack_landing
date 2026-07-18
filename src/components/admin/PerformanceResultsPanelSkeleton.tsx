type PerformanceResultsPanelSkeletonProps = {
  label?: string;
  category?: string;
  onClose: () => void;
};

function SkeletonBlock({ className = "" }: { className?: string }) {
  return <div className={`rounded-md bg-surface-soft ${className}`} />;
}

export function PerformanceResultsPanelSkeleton({
  label,
  category,
  onClose,
}: PerformanceResultsPanelSkeletonProps) {
  return (
    <div className="space-y-6 p-6" aria-busy="true" aria-label="Loading audit details">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1 space-y-2">
          {label ? (
            <>
              <h1 className="font-display text-lg font-semibold text-text">{label}</h1>
              {category ? (
                <p className="font-secondary text-sm text-text-muted capitalize">
                  {category.replace(/_/g, " ")}
                </p>
              ) : (
                <SkeletonBlock className="h-4 w-24 animate-pulse" />
              )}
            </>
          ) : (
            <>
              <SkeletonBlock className="h-6 w-48 animate-pulse" />
              <SkeletonBlock className="h-4 w-24 animate-pulse" />
            </>
          )}
        </div>
        <button
          type="button"
          onClick={onClose}
          className="shrink-0 rounded-lg border border-border px-2 py-1 text-xs text-text-muted hover:bg-surface-soft"
        >
          Close
        </button>
      </div>

      <section className="space-y-3 rounded-xl border border-border bg-surface p-4">
        <SkeletonBlock className="h-3 w-16 animate-pulse" />
        <div className="space-y-3">
          <SkeletonBlock className="h-4 w-full animate-pulse" />
          <SkeletonBlock className="h-4 w-5/6 animate-pulse" />
          <SkeletonBlock className="h-4 w-2/3 animate-pulse" />
          <SkeletonBlock className="h-4 w-1/2 animate-pulse" />
        </div>
      </section>

      <section className="space-y-3 rounded-xl border border-border bg-surface p-4">
        <SkeletonBlock className="h-3 w-12 animate-pulse" />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="rounded-lg border border-border bg-bg p-3">
              <SkeletonBlock className="mb-2 h-3 w-16 animate-pulse" />
              <SkeletonBlock className="h-6 w-10 animate-pulse" />
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-3 rounded-xl border border-border bg-surface p-4">
        <SkeletonBlock className="h-3 w-24 animate-pulse" />
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="space-y-2 rounded-lg border border-border bg-bg p-3">
              <SkeletonBlock className="h-4 w-4/5 animate-pulse" />
              <SkeletonBlock className="h-3 w-1/3 animate-pulse" />
              <SkeletonBlock className="h-3 w-full animate-pulse" />
              <SkeletonBlock className="h-3 w-full animate-pulse" />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
