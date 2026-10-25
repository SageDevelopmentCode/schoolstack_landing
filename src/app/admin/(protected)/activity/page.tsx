"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import ActivityFunnelPanel from "@/components/admin/ActivityFunnelPanel";
import ActivityLogDetail from "@/components/admin/ActivityLogDetail";
import ActivityLogFeed from "@/components/admin/ActivityLogFeed";
import { AdminDrawer } from "@/components/admin/ui/AdminDrawer";
import { AdminSelect } from "@/components/admin/ui/AdminSelect";
import { enrichActivityEventsForDisplay, type EnrichedActivityEvent } from "@/lib/activity-event-display";
import {
  ACTIVITY_ACTIONS,
  fetchActivityEvents,
  normalizeActivityActorEmail,
  type ActorType,
  type ActivityDatePreset,
  type ActivityEventRow,
} from "@/lib/activity-log";

type OrganizationOption = {
  id: string;
  name: string;
  slug: string;
};

type SurfaceFilter = "" | "parent" | "teacher" | "school_admin" | "system";
type ActorTypeFilter = "" | ActorType;
type ActivityView = "funnel" | "log";

const ACTOR_TYPE_VALUES: ActorType[] = [
  "parent",
  "teacher",
  "school_admin",
  "platform_admin",
  "system",
];

const ACTOR_FILTERS: { value: ActorTypeFilter; label: string }[] = [
  { value: "", label: "All actors" },
  { value: "parent", label: "Parent" },
  { value: "teacher", label: "Teacher" },
  { value: "school_admin", label: "School admin" },
  { value: "platform_admin", label: "Platform admin" },
  { value: "system", label: "System" },
];

const DATE_PRESETS: { value: ActivityDatePreset; label: string }[] = [
  { value: "today", label: "Today" },
  { value: "7d", label: "Last 7 days" },
  { value: "30d", label: "Last 30 days" },
  { value: "all", label: "All" },
];

const VIEW_OPTIONS: { value: ActivityView; label: string }[] = [
  { value: "log", label: "Activity log" },
  { value: "funnel", label: "Funnel" },
];

const SURFACE_FILTERS: { value: SurfaceFilter; label: string }[] = [
  { value: "", label: "All surfaces" },
  { value: "parent", label: "Parent" },
  { value: "teacher", label: "Teacher" },
  { value: "school_admin", label: "School admin" },
  { value: "system", label: "API / system surface" },
];

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

      <AdminSelect
        value={organizationId}
        onChange={(e) => onOrganizationChange(e.target.value)}
        className="w-full"
        triggerClassName="text-xs px-2 py-1.5 text-admin-text"
        aria-label="Organization filter"
      >
        <option value="">All organizations</option>
        {organizations.map((org) => (
          <option key={org.id} value={org.id}>
            {org.name}
          </option>
        ))}
      </AdminSelect>

      {children}
    </div>
  );
}

