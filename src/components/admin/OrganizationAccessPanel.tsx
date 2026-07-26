"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2, UserMinus, UserPlus } from "lucide-react";
import type { OrganizationMembershipRecord } from "@/lib/admin/organization-memberships";
import { AdminSelect } from "@/components/admin/ui/AdminSelect";

type OrganizationAccessPanelProps = {
  organizationId: string;
  organizationName: string;
};

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export default function OrganizationAccessPanel({
  organizationId,
  organizationName,
}: OrganizationAccessPanelProps) {
  const [memberships, setMemberships] = useState<OrganizationMembershipRecord[]>(
    [],
  );
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"admin" | "owner">("admin");

  const loadMemberships = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/admin/organizations/${organizationId}/memberships`,
      );
      const payload = (await response.json()) as {
        memberships?: OrganizationMembershipRecord[];
        error?: string;
      };

      if (!response.ok) {
        throw new Error(payload.error ?? "Failed to load access list.");
      }

      setMemberships(payload.memberships ?? []);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Failed to load access list.",
      );
      setMemberships([]);
    } finally {
      setLoading(false);
    }
  }, [organizationId]);

  useEffect(() => {
    queueMicrotask(() => {
      void loadMemberships();
    });
  }, [loadMemberships]);

  const handleAdd = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/admin/organizations/${organizationId}/memberships`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, role }),
        },
      );
      const payload = (await response.json()) as {
        membership?: OrganizationMembershipRecord;
        error?: string;
      };

      if (!response.ok || !payload.membership) {
        throw new Error(payload.error ?? "Failed to assign access.");
      }

      setEmail("");
      await loadMemberships();
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "Failed to assign access.",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDisable = async (membershipId: string) => {
    setSaving(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/admin/organizations/${organizationId}/memberships/${membershipId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "disabled" }),
        },
      );
      const payload = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(payload.error ?? "Failed to remove access.");
      }

      await loadMemberships();
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "Failed to remove access.",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="bg-admin-surface border border-admin-border rounded-admin-md p-4 space-y-4">
      <div>
        <h2 className="text-xs font-semibold text-admin-faint uppercase tracking-wide font-secondary">
          School admin access
        </h2>
        <p className="mt-1 text-sm text-admin-muted font-secondary">
          Assign who can sign in to {organizationName}&apos;s admin portal.
          Users must already exist in Supabase Auth.
        </p>
      </div>

      {error ? (
        <p
          className="rounded-admin-md border border-admin-accent/30 bg-admin-accent-soft/30 px-3 py-2 text-sm text-admin-accent font-secondary"
          role="alert"
        >
          {error}
        </p>
      ) : null}

      <form onSubmit={handleAdd} className="grid gap-3 sm:grid-cols-[1fr_auto_auto]">
        <label className="block space-y-1">
          <span className="text-xs text-admin-muted font-secondary">Email</span>
          <input
            type="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="admin@school.org"
            className="w-full text-sm border border-admin-border rounded-admin-md px-3 py-2 bg-admin-bg"
          />
        </label>
        <label className="block space-y-1">
          <span className="text-xs text-admin-muted font-secondary">Role</span>
          <AdminSelect
            value={role}
            onChange={(event) =>
              setRole(event.target.value as "admin" | "owner")
            }
            className="w-full text-sm border border-admin-border rounded-admin-md px-3 py-2 bg-admin-bg"
          >
            <option value="admin">Admin</option>
            <option value="owner">Owner</option>
          </AdminSelect>
        </label>
        <div className="flex items-end">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex w-full items-center justify-center gap-2 rounded-admin-md bg-admin-accent px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <UserPlus className="h-4 w-4" />
            )}
            Add admin
          </button>
        </div>
      </form>

      <div className="space-y-2">
        {loading ? (
          <div className="flex items-center gap-2 text-sm text-admin-faint font-secondary">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading access list…
          </div>
        ) : memberships.length === 0 ? (
          <p className="text-sm text-admin-faint font-secondary">
            No school admins assigned yet.
          </p>
        ) : (
          <ul className="divide-y divide-border rounded-admin-md border border-admin-border overflow-hidden">
            {memberships.map((membership) => (
              <li
                key={membership.id}
                className="flex items-center justify-between gap-3 bg-admin-bg px-3 py-3"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium text-admin-text truncate">
                    {membership.email ?? membership.userId}
                  </p>
                  <p className="text-xs text-admin-muted font-secondary">
                    {membership.role} · {membership.status} · added{" "}
                    {formatDateTime(membership.createdAt)}
                  </p>
                </div>
                {membership.status === "active" ? (
                  <button
                    type="button"
                    disabled={saving}
                    onClick={() => void handleDisable(membership.id)}
                    className="inline-flex items-center gap-1 rounded-admin-sm border border-admin-border px-2.5 py-1.5 text-xs font-medium text-admin-muted hover:bg-admin-neutral-bg disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <UserMinus className="h-3.5 w-3.5" />
                    Remove
                  </button>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
