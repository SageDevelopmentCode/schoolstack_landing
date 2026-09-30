"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AdminDetailEmpty } from "@/components/admin/ui/AdminDetailEmpty";
import { AdminDetailHeader } from "@/components/admin/ui/AdminDetailHeader";
import { AdminDetailLayout } from "@/components/admin/ui/AdminDetailLayout";
import { AdminDetailSection } from "@/components/admin/ui/AdminDetailSection";
import { AdminEmptyState } from "@/components/admin/ui/AdminEmptyState";
import { AdminFilterChip } from "@/components/admin/ui/AdminFilterChip";
import { AdminListItem } from "@/components/admin/ui/AdminListItem";
import { AdminListPanelHeader } from "@/components/admin/ui/AdminListPanelHeader";
import { AdminMasterDetail } from "@/components/admin/ui/AdminMasterDetail";
import { AdminPageState } from "@/components/admin/ui/AdminPageState";
import { AdminStatusBadge } from "@/components/admin/ui/AdminStatusBadge";
import type { OutboundEmailSuppressionRow } from "@/lib/outbound-email-suppressions-types";

type StatusFilter = "all" | "unsubscribed" | "whitelisted";

function formatWhen(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString();
}

export default function EmailSuppressionsPage() {
  const [rows, setRows] = useState<OutboundEmailSuppressionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [selectedEmail, setSelectedEmail] = useState<string | null>(null);
  const [newEmail, setNewEmail] = useState("");
  const [newNotes, setNewNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/email-suppressions");
      const data = (await res.json()) as {
        suppressions?: OutboundEmailSuppressionRow[];
        error?: string;
      };
      if (!res.ok) {
        setError(data.error ?? "Failed to load suppressions.");
        return;
      }
      const list = data.suppressions ?? [];
      setRows(list);
      setSelectedEmail((current) => current ?? list[0]?.email ?? null);
    } catch {
      setError("Failed to load suppressions.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    queueMicrotask(() => {
      void load();
    });
  }, [load]);

  const filtered = useMemo(() => {
    if (statusFilter === "all") return rows;
    return rows.filter((row) => row.status === statusFilter);
  }, [rows, statusFilter]);

  const selected = rows.find((row) => row.email === selectedEmail) ?? null;

  const counts = useMemo(() => {
    let unsubscribed = 0;
    let whitelisted = 0;
    for (const row of rows) {
      if (row.status === "unsubscribed") unsubscribed += 1;
      if (row.status === "whitelisted") whitelisted += 1;
    }
    return { unsubscribed, whitelisted, all: rows.length };
  }, [rows]);

  async function runAction(
    action: "whitelist" | "unsubscribe",
    email: string,
    notes?: string,
  ) {
    setSaving(true);
    setActionError(null);
    try {
      const res = await fetch("/api/admin/email-suppressions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, email, notes }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setActionError(data.error ?? "Update failed.");
        return;
      }
      await load();
      setSelectedEmail(email);
      if (action === "whitelist") {
        setNewEmail("");
        setNewNotes("");
      }
    } catch {
      setActionError("Update failed.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <AdminPageState variant="loading" />;
  if (error) return <AdminPageState variant="error" message={error} />;

  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="border-b border-admin-border bg-admin-surface px-6 py-4">
        <h1 className="text-lg font-semibold text-admin-text">Email suppressions</h1>
        <p className="text-sm text-admin-text-muted mt-1 max-w-2xl">
          People who unsubscribed from non-essential MudKitchen emails, and
          whitelist overrides that allow marketing sends again.
        </p>
        <div className="mt-4 flex flex-wrap gap-2 items-end">
          <label className="flex flex-col gap-1 text-xs text-admin-text-muted">
            Whitelist email
            <input
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder="parent@example.com"
              className="rounded-md border border-admin-border bg-admin-bg px-3 py-2 text-sm text-admin-text min-w-[240px]"
            />
          </label>
          <label className="flex flex-col gap-1 text-xs text-admin-text-muted">
            Note (optional)
            <input
              type="text"
              value={newNotes}
              onChange={(e) => setNewNotes(e.target.value)}
              placeholder="Re-subscribed on phone call"
              className="rounded-md border border-admin-border bg-admin-bg px-3 py-2 text-sm text-admin-text min-w-[200px]"
            />
          </label>
          <button
            type="button"
            disabled={saving || !newEmail.trim()}
            onClick={() =>
              void runAction("whitelist", newEmail.trim(), newNotes.trim())
            }
            className="rounded-md bg-admin-accent px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            Add to whitelist
          </button>
        </div>
        {actionError ? (
          <p className="text-sm text-red-600 mt-2" role="alert">{actionError}</p>
        ) : null}
      </div>

      <AdminMasterDetail
        className="flex-1 min-h-0"
        list={
          <>
            <AdminListPanelHeader>
              <div className="flex flex-wrap gap-1.5">
                <AdminFilterChip
                  label={`All (${counts.all})`}
                  active={statusFilter === "all"}
                  onClick={() => setStatusFilter("all")}
                />
                <AdminFilterChip
                  label={`Unsubscribed (${counts.unsubscribed})`}
                  active={statusFilter === "unsubscribed"}
                  onClick={() => setStatusFilter("unsubscribed")}
                />
                <AdminFilterChip
                  label={`Whitelisted (${counts.whitelisted})`}
                  active={statusFilter === "whitelisted"}
                  onClick={() => setStatusFilter("whitelisted")}
                />
              </div>
            </AdminListPanelHeader>
            {filtered.length === 0 ? (
              <AdminEmptyState message="No matching email addresses." />
            ) : (
              filtered.map((row) => (
                <AdminListItem
                  key={row.email}
                  selected={row.email === selectedEmail}
                  onClick={() => setSelectedEmail(row.email)}
                  title={row.email}
                  subtitle={
                    row.status === "unsubscribed"
                      ? `Unsubscribed ${formatWhen(row.unsubscribed_at)}`
                      : `Whitelisted ${formatWhen(row.whitelisted_at)}`
                  }
                />
              ))
            )}
          </>
        }
        detail={
          selected ? (
            <AdminDetailLayout>
              <AdminDetailHeader title={selected.email} />
              <AdminDetailSection title="Status">
                <AdminStatusBadge
                  label={
                    selected.status === "unsubscribed"
                      ? "Unsubscribed"
                      : "Whitelisted"
                  }
                  variant={
                    selected.status === "unsubscribed" ? "warning" : "success"
                  }
                />
              </AdminDetailSection>
              <AdminDetailSection title="Source">
                <p className="text-sm text-admin-text">
                  {selected.source === "link" ? "Unsubscribe link" : "Platform admin"}
                </p>
              </AdminDetailSection>
              {selected.notes ? (
                <AdminDetailSection title="Notes">
                  <p className="text-sm text-admin-text whitespace-pre-wrap">
                    {selected.notes}
                  </p>
                </AdminDetailSection>
              ) : null}
              <AdminDetailSection title="Timeline">
                <ul className="text-sm text-admin-text space-y-1">
                  <li>Unsubscribed: {formatWhen(selected.unsubscribed_at)}</li>
                  <li>Whitelisted: {formatWhen(selected.whitelisted_at)}</li>
                  <li>Updated: {formatWhen(selected.updated_at)}</li>
                </ul>
              </AdminDetailSection>
              <div className="flex flex-wrap gap-2 pt-2">
                {selected.status === "unsubscribed" ? (
                  <button
                    type="button"
                    disabled={saving}
                    onClick={() =>
                      void runAction("whitelist", selected.email, "Re-subscribed from admin")
                    }
                    className="rounded-md border border-admin-border px-3 py-2 text-sm font-medium text-admin-text hover:bg-admin-bg"
                  >
                    Re-subscribe (whitelist)
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={saving}
                    onClick={() =>
                      void runAction("unsubscribe", selected.email, "Marked unsubscribed from admin")
                    }
                    className="rounded-md border border-admin-border px-3 py-2 text-sm font-medium text-admin-text hover:bg-admin-bg"
                  >
                    Mark unsubscribed
                  </button>
                )}
              </div>
            </AdminDetailLayout>
          ) : (
            <AdminDetailEmpty message="Select an email address" />
          )
        }
      />
    </div>
  );
}
