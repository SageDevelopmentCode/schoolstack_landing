"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import type { PushNotificationPreviewMode } from "@/components/admin/MobilePushNotificationPreview";
import PushNotificationDeliveryRow from "@/components/admin/PushNotificationDeliveryRow";
import PushNotificationPreviewModeToggle from "@/components/admin/PushNotificationPreviewModeToggle";
import type { AdminPushNotificationDelivery } from "@/lib/admin/push-notification-deliveries";

type OrganizationPushNotificationsPanelProps = {
  organizationId: string;
  recipientUserId?: string | null;
  compact?: boolean;
  showRecipient?: boolean;
  defaultPreviewMode?: PushNotificationPreviewMode;
};

const PAGE_SIZE = 20;

export default function OrganizationPushNotificationsPanel({
  organizationId,
  recipientUserId = null,
  compact = false,
  showRecipient = true,
  defaultPreviewMode = "both",
}: OrganizationPushNotificationsPanelProps) {
  const [previewMode, setPreviewMode] =
    useState<PushNotificationPreviewMode>(defaultPreviewMode);
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
    [organizationId, recipientUserId],
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

  const maxHeightClass = compact ? "max-h-[calc(100vh-12rem)]" : "max-h-[32rem]";

  return (
    <section
      className={
        compact
          ? "space-y-3"
          : "bg-admin-surface border border-admin-border rounded-admin-md p-4 space-y-3"
      }
    >
      {!compact ? (
        <div className="space-y-1">
          <h2 className="text-xs font-semibold text-admin-faint uppercase tracking-wide font-secondary">
            Delivery log
          </h2>
          <p className="text-xs text-admin-muted font-secondary">
            Delivery log for MudKitchen mobile app (Expo) push notifications.
          </p>
        </div>
      ) : null}

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
        <>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-[11px] text-admin-faint font-secondary">
              Preview how the notification appeared on device.
            </p>
            <PushNotificationPreviewModeToggle
              value={previewMode}
              onChange={setPreviewMode}
            />
          </div>
          <div
            ref={scrollContainerRef}
            className={`${maxHeightClass} overflow-y-auto`}
          >
            <ul className="flex flex-col gap-3">
              {deliveries.map((delivery) => (
                <PushNotificationDeliveryRow
                  key={delivery.id}
                  delivery={delivery}
                  showRecipient={showRecipient}
                  previewMode={previewMode}
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
        </>
      )}
    </section>
  );
}
