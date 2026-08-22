"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import OrganizationCustomerBillingPanel from "@/components/admin/OrganizationCustomerBillingPanel";
import OrganizationSettingsEditor from "@/components/admin/OrganizationSettingsEditor";
import OrganizationAccessPanel from "@/components/admin/OrganizationAccessPanel";
import OrganizationSubmissionsPanel from "@/components/admin/OrganizationSubmissionsPanel";
import OrganizationParentPortalPanel from "@/components/admin/OrganizationParentPortalPanel";
import OrganizationNotificationsPanel from "@/components/admin/OrganizationNotificationsPanel";
import { AdminSelect } from "@/components/admin/ui/AdminSelect";
import { AdminPageState } from "@/components/admin/ui/AdminPageState";
import type { OrganizationSettingsRow } from "@/lib/organization-settings/types";

type OrganizationStatus = "onboarding" | "live" | "paused" | "churned";

type OrganizationDetailTab =
  | "overview"
  | "notifications"
  | "submissions"
  | "parent-portal";

const ORGANIZATION_DETAIL_TABS: {
  id: OrganizationDetailTab;
  label: string;
}[] = [
  { id: "overview", label: "Overview" },
  { id: "notifications", label: "Notifications" },
  { id: "submissions", label: "Submissions" },
  { id: "parent-portal", label: "Parent portal" },
];

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
    pill: "bg-admin-accent-soft text-admin-accent border-admin-accent/20",
  },
  live: {
    label: "Live",
    pill: "bg-admin-success-bg text-admin-success border-admin-success-border",
  },
  paused: {
    label: "Paused",
    pill: "bg-admin-neutral-bg text-admin-muted border-admin-border",
  },
  churned: {
    label: "Churned",
    pill: "bg-admin-bg text-admin-faint border-admin-border",
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
  const [activeDetailTab, setActiveDetailTab] =
    useState<OrganizationDetailTab>("overview");

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
    queueMicrotask(() => setActiveDetailTab("overview"));
  }, [selectedId]);

  useEffect(() => {
    if (!selectedId) {
      queueMicrotask(() => setSettingsRow(null));
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

  if (loading) return <AdminPageState variant="loading" />;
  if (error) return <AdminPageState variant="error" message={error} />;

  return (
    <div className="h-[calc(100vh-3rem)] flex overflow-hidden">
      {/* List panel */}
      <div className="w-80 shrink-0 border-r border-admin-border flex flex-col bg-admin-surface">
        <div className="p-3 border-b border-admin-border space-y-2">
          <p className="text-xs font-semibold text-admin-faint uppercase tracking-wide">
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
                className={`text-xs px-2 py-1 rounded-admin-md border transition-colors ${
                  statusFilter === status
                    ? STATUS[status].pill
                    : "bg-admin-bg text-admin-muted border-admin-border hover:bg-admin-neutral-bg"
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
            <p className="text-sm text-admin-faint text-center py-8">
              No organizations
            </p>
          ) : (
            filtered.map((org) => (
              <button
                key={org.id}
                type="button"
                onClick={() => setSelectedId(org.id)}
                className={`w-full text-left px-3 py-3 border-b border-admin-border hover:bg-admin-bg transition-colors ${
                  selectedId === org.id ? "bg-admin-accent-soft" : ""
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-admin-text truncate">
                      {org.name}
                    </p>
                    <p className="text-xs text-admin-muted truncate font-mono">
                      {org.slug}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 text-xs px-1.5 py-0.5 rounded border ${STATUS[org.status].pill}`}
                  >
                    {STATUS[org.status].label}
                  </span>
                </div>
                <p className="text-xs text-admin-faint mt-1">
                  {new Date(org.created_at).toLocaleDateString()}
                </p>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Detail panel */}
      <div className="flex-1 overflow-y-auto bg-admin-bg/40">
        {!selected ? (
          <div className="h-full flex items-center justify-center text-sm text-admin-faint">
            Select an organization
          </div>
        ) : (
          <div className="w-full max-w-6xl mx-auto p-6 space-y-6">
            <div>
              <h1 className="text-lg font-semibold text-admin-text ">
                {selected.name}
              </h1>
              <span className="inline-block mt-2 text-[11px] font-mono text-admin-muted px-2 py-0.5 rounded-admin-sm bg-admin-bg border border-admin-border">
                {selected.slug}
              </span>
            </div>

            <div
              role="tablist"
              aria-label="Organization sections"
              className="flex gap-4 overflow-x-auto border-b border-admin-border"
            >
              {ORGANIZATION_DETAIL_TABS.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={activeDetailTab === tab.id}
                  onClick={() => setActiveDetailTab(tab.id)}
                  className={`text-sm font-medium py-2 border-b-2 transition-colors whitespace-nowrap ${
                    activeDetailTab === tab.id
                      ? "border-admin-accent text-admin-accent"
                      : "border-transparent text-admin-muted hover:text-admin-text"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {activeDetailTab === "overview" ? (
              <>
            <section className="bg-admin-surface border border-admin-border rounded-admin-md p-4 space-y-4">
              <h2 className="text-xs font-semibold text-admin-faint uppercase tracking-wide ">
                Settings
              </h2>
              <div className="space-y-3">
                <label className="block space-y-1">
                  <span className="text-xs text-admin-muted ">
                    Status
                  </span>
                  <AdminSelect
                    value={selected.status}
                    disabled={saving}
                    onChange={(e) =>
                      updateOrganization(selected.id, {
                        status: e.target.value as OrganizationStatus,
                        timezone: selected.timezone,
                      })
                    }
                    className="w-full"
                    triggerClassName={`border rounded-admin-md px-2 py-1.5 ${STATUS[selected.status].pill}`}
                    aria-label="Organization status"
                  >
                    {STATUSES.map((status) => (
                      <option key={status} value={status}>
                        {STATUS[status].label}
                      </option>
                    ))}
                  </AdminSelect>
                </label>
                <label className="block space-y-1">
                  <span className="text-xs text-admin-muted ">
                    Timezone
                  </span>
                  <AdminSelect
                    value={selected.timezone}
                    disabled={saving}
                    onChange={(e) =>
                      updateOrganization(selected.id, {
                        status: selected.status,
                        timezone: e.target.value,
                      })
                    }
                    className="w-full"
                    aria-label="Organization timezone"
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
                  </AdminSelect>
                </label>
              </div>
            </section>

            <OrganizationCustomerBillingPanel
              organizationId={selected.id}
              organizationName={selected.name}
            />

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

            <section className="bg-admin-surface border border-admin-border rounded-admin-md p-4 space-y-3">
              <h2 className="text-xs font-semibold text-admin-faint uppercase tracking-wide ">
                Details
              </h2>
              <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm ">
                <dt className="text-admin-muted">CRM school ID</dt>
                <dd className="font-mono text-xs break-all">
                  {selected.crm_school_id ?? "—"}
                </dd>
                <dt className="text-admin-muted">Created</dt>
                <dd>{formatDateTime(selected.created_at)}</dd>
                <dt className="text-admin-muted">Updated</dt>
                <dd>{formatDateTime(selected.updated_at)}</dd>
              </dl>
            </section>

            <section className="bg-admin-surface border border-admin-border rounded-admin-md p-4 space-y-3">
              <h2 className="text-xs font-semibold text-admin-faint uppercase tracking-wide ">
                Quick links
              </h2>
              <ul className="space-y-2">
                <li>
                  <Link
                    href={`/admin/preview/${selected.slug}/admin`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between gap-2 text-sm text-admin-accent hover:underline group"
                  >
                    <span>Preview school admin (read-only)</span>
                    <ArrowUpRight
                      className="w-3.5 h-3.5 shrink-0 opacity-60 group-hover:opacity-100"
                      aria-hidden
                    />
                  </Link>
                  <p className="text-xs text-admin-faint mt-0.5">
                    /admin/preview/{selected.slug}/admin
                  </p>
                </li>
                <li>
                  <Link
                    href={`/school/${selected.slug}/admin`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between gap-2 text-sm text-admin-accent hover:underline group"
                  >
                    <span>School admin</span>
                    <ArrowUpRight
                      className="w-3.5 h-3.5 shrink-0 opacity-60 group-hover:opacity-100"
                      aria-hidden
                    />
                  </Link>
                  <p className="text-xs text-admin-faint mt-0.5">
                    /school/{selected.slug}/admin
                  </p>
                </li>
                <li>
                  <Link
                    href={`/school/${selected.slug}/forms/apply`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between gap-2 text-sm text-admin-accent hover:underline group"
                  >
                    <span>Apply form</span>
                    <ArrowUpRight
                      className="w-3.5 h-3.5 shrink-0 opacity-60 group-hover:opacity-100"
                      aria-hidden
                    />
                  </Link>
                  <p className="text-xs text-admin-faint mt-0.5">
                    /school/{selected.slug}/forms/apply
                  </p>
                </li>
                <li>
                  <Link
                    href={`/timeline/${selected.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between gap-2 text-sm text-admin-accent hover:underline group"
                  >
                    <span>Rollout timeline</span>
                    <ArrowUpRight
                      className="w-3.5 h-3.5 shrink-0 opacity-60 group-hover:opacity-100"
                      aria-hidden
                    />
                  </Link>
                  <p className="text-xs text-admin-faint mt-0.5">
                    /timeline/{selected.slug}
                  </p>
                </li>
                {selected.crm_school_id ? (
                  <li>
                    <Link
                      href="/admin/research"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between gap-2 text-sm text-admin-accent hover:underline group"
                    >
                      <span>CRM record</span>
                      <ArrowUpRight
                        className="w-3.5 h-3.5 shrink-0 opacity-60 group-hover:opacity-100"
                        aria-hidden
                      />
                    </Link>
                    <p className="text-xs text-admin-faint mt-0.5">
                      Search for{" "}
                      <span className="font-mono">{selected.crm_school_id}</span>{" "}
                      in CRM
                    </p>
                  </li>
                ) : null}
              </ul>
            </section>
              </>
            ) : null}

            {activeDetailTab === "notifications" ? (
              <OrganizationNotificationsPanel organizationId={selected.id} />
            ) : null}

            {activeDetailTab === "submissions" ? (
              <OrganizationSubmissionsPanel
                organizationId={selected.id}
                organizationSlug={selected.slug}
              />
            ) : null}

            {activeDetailTab === "parent-portal" ? (
              <OrganizationParentPortalPanel organizationId={selected.id} />
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}
