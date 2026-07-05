"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import OrganizationSettingsEditor from "@/components/admin/OrganizationSettingsEditor";
import OrganizationAccessPanel from "@/components/admin/OrganizationAccessPanel";
import type { OrganizationSettingsRow } from "@/lib/organization-settings/types";

type OrganizationStatus = "onboarding" | "live" | "paused" | "churned";

type Organization = {
  id: string;
  slug: string;
  name: string;
  status: OrganizationStatus;
  timezone: string;
  crm_school_id: string | null;
  created_at: string;
  updated_at: string;
};

const STATUSES: OrganizationStatus[] = [
  "onboarding",
  "live",
  "paused",
  "churned",
];

const STATUS: Record<
  OrganizationStatus,
  { label: string; pill: string }
> = {
  onboarding: {
    label: "Onboarding",
    pill: "bg-clay-soft text-clay border-clay/20",
  },
  live: {
    label: "Live",
    pill: "bg-accent-highlight text-accent border-accent-soft",
  },
  paused: {
    label: "Paused",
    pill: "bg-surface-soft text-text-muted border-border",
  },
  churned: {
    label: "Churned",
    pill: "bg-bg text-text-faint border-border",
  },
};

const TIMEZONE_OPTIONS = [
  { value: "America/New_York", label: "Eastern — New York" },
  { value: "America/Chicago", label: "Central — Chicago" },
  { value: "America/Denver", label: "Mountain — Denver" },
  { value: "America/Phoenix", label: "Arizona — Phoenix" },
  { value: "America/Los_Angeles", label: "Pacific — Los Angeles" },
  { value: "America/Anchorage", label: "Alaska — Anchorage" },
  { value: "Pacific/Honolulu", label: "Hawaii — Honolulu" },
];

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export default function AdminOrganizationsPage() {
  const supabase = createClient();
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<OrganizationStatus | "">(
    "",
  );
  const [saving, setSaving] = useState(false);
  const [settingsRow, setSettingsRow] = useState<OrganizationSettingsRow | null>(
    null,
  );
  const [settingsLoading, setSettingsLoading] = useState(false);

  useEffect(() => {
    async function load() {
      const { data, error: fetchError } = await supabase
        .from("organizations")
        .select("*")
        .order("created_at", { ascending: false });

      if (fetchError) setError(fetchError.message);
      else {
        setOrganizations(data as Organization[]);
        if (data?.length) setSelectedId(data[0].id);
      }
      setLoading(false);
    }
    load();
  }, [supabase]);

  useEffect(() => {
    if (!selectedId) {
      setSettingsRow(null);
      return;
    }

    let cancelled = false;

    async function loadSettings() {
      setSettingsLoading(true);
      const { data, error: settingsError } = await supabase
        .from("organization_settings")
        .select("*")
        .eq("organization_id", selectedId)
        .maybeSingle();

      if (cancelled) return;

      if (settingsError) {
        console.error("Failed to load organization settings:", settingsError.message);
        setSettingsRow(null);
      } else {
        setSettingsRow((data as OrganizationSettingsRow | null) ?? null);
      }
      setSettingsLoading(false);
    }

    loadSettings();

    return () => {
      cancelled = true;
    };
  }, [selectedId, supabase]);

  const updateOrganization = useCallback(
    async (
      id: string,
      patch: Pick<Organization, "status" | "timezone">,
    ) => {
      setSaving(true);
      const { error: updateError } = await supabase
        .from("organizations")
        .update(patch)
        .eq("id", id);

      setSaving(false);

      if (updateError) {
        alert("Update failed: " + updateError.message);
        return;
      }

      setOrganizations((prev) =>
        prev.map((org) =>
          org.id === id
            ? { ...org, ...patch, updated_at: new Date().toISOString() }
            : org,
        ),
      );
    },
    [supabase],
  );

  const filtered = organizations.filter(
    (org) => !statusFilter || org.status === statusFilter,
  );

  const selected =
    organizations.find((org) => org.id === selectedId) ?? null;

  const counts = organizations.reduce(
    (acc, org) => {
      acc[org.status] = (acc[org.status] ?? 0) + 1;
      return acc;
    },
    {} as Record<OrganizationStatus, number>,
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-3rem)] text-sm text-text-faint font-secondary">
        Loading…
      </div>
    );
  }

  if (error) {
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
      {/* List panel */}
      <div className="w-80 shrink-0 border-r border-border flex flex-col bg-surface">
        <div className="p-3 border-b border-border space-y-2">
          <p className="text-xs font-semibold text-text-faint uppercase tracking-wide">
            Product schools
          </p>
          <div className="flex gap-1 flex-wrap">
            {STATUSES.map((status) => (
              <button
                key={status}
                type="button"
                onClick={() =>
                  setStatusFilter(statusFilter === status ? "" : status)
                }
                className={`text-xs px-2 py-1 rounded-full border transition-colors ${
                  statusFilter === status
                    ? STATUS[status].pill
                    : "bg-bg text-text-muted border-border hover:bg-surface-soft"
                }`}
              >
                {STATUS[status].label}
                {counts[status] ? ` (${counts[status]})` : ""}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {filtered.length === 0 ? (
            <p className="text-sm text-text-faint text-center py-8">
              No organizations
            </p>
          ) : (
            filtered.map((org) => (
              <button
                key={org.id}
                type="button"
                onClick={() => setSelectedId(org.id)}
                className={`w-full text-left px-3 py-3 border-b border-border hover:bg-bg transition-colors ${
                  selectedId === org.id ? "bg-clay-soft" : ""
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-text truncate">
                      {org.name}
                    </p>
                    <p className="text-xs text-text-muted truncate font-mono">
                      {org.slug}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 text-xs px-1.5 py-0.5 rounded border ${STATUS[org.status].pill}`}
                  >
                    {STATUS[org.status].label}
                  </span>
                </div>
                <p className="text-xs text-text-faint mt-1">
                  {new Date(org.created_at).toLocaleDateString()}
                </p>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Detail panel */}
      <div className="flex-1 overflow-y-auto bg-bg/40">
        {!selected ? (
          <div className="h-full flex items-center justify-center text-sm text-text-faint">
            Select an organization
          </div>
        ) : (
          <div className="max-w-3xl mx-auto p-6 space-y-6">
            <div>
              <h1 className="text-lg font-semibold text-text font-display">
                {selected.name}
              </h1>
              <span className="inline-block mt-2 text-[11px] font-mono text-text-muted px-2 py-0.5 rounded-md bg-bg border border-border">
                {selected.slug}
              </span>
            </div>

            <section className="bg-surface border border-border rounded-lg p-4 space-y-4">
              <h2 className="text-xs font-semibold text-text-faint uppercase tracking-wide font-secondary">
                Settings
              </h2>
              <div className="space-y-3">
                <label className="block space-y-1">
                  <span className="text-xs text-text-muted font-secondary">
                    Status
                  </span>
                  <select
                    value={selected.status}
                    disabled={saving}
                    onChange={(e) =>
                      updateOrganization(selected.id, {
                        status: e.target.value as OrganizationStatus,
                        timezone: selected.timezone,
                      })
                    }
                    className={`w-full text-sm border rounded-lg px-2 py-1.5 font-secondary ${STATUS[selected.status].pill}`}
                  >
                    {STATUSES.map((status) => (
                      <option key={status} value={status}>
                        {STATUS[status].label}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block space-y-1">
                  <span className="text-xs text-text-muted font-secondary">
                    Timezone
                  </span>
                  <select
                    value={selected.timezone}
                    disabled={saving}
                    onChange={(e) =>
                      updateOrganization(selected.id, {
                        status: selected.status,
                        timezone: e.target.value,
                      })
                    }
                    className="w-full text-sm border border-border rounded-lg px-2 py-1.5 font-secondary bg-bg"
                  >
                    {!TIMEZONE_OPTIONS.some(
                      (option) => option.value === selected.timezone,
                    ) ? (
                      <option value={selected.timezone}>
                        {selected.timezone}
                      </option>
                    ) : null}
                    {TIMEZONE_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            </section>

            <OrganizationSettingsEditor
              organizationId={selected.id}
              organizationSlug={selected.slug}
              organizationName={selected.name}
              initialRow={settingsRow}
              settingsLoading={settingsLoading}
              onSaved={async () => {
                const { data } = await supabase
                  .from("organization_settings")
                  .select("*")
                  .eq("organization_id", selected.id)
                  .maybeSingle();
                setSettingsRow((data as OrganizationSettingsRow | null) ?? null);
              }}
            />

            <OrganizationAccessPanel
              organizationId={selected.id}
              organizationName={selected.name}
            />

            <section className="bg-surface border border-border rounded-lg p-4 space-y-3">
              <h2 className="text-xs font-semibold text-text-faint uppercase tracking-wide font-secondary">
                Details
              </h2>
              <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm font-secondary">
                <dt className="text-text-muted">CRM school ID</dt>
                <dd className="font-mono text-xs break-all">
                  {selected.crm_school_id ?? "—"}
                </dd>
                <dt className="text-text-muted">Created</dt>
                <dd>{formatDateTime(selected.created_at)}</dd>
                <dt className="text-text-muted">Updated</dt>
                <dd>{formatDateTime(selected.updated_at)}</dd>
              </dl>
            </section>

            <section className="bg-surface border border-border rounded-lg p-4 space-y-3">
              <h2 className="text-xs font-semibold text-text-faint uppercase tracking-wide font-secondary">
                Quick links
              </h2>
              <ul className="space-y-2">
                <li>
                  <Link
                    href={`/school/${selected.slug}/admin`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between gap-2 text-sm text-clay hover:underline font-secondary group"
                  >
                    <span>School admin</span>
                    <ArrowUpRight
                      className="w-3.5 h-3.5 shrink-0 opacity-60 group-hover:opacity-100"
                      aria-hidden
                    />
                  </Link>
                  <p className="text-xs text-text-faint mt-0.5">
                    /school/{selected.slug}/admin
                  </p>
                </li>
                <li>
                  <Link
                    href={`/timeline/${selected.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between gap-2 text-sm text-clay hover:underline font-secondary group"
                  >
                    <span>Rollout timeline</span>
                    <ArrowUpRight
                      className="w-3.5 h-3.5 shrink-0 opacity-60 group-hover:opacity-100"
                      aria-hidden
                    />
                  </Link>
                  <p className="text-xs text-text-faint mt-0.5">
                    /timeline/{selected.slug}
                  </p>
                </li>
                {selected.crm_school_id ? (
                  <li>
                    <Link
                      href="/admin/research"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between gap-2 text-sm text-clay hover:underline font-secondary group"
                    >
                      <span>CRM record</span>
                      <ArrowUpRight
                        className="w-3.5 h-3.5 shrink-0 opacity-60 group-hover:opacity-100"
                        aria-hidden
                      />
                    </Link>
                    <p className="text-xs text-text-faint mt-0.5">
                      Search for{" "}
                      <span className="font-mono">{selected.crm_school_id}</span>{" "}
                      in CRM
                    </p>
                  </li>
                ) : null}
              </ul>
            </section>
          </div>
        )}
      </div>
    </div>
  );
}
