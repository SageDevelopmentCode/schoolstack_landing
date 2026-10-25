"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import MobileFeatureAnalyticsPanel from "@/components/admin/MobileFeatureAnalyticsPanel";
import { AdminSelect } from "@/components/admin/ui/AdminSelect";
import type { ActivityDatePreset } from "@/lib/activity-log";
import type {
  MobileFeatureAnalyticsResult,
  MobileFeatureAnalyticsSurface,
} from "@/lib/mobile-feature-analytics";

type OrganizationOption = {
  id: string;
  name: string;
  slug: string;
};

type SurfaceFilter = "" | MobileFeatureAnalyticsSurface;

const DATE_PRESETS: { value: ActivityDatePreset; label: string }[] = [
  { value: "today", label: "Today" },
  { value: "7d", label: "Last 7 days" },
  { value: "30d", label: "Last 30 days" },
  { value: "all", label: "All" },
];

const SURFACE_FILTERS: { value: SurfaceFilter; label: string }[] = [
  { value: "", label: "All portals" },
  { value: "parent_portal", label: "Parent" },
  { value: "teacher_portal", label: "Teacher" },
  { value: "school_admin", label: "School admin" },
];

export default function AdminMobileAnalyticsPage() {
  const [datePreset, setDatePreset] = useState<ActivityDatePreset>("7d");
  const [organizationId, setOrganizationId] = useState("");
  const [surfaceFilter, setSurfaceFilter] = useState<SurfaceFilter>("");
  const [organizations, setOrganizations] = useState<OrganizationOption[]>([]);
  const [data, setData] = useState<MobileFeatureAnalyticsResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      const supabase = createClient();
      const { data: orgRows, error: orgError } = await supabase
        .from("organizations")
        .select("id, name, slug")
        .order("name");

      if (orgError) {
        console.error("[mobile-analytics] organizations load failed:", orgError);
        return;
      }

      setOrganizations(
        (orgRows ?? []).map((row: OrganizationOption) => ({
          id: String(row.id),
          name: String(row.name),
          slug: String(row.slug),
        })),
      );
    })();
  }, []);

  const loadAnalytics = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({ preset: datePreset });
      if (organizationId) {
        params.set("organizationId", organizationId);
      }
      if (surfaceFilter) {
        params.set("surface", surfaceFilter);
      }

      const res = await fetch(`/api/admin/mobile-feature-analytics?${params.toString()}`);
      const body = (await res.json()) as MobileFeatureAnalyticsResult & { error?: string };

      if (!res.ok) {
        setData(null);
        setError(body.error ?? "Failed to load mobile analytics.");
        return;
      }

      setData(body);
    } catch (loadError) {
      console.error("[mobile-analytics] fetch failed:", loadError);
      setData(null);
      setError("Failed to load mobile analytics.");
    } finally {
      setLoading(false);
    }
  }, [datePreset, organizationId, surfaceFilter]);

  useEffect(() => {
    queueMicrotask(() => {
      void loadAnalytics();
    });
  }, [loadAnalytics]);

  return (
    <div className="h-[calc(100vh-3rem)] flex flex-col overflow-hidden">
      <div className="border-b border-admin-border bg-admin-surface px-4 py-3 shrink-0 space-y-3">
        <div>
          <h1 className="text-base font-semibold text-admin-text">Mobile analytics</h1>
          <p className="text-xs text-admin-muted mt-0.5">
            Feature usage in the MudKitchen mobile app (parents, teachers, and school admins).
            Platform admin and preview sessions are excluded.
          </p>
        </div>

        <div className="rounded-admin-md border border-admin-border bg-admin-bg p-3 space-y-3">
          <div className="flex gap-1 flex-wrap">
            {DATE_PRESETS.map((preset) => (
              <button
                key={preset.value}
                type="button"
                onClick={() => setDatePreset(preset.value)}
                className={`text-xs px-2 py-1 rounded-admin-md border transition-colors ${
                  datePreset === preset.value
                    ? "bg-admin-accent-soft text-admin-accent border-admin-accent/20"
                    : "bg-admin-surface text-admin-muted border-admin-border hover:bg-admin-neutral-bg"
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
              onChange={(e) => setSurfaceFilter(e.target.value as SurfaceFilter)}
              className="flex-1 min-w-0"
              triggerClassName="text-xs px-2 py-1.5 text-admin-text"
              aria-label="Portal filter"
            >
              {SURFACE_FILTERS.map((filter) => (
                <option key={filter.value || "all"} value={filter.value}>
                  {filter.label}
                </option>
              ))}
            </AdminSelect>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <MobileFeatureAnalyticsPanel data={data} loading={loading} error={error} />
      </div>
    </div>
  );
}
