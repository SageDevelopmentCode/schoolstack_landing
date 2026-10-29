"use client";

import { useCallback } from "react";
import AdminPushNotificationDeliveriesPanel from "@/components/admin/AdminPushNotificationDeliveriesPanel";
import { AdminDrawer } from "@/components/admin/ui/AdminDrawer";
import type { ActivityDatePreset } from "@/lib/activity-log";
import type { AdminPushNotificationsPage } from "@/lib/admin/push-notification-deliveries";
import type { MobilePushNotificationKind } from "@/lib/notifications/mobile-push-catalog";
import { recipientPortalsLabel } from "@/lib/notifications/mobile-push-catalog";

type SurfaceFilter = "" | "parent_portal" | "teacher_portal" | "school_admin";

type MobilePushNotificationHistoryDrawerProps = {
  open: boolean;
  onClose: () => void;
  kind: MobilePushNotificationKind | null;
  label: string;
  datePreset: ActivityDatePreset;
  organizationId: string;
  surfaceFilter: SurfaceFilter;
  showOrganization: boolean;
};

export default function MobilePushNotificationHistoryDrawer({
  open,
  onClose,
  kind,
  label,
  datePreset,
  organizationId,
  surfaceFilter,
  showOrganization,
}: MobilePushNotificationHistoryDrawerProps) {
  const loadPage = useCallback(
    async (cursor: string | null): Promise<AdminPushNotificationsPage> => {
      if (!kind) {
        return { deliveries: [], nextCursor: null, hasMore: false };
      }

      const params = new URLSearchParams({
        kind,
        preset: datePreset,
        limit: "20",
      });
      if (cursor) params.set("cursor", cursor);
      if (organizationId) params.set("organizationId", organizationId);
      if (surfaceFilter) params.set("surface", surfaceFilter);

      const response = await fetch(
        `/api/admin/mobile-push-analytics/deliveries?${params.toString()}`,
      );
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error ?? "Failed to load delivery history.");
      }

      return payload as AdminPushNotificationsPage;
    },
    [datePreset, kind, organizationId, surfaceFilter],
  );

  const reloadKey = `${kind ?? ""}:${datePreset}:${organizationId}:${surfaceFilter}`;
  const fetchEnabled = open && Boolean(kind);

  return (
    <AdminDrawer
      open={open}
      onClose={onClose}
      title={kind ? `${label} — delivery history` : "Delivery history"}
      width="lg"
    >
      <div className="p-4">
        {open && kind ? (
          <AdminPushNotificationDeliveriesPanel
            loadPage={loadPage}
            reloadKey={reloadKey}
            fetchEnabled={fetchEnabled}
            compact
            showOrganization={showOrganization}
            emptyMessage="No deliveries for this notification type in the selected period."
          />
        ) : null}
      </div>
    </AdminDrawer>
  );
}

export function formatKindRecipientSummary(
  recipientPortals: ("parent" | "teacher" | "admin")[],
): string {
  return recipientPortalsLabel(recipientPortals);
}
