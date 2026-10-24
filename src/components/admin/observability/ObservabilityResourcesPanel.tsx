"use client";

import Link from "next/link";
import { ExternalLink } from "lucide-react";

export default function ObservabilityResourcesPanel({
  sentryWebBaseUrl,
  sentryConfigured,
}: {
  sentryConfigured: boolean;
  sentryWebBaseUrl: string | null;
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <div className="rounded-admin-md border border-admin-border bg-admin-surface p-4 space-y-2">
        <h3 className="text-sm font-medium text-admin-text">Lighthouse audits</h3>
        <p className="text-xs text-admin-muted">
          Scheduled and on-demand page audits stored in MudKitchen (seed school paths).
        </p>
        <Link
          href="/admin/performance"
          className="inline-flex items-center gap-1 text-xs text-admin-accent hover:underline"
        >
          Open Performance admin
        </Link>
      </div>
      <div className="rounded-admin-md border border-admin-border bg-admin-surface p-4 space-y-2">
        <h3 className="text-sm font-medium text-admin-text">Load time and speed</h3>
        <p className="text-xs text-admin-muted">
          <strong className="font-medium text-admin-text">Vercel Speed Insights</strong> — real-user
          LCP, INP, and CLS (including parent/committees).{" "}
          <strong className="font-medium text-admin-text">Sentry Traces</strong> — server and API
          transaction duration (~10% sampled in production).{" "}
          <strong className="font-medium text-admin-text">Sentry Metrics</strong> — custom{" "}
          <code className="font-mono text-[10px]">api.request.duration</code> on hot API routes;
          open Explore → Metrics in Sentry after deploy.
        </p>
        <p className="text-xs text-admin-muted">
          Env setup and verification steps:{" "}
          <code className="font-mono text-[10px]">docs/sentry-env-and-verification.md</code>
        </p>
        <a
          href="https://vercel.com/dashboard"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-xs text-admin-accent hover:underline"
        >
          Vercel dashboard
          <ExternalLink className="size-3" aria-hidden />
        </a>
      </div>
      <div className="rounded-admin-md border border-admin-border bg-admin-surface p-4 space-y-2 sm:col-span-2">
        <h3 className="text-sm font-medium text-admin-text">Activity log</h3>
        <p className="text-xs text-admin-muted">
          Full product activity stream (not only errors).
        </p>
        <Link
          href="/admin/activity"
          className="inline-flex items-center gap-1 text-xs text-admin-accent hover:underline"
        >
          Open Activity
        </Link>
      </div>
      {sentryConfigured && sentryWebBaseUrl ? (
        <div className="rounded-admin-md border border-admin-border bg-admin-surface p-4 space-y-2 sm:col-span-2">
          <h3 className="text-sm font-medium text-admin-text">Sentry project</h3>
          <p className="text-xs text-admin-muted">
            Issues, session replay, Traces (load time), and Application Metrics.
          </p>
          <div className="flex flex-wrap gap-3">
            <a
              href={`${sentryWebBaseUrl}/issues/`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-admin-accent hover:underline"
            >
              Issues
              <ExternalLink className="size-3" aria-hidden />
            </a>
            <a
              href={`${sentryWebBaseUrl}/explore/traces/`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-admin-accent hover:underline"
            >
              Traces
              <ExternalLink className="size-3" aria-hidden />
            </a>
            <a
              href={`${sentryWebBaseUrl}/explore/metrics/`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-admin-accent hover:underline"
            >
              Metrics
              <ExternalLink className="size-3" aria-hidden />
            </a>
          </div>
        </div>
      ) : null}
    </div>
  );
}
