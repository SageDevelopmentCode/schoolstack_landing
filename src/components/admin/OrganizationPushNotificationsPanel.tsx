"use client";

import { useCallback } from "react";
import AdminPushNotificationDeliveriesPanel, {
  ADMIN_PUSH_DELIVERIES_PAGE_SIZE,
} from "@/components/admin/AdminPushNotificationDeliveriesPanel";
import type { PushNotificationPreviewMode } from "@/components/admin/MobilePushNotificationPreview";
import type { AdminPushNotificationsPage } from "@/lib/admin/push-notification-deliveries";

type OrganizationPushNotificationsPanelProps = {
  organizationId: string;
  recipientUserId?: string | null;
  compact?: boolean;
  showRecipient?: boolean;
  defaultPreviewMode?: PushNotificationPreviewMode;
};

export default function OrganizationPushNotificationsPanel({
  organizationId,
  recipientUserId = null,
  compact = false,
  showRecipient = true,
  defaultPreviewMode = "both",
}: OrganizationPushNotificationsPanelProps) {
  const loadPage = useCallback(
    async (cursor: string | null): Promise<AdminPushNotificationsPage> => {
      const params = new URLSearchParams({
        limit: String(ADMIN_PUSH_DELIVERIES_PAGE_SIZE),
      });
      if (cursor) params.set("cursor", cursor);
      if (recipientUserId) {
        params.set("recipientUserId", recipientUserId);
      }

      const response = await fetch(
        `/api/admin/organizations/${organizationId}/push-notifications?${params}`,
      );
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error ?? "Failed to load push notifications.");
      }

      return payload as AdminPushNotificationsPage;
    },
    [organizationId, recipientUserId],
  );

  const reloadKey = `${organizationId}:${recipientUserId ?? ""}`;

  return (
    <>
      {!compact ? (
        <div className="space-y-1 mb-3">
          <h2 className="text-xs font-semibold text-admin-faint uppercase tracking-wide font-secondary">
            Delivery log
          </h2>
          <p className="text-xs text-admin-muted font-secondary">
            Delivery log for MudKitchen mobile app (Expo) push notifications.
          </p>
        </div>
      ) : null}
      <AdminPushNotificationDeliveriesPanel
        loadPage={loadPage}
        reloadKey={reloadKey}
        compact={compact}
        showRecipient={showRecipient}
        defaultPreviewMode={defaultPreviewMode}
        showOrganization={false}
      />
    </>
  );
}
