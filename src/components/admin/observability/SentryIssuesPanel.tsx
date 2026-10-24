"use client";

import { useCallback, useEffect, useState } from "react";
import { AdminDrawer } from "@/components/admin/ui/AdminDrawer";
import { AdminPageState } from "@/components/admin/ui/AdminPageState";
import type { SentryIssueDetail, SentryIssueSummary } from "@/lib/sentry/types";

type SentryStatus = {
  configured: boolean;
  webBaseUrl: string | null;
};

function formatRelative(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    dateStyle: "short",
    timeStyle: "short",
  });
}

export default function SentryIssuesPanel({ status }: { status: SentryStatus }) {
  const [issues, setIssues] = useState<SentryIssueSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detail, setDetail] = useState<SentryIssueDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const loadIssues = useCallback(async (cursor?: string) => {
    if (!status.configured) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ statsPeriod: "14d" });
      if (cursor) params.set("cursor", cursor);
      const res = await fetch(`/api/admin/sentry/issues?${params}`);
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error ?? "Failed to load issues.");
      }
      setIssues((prev) => (cursor ? [...prev, ...(data.issues ?? [])] : data.issues ?? []));
      setNextCursor(data.nextCursor ?? null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load issues.");
    } finally {
      setLoading(false);
    }
  }, [status.configured]);

  useEffect(() => {
    queueMicrotask(() => {
      void loadIssues();
    });
  }, [loadIssues]);

  useEffect(() => {
    if (!selectedId || !status.configured) {
      queueMicrotask(() => {
        setDetail(null);
        setDetailLoading(false);
      });
      return;
    }

    let cancelled = false;
    queueMicrotask(() => {
      setDetailLoading(true);
    });
    void (async () => {
      try {
        const res = await fetch(`/api/admin/sentry/issues/${selectedId}`);
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.error ?? "Failed to load issue.");
        if (!cancelled) setDetail(data.issue ?? null);
      } catch {
        if (!cancelled) setDetail(null);
      } finally {
        if (!cancelled) setDetailLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [selectedId, status.configured]);

  if (!status.configured) {
    return (
      <p className="text-sm text-admin-muted">
        Sentry is not configured on this deployment. Set SENTRY_ORG, SENTRY_PROJECT, and
        SENTRY_AUTH_TOKEN to load issues here.
      </p>
    );
  }

  if (loading && issues.length === 0) {
    return <AdminPageState variant="loading" />;
  }

  if (error && issues.length === 0) {
    return <AdminPageState variant="error" message={error} />;
  }

  return (
    <div className="space-y-3">
      {error ? <p className="text-xs text-admin-accent">{error}</p> : null}
      <p className="text-xs text-admin-faint">
        Sampled server and client errors from Sentry (last 14 days). Open in Sentry for stack traces and replay.
      </p>
      <div className="rounded-admin-md border border-admin-border overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-admin-neutral-bg text-admin-muted">
            <tr>
              <th className="px-3 py-2 font-medium">Issue</th>
              <th className="px-3 py-2 font-medium hidden sm:table-cell">Level</th>
              <th className="px-3 py-2 font-medium">Events</th>
              <th className="px-3 py-2 font-medium hidden md:table-cell">Last seen</th>
              <th className="px-3 py-2 font-medium w-24" />
            </tr>
          </thead>
          <tbody className="divide-y divide-admin-border">
            {issues.map((issue) => (
              <tr key={issue.id} className="bg-admin-surface hover:bg-admin-bg">
                <td className="px-3 py-2">
                  <button
                    type="button"
                    className="text-left text-admin-text hover:text-admin-accent font-medium line-clamp-2"
                    onClick={() => setSelectedId(issue.id)}
                  >
                    {issue.title}
                  </button>
                  <p className="text-admin-faint mt-0.5">{issue.shortId}</p>
                </td>
                <td className="px-3 py-2 hidden sm:table-cell capitalize">{issue.level}</td>
                <td className="px-3 py-2 tabular-nums">{issue.count}</td>
                <td className="px-3 py-2 hidden md:table-cell text-admin-muted">
                  {formatRelative(issue.lastSeen)}
                </td>
                <td className="px-3 py-2">
                  <a
                    href={issue.permalink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-admin-accent hover:underline whitespace-nowrap"
                  >
                    Sentry
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {nextCursor ? (
        <button
          type="button"
          disabled={loading}
          onClick={() => void loadIssues(nextCursor)}
          className="text-xs px-3 py-1.5 rounded-admin-md border border-admin-border bg-admin-surface hover:bg-admin-bg"
        >
          {loading ? "Loading…" : "Load more"}
        </button>
      ) : null}

      <AdminDrawer
        open={selectedId !== null}
        onClose={() => setSelectedId(null)}
        title="Sentry issue"
        width="lg"
      >
        {detailLoading ? (
          <p className="text-sm text-admin-faint">Loading…</p>
        ) : detail ? (
          <div className="space-y-4 text-sm">
            <p className="font-medium text-admin-text">{detail.title}</p>
            <dl className="grid gap-2 text-xs">
              <div>
                <dt className="text-admin-faint">Status</dt>
                <dd className="capitalize">{detail.status}</dd>
              </div>
              <div>
                <dt className="text-admin-faint">Culprit</dt>
                <dd className="font-mono break-all">{detail.culprit ?? "—"}</dd>
              </div>
              <div>
                <dt className="text-admin-faint">Events</dt>
                <dd>{detail.count}</dd>
              </div>
            </dl>
            {detail.tags.length > 0 ? (
              <div>
                <p className="text-xs text-admin-faint mb-1">Tags</p>
                <ul className="flex flex-wrap gap-1">
                  {detail.tags.map((tag) => (
                    <li
                      key={`${tag.key}-${tag.value}`}
                      className="text-[10px] px-1.5 py-0.5 rounded bg-admin-neutral-bg font-mono"
                    >
                      {tag.key}={tag.value}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
            <a
              href={detail.permalink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex text-admin-accent hover:underline"
            >
              Open in Sentry
            </a>
          </div>
        ) : (
          <p className="text-sm text-admin-faint">Issue details unavailable.</p>
        )}
      </AdminDrawer>
    </div>
  );
}
