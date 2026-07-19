export function performanceScoreClassName(score: number | null): string {
  if (score === null || Number.isNaN(score)) return "text-admin-muted";
  if (score >= 90) return "text-admin-success";
  if (score >= 50) return "text-admin-warning";
  return "text-admin-error";
}

export function statusBadgeClassName(status: string): string {
  switch (status) {
    case "success":
      return "border-admin-success-border bg-admin-success-bg text-admin-success";
    case "failed":
      return "border-admin-error-border bg-admin-error-bg text-admin-error";
    case "skipped":
      return "border-admin-neutral-border bg-admin-neutral-bg text-admin-neutral";
    default:
      return "border-admin-border bg-admin-bg text-admin-muted";
  }
}

export function opportunityCardClassName(score?: number): string {
  if (score === undefined || score === null) return "border-admin-border bg-admin-bg";
  if (score < 0.5) return "border-admin-error-border bg-admin-error-bg/40";
  if (score < 0.9) return "border-admin-warning-border bg-admin-warning-bg/60";
  return "border-admin-border bg-admin-bg";
}
