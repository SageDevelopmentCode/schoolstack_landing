"use client";

import { useCallback, useEffect, useState } from "react";
import { Bell, Loader2 } from "lucide-react";
import { AdminTableSkeleton } from "@/components/admin/ui/AdminSkeleton";
import { AdminDrawer } from "@/components/admin/ui/AdminDrawer";
import OrganizationPushNotificationsPanel from "@/components/admin/OrganizationPushNotificationsPanel";
import type {
  OrganizationMobileUser,
  OrganizationMobileUserPortal,
  OrganizationMobileUsersSummary,
} from "@/lib/admin/organization-mobile-users";

type OrganizationMobileUsersPanelProps = {
  organizationId: string;
};

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function portalBadgeLabel(portal: OrganizationMobileUserPortal): string {
  switch (portal) {
    case "parent":
      return "Parent";
    case "teacher":
      return "Teacher";
    case "admin":
      return "School admin";
    default:
      return portal;
  }
}

function platformLabels(user: OrganizationMobileUser): string[] {
  const platforms = new Set<string>();
  for (const device of user.devices) {
    if (device.platform === "ios") platforms.add("iOS");
    else if (device.platform === "android") platforms.add("Android");
    else platforms.add("Unknown");
  }
  return [...platforms];
}

function firstMobileRegistrationAt(user: OrganizationMobileUser): string | null {
  if (user.devices.length === 0) return null;

  let earliest = user.devices[0]?.updatedAt ?? null;
  for (const device of user.devices) {
    if (!earliest || new Date(device.updatedAt) < new Date(earliest)) {
      earliest = device.updatedAt;
    }
  }
  return earliest;
}

type DrawerUser = Pick<
  OrganizationMobileUser,
  "userId" | "displayName" | "email"
> & {
  firstMobileRegistrationAt: string | null;
};

