"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import ActivityLogDetail from "@/components/admin/ActivityLogDetail";
import ActivityLogFeed from "@/components/admin/ActivityLogFeed";
import { AdminDrawer } from "@/components/admin/ui/AdminDrawer";
import { AdminSelect } from "@/components/admin/ui/AdminSelect";
import { enrichActivityEventsForDisplay, type EnrichedActivityEvent } from "@/lib/activity-event-display";
import {
  ACTIVITY_ACTIONS,
  fetchActivityEvents,
  type ActivityDatePreset,
  type ActivityEventRow,
} from "@/lib/activity-log";

type OrganizationOption = {
  id: string;
  name: string;
  slug: string;
};

type SurfaceFilter = "" | "parent" | "teacher" | "school_admin" | "system";

const DATE_PRESETS: { value: ActivityDatePreset; label: string }[] = [
  { value: "today", label: "Today" },
  { value: "7d", label: "Last 7 days" },
  { value: "30d", label: "Last 30 days" },
];

const SURFACE_FILTERS: { value: SurfaceFilter; label: string }[] = [
  { value: "", label: "All surfaces" },
  { value: "parent", label: "Parent" },
  { value: "teacher", label: "Teacher" },
  { value: "school_admin", label: "School admin" },
  { value: "system", label: "System" },
];

const ERROR_ACTIONS = [
  ACTIVITY_ACTIONS.API_ERROR,
  ACTIVITY_ACTIONS.ADMIN_OPERATION_FAILED,
];

export default function OperationalErrorsPanel() {
  const supabase = useMemo(() => createClient(), []);
  const [events, setEvents] = useState<EnrichedActivityEvent[]>([]);
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
      const data: ActivityEventRow[] = await fetchActivityEvents(supabase, {
        datePreset,
        organizationId: organizationId || undefined,
        surface: surfaceFilter || undefined,
        actions: ERROR_ACTIONS,
        limit: 200,
      });
      const enriched = await enrichActivityEventsForDisplay(supabase, data);
      setEvents(enriched);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load errors.");
    } finally {
      setLoading(false);
    }
  }, [supabase, datePreset, organizationId, surfaceFilter]);

  useEffect(() => {
    void (async () => {
      const { data, error: orgError } = await supabase
        .from("organizations")
        .select("id, name, slug")
        .order("name", { ascending: true });
      if (!orgError) setOrganizations((data ?? []) as OrganizationOption[]);
    })();
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

  return (
    <div className="space-y-3">
      <p className="text-xs text-admin-faint">
        Operational failures recorded in MudKitchen (`api.error` and `admin.operation_failed`). These overlap with many Sentry events from `reportOperationalError`.
      </p>
      <div className="rounded-admin-md border border-admin-border bg-admin-surface p-3 space-y-3">
        <div className="flex gap-1 flex-wrap">
          {DATE_PRESETS.map((preset) => (
            <button
              key={preset.value}
              type="button"
              onClick={() => setDatePreset(preset.value)}
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
        <div className="flex flex-col sm:flex-row gap-2">
          <AdminSelect
            value={organizationId}
            onChange={(e) => setOrganizationId(e.target.value)}
            className="flex-1 min-w-0"
            triggerClassName="text-xs"
            aria-label="Organization filter"
          >
            <option value="">All organizations</option>
            {organizations.map((org) => (
              <option key={org.id} value={org.id}>
                {org.name}
              </option>
            ))}
          </AdminSelect>
          <AdminSelect
            value={surfaceFilter}
            onChange={(e) => setSurfaceFilter(e.target.value as SurfaceFilter)}
            className="flex-1 min-w-0"
            triggerClassName="text-xs"
            aria-label="Surface filter"
          >
            {SURFACE_FILTERS.map((filter) => (
              <option key={filter.value || "all"} value={filter.value}>
                {filter.label}
              </option>
            ))}
          </AdminSelect>
        </div>
      </div>
      {loading ? <p className="text-xs text-admin-faint">Loading…</p> : null}
      {error ? <p className="text-xs text-admin-accent">{error}</p> : null}
      {!loading && !error ? (
        <p className="text-xs text-admin-faint">
          {events.length} error event{events.length === 1 ? "" : "s"}
        </p>
      ) : null}
      <div className="rounded-admin-md border border-admin-border bg-admin-surface overflow-hidden">
        <ActivityLogFeed
          events={events}
          selectedId={selectedId}
          onSelect={setSelectedId}
        />
      </div>
      <AdminDrawer
        open={selected !== null}
        onClose={() => setSelectedId(null)}
        title="Error details"
        width="lg"
      >
        {selected ? <ActivityLogDetail event={selected} /> : null}
      </AdminDrawer>
    </div>
  );
}
