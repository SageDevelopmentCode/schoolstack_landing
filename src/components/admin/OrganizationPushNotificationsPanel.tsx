"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ChevronRight, Loader2, Smartphone } from "lucide-react";
import type { AdminPushNotificationDelivery } from "@/lib/admin/push-notification-deliveries";
import { formatRelativeTime } from "@/lib/school-admin/activity-notifications";

type OrganizationPushNotificationsPanelProps = {
  organizationId: string;
};

const PAGE_SIZE = 20;

function statusLabel(status: AdminPushNotificationDelivery["status"]): string {
  switch (status) {
    case "sent":
      return "Sent";
    case "failed":
      return "Failed";
    case "skipped_no_token":
      return "No device";
    default:
      return status;
  }
}

function statusPillClass(status: AdminPushNotificationDelivery["status"]): string {
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

function portalLabel(portal: AdminPushNotificationDelivery["recipientPortal"]): string {
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

function DeliveryRow({
  delivery,
  showDivider,
}: {
  delivery: AdminPushNotificationDelivery;
  showDivider: boolean;
}) {
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
          To {recipientLabel(delivery)} · {formatRelativeTime(delivery.createdAt)}
        </p>
        {delivery.status === "failed" && delivery.errorMessage ? (
          <p className="mt-1 text-[11px] text-admin-error">{delivery.errorMessage}</p>
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

export default function OrganizationPushNotificationsPanel({
  organizationId,
}: OrganizationPushNotificationsPanelProps) {
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deliveries, setDeliveries] = useState<AdminPushNotificationDelivery[]>(
    [],
  );
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const fetchPage = useCallback(
    async (cursor: string | null, append: boolean) => {
      if (append) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }
      setError(null);

      try {
        const params = new URLSearchParams({ limit: String(PAGE_SIZE) });
        if (cursor) params.set("cursor", cursor);

        const response = await fetch(
          `/api/admin/organizations/${organizationId}/push-notifications?${params}`,
        );
        const payload = await response.json();

        if (!response.ok) {
          throw new Error(payload.error ?? "Failed to load push notifications.");
        }

        const pageDeliveries =
          (payload.deliveries as AdminPushNotificationDelivery[]) ?? [];

        setDeliveries((prev) =>
          append ? [...prev, ...pageDeliveries] : pageDeliveries,
        );
        setNextCursor(payload.nextCursor ?? null);
        setHasMore(Boolean(payload.hasMore));
      } catch (loadError) {
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Failed to load push notifications.",
        );
        if (!append) {
          setDeliveries([]);
          setNextCursor(null);
          setHasMore(false);
        }
      } finally {
        if (append) {
          setLoadingMore(false);
        } else {
          setLoading(false);
        }
      }
    },
    [organizationId],
  );

  const loadDeliveries = useCallback(async () => {
    await fetchPage(null, false);
  }, [fetchPage]);

  const loadMoreDeliveries = useCallback(async () => {
    if (!hasMore || loadingMore || loading || !nextCursor) return;
    await fetchPage(nextCursor, true);
  }, [fetchPage, hasMore, loading, loadingMore, nextCursor]);

  useEffect(() => {
    queueMicrotask(() => {
      setDeliveries([]);
      setNextCursor(null);
      setHasMore(false);
      void loadDeliveries();
    });
  }, [loadDeliveries]);

  useEffect(() => {
    if (!hasMore || loading || loadingMore) return;

    const root = scrollContainerRef.current;
    const sentinel = loadMoreRef.current;
    if (!root || !sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          void loadMoreDeliveries();
        }
      },
      { root, rootMargin: "120px" },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [deliveries.length, hasMore, loadMoreDeliveries, loading, loadingMore]);

  return (
    <section className="bg-admin-surface border border-admin-border rounded-admin-md p-4 space-y-3">
      <div className="space-y-1">
        <h2 className="text-xs font-semibold text-admin-faint uppercase tracking-wide font-secondary">
          Mobile push notifications
        </h2>
        <p className="text-xs text-admin-muted font-secondary">
          Delivery log for MudKitchen mobile app (Expo) push notifications.
        </p>
      </div>

      {loading && deliveries.length === 0 ? (
        <div className="flex items-center gap-2 py-6 text-sm text-admin-faint font-secondary">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading push notifications…
        </div>
      ) : error ? (
        <div className="rounded-admin-md border border-admin-border bg-admin-bg px-4 py-6 text-center">
          <p className="text-sm text-admin-error font-secondary">{error}</p>
          <button
            type="button"
            onClick={() => void loadDeliveries()}
            className="mt-3 rounded-admin-md border border-admin-border bg-admin-surface px-3 py-1.5 text-xs font-semibold text-admin-text hover:bg-admin-bg"
          >
            Try again
          </button>
        </div>
      ) : deliveries.length === 0 ? (
        <p className="py-6 text-center text-sm text-admin-faint font-secondary">
          No mobile push notifications logged yet.
        </p>
      ) : (
        <div ref={scrollContainerRef} className="max-h-[32rem] overflow-y-auto">
          <ul className="flex flex-col">
            {deliveries.map((delivery, index) => (
              <DeliveryRow
                key={delivery.id}
                delivery={delivery}
                showDivider={index < deliveries.length - 1}
              />
            ))}
          </ul>
          <div ref={loadMoreRef} className="h-4" aria-hidden />
          {loadingMore ? (
            <div className="flex justify-center py-3">
              <Loader2
                className="h-4 w-4 animate-spin text-admin-faint"
                aria-label="Loading more push notifications"
              />
            </div>
          ) : null}
        </div>
      )}
    </section>
  );
}