function ActivityLogFilterBar({
  datePreset,
  organizationId,
  organizations,
  surfaceFilter,
  actorTypeFilter,
  actorEmailInput,
  onDatePresetChange,
  onOrganizationChange,
  onSurfaceFilterChange,
  onActorTypeFilterChange,
  onActorEmailInputChange,
}: {
  datePreset: ActivityDatePreset;
  organizationId: string;
  organizations: OrganizationOption[];
  surfaceFilter: SurfaceFilter;
  actorTypeFilter: ActorTypeFilter;
  actorEmailInput: string;
  onDatePresetChange: (value: ActivityDatePreset) => void;
  onOrganizationChange: (value: string) => void;
  onSurfaceFilterChange: (value: SurfaceFilter) => void;
  onActorTypeFilterChange: (value: ActorTypeFilter) => void;
  onActorEmailInputChange: (value: string) => void;
}) {
  return (
    <div className="rounded-admin-md border border-admin-border bg-admin-surface p-3 space-y-3">
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

      <div className="flex flex-col sm:flex-row gap-2">
        <AdminSelect
          value={organizationId}
          onChange={(e) => onOrganizationChange(e.target.value)}
          className="flex-1 min-w-0"
          triggerClassName="text-xs px-2 py-1.5 text-admin-text"
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
          onChange={(e) =>
            onSurfaceFilterChange(e.target.value as SurfaceFilter)
          }
          className="flex-1 min-w-0"
          triggerClassName="text-xs px-2 py-1.5 text-admin-text"
          aria-label="Surface filter"
        >
          {SURFACE_FILTERS.map((filter) => (
            <option key={filter.value || "all"} value={filter.value}>
              {filter.label}
            </option>
          ))}
        </AdminSelect>

        <AdminSelect
          value={actorTypeFilter}
          onChange={(e) =>
            onActorTypeFilterChange(e.target.value as ActorTypeFilter)
          }
          className="flex-1 min-w-0"
          triggerClassName="text-xs px-2 py-1.5 text-admin-text"
          aria-label="Actor type filter"
        >
          {ACTOR_FILTERS.map((filter) => (
            <option key={filter.value || "all"} value={filter.value}>
              {filter.label}
            </option>
          ))}
        </AdminSelect>
      </div>

      <input
        type="search"
        value={actorEmailInput}
        onChange={(e) => onActorEmailInputChange(e.target.value)}
        placeholder="Search by actor email"
        className="w-full rounded-admin-md border border-admin-border bg-admin-bg px-2.5 py-1.5 text-xs text-admin-text placeholder:text-admin-faint"
        aria-label="Search by actor email"
      />
    </div>
  );
}

