import * as Sentry from "@sentry/nextjs";

/** Low-cardinality route template, e.g. `/api/parent-portal/committees/[committeeId]`. */
export function recordApiDuration(
  route: string,
  method: string,
  status: number,
  durationMs: number,
): void {
  if (!Number.isFinite(durationMs) || durationMs < 0) return;

  Sentry.metrics.distribution("api.request.duration", durationMs, {
    unit: "millisecond",
    attributes: {
      route,
      method,
      status: String(status),
    },
  });
}
