"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  Bell,
  ChevronRight,
  ClipboardList,
  CreditCard,
  GraduationCap,
  Heart,
  Loader2,
  type LucideIcon,
} from "lucide-react";
import {
  formatRelativeTime,
  type ActivityNotificationCategory,
  type SchoolAdminActivityNotification,
} from "@/lib/school-admin/activity-notifications";

type OrganizationNotificationsPanelProps = {
  organizationId: string;
};

const PAGE_SIZE = 20;

type NotificationVisual = {
  Icon: LucideIcon;
  badgeClassName: string;
};

function getNotificationVisual(
  category: ActivityNotificationCategory,
): NotificationVisual {
  switch (category) {
    case "enrollment":
      return {
        Icon: GraduationCap,
        badgeClassName:
          "bg-admin-success-bg text-admin-success border-admin-success-border",
      };
    case "payments":
      return {
        Icon: CreditCard,
        badgeClassName: "bg-admin-info-bg text-admin-info border-admin-info-border",
      };
    case "committees":
      return {
        Icon: Heart,
        badgeClassName: "bg-admin-accent-soft text-admin-accent border-admin-accent/20",
      };
    case "other":
      return {
        Icon: Bell,
        badgeClassName: "bg-admin-bg text-admin-muted border-admin-border",
      };
    case "applications":
    default:
      return {
        Icon: ClipboardList,
        badgeClassName: "bg-admin-accent-soft text-admin-accent border-admin-accent/20",
      };
  }
}

function NotificationRow({
  notification,
  showDivider,
}: {
  notification: SchoolAdminActivityNotification;
  showDivider: boolean;
}) {
  const { Icon, badgeClassName } = getNotificationVisual(notification.category);

  return (
    <li
      className={showDivider ? "border-b border-admin-border" : undefined}
    >
      <Link
        href={notification.href}
        target="_blank"
        rel="noopener noreferrer"
        className="group flex items-center gap-2.5 rounded-lg px-1.5 py-2.5 transition-colors hover:bg-admin-bg"
      >
        <div
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border ${badgeClassName}`}
        >
          <Icon className="h-3.5 w-3.5" aria-hidden />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm text-admin-text">{notification.detail}</p>
          <p className="mt-0.5 text-[11px] text-admin-faint">
            {formatRelativeTime(notification.createdAt)}
          </p>
        </div>
        <ChevronRight
          className="h-3.5 w-3.5 shrink-0 text-admin-faint opacity-35 transition-opacity group-hover:opacity-70"
          aria-hidden
        />
      </Link>
    </li>
  );
}

export default function OrganizationNotificationsPanel({
  organizationId,
}: OrganizationNotificationsPanelProps) {
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<
    SchoolAdminActivityNotification[]
  >([]);
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
          `/api/admin/organizations/${organizationId}/activity-notifications?${params}`,
        );
        const payload = await response.json();

        if (!response.ok) {
          throw new Error(payload.error ?? "Failed to load notifications.");
        }

        const pageNotifications =
          (payload.notifications as SchoolAdminActivityNotification[]) ?? [];

        setNotifications((prev) =>
          append ? [...prev, ...pageNotifications] : pageNotifications,
        );
        setNextCursor(payload.nextCursor ?? null);
        setHasMore(Boolean(payload.hasMore));
      } catch (loadError) {
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Failed to load notifications.",
        );
        if (!append) {
          setNotifications([]);
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

  const loadNotifications = useCallback(async () => {
    await fetchPage(null, false);
  }, [fetchPage]);

  const loadMoreNotifications = useCallback(async () => {
    if (!hasMore || loadingMore || loading || !nextCursor) return;
    await fetchPage(nextCursor, true);
  }, [fetchPage, hasMore, loading, loadingMore, nextCursor]);

  useEffect(() => {
    queueMicrotask(() => {
      setNotifications([]);
      setNextCursor(null);
      setHasMore(false);
      void loadNotifications();
    });
  }, [loadNotifications]);

  useEffect(() => {
    if (!hasMore || loading || loadingMore) return;

    const root = scrollContainerRef.current;
    const sentinel = loadMoreRef.current;
    if (!root || !sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          void loadMoreNotifications();
        }
      },
      { root, rootMargin: "120px" },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, loadMoreNotifications, loading, loadingMore, notifications.length]);

  return (
    <section className="bg-admin-surface border border-admin-border rounded-admin-md p-4 space-y-3">
      <div className="space-y-1">
        <h2 className="text-xs font-semibold text-admin-faint uppercase tracking-wide font-secondary">
          School admin notifications
        </h2>
        <p className="text-xs text-admin-muted font-secondary">
          Read-only — does not mark notifications read for school staff.
        </p>
      </div>

      {loading && notifications.length === 0 ? (
        <div className="flex items-center gap-2 py-6 text-sm text-admin-faint font-secondary">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading notifications…
        </div>
      ) : error ? (
        <div className="rounded-admin-md border border-admin-border bg-admin-bg px-4 py-6 text-center">
          <p className="text-sm text-admin-error font-secondary">{error}</p>
          <button
            type="button"
            onClick={() => void loadNotifications()}
            className="mt-3 rounded-admin-md border border-admin-border bg-admin-surface px-3 py-1.5 text-xs font-semibold text-admin-text hover:bg-admin-bg"
          >
            Try again
          </button>
        </div>
      ) : notifications.length === 0 ? (
        <p className="py-6 text-center text-sm text-admin-faint font-secondary">
          No recent activity in the last 30 days.
        </p>
      ) : (
        <div ref={scrollContainerRef} className="max-h-[32rem] overflow-y-auto">
          <ul className="flex flex-col">
            {notifications.map((notification, index) => (
              <NotificationRow
                key={notification.id}
                notification={notification}
                showDivider={index < notifications.length - 1}
              />
            ))}
          </ul>
          <div ref={loadMoreRef} className="h-4" aria-hidden />
          {loadingMore ? (
            <div className="flex justify-center py-3">
              <Loader2
                className="h-4 w-4 animate-spin text-admin-faint"
                aria-label="Loading more notifications"
              />
            </div>
          ) : null}
        </div>
      )}
    </section>
  );
}