function ViewToggle({
  view,
  onChange,
}: {
  view: ActivityView;
  onChange: (view: ActivityView) => void;
}) {
  return (
    <div className="flex gap-1 flex-wrap">
      {VIEW_OPTIONS.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
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
  );
}

function parseActorTypeFilter(value: string | null): ActorTypeFilter {
  if (!value) return "";
  return ACTOR_TYPE_VALUES.includes(value as ActorType)
    ? (value as ActorType)
    : "";
}

export default function AdminActivityPage() {
  const supabase = createClient();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [view, setView] = useState<ActivityView>("log");
  const [events, setEvents] = useState<EnrichedActivityEvent[]>([]);
  const [organizations, setOrganizations] = useState<OrganizationOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [datePreset, setDatePreset] = useState<ActivityDatePreset>("7d");
  const [organizationId, setOrganizationId] = useState(
    () => searchParams.get("organizationId")?.trim() ?? "",
  );
  const [surfaceFilter, setSurfaceFilter] = useState<SurfaceFilter>("");
  const [actorTypeFilter, setActorTypeFilter] = useState<ActorTypeFilter>(() =>
    parseActorTypeFilter(searchParams.get("actorType")),
  );
  const [actorEmailInput, setActorEmailInput] = useState(
    () => searchParams.get("actorEmail")?.trim() ?? "",
  );
  const [debouncedActorEmail, setDebouncedActorEmail] = useState(() => {
    const fromUrl = searchParams.get("actorEmail")?.trim() ?? "";
    return normalizeActivityActorEmail(fromUrl) ?? "";
  });
  const [errorsOnly, setErrorsOnly] = useState(false);

  useEffect(() => {
    const handle = window.setTimeout(() => {
      setDebouncedActorEmail(
        normalizeActivityActorEmail(actorEmailInput) ?? "",
      );
    }, 300);
    return () => window.clearTimeout(handle);
  }, [actorEmailInput]);

  const searchParamsString = searchParams.toString();

  useEffect(() => {
    const params = new URLSearchParams();
    if (organizationId) params.set("organizationId", organizationId);
    if (debouncedActorEmail) params.set("actorEmail", debouncedActorEmail);
    if (actorTypeFilter) params.set("actorType", actorTypeFilter);
    const next = params.toString();
    if (next !== searchParamsString) {
      router.replace(next ? `/admin/activity?${next}` : "/admin/activity", {
        scroll: false,
      });
    }
  }, [
    organizationId,
    debouncedActorEmail,
    actorTypeFilter,
    router,
    searchParamsString,
  ]);

  const loadEvents = useCallback(async () => {
    if (view !== "log") return;

    setLoading(true);
    setError(null);
    try {
      const data: ActivityEventRow[] = await fetchActivityEvents(supabase, {
        datePreset,
        organizationId: organizationId || undefined,
        surface: surfaceFilter || undefined,
        actorType: actorTypeFilter || undefined,
        actorEmail: debouncedActorEmail || undefined,
        ...(errorsOnly
          ? {
              actions: [
                ACTIVITY_ACTIONS.API_ERROR,
                ACTIVITY_ACTIONS.ADMIN_OPERATION_FAILED,
                ACTIVITY_ACTIONS.NOTIFICATION_FAILED,
              ],
            }
          : {}),
      });
      const enriched = await enrichActivityEventsForDisplay(supabase, data);
      setEvents(enriched);
      setSelectedId((current) => {
        if (current && enriched.some((event) => event.id === current)) {
          return current;
        }
        return null;
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load activity.");
    } finally {
      setLoading(false);
    }
  }, [
    supabase,
    view,
    datePreset,
    organizationId,
    surfaceFilter,
    actorTypeFilter,
    debouncedActorEmail,
    errorsOnly,
  ]);

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
      <div className="h-[calc(100vh-3rem)] flex flex-col">
        <div className="border-b border-admin-border bg-admin-surface px-4 py-3 space-y-3">
          <ViewToggle view={view} onChange={setView} />
        </div>
        <div className="flex items-center justify-center flex-1 text-sm text-admin-faint">
          Loading…
        </div>
      </div>
    );
  }

  if (view === "log" && error && events.length === 0) {
    return (
      <div className="h-[calc(100vh-3rem)] flex flex-col">
        <div className="border-b border-admin-border bg-admin-surface px-4 py-3 space-y-3">
          <ViewToggle view={view} onChange={setView} />
        </div>
        <div className="flex items-center justify-center flex-1 text-sm text-admin-accent">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-3rem)] flex flex-col overflow-hidden">
      <div className="border-b border-admin-border bg-admin-surface px-4 py-3 space-y-3 shrink-0">
        <ViewToggle view={view} onChange={setView} />

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
        <>
          <div className="flex-1 min-h-0 overflow-y-auto bg-admin-bg">
            <div className="max-w-2xl mx-auto px-4 py-4 space-y-4">
              <ActivityLogFilterBar
                datePreset={datePreset}
                organizationId={organizationId}
                organizations={organizations}
                surfaceFilter={surfaceFilter}
                actorTypeFilter={actorTypeFilter}
                actorEmailInput={actorEmailInput}
                onDatePresetChange={setDatePreset}
                onOrganizationChange={setOrganizationId}
                onSurfaceFilterChange={setSurfaceFilter}
                onActorTypeFilterChange={setActorTypeFilter}
                onActorEmailInputChange={setActorEmailInput}
              />

              <label className="flex items-center gap-2 text-xs text-admin-muted cursor-pointer">
                <input
                  type="checkbox"
                  checked={errorsOnly}
                  onChange={(e) => setErrorsOnly(e.target.checked)}
                  className="rounded border-admin-border"
                />
                Errors only (API, admin ops, notification failures)
              </label>

              {error ? (
                <p className="text-xs text-admin-accent">{error}</p>
              ) : (
                <p className="text-xs text-admin-faint">
                  {events.length} event{events.length === 1 ? "" : "s"}
                </p>
              )}

              <div className="rounded-admin-md border border-admin-border bg-admin-surface overflow-hidden">
                <ActivityLogFeed
                  events={events}
                  selectedId={selectedId}
                  onSelect={setSelectedId}
                />
              </div>
            </div>
          </div>

          <AdminDrawer
            open={selected !== null}
            onClose={() => setSelectedId(null)}
            title="Activity details"
            width="lg"
          >
            {selected ? <ActivityLogDetail event={selected} /> : null}
          </AdminDrawer>
        </>
      )}
    </div>
  );
}
