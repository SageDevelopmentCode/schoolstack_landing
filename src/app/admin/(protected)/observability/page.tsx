"use client";

import { useEffect, useState } from "react";
import ObservabilityResourcesPanel from "@/components/admin/observability/ObservabilityResourcesPanel";
import OperationalErrorsPanel from "@/components/admin/observability/OperationalErrorsPanel";
import SentryIssuesPanel from "@/components/admin/observability/SentryIssuesPanel";
import SentryPerformancePanel from "@/components/admin/observability/SentryPerformancePanel";

type ObservabilityTab =
  | "issues"
  | "performance"
  | "errors"
  | "resources";

const TABS: { id: ObservabilityTab; label: string }[] = [
  { id: "issues", label: "Sentry issues" },
  { id: "performance", label: "Sentry performance" },
  { id: "errors", label: "Operational errors" },
  { id: "resources", label: "Web vitals & audits" },
];

type SentryStatusResponse = {
  configured: boolean;
  orgSlug: string | null;
  projectSlug: string | null;
  webBaseUrl: string | null;
  web?: { configured: boolean; projectSlug: string | null };
  mobile?: { configured: boolean; projectSlug: string | null };
};

export default function AdminObservabilityPage() {
  const [tab, setTab] = useState<ObservabilityTab>("issues");
  const [sentryStatus, setSentryStatus] = useState<SentryStatusResponse>({
    configured: false,
    orgSlug: null,
    projectSlug: null,
    webBaseUrl: null,
    web: { configured: false, projectSlug: null },
    mobile: { configured: false, projectSlug: null },
  });

  useEffect(() => {
    void (async () => {
      try {
        const res = await fetch("/api/admin/sentry/status");
        const data = (await res.json()) as SentryStatusResponse;
        if (res.ok) setSentryStatus(data);
      } catch {
        // Non-fatal; panels show not-configured state.
      }
    })();
  }, []);

  return (
    <div className="h-[calc(100vh-3rem)] flex flex-col overflow-hidden">
      <div className="border-b border-admin-border bg-admin-surface px-4 py-3 shrink-0 space-y-2">
        <div>
          <h1 className="text-base font-semibold text-admin-text">Observability</h1>
          <p className="text-xs text-admin-muted mt-0.5">
            Sentry issues and performance, MudKitchen operational errors, and links to Lighthouse and Speed Insights.
          </p>
        </div>
        <div className="flex gap-1 flex-wrap">
          {TABS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setTab(item.id)}
              className={`text-xs px-3 py-1.5 rounded-admin-md border transition-colors ${
                tab === item.id
                  ? "bg-admin-accent-soft text-admin-accent border-admin-accent/20"
                  : "bg-admin-bg text-admin-muted border-admin-border hover:bg-admin-neutral-bg"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>
      <div className="flex-1 min-h-0 overflow-y-auto bg-admin-bg">
        <div className="max-w-4xl mx-auto px-4 py-4">
          {tab === "issues" ? (
            <SentryIssuesPanel
              status={{
                configured: sentryStatus.configured,
                webBaseUrl: sentryStatus.webBaseUrl,
              }}
            />
          ) : null}
          {tab === "performance" ? (
            <SentryPerformancePanel
              status={{
                web: {
                  configured:
                    sentryStatus.web?.configured ?? sentryStatus.configured,
                  projectSlug:
                    sentryStatus.web?.projectSlug ?? sentryStatus.projectSlug,
                },
                mobile: {
                  configured: sentryStatus.mobile?.configured ?? false,
                  projectSlug: sentryStatus.mobile?.projectSlug ?? null,
                },
              }}
            />
          ) : null}
          {tab === "errors" ? <OperationalErrorsPanel /> : null}
          {tab === "resources" ? (
            <ObservabilityResourcesPanel
              sentryConfigured={sentryStatus.configured}
              sentryWebBaseUrl={sentryStatus.webBaseUrl}
            />
          ) : null}
        </div>
      </div>
    </div>
  );
}
