interface DemoSkeletonProps {
  className?: string
}

export function DemoSkeleton({ className = '' }: DemoSkeletonProps) {
  return (
    <div
      className={`w-full h-full bg-surface-muted animate-pulse ${className}`}
      aria-hidden="true"
    >
      <div className="h-10 border-b border-border bg-surface-muted" />
      <div className="p-4 space-y-3">
        <div className="h-4 w-1/3 rounded bg-border/60" />
        <div className="h-4 w-2/3 rounded bg-border/40" />
        <div className="h-4 w-1/2 rounded bg-border/40" />
        <div className="mt-6 h-32 rounded-lg bg-border/30" />
      </div>
    </div>
  )
}
