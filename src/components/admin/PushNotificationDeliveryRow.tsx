"use client";

import Link from "next/link";
import { ChevronRight, Smartphone } from "lucide-react";
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

function recipientLabel(delivery: AdminPushNotificationDelivery): string {
  if (delivery.recipientEmail) return delivery.recipientEmail;
  return `${delivery.recipientUserId.slice(0, 8)}…`;
}

type PushNotificationDeliveryRowProps = {
  delivery: AdminPushNotificationDelivery;
  showDivider: boolean;
  showRecipient?: boolean;
};

export default function PushNotificationDeliveryRow({
  delivery,
  showDivider,
  showRecipient = true,
}: PushNotificationDeliveryRowProps) {
  const content = (
    <>
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border bg-admin-accent-soft text-admin-accent border-admin-accent/20">
        <Smartphone className="h-3.5 w-3.5" aria-hidden />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${statusPillClass(delivery.status)}`}
          >
            {statusLabel(delivery.status)}
          </span>
          <span className="inline-flex items-center rounded-full border border-admin-border bg-admin-bg px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-admin-muted">
            {portalLabel(delivery.recipientPortal)}
          </span>
        </div>
        <p className="mt-1 truncate text-sm font-medium text-admin-text">
          {delivery.title}
        </p>
        <p className="truncate text-sm text-admin-muted">{delivery.body}</p>
        <p className="mt-1 text-[11px] text-admin-faint">
          {showRecipient ? `To ${recipientLabel(delivery)} · ` : ""}
          {formatRelativeTime(delivery.createdAt)}
        </p>
        {delivery.status === "failed" && delivery.errorMessage ? (
          <p className="mt-1 text-[11px] text-admin-error">
            {delivery.errorMessage}
          </p>
        ) : null}
      </div>
      {delivery.messageHref ? (
        <ChevronRight
          className="h-3.5 w-3.5 shrink-0 text-admin-faint opacity-35 transition-opacity group-hover:opacity-70"
          aria-hidden
        />
      ) : null}
    </>
  );

  return (
    <li className={showDivider ? "border-b border-admin-border" : undefined}>
      {delivery.messageHref ? (
        <Link
          href={delivery.messageHref}
          target="_blank"
          rel="noopener noreferrer"
          className="group flex items-center gap-2.5 rounded-lg px-1.5 py-2.5 transition-colors hover:bg-admin-bg"
        >
          {content}
        </Link>
      ) : (
        <div className="flex items-center gap-2.5 rounded-lg px-1.5 py-2.5">
          {content}
        </div>
      )}
    </li>
  );
}
