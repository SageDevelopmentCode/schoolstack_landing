"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import type { AdminFeatureAnnouncementRecord } from "@/lib/admin/admin-feature-announcements-storage";
import {
  ADMIN_FEATURE_ANNOUNCEMENT_CTA_LABELS,
  ADMIN_FEATURE_ANNOUNCEMENT_FEATURE_KEYS,
  type AdminFeatureAnnouncementCtaLabel,
} from "@/lib/school-admin/admin-feature-announcements";
import { AdminSelect } from "@/components/admin/ui/AdminSelect";

type OrganizationFeatureAnnouncementsPanelProps = {
  organizationId: string;
  organizationName: string;
};

type AnnouncementFormState = {
  announcementId: string;
  title: string;
  description: string;
  ctaLabel: AdminFeatureAnnouncementCtaLabel;
  featureKey: string;
  hrefPath: string;
  publishedAt: string;
  published: boolean;
};

const EMPTY_FORM: AnnouncementFormState = {
  announcementId: "",
  title: "",
  description: "",
  ctaLabel: "Try it now",
  featureKey: "admissions",
  hrefPath: "",
  publishedAt: new Date().toISOString().slice(0, 10),
  published: true,
};

function formatDate(isoDate: string) {
  const [year, month, day] = isoDate.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function AnnouncementFormFields({
  form,
  onChange,
  idPrefix,
}: {
  form: AnnouncementFormState;
  onChange: (next: AnnouncementFormState) => void;
  idPrefix: string;
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <label className="block space-y-1 sm:col-span-2">
        <span className="text-xs text-admin-muted font-secondary">Card ID</span>
        <input
          id={`${idPrefix}-announcement-id`}
          type="text"
          required
          value={form.announcementId}
          onChange={(event) =>
            onChange({ ...form, announcementId: event.target.value })
          }
          placeholder="coop-supply-list"
          className="w-full text-sm border border-admin-border rounded-admin-md px-3 py-2 bg-admin-bg font-mono"
        />
      </label>
      <label className="block space-y-1 sm:col-span-2">
        <span className="text-xs text-admin-muted font-secondary">Title</span>
        <input
          id={`${idPrefix}-title`}
          type="text"
          required
          value={form.title}
          onChange={(event) => onChange({ ...form, title: event.target.value })}
          className="w-full text-sm border border-admin-border rounded-admin-md px-3 py-2 bg-admin-bg"
        />
      </label>
      <label className="block space-y-1 sm:col-span-2">
        <span className="text-xs text-admin-muted font-secondary">
          Description
        </span>
        <textarea
          id={`${idPrefix}-description`}
          required
          rows={3}
          value={form.description}
          onChange={(event) =>
            onChange({ ...form, description: event.target.value })
          }
          className="w-full text-sm border border-admin-border rounded-admin-md px-3 py-2 bg-admin-bg"
        />
      </label>
      <label className="block space-y-1">
        <span className="text-xs text-admin-muted font-secondary">CTA</span>
        <AdminSelect
          value={form.ctaLabel}
          onChange={(event) =>
            onChange({
              ...form,
              ctaLabel: event.target.value as AdminFeatureAnnouncementCtaLabel,
            })
          }
          className="w-full"
          triggerClassName="px-3 py-2"
        >
          {ADMIN_FEATURE_ANNOUNCEMENT_CTA_LABELS.map((label) => (
            <option key={label} value={label}>{label}</option>
          ))}
        </AdminSelect>
      </label>
      <label className="block space-y-1">
        <span className="text-xs text-admin-muted font-secondary">Feature</span>
        <AdminSelect
          value={form.featureKey}
          onChange={(event) =>
            onChange({ ...form, featureKey: event.target.value })
          }
          className="w-full"
          triggerClassName="px-3 py-2"
        >
          {ADMIN_FEATURE_ANNOUNCEMENT_FEATURE_KEYS.map((key) => (
            <option key={key} value={key}>{key}</option>
          ))}
        </AdminSelect>
      </label>
      <label className="block space-y-1">
        <span className="text-xs text-admin-muted font-secondary">
          Admin path
        </span>
        <input
          id={`${idPrefix}-href-path`}
          type="text"
          required
          value={form.hrefPath}
          onChange={(event) =>
            onChange({ ...form, hrefPath: event.target.value })
          }
          placeholder="admissions/programs"
          className="w-full text-sm border border-admin-border rounded-admin-md px-3 py-2 bg-admin-bg font-mono"
        />
      </label>
      <label className="block space-y-1">
        <span className="text-xs text-admin-muted font-secondary">
          Published date
        </span>
        <input
          id={`${idPrefix}-published-at`}
          type="date"
          required
          value={form.publishedAt}
          onChange={(event) =>
            onChange({ ...form, publishedAt: event.target.value })
          }
          className="w-full text-sm border border-admin-border rounded-admin-md px-3 py-2 bg-admin-bg"
        />
      </label>
      <label className="flex items-center gap-2 sm:col-span-2">
        <input
          id={`${idPrefix}-published`}
          type="checkbox"
          checked={form.published}
          onChange={(event) =>
            onChange({ ...form, published: event.target.checked })
          }
        />
        <span className="text-sm text-admin-muted font-secondary">Published</span>
      </label>
    </div>
  );
}

function recordToForm(record: AdminFeatureAnnouncementRecord): AnnouncementFormState {
  return {
    announcementId: record.announcementId,
    title: record.title,
    description: record.description,
    ctaLabel: record.ctaLabel,
    featureKey: record.featureKey,
    hrefPath: record.hrefPath,
    publishedAt: record.publishedAt,
    published: record.published,
  };
}

export default function OrganizationFeatureAnnouncementsPanel({
  organizationId,
  organizationName,
}: OrganizationFeatureAnnouncementsPanelProps) {
  const [globals, setGlobals] = useState<AdminFeatureAnnouncementRecord[]>([]);
  const [overrides, setOverrides] = useState<AdminFeatureAnnouncementRecord[]>([]);
  const [effective, setEffective] = useState<AdminFeatureAnnouncementRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [globalForm, setGlobalForm] = useState<AnnouncementFormState>(EMPTY_FORM);
  const [overrideForm, setOverrideForm] =
    useState<AnnouncementFormState>(EMPTY_FORM);
  const [editingGlobalId, setEditingGlobalId] = useState<string | null>(null);
  const [editingOverrideId, setEditingOverrideId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<AnnouncementFormState>(EMPTY_FORM);

  const loadAnnouncements = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/admin/organizations/${organizationId}/feature-announcements`,
      );
      const payload = (await response.json()) as {
        globals?: AdminFeatureAnnouncementRecord[];
        overrides?: AdminFeatureAnnouncementRecord[];
        effective?: AdminFeatureAnnouncementRecord[];
        error?: string;
      };

      if (!response.ok) {
        throw new Error(payload.error ?? "Failed to load dashboard cards.");
      }

      setGlobals(payload.globals ?? []);
      setOverrides(payload.overrides ?? []);
      setEffective(payload.effective ?? []);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Failed to load dashboard cards.",
      );
      setGlobals([]);
      setOverrides([]);
      setEffective([]);
    } finally {
      setLoading(false);
    }
  }, [organizationId]);

  useEffect(() => {
    queueMicrotask(() => {
      void loadAnnouncements();
    });
  }, [loadAnnouncements]);

  const submitGlobal = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const response = await fetch("/api/admin/feature-announcements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(globalForm),
      });
      const payload = (await response.json()) as { error?: string };
      if (!response.ok) {
        throw new Error(payload.error ?? "Failed to create global card.");
      }
      setGlobalForm(EMPTY_FORM);
      await loadAnnouncements();
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "Failed to create global card.",
      );
    } finally {
      setSaving(false);
    }
  };

  const submitOverride = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/admin/organizations/${organizationId}/feature-announcements`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(overrideForm),
        },
      );
      const payload = (await response.json()) as { error?: string };
      if (!response.ok) {
        throw new Error(payload.error ?? "Failed to create override.");
      }
      setOverrideForm(EMPTY_FORM);
      await loadAnnouncements();
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "Failed to create override.",
      );
    } finally {
      setSaving(false);
    }
  };

  const saveEdit = async () => {
    if (!editingGlobalId && !editingOverrideId) return;
    setSaving(true);
    setError(null);

    try {
      const url = editingGlobalId
        ? `/api/admin/feature-announcements/${editingGlobalId}`
        : `/api/admin/organizations/${organizationId}/feature-announcements/${editingOverrideId}`;

      const response = await fetch(url, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });
      const payload = (await response.json()) as { error?: string };
      if (!response.ok) {
        throw new Error(payload.error ?? "Failed to save card.");
      }

      setEditingGlobalId(null);
      setEditingOverrideId(null);
      setEditForm(EMPTY_FORM);
      await loadAnnouncements();
    } catch (saveError) {
      setError(
        saveError instanceof Error ? saveError.message : "Failed to save card.",
      );
    } finally {
      setSaving(false);
    }
  };

  const deleteGlobal = async (id: string) => {
    setSaving(true);
    setError(null);
    try {
      const response = await fetch(`/api/admin/feature-announcements/${id}`, {
        method: "DELETE",
      });
      const payload = (await response.json()) as { error?: string };
      if (!response.ok) {
        throw new Error(payload.error ?? "Failed to delete global card.");
      }
      await loadAnnouncements();
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "Failed to delete global card.",
      );
    } finally {
      setSaving(false);
    }
  };

  const deleteOverride = async (id: string) => {
    setSaving(true);
    setError(null);
    try {
      const response = await fetch(
        `/api/admin/organizations/${organizationId}/feature-announcements/${id}`,
        { method: "DELETE" },
      );
      const payload = (await response.json()) as { error?: string };
      if (!response.ok) {
        throw new Error(payload.error ?? "Failed to delete override.");
      }
      await loadAnnouncements();
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "Failed to delete override.",
      );
    } finally {
      setSaving(false);
    }
  };

  const hideGlobalForOrg = async (global: AdminFeatureAnnouncementRecord) => {
    setSaving(true);
    setError(null);
    try {
      const response = await fetch(
        `/api/admin/organizations/${organizationId}/feature-announcements`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            announcementId: global.announcementId,
            title: global.title,
            description: global.description,
            ctaLabel: global.ctaLabel,
            featureKey: global.featureKey,
            hrefPath: global.hrefPath,
            publishedAt: global.publishedAt,
            published: false,
          }),
        },
      );
      const payload = (await response.json()) as { error?: string };
      if (!response.ok) {
        throw new Error(payload.error ?? "Failed to hide card for this school.");
      }
      await loadAnnouncements();
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "Failed to hide card for this school.",
      );
    } finally {
      setSaving(false);
    }
  };

  const renderTable = (
    rows: AdminFeatureAnnouncementRecord[],
    scope: "global" | "override",
  ) => (
    <ul className="divide-y divide-admin-border rounded-admin-md border border-admin-border overflow-hidden">
      {rows.map((row) => {
        const isEditing =
          scope === "global"
            ? editingGlobalId === row.id
            : editingOverrideId === row.id;

        return (
          <li key={row.id} className="bg-admin-bg px-3 py-3 space-y-3">
            {isEditing ? (
              <>
                <AnnouncementFormFields
                  form={editForm}
                  onChange={setEditForm}
                  idPrefix={`edit-${row.id}`}
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={saving}
                    onClick={() => void saveEdit()}
                    className="rounded-admin-md bg-admin-accent px-3 py-1.5 text-xs font-medium text-white disabled:opacity-60"
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    disabled={saving}
                    onClick={() => {
                      setEditingGlobalId(null);
                      setEditingOverrideId(null);
                      setEditForm(EMPTY_FORM);
                    }}
                    className="rounded-admin-md border border-admin-border px-3 py-1.5 text-xs font-medium text-admin-muted"
                  >
                    Cancel
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-medium text-admin-text">
                      {row.title}
                    </p>
                    {scope === "override" ? (
                      <span className="rounded-full border border-admin-accent/20 bg-admin-accent-soft px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-admin-accent">
                        Override
                      </span>
                    ) : null}
                    {!row.published ? (
                      <span className="rounded-full border border-admin-border bg-admin-neutral-bg px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-admin-muted">
                        Hidden
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-1 text-xs text-admin-muted font-secondary">
                    {formatDate(row.publishedAt)} · {row.featureKey} ·{" "}
                    <span className="font-mono">{row.hrefPath}</span>
                  </p>
                  <p className="mt-2 text-sm text-admin-muted">{row.description}</p>
                </div>
                <div className="flex shrink-0 flex-col gap-2">
                  <button
                    type="button"
                    disabled={saving}
                    onClick={() => {
                      if (scope === "global") {
                        setEditingGlobalId(row.id);
                        setEditingOverrideId(null);
                      } else {
                        setEditingOverrideId(row.id);
                        setEditingGlobalId(null);
                      }
                      setEditForm(recordToForm(row));
                    }}
                    className="inline-flex items-center gap-1 rounded-admin-sm border border-admin-border px-2.5 py-1.5 text-xs font-medium text-admin-muted hover:bg-admin-neutral-bg"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    Edit
                  </button>
                  {scope === "global" ? (
                    <button
                      type="button"
                      disabled={saving}
                      onClick={() => void hideGlobalForOrg(row)}
                      className="inline-flex items-center gap-1 rounded-admin-sm border border-admin-border px-2.5 py-1.5 text-xs font-medium text-admin-muted hover:bg-admin-neutral-bg"
                    >
                      Hide here
                    </button>
                  ) : null}
                  <button
                    type="button"
                    disabled={saving}
                    onClick={() =>
                      void (scope === "global"
                        ? deleteGlobal(row.id)
                        : deleteOverride(row.id))
                    }
                    className="inline-flex items-center gap-1 rounded-admin-sm border border-admin-border px-2.5 py-1.5 text-xs font-medium text-admin-muted hover:bg-admin-neutral-bg"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Delete
                  </button>
                </div>
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );

  return (
    <div className="space-y-6">
      {error ? (
        <p
          className="rounded-admin-md border border-admin-accent/30 bg-admin-accent-soft/30 px-3 py-2 text-sm text-admin-accent font-secondary"
          role="alert"
        >
          {error}
        </p>
      ) : null}

      {loading ? (
        <div className="flex items-center gap-2 text-sm text-admin-faint font-secondary">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading dashboard cards…
        </div>
      ) : (
        <>
          <section className="bg-admin-surface border border-admin-border rounded-admin-md p-4 space-y-4">
            <div>
              <h2 className="text-xs font-semibold text-admin-faint uppercase tracking-wide font-secondary">
                Product defaults
              </h2>
              <p className="mt-1 text-sm text-admin-muted font-secondary">
                Cards shown on every school admin dashboard unless overridden.
              </p>
            </div>
            {globals.length > 0 ? renderTable(globals, "global") : (
              <p className="text-sm text-admin-faint font-secondary">
                No global cards yet.
              </p>
            )}
            <form onSubmit={submitGlobal} className="space-y-3 border-t border-admin-border pt-4">
              <h3 className="text-sm font-medium text-admin-text">
                Add global card
              </h3>
              <AnnouncementFormFields
                form={globalForm}
                onChange={setGlobalForm}
                idPrefix="global-new"
              />
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-admin-md bg-admin-accent px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
              >
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Plus className="h-4 w-4" />
                )}
                Add global card
              </button>
            </form>
          </section>

          <section className="bg-admin-surface border border-admin-border rounded-admin-md p-4 space-y-4">
            <div>
              <h2 className="text-xs font-semibold text-admin-faint uppercase tracking-wide font-secondary">
                Overrides for {organizationName}
              </h2>
              <p className="mt-1 text-sm text-admin-muted font-secondary">
                Replace or hide a global card for this school only. Use the same
                card ID to override a product default.
              </p>
            </div>
            {overrides.length > 0 ? renderTable(overrides, "override") : (
              <p className="text-sm text-admin-faint font-secondary">
                No school-specific overrides yet.
              </p>
            )}
            <form onSubmit={submitOverride} className="space-y-3 border-t border-admin-border pt-4">
              <h3 className="text-sm font-medium text-admin-text">
                Add school override
              </h3>
              <AnnouncementFormFields
                form={overrideForm}
                onChange={setOverrideForm}
                idPrefix="override-new"
              />
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-admin-md bg-admin-accent px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
              >
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Plus className="h-4 w-4" />
                )}
                Add override
              </button>
            </form>
          </section>

          <section className="bg-admin-surface border border-admin-border rounded-admin-md p-4 space-y-3">
            <div>
              <h2 className="text-xs font-semibold text-admin-faint uppercase tracking-wide font-secondary">
                Preview
              </h2>
              <p className="mt-1 text-sm text-admin-muted font-secondary">
                Published cards this school will see after feature gating and the
                14-day window on the dashboard.
              </p>
            </div>
            {effective.length > 0 ? (
              <ul className="space-y-2">
                {effective.map((row) => (
                  <li
                    key={`${row.announcementId}-${row.id}`}
                    className="rounded-admin-md border border-admin-border bg-admin-bg px-3 py-3"
                  >
                    <p className="text-sm font-medium text-admin-text">
                      {row.title}
                    </p>
                    <p className="mt-1 text-xs text-admin-muted font-secondary">
                      {formatDate(row.publishedAt)} · {row.ctaLabel} ·{" "}
                      {row.featureKey}
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-admin-faint font-secondary">
                No published cards for this school.
              </p>
            )}
          </section>
        </>
      )}
    </div>
  );
}
