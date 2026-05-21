interface DemoSkeletonProps {
  className?: string
}

export function DemoSkeleton({ className = '' }: DemoSkeletonProps) {
  return (
    <div
      className={`w-full h-full bg-white animate-pulse ${className}`}
      aria-hidden="true"
    >
      <div className="h-10 border-b border-gray-200 bg-gray-50" />
      <div className="p-4 space-y-3">
        <div className="h-4 w-1/3 rounded bg-gray-200" />
        <div className="h-4 w-2/3 rounded bg-gray-100" />
        <div className="h-4 w-1/2 rounded bg-gray-100" />
        <div className="mt-6 h-32 rounded-lg bg-gray-50 border border-gray-100" />
      </div>
    </div>
  )
}
