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
        <h3 className="text-sm font-medium text-admin-text">Vercel Speed Insights</h3>
        <p className="text-xs text-admin-muted">
          Real-user Core Web Vitals (LCP, INP, CLS) from production traffic, including parent portal routes.
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
            Full issue triage, assignment, session replay, and release health.
          </p>
          <a
            href={`${sentryWebBaseUrl}/issues/`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-admin-accent hover:underline"
          >
            Open Sentry
            <ExternalLink className="size-3" aria-hidden />
          </a>
        </div>
      ) : null}
    </div>
  );
}
