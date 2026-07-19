"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { createClient } from "@/utils/supabase/client";
import ActivityFunnelPanel from "@/components/admin/ActivityFunnelPanel";
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
type ActivityView = "funnel" | "log";

const DATE_PRESETS: { value: ActivityDatePreset; label: string }[] = [
  { value: "today", label: "Today" },
  { value: "7d", label: "Last 7 days" },
  { value: "30d", label: "Last 30 days" },
  { value: "all", label: "All" },
];

const VIEW_OPTIONS: { value: ActivityView; label: string }[] = [
  { value: "funnel", label: "Funnel" },
  { value: "log", label: "Activity log" },
];

const SURFACE_FILTERS: { value: SurfaceFilter; label: string }[] = [
  { value: "", label: "All surfaces" },
  { value: "parent", label: "Parent" },
  { value: "school_admin", label: "School admin" },
  { value: "system", label: "System" },
];

const SEVERITY_STYLES: Record<string, string> = {
  info: "bg-admin-neutral-bg text-admin-muted border-admin-border",
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

function ActivityFilters({
  datePreset,
  organizationId,
  organizations,
  onDatePresetChange,
  onOrganizationChange,
  children,
}: {
  datePreset: ActivityDatePreset;
  organizationId: string;
  organizations: OrganizationOption[];
  onDatePresetChange: (value: ActivityDatePreset) => void;
  onOrganizationChange: (value: string) => void;
  children?: React.ReactNode;
}) {
  return (
    <div className="space-y-3">
      <div className="flex gap-1 flex-wrap">
        {DATE_PRESETS.map((preset) => (
          <button
            key={preset.value}
            type="button"
            onClick={() => onDatePresetChange(preset.value)}
            className={`text-xs px-2 py-1 rounded-admin-md border transition-colors ${
              datePreset === preset.value
                ? "bg-admin-accent-soft text-admin-accent border-admin-accent/20"
                : "bg-admin-bg text-admin-muted border-admin-border hover:bg-admin-neutral-bg"
            }`}
          >
            {preset.label}
          </button>
        ))}
      </div>

      <select
        value={organizationId}
        onChange={(e) => onOrganizationChange(e.target.value)}
        className="w-full text-xs rounded-admin-md border border-admin-border bg-admin-bg px-2 py-1.5 text-admin-text"
      >
        <option value="">All organizations</option>
        {organizations.map((org) => (
          <option key={org.id} value={org.id}>
            {org.name}
          </option>
        ))}
      </select>

      {children}
    </div>
  );
}

export default function AdminActivityPage() {
  const supabase = createClient();
  const [view, setView] = useState<ActivityView>("funnel");
  const [events, setEvents] = useState<ActivityEventRow[]>([]);
  const [organizations, setOrganizations] = useState<OrganizationOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [datePreset, setDatePreset] = useState<ActivityDatePreset>("7d");
  const [organizationId, setOrganizationId] = useState("");
  const [surfaceFilter, setSurfaceFilter] = useState<SurfaceFilter>("");

  const loadEvents = useCallback(async () => {
    if (view !== "log") return;

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
  }, [supabase, view, datePreset, organizationId, surfaceFilter]);

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
    queueMicrotask(() => {
      void loadEvents();
    });
  }, [loadEvents]);

  const selected = useMemo(
    () => events.find((event) => event.id === selectedId) ?? null,
    [events, selectedId],
  );

  if (view === "log" && loading && events.length === 0) {
    return (
      <div
        className="h-[calc(100vh-3rem)] flex flex-col"
        
      >
        <div className="border-b border-admin-border bg-admin-surface px-4 py-3 space-y-3">
          <div className="flex gap-1 flex-wrap">
            {VIEW_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setView(option.value)}
                className={`text-xs px-3 py-1.5 rounded-admin-md border transition-colors ${
                  view === option.value
                    ? "bg-admin-accent-soft text-admin-accent border-admin-accent/20"
                    : "bg-admin-bg text-admin-muted border-admin-border hover:bg-admin-neutral-bg"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center justify-center flex-1 text-sm text-admin-faint ">
          Loading…
        </div>
      </div>
    );
  }

  if (view === "log" && error && events.length === 0) {
    return (
      <div
        className="h-[calc(100vh-3rem)] flex flex-col"
        
      >
        <div className="border-b border-admin-border bg-admin-surface px-4 py-3 space-y-3">
          <div className="flex gap-1 flex-wrap">
            {VIEW_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setView(option.value)}
                className={`text-xs px-3 py-1.5 rounded-admin-md border transition-colors ${
                  view === option.value
                    ? "bg-admin-accent-soft text-admin-accent border-admin-accent/20"
                    : "bg-admin-bg text-admin-muted border-admin-border hover:bg-admin-neutral-bg"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center justify-center flex-1 text-sm text-admin-accent ">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div
      className="h-[calc(100vh-3rem)] flex flex-col overflow-hidden"
      
    >
      <div className="border-b border-admin-border bg-admin-surface px-4 py-3 space-y-3 shrink-0">
        <div className="flex gap-1 flex-wrap">
          {VIEW_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setView(option.value)}
              className={`text-xs px-3 py-1.5 rounded-admin-md border transition-colors ${
                view === option.value
                  ? "bg-admin-accent-soft text-admin-accent border-admin-accent/20"
                  : "bg-admin-bg text-admin-muted border-admin-border hover:bg-admin-neutral-bg"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>

        {view === "funnel" ? (
          <div className="max-w-4xl">
            <ActivityFilters
              datePreset={datePreset}
              organizationId={organizationId}
              organizations={organizations}
              onDatePresetChange={setDatePreset}
              onOrganizationChange={setOrganizationId}
            />
          </div>
        ) : null}
      </div>

      {view === "funnel" ? (
        <div className="flex-1 min-h-0">
          <ActivityFunnelPanel
            supabase={supabase}
            datePreset={datePreset}
            organizationId={organizationId}
            organizations={organizations}
          />
        </div>
      ) : (
        <div className="flex flex-1 min-h-0 overflow-hidden">
          <div className="w-96 shrink-0 border-r border-admin-border flex flex-col bg-admin-surface">
            <div className="p-3 border-b border-admin-border space-y-3">
              <ActivityFilters
                datePreset={datePreset}
                organizationId={organizationId}
                organizations={organizations}
                onDatePresetChange={setDatePreset}
                onOrganizationChange={setOrganizationId}
              >
                <select
                  value={surfaceFilter}
                  onChange={(e) =>
                    setSurfaceFilter(e.target.value as SurfaceFilter)
                  }
                  className="w-full text-xs rounded-admin-md border border-admin-border bg-admin-bg px-2 py-1.5 text-admin-text"
                >
                  {SURFACE_FILTERS.map((filter) => (
                    <option key={filter.value || "all"} value={filter.value}>
                      {filter.label}
                    </option>
                  ))}
                </select>
              </ActivityFilters>

              {error ? (
                <p className="text-xs text-admin-accent">{error}</p>
              ) : (
                <p className="text-xs text-admin-faint">
                  {events.length} event{events.length === 1 ? "" : "s"}
                </p>
              )}
            </div>

            <div className="flex-1 overflow-y-auto">
              {events.length === 0 ? (
                <p className="text-sm text-admin-faint text-center py-8">
                  No activity for this filter
                </p>
              ) : (
                events.map((event) => (
                  <button
                    key={event.id}
                    type="button"
                    onClick={() => setSelectedId(event.id)}
                    className={`w-full text-left px-3 py-3 border-b border-admin-border hover:bg-admin-bg transition-colors ${
                      selectedId === event.id ? "bg-admin-accent-soft" : ""
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-admin-text line-clamp-2">
                          {event.summary}
                        </p>
                        <p className="text-xs text-admin-muted truncate mt-0.5">
                          {event.organizations?.name ?? "—"}
                        </p>
                      </div>
                      <span
                        className={`shrink-0 text-[10px] px-1.5 py-0.5 rounded-admin-md border ${
                          SEVERITY_STYLES[event.severity] ??
                          SEVERITY_STYLES.info
                        }`}
                      >
                        {formatActivityActionLabel(event.action)}
                      </span>
                    </div>
                    <p className="text-[11px] text-admin-faint mt-1">
                      {formatDateTime(event.created_at)}
                    </p>
                  </button>
                ))
              )}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {!selected ? (
              <div className="flex items-center justify-center h-full text-sm text-admin-faint">
                Select an event to view details
              </div>
            ) : (
              <div className="max-w-3xl mx-auto p-6 space-y-6">
                <div>
                  <p className="text-xs font-semibold text-admin-faint uppercase tracking-wide">
                    Summary
                  </p>
                  <h1 className="text-xl font-medium text-admin-text mt-1">
                    {selected.summary}
                  </h1>
                  <p className="text-sm text-admin-muted mt-1">
                    {formatDateTime(selected.created_at)}
                  </p>
                </div>

                <section className="bg-admin-surface border border-admin-border rounded-admin-md p-4 space-y-4">
                  <h2 className="text-xs font-semibold text-admin-faint uppercase tracking-wide">
                    Event
                  </h2>
                  <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                    <div>
                      <dt className="text-admin-faint text-xs">Organization</dt>
                      <dd className="text-admin-text">
                        {selected.organizations?.name ?? "—"}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-admin-faint text-xs">Action</dt>
                      <dd className="text-admin-text font-mono text-xs">
                        {selected.action}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-admin-faint text-xs">Surface</dt>
                      <dd className="text-admin-text">{selected.surface}</dd>
                    </div>
                    <div>
                      <dt className="text-admin-faint text-xs">Severity</dt>
                      <dd className="text-admin-text capitalize">
                        {selected.severity}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-admin-faint text-xs">Actor type</dt>
                      <dd className="text-admin-text">{selected.actor_type}</dd>
                    </div>
                    <div>
                      <dt className="text-admin-faint text-xs">Actor email</dt>
                      <dd className="text-admin-text break-all">
                        {selected.actor_email ?? "—"}
                      </dd>
                    </div>
                  </dl>
                </section>

                {(selected.entity_type || selected.entity_id) && (
                  <section className="bg-admin-surface border border-admin-border rounded-admin-md p-4 space-y-3">
                    <h2 className="text-xs font-semibold text-admin-faint uppercase tracking-wide">
                      Entity
                    </h2>
                    <dl className="grid grid-cols-1 gap-3 text-sm">
                      {selected.entity_type ? (
                        <div>
                          <dt className="text-admin-faint text-xs">Type</dt>
                          <dd className="text-admin-text">{selected.entity_type}</dd>
                        </div>
                      ) : null}
                      {selected.entity_id ? (
                        <div>
                          <dt className="text-admin-faint text-xs">ID</dt>
                          <dd className="flex items-center gap-2">
                            <code className="text-xs bg-admin-bg border border-admin-border rounded px-2 py-1 break-all">
                              {selected.entity_id}
                            </code>
                            <button
                              type="button"
                              onClick={() =>
                                copyToClipboard(selected.entity_id!)
                              }
                              className="text-xs text-admin-accent hover:underline shrink-0"
                            >
                              Copy
                            </button>
                          </dd>
                        </div>
                      ) : null}
                    </dl>
                  </section>
                )}

                <section className="bg-admin-surface border border-admin-border rounded-admin-md p-4 space-y-3">
                  <h2 className="text-xs font-semibold text-admin-faint uppercase tracking-wide">
                    Metadata
                  </h2>
                  <pre className="text-xs bg-admin-bg border border-admin-border rounded-admin-md p-3 overflow-x-auto text-admin-muted">
                    {JSON.stringify(selected.metadata, null, 2)}
                  </pre>
                </section>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
