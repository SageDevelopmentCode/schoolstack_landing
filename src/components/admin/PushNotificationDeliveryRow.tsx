"use client";

import Link from "next/link";
import { ChevronRight, User } from "lucide-react";
import {
  MobilePushNotificationPreviewStack,
  type PushNotificationPreviewMode,
} from "@/components/admin/MobilePushNotificationPreview";
import type { AdminPushNotificationDelivery } from "@/lib/admin/push-notification-deliveries";
import { formatRelativeTime } from "@/lib/school-admin/activity-notifications";

export function statusLabel(
  status: AdminPushNotificationDelivery["status"],
): string {
  switch (status) {
    case "sent":
      return "Sent";
    case "failed":
      return "Failed";
    case "skipped_no_token":
      return "No push token";
    default:
      return status;
  }
}

export function statusPillClass(
  status: AdminPushNotificationDelivery["status"],
): string {
  switch (status) {
    case "sent":
      return "bg-admin-success-bg text-admin-success border-admin-success-border";
    case "failed":
      return "bg-admin-error-bg text-admin-error border-admin-error-border";
    case "skipped_no_token":
      return "bg-admin-neutral-bg text-admin-muted border-admin-border";
    default:
      return "bg-admin-bg text-admin-muted border-admin-border";
  }
}

export function portalLabel(
  portal: AdminPushNotificationDelivery["recipientPortal"],
): string {
  switch (portal) {
    case "parent":
      return "Parent";
    case "teacher":
      return "Teacher";
    case "admin":
      return "Admin";
    default:
      return portal;
  }
}

function recipientDisplayLabel(delivery: AdminPushNotificationDelivery): string {
  if (delivery.recipientEmail) return delivery.recipientEmail;
  return `User ${delivery.recipientUserId.slice(0, 8)}…`;
}

const cardShellClass =
  "block rounded-admin-md border border-admin-border bg-admin-bg p-3 transition-colors";

type PushNotificationDeliveryRowProps = {
  delivery: AdminPushNotificationDelivery;
  showRecipient?: boolean;
  showOrganization?: boolean;
  previewMode?: PushNotificationPreviewMode;
};

export default function PushNotificationDeliveryRow({
  delivery,
  showRecipient = true,
  showOrganization = false,
  previewMode = "both",
}: PushNotificationDeliveryRowProps) {
  const timeLabel = formatRelativeTime(delivery.createdAt);

  const content = (
    <div className="min-w-0 space-y-2.5">
      {showOrganization && delivery.organizationName ? (
        <p className="text-[11px] font-medium text-admin-muted truncate">
          {delivery.organizationName}
        </p>
      ) : null}
      {showRecipient ? (
        <div className="flex items-start justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2">
            <User
              className="h-4 w-4 shrink-0 text-admin-muted"
              aria-hidden
            />
            <p className="truncate text-sm font-semibold text-admin-text">
              {recipientDisplayLabel(delivery)}
            </p>
          </div>
          <span className="shrink-0 text-[11px] text-admin-faint whitespace-nowrap">
            {timeLabel}
          </span>
        </div>
      ) : (
        <div className="flex items-center justify-between gap-2">
          <span className="text-[11px] font-medium text-admin-muted">
            {timeLabel}
          </span>
          {delivery.messageHref ? (
            <ChevronRight
              className="h-3.5 w-3.5 shrink-0 text-admin-faint opacity-35 transition-opacity group-hover:opacity-70"
              aria-hidden
            />
          ) : null}
        </div>
      )}

      <div className="flex items-center gap-2">
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
          <span
            className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${statusPillClass(delivery.status)}`}
          >
            {statusLabel(delivery.status)}
          </span>
          <span className="inline-flex items-center rounded-full border border-admin-border bg-admin-surface px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-admin-muted">
            {portalLabel(delivery.recipientPortal)}
          </span>
        </div>
        {showRecipient && delivery.messageHref ? (
          <ChevronRight
            className="h-3.5 w-3.5 shrink-0 text-admin-faint opacity-35 transition-opacity group-hover:opacity-70"
            aria-hidden
          />
        ) : null}
      </div>

      <MobilePushNotificationPreviewStack
        mode={previewMode}
        title={delivery.title}
        body={delivery.body}
        createdAt={delivery.createdAt}
      />

      {delivery.status === "failed" && delivery.errorMessage ? (
        <p className="text-[11px] text-admin-error">{delivery.errorMessage}</p>
      ) : null}
    </div>
  );

  return (
    <li>
      {delivery.messageHref ? (
        <Link
          href={delivery.messageHref}
          target="_blank"
          rel="noopener noreferrer"
          className={`group ${cardShellClass} hover:bg-admin-surface`}
        >
          {content}
        </Link>
      ) : (
        <div className={cardShellClass}>{content}</div>
      )}
    </li>
  );
}
