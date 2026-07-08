"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { createClient } from "@/utils/supabase/client";
import {
  fetchActivityEvents,
  formatActivityActionLabel,
  type ActivityDatePreset,
  type ActivityEventRow,
} from "@/lib/activity-log";

type OrganizationOption = {
  id: string;
  name: string;
  slug: string;
};

type SurfaceFilter = "" | "parent" | "school_admin" | "system";

const DATE_PRESETS: { value: ActivityDatePreset; label: string }[] = [
  { value: "today", label: "Today" },
  { value: "7d", label: "Last 7 days" },
  { value: "30d", label: "Last 30 days" },
  { value: "all", label: "All" },
];

const SURFACE_FILTERS: { value: SurfaceFilter; label: string }[] = [
  { value: "", label: "All surfaces" },
  { value: "parent", label: "Parent" },
  { value: "school_admin", label: "School admin" },
  { value: "system", label: "System" },
];

const SEVERITY_STYLES: Record<string, string> = {
  info: "bg-surface-soft text-text-muted border-border",
  warning: "bg-amber-50 text-amber-800 border-amber-200",
  error: "bg-red-50 text-red-700 border-red-200",
};

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function copyToClipboard(value: string) {
  void navigator.clipboard.writeText(value);
}

export default function AdminActivityPage() {
  const supabase = createClient();
  const [events, setEvents] = useState<ActivityEventRow[]>([]);
  const [organizations, setOrganizations] = useState<OrganizationOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [datePreset, setDatePreset] = useState<ActivityDatePreset>("7d");
  const [organizationId, setOrganizationId] = useState("");
  const [surfaceFilter, setSurfaceFilter] = useState<SurfaceFilter>("");

  const loadEvents = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchActivityEvents(supabase, {
        datePreset,
        organizationId: organizationId || undefined,
        surface: surfaceFilter || undefined,
      });
      setEvents(data);
      setSelectedId((current) => {
        if (current && data.some((event) => event.id === current)) {
          return current;
        }
        return data[0]?.id ?? null;
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load activity.");
    } finally {
      setLoading(false);
    }
  }, [supabase, datePreset, organizationId, surfaceFilter]);

  useEffect(() => {
    async function loadOrganizations() {
      const { data, error: orgError } = await supabase
        .from("organizations")
        .select("id, name, slug")
        .order("name", { ascending: true });

      if (orgError) {
        setError(orgError.message);
        return;
      }

      setOrganizations((data ?? []) as OrganizationOption[]);
    }

    void loadOrganizations();
  }, [supabase]);

  useEffect(() => {
    void loadEvents();
  }, [loadEvents]);

  const selected = useMemo(
    () => events.find((event) => event.id === selectedId) ?? null,
    [events, selectedId],
  );

  if (loading && events.length === 0) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-3rem)] text-sm text-text-faint font-secondary">
        Loading…
      </div>
    );
  }

  if (error && events.length === 0) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-3rem)] text-sm text-clay font-secondary">
        {error}
      </div>
    );
  }

  return (
    <div
      className="h-[calc(100vh-3rem)] flex overflow-hidden"
      style={{ fontFamily: "var(--font-poppins), Poppins, sans-serif" }}
    >
      <div className="w-96 shrink-0 border-r border-border flex flex-col bg-surface">
        <div className="p-3 border-b border-border space-y-3">
          <div className="flex gap-1 flex-wrap">
            {DATE_PRESETS.map((preset) => (
              <button
                key={preset.value}
                type="button"
                onClick={() => setDatePreset(preset.value)}
                className={`text-xs px-2 py-1 rounded-full border transition-colors ${
                  datePreset === preset.value
                    ? "bg-clay-soft text-clay border-clay/20"
                    : "bg-bg text-text-muted border-border hover:bg-surface-soft"
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>

          <div className="space-y-2">
            <select
              value={organizationId}
              onChange={(e) => setOrganizationId(e.target.value)}
              className="w-full text-xs rounded-lg border border-border bg-bg px-2 py-1.5 text-text"
            >
              <option value="">All organizations</option>
              {organizations.map((org) => (
                <option key={org.id} value={org.id}>
                  {org.name}
                </option>
              ))}
            </select>

            <select
              value={surfaceFilter}
              onChange={(e) => setSurfaceFilter(e.target.value as SurfaceFilter)}
              className="w-full text-xs rounded-lg border border-border bg-bg px-2 py-1.5 text-text"
            >
              {SURFACE_FILTERS.map((filter) => (
                <option key={filter.value || "all"} value={filter.value}>
                  {filter.label}
                </option>
              ))}
            </select>
          </div>

          {error ? (
            <p className="text-xs text-clay">{error}</p>
          ) : (
            <p className="text-xs text-text-faint">
              {events.length} event{events.length === 1 ? "" : "s"}
            </p>
          )}
        </div>

        <div className="flex-1 overflow-y-auto">
          {events.length === 0 ? (
            <p className="text-sm text-text-faint text-center py-8">
              No activity for this filter
            </p>
          ) : (
            events.map((event) => (
              <button
                key={event.id}
                type="button"
                onClick={() => setSelectedId(event.id)}
                className={`w-full text-left px-3 py-3 border-b border-border hover:bg-bg transition-colors ${
                  selectedId === event.id ? "bg-clay-soft" : ""
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-text line-clamp-2">
                      {event.summary}
                    </p>
                    <p className="text-xs text-text-muted truncate mt-0.5">
                      {event.organizations?.name ?? "—"}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 text-[10px] px-1.5 py-0.5 rounded-full border ${
                      SEVERITY_STYLES[event.severity] ?? SEVERITY_STYLES.info
                    }`}
                  >
                    {formatActivityActionLabel(event.action)}
                  </span>
                </div>
                <p className="text-[11px] text-text-faint mt-1">
                  {formatDateTime(event.created_at)}
                </p>
              </button>
            ))
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {!selected ? (
          <div className="flex items-center justify-center h-full text-sm text-text-faint">
            Select an event to view details
          </div>
        ) : (
          <div className="max-w-3xl mx-auto p-6 space-y-6">
            <div>
              <p className="text-xs font-semibold text-text-faint uppercase tracking-wide">
                Summary
              </p>
              <h1 className="text-xl font-medium text-text mt-1">
                {selected.summary}
              </h1>
              <p className="text-sm text-text-muted mt-1">
                {formatDateTime(selected.created_at)}
              </p>
            </div>

            <section className="bg-surface border border-border rounded-xl p-4 space-y-4">
              <h2 className="text-xs font-semibold text-text-faint uppercase tracking-wide">
                Event
              </h2>
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <div>
                  <dt className="text-text-faint text-xs">Organization</dt>
                  <dd className="text-text">
                    {selected.organizations?.name ?? "—"}
                  </dd>
                </div>
                <div>
                  <dt className="text-text-faint text-xs">Action</dt>
                  <dd className="text-text font-mono text-xs">{selected.action}</dd>
                </div>
                <div>
                  <dt className="text-text-faint text-xs">Surface</dt>
                  <dd className="text-text">{selected.surface}</dd>
                </div>
                <div>
                  <dt className="text-text-faint text-xs">Severity</dt>
                  <dd className="text-text capitalize">{selected.severity}</dd>
                </div>
                <div>
                  <dt className="text-text-faint text-xs">Actor type</dt>
                  <dd className="text-text">{selected.actor_type}</dd>
                </div>
                <div>
                  <dt className="text-text-faint text-xs">Actor email</dt>
                  <dd className="text-text break-all">
                    {selected.actor_email ?? "—"}
                  </dd>
                </div>
              </dl>
            </section>

            {(selected.entity_type || selected.entity_id) && (
              <section className="bg-surface border border-border rounded-xl p-4 space-y-3">
                <h2 className="text-xs font-semibold text-text-faint uppercase tracking-wide">
                  Entity
                </h2>
                <dl className="grid grid-cols-1 gap-3 text-sm">
                  {selected.entity_type ? (
                    <div>
                      <dt className="text-text-faint text-xs">Type</dt>
                      <dd className="text-text">{selected.entity_type}</dd>
                    </div>
                  ) : null}
                  {selected.entity_id ? (
                    <div>
                      <dt className="text-text-faint text-xs">ID</dt>
                      <dd className="flex items-center gap-2">
                        <code className="text-xs bg-bg border border-border rounded px-2 py-1 break-all">
                          {selected.entity_id}
                        </code>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(selected.entity_id!)}
                          className="text-xs text-clay hover:underline shrink-0"
                        >
                          Copy
                        </button>
                      </dd>
                    </div>
                  ) : null}
                </dl>
              </section>
            )}

            <section className="bg-surface border border-border rounded-xl p-4 space-y-3">
              <h2 className="text-xs font-semibold text-text-faint uppercase tracking-wide">
                Metadata
              </h2>
              <pre className="text-xs bg-bg border border-border rounded-lg p-3 overflow-x-auto text-text-muted">
                {JSON.stringify(selected.metadata, null, 2)}
              </pre>
            </section>
          </div>
        )}
      </div>
    </div>
  );
}
