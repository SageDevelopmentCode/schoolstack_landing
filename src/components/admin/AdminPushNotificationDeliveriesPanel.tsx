"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import type { PushNotificationPreviewMode } from "@/components/admin/MobilePushNotificationPreview";
import PushNotificationDeliveryRow from "@/components/admin/PushNotificationDeliveryRow";
import PushNotificationPreviewModeToggle from "@/components/admin/PushNotificationPreviewModeToggle";
import type {
  AdminPushNotificationDelivery,
  AdminPushNotificationsPage,
} from "@/lib/admin/push-notification-deliveries";

type AdminPushNotificationDeliveriesPanelProps = {
  loadPage: (cursor: string | null) => Promise<AdminPushNotificationsPage>;
  reloadKey: string;
  fetchEnabled?: boolean;
  compact?: boolean;
  showRecipient?: boolean;
  showOrganization?: boolean;
  defaultPreviewMode?: PushNotificationPreviewMode;
  emptyMessage?: string;
};

const PAGE_SIZE = 20;

function isNearScrollBottom(element: HTMLElement): boolean {
  const thresholdPx = 120;
  return (
    element.scrollTop + element.clientHeight >=
    element.scrollHeight - thresholdPx
  );
}

export default function AdminPushNotificationDeliveriesPanel({
  loadPage,
  reloadKey,
  fetchEnabled = true,
  compact = false,
  showRecipient = true,
  showOrganization = false,
  defaultPreviewMode = "both",
  emptyMessage = "No mobile push notifications logged yet.",
}: AdminPushNotificationDeliveriesPanelProps) {
  const [previewMode, setPreviewMode] =
    useState<PushNotificationPreviewMode>(defaultPreviewMode);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deliveries, setDeliveries] = useState<AdminPushNotificationDelivery[]>(
    [],
  );
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const hasUserScrolledRef = useRef(false);
  const listIsScrollableRef = useRef(false);

  const fetchPage = useCallback(
    async (cursor: string | null, append: boolean) => {
      if (append) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }
      setError(null);

      try {
        const page = await loadPage(cursor);
        setDeliveries((prev) =>
          append ? [...prev, ...page.deliveries] : page.deliveries,
        );
        setNextCursor(page.nextCursor);
        setHasMore(page.hasMore);
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
    [loadPage],
  );

  const loadDeliveries = useCallback(async () => {
    await fetchPage(null, false);
  }, [fetchPage]);

  const loadMoreDeliveries = useCallback(async () => {
    if (!hasMore || loadingMore || loading || !nextCursor) return;
    await fetchPage(nextCursor, true);
  }, [fetchPage, hasMore, loading, loadingMore, nextCursor]);

  useEffect(() => {
    hasUserScrolledRef.current = false;
    listIsScrollableRef.current = false;

    if (!fetchEnabled) {
      return;
    }

    queueMicrotask(() => {
      setDeliveries([]);
      setNextCursor(null);
      setHasMore(false);
      void loadDeliveries();
    });
  }, [fetchEnabled, loadDeliveries, reloadKey]);

  useEffect(() => {
    if (!fetchEnabled || !hasMore || loading || loadingMore) return;

    const root = scrollContainerRef.current;
    const sentinel = loadMoreRef.current;
    if (!root || !sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;

        const canAutoLoad =
          hasUserScrolledRef.current ||
          (listIsScrollableRef.current && isNearScrollBottom(root));

        if (canAutoLoad) {
          void loadMoreDeliveries();
        }
      },
      { root, rootMargin: "0px" },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [
    deliveries.length,
    fetchEnabled,
    hasMore,
    loadMoreDeliveries,
    loading,
    loadingMore,
  ]);

  useEffect(() => {
    if (!fetchEnabled || loading) return;
    const root = scrollContainerRef.current;
    if (!root) return;

    listIsScrollableRef.current = root.scrollHeight > root.clientHeight + 4;
  }, [deliveries.length, fetchEnabled, loading]);

  const handleScroll = () => {
    hasUserScrolledRef.current = true;
  };

  const maxHeightClass = compact ? "max-h-[calc(100vh-12rem)]" : "max-h-[32rem]";

  if (!fetchEnabled) {
    return null;
  }

  return (
    <section
      className={
        compact
          ? "space-y-3"
          : "bg-admin-surface border border-admin-border rounded-admin-md p-4 space-y-3"
      }
    >
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
          {emptyMessage}
        </p>
      ) : (
        <>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-[11px] text-admin-faint font-secondary">
              Showing {deliveries.length.toLocaleString()} deliveries — scroll or
              load more for older rows.
            </p>
            <PushNotificationPreviewModeToggle
              value={previewMode}
              onChange={setPreviewMode}
            />
          </div>
          <div
            ref={scrollContainerRef}
            onScroll={handleScroll}
            className={`${maxHeightClass} overflow-y-auto`}
          >
            <ul className="flex flex-col gap-3">
              {deliveries.map((delivery) => (
                <PushNotificationDeliveryRow
                  key={delivery.id}
                  delivery={delivery}
                  showRecipient={showRecipient}
                  showOrganization={showOrganization}
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
          {hasMore && !loadingMore ? (
            <div className="flex justify-center pt-1">
              <button
                type="button"
                onClick={() => void loadMoreDeliveries()}
                disabled={loading}
                className="rounded-admin-md border border-admin-border bg-admin-bg px-3 py-1.5 text-xs font-semibold text-admin-text hover:bg-admin-neutral-bg disabled:opacity-50"
              >
                Load more
              </button>
            </div>
          ) : null}
        </>
      )}
    </section>
  );
}

export { PAGE_SIZE as ADMIN_PUSH_DELIVERIES_PAGE_SIZE };
