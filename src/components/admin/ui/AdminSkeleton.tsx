type AdminSkeletonBlockProps = {
  className?: string;
};

export function AdminSkeletonBlock({ className = "" }: AdminSkeletonBlockProps) {
  return (
    <div
      className={`rounded-admin-sm bg-admin-neutral-bg animate-pulse ${className}`}
    />
  );
}

type AdminTableSkeletonProps = {
  columns: number;
  rows?: number;
  ariaLabel?: string;
  className?: string;
};

export function AdminTableSkeleton({
  columns,
  rows = 5,
  ariaLabel = "Loading table",
  className = "",
}: AdminTableSkeletonProps) {
  return (
    <div
      className={className}
      aria-busy="true"
      aria-label={ariaLabel}
    >
      <div className="flex gap-2 border-b border-admin-border pb-2 mb-1">
        {Array.from({ length: columns }).map((_, columnIndex) => (
          <AdminSkeletonBlock
            key={`head-${columnIndex}`}
            className="h-3 flex-1 min-w-[3rem]"
          />
        ))}
      </div>
      <div className="space-y-3 pt-1">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={`row-${rowIndex}`} className="flex gap-2 items-start">
            {Array.from({ length: columns }).map((_, columnIndex) => (
              <AdminSkeletonBlock
                key={`cell-${rowIndex}-${columnIndex}`}
                className={`h-8 flex-1 min-w-[3rem] ${columnIndex === columns - 1 ? "max-w-[5rem]" : ""}`}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

type AdminSectionCardSkeletonProps = {
  ariaLabel?: string;
  rows?: number;
  className?: string;
};

export function AdminSectionCardSkeleton({
  ariaLabel = "Loading section",
  rows = 4,
  className = "",
}: AdminSectionCardSkeletonProps) {
  return (
    <section
      className={`bg-admin-surface border border-admin-border rounded-admin-md p-4 space-y-3 ${className}`}
      aria-busy="true"
      aria-label={ariaLabel}
    >
      <div className="flex items-center justify-between gap-3">
        <AdminSkeletonBlock className="h-3 w-24" />
        <AdminSkeletonBlock className="h-3 w-16" />
      </div>
      <div className="space-y-3">
        {Array.from({ length: rows }).map((_, index) => (
          <AdminSkeletonBlock key={index} className="h-10 w-full" />
        ))}
      </div>
    </section>
  );
}

export function OrganizationSubmissionsTableSkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading submissions">
      <table className="w-full text-sm font-secondary">
        <thead>
          <tr className="text-left text-xs text-admin-faint border-b border-admin-border">
            {["Student", "Contact", "Status", "Parent sign-in", "Updated", "Preview"].map(
              (label) => (
                <th key={label} className="px-2 py-2 font-semibold">
                  {label}
                </th>
              ),
            )}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: 6 }).map((_, rowIndex) => (
            <tr
              key={rowIndex}
              className="border-b border-admin-border/70 last:border-b-0"
            >
              <td className="px-2 py-2.5 align-top space-y-1.5">
                <AdminSkeletonBlock className="h-4 w-32" />
                <AdminSkeletonBlock className="h-3 w-40" />
              </td>
              <td className="px-2 py-2.5 align-top space-y-1.5">
                <AdminSkeletonBlock className="h-4 w-28" />
                <AdminSkeletonBlock className="h-3 w-36" />
              </td>
              <td className="px-2 py-2.5 align-top">
                <AdminSkeletonBlock className="h-3 w-16" />
              </td>
              <td className="px-2 py-2.5 align-top">
                <AdminSkeletonBlock className="h-6 w-20 rounded-full" />
              </td>
              <td className="px-2 py-2.5 align-top">
                <AdminSkeletonBlock className="h-3 w-24" />
              </td>
              <td className="px-2 py-2.5 align-top">
                <div className="flex flex-col items-end gap-1.5">
                  <AdminSkeletonBlock className="h-7 w-[5.5rem]" />
                  <AdminSkeletonBlock className="h-7 w-[6.5rem]" />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function AdminListItemsSkeleton({
  count = 5,
  ariaLabel = "Loading list",
  className = "",
}: {
  count?: number;
  ariaLabel?: string;
  className?: string;
}) {
  return (
    <div
      className={`space-y-3 ${className}`}
      aria-busy="true"
      aria-label={ariaLabel}
    >
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="space-y-2 border-b border-admin-border/70 pb-3 last:border-b-0"
        >
          <AdminSkeletonBlock className="h-4 w-4/5 max-w-md" />
          <AdminSkeletonBlock className="h-3 w-1/2 max-w-xs" />
          <AdminSkeletonBlock className="h-3 w-full" />
        </div>
      ))}
    </div>
  );
}

export function OrganizationGuardianAccessTableSkeleton() {
  return (
    <section
      className="bg-admin-surface border border-admin-border rounded-admin-md p-4 space-y-3"
      aria-busy="true"
      aria-label="Loading guardian access"
    >
      <div className="flex items-center justify-between gap-3">
        <AdminSkeletonBlock className="h-3 w-28" />
        <AdminSkeletonBlock className="h-3 w-32" />
      </div>
      <AdminTableSkeleton columns={3} rows={4} ariaLabel="Loading guardians" />
    </section>
  );
}