export default function OrganizationMobileUsersPanel({
  organizationId,
}: OrganizationMobileUsersPanelProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [users, setUsers] = useState<OrganizationMobileUser[]>([]);
  const [summary, setSummary] = useState<OrganizationMobileUsersSummary | null>(
    null,
  );
  const [drawerUser, setDrawerUser] = useState<DrawerUser | null>(null);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/admin/organizations/${organizationId}/mobile-users`,
      );
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error ?? "Failed to load mobile app users.");
      }

      setUsers((payload.users as OrganizationMobileUser[]) ?? []);
      setSummary((payload.summary as OrganizationMobileUsersSummary) ?? null);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Failed to load mobile app users.",
      );
      setUsers([]);
      setSummary(null);
    } finally {
      setLoading(false);
    }
  }, [organizationId]);

  useEffect(() => {
    queueMicrotask(() => {
      void loadUsers();
    });
  }, [loadUsers]);

  const drawerTitle = drawerUser
    ? `Push notifications — ${drawerUser.displayName}`
    : "Push notifications";

  return (
    <>
      <section className="bg-admin-surface border border-admin-border rounded-admin-md p-4 space-y-3">
        <div className="space-y-1">
          <h2 className="text-xs font-semibold text-admin-faint uppercase tracking-wide font-secondary">
            Mobile app users
          </h2>
          <p className="text-xs text-admin-muted font-secondary">
            Accounts with a registered Expo push token (MudKitchen mobile app).
            No token can mean push was denied, the simulator was used, or the app
            was never opened — not proof the app is uninstalled.
          </p>
          {summary ? (
            <p className="text-xs text-admin-faint font-secondary">
              {summary.withMobilePush} user
              {summary.withMobilePush === 1 ? "" : "s"} · {summary.totalDevices}{" "}
              device{summary.totalDevices === 1 ? "" : "s"}
            </p>
          ) : null}
        </div>

        {loading ? (
          <AdminTableSkeleton
            columns={4}
            rows={5}
            ariaLabel="Loading mobile users"
          />
        ) : error ? (
          <div className="rounded-admin-md border border-admin-border bg-admin-bg px-4 py-6 text-center">
            <p className="text-sm text-admin-error font-secondary">{error}</p>
            <button
              type="button"
              onClick={() => void loadUsers()}
              className="mt-3 rounded-admin-md border border-admin-border bg-admin-surface px-3 py-1.5 text-xs font-semibold text-admin-text hover:bg-admin-bg"
            >
              Try again
            </button>
          </div>
        ) : users.length === 0 ? (
          <p className="py-6 text-center text-sm text-admin-faint font-secondary">
            No mobile push tokens for users affiliated with this school yet.
          </p>
        ) : (
          <div className="overflow-x-auto rounded-admin-md border border-admin-border">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-admin-border bg-admin-bg text-[11px] font-semibold uppercase tracking-wide text-admin-faint">
                <tr>
                  <th className="px-3 py-2 font-secondary">User</th>
                  <th className="px-3 py-2 font-secondary">Portals</th>
                  <th className="px-3 py-2 font-secondary">Devices</th>
                  <th className="px-3 py-2 font-secondary">Platforms</th>
                  <th className="px-3 py-2 font-secondary">Last on mobile</th>
                  <th className="px-3 py-2 font-secondary">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-admin-border">
                {users.map((user) => (
                  <tr key={user.userId} className="bg-admin-surface">
                    <td className="px-3 py-2.5">
                      <p className="font-medium text-admin-text">
                        {user.displayName}
                      </p>
                      {user.email ? (
                        <p className="text-xs text-admin-muted">{user.email}</p>
                      ) : null}
                    </td>
                    <td className="px-3 py-2.5">
                      <div className="flex flex-wrap gap-1">
                        {user.portals.length > 0 ? (
                          user.portals.map((portal) => (
                            <span
                              key={portal}
                              className="inline-flex rounded-full border border-admin-border bg-admin-bg px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-admin-muted"
                            >
                              {portalBadgeLabel(portal)}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-admin-faint">—</span>
                        )}
                      </div>
                    </td>
                    <td className="px-3 py-2.5 text-admin-text">
                      {user.devices.length}
                    </td>
                    <td className="px-3 py-2.5">
                      <div className="flex flex-wrap gap-1">
                        {platformLabels(user).map((label) => (
                          <span
                            key={label}
                            className="inline-flex rounded-full border border-admin-accent/20 bg-admin-accent-soft px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-admin-accent"
                          >
                            {label}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-3 py-2.5 text-xs text-admin-muted whitespace-nowrap">
                      {user.lastMobileActivityAt
                        ? formatDateTime(user.lastMobileActivityAt)
                        : "—"}
                    </td>
                    <td className="px-3 py-2.5 text-right">
                      <button
                        type="button"
                        onClick={() =>
                          setDrawerUser({
                            userId: user.userId,
                            displayName: user.displayName,
                            email: user.email,
                            firstMobileRegistrationAt:
                              firstMobileRegistrationAt(user),
                          })
                        }
                        className="inline-flex items-center gap-1.5 rounded-admin-md border border-admin-border bg-admin-surface px-2.5 py-1.5 text-xs font-semibold text-admin-text hover:bg-admin-bg"
                      >
                        <Bell className="h-3.5 w-3.5" aria-hidden />
                        Notifications
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <AdminDrawer
        open={drawerUser !== null}
        onClose={() => setDrawerUser(null)}
        title={drawerTitle}
        width="lg"
      >
        {drawerUser ? (
          <div className="p-4 space-y-3">
            {drawerUser.email ? (
              <p className="text-xs text-admin-muted">{drawerUser.email}</p>
            ) : null}
            {drawerUser.firstMobileRegistrationAt ? (
              <p className="text-xs text-admin-muted font-secondary">
                First registered on mobile:{" "}
                {formatDateTime(drawerUser.firstMobileRegistrationAt)}
              </p>
            ) : null}
            <p className="text-xs text-admin-faint font-secondary">
              Status reflects whether a push token existed at send time.{" "}
              <span className="text-admin-muted">No push token</span> means the
              MudKitchen mobile app had not registered for push yet — not whether
              they have a device today.
            </p>
            <OrganizationPushNotificationsPanel
              key={drawerUser.userId}
              organizationId={organizationId}
              recipientUserId={drawerUser.userId}
              compact
              showRecipient={false}
            />
          </div>
        ) : null}
      </AdminDrawer>
    </>
  );
}
