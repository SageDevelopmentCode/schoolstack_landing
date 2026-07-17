export function performanceScoreClassName(score: number | null): string {
  if (score === null || Number.isNaN(score)) return "text-text-muted";
  if (score >= 90) return "text-emerald-600";
  if (score >= 50) return "text-amber-600";
  return "text-clay";
}

export function statusBadgeClassName(status: string): string {
  switch (status) {
    case "success":
      return "border-emerald-200 bg-emerald-50 text-emerald-800";
    case "failed":
      return "border-clay/30 bg-clay/10 text-clay";
    case "skipped":
      return "border-border bg-surface-soft text-text-muted";
    default:
      return "border-border bg-bg text-text-muted";
  }
}

export function opportunityCardClassName(score?: number): string {
  if (score === undefined || score === null) return "border-border bg-bg";
  if (score < 0.5) return "border-clay/30 bg-clay/5";
  if (score < 0.9) return "border-amber-200 bg-amber-50/60";
  return "border-border bg-bg";
}
