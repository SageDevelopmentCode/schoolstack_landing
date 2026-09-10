"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import {
  Bell,
  CalendarDays,
  ChevronRight,
  ClipboardList,
  CreditCard,
  GraduationCap,
  Heart,
  Loader2,
  Megaphone,
  MessageSquare,
  Package,
  X,
  type LucideIcon,
} from "lucide-react";
import {
  formatRelativeTime,
  type ParentActivityNotification,
  type ParentActivityNotificationCategory,
} from "@/lib/parent-portal/parent-activity-notifications";

type OrganizationFamilyNotificationsPanelProps = {
  organizationId: string;
  organizationSlug: string;
  familyId: string;
  familyLabel: string;
  open: boolean;
  onClose: () => void;
};

const PAGE_SIZE = 20;

type NotificationVisual = {
  Icon: LucideIcon;
  badgeClassName: string;
};

function getNotificationVisual(
  category: ParentActivityNotificationCategory,
): NotificationVisual {
  switch (category) {
    case "messages":
      return {
        Icon: MessageSquare,
        badgeClassName:
          "bg-admin-accent-soft text-admin-accent border-admin-accent/20",
      };
    case "announcements":
      return {
        Icon: Megaphone,
        badgeClassName:
          "bg-admin-warning-bg text-admin-warning border-admin-warning-border",
      };
    case "events":
      return {
        Icon: CalendarDays,
        badgeClassName: "bg-admin-info-bg text-admin-info border-admin-info-border",
      };
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
    case "applications":
      return {
        Icon: ClipboardList,
        badgeClassName: "bg-admin-accent-soft text-admin-accent border-admin-accent/20",
      };
    case "coop":
      return {
        Icon: Package,
        badgeClassName:
          "bg-admin-success-bg text-admin-success border-admin-success-border",
      };
    case "other":
    default:
      return {
        Icon: Bell,
        badgeClassName: "bg-admin-bg text-admin-muted border-admin-border",
      };
  }
}

function NotificationRow({
  notification,
  showDivider,
}: {
  notification: ParentActivityNotification;
  showDivider: boolean;
}) {
  const { Icon, badgeClassName } = getNotificationVisual(notification.category);

  return (
    <li className={showDivider ? "border-b border-admin-border" : undefined}>
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

export default function OrganizationFamilyNotificationsPanel({
  organizationId,
  organizationSlug,
  familyId,
  familyLabel,
  open,
  onClose,
}: OrganizationFamilyNotificationsPanelProps) {
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<ParentActivityNotification[]>(
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
        const params = new URLSearchParams({
          familyId,
          limit: String(PAGE_SIZE),
        });
        if (cursor) params.set("cursor", cursor);

        const response = await fetch(
          `/api/admin/organizations/${organizationId}/parent-activity-notifications?${params}`,
        );
        const payload = await response.json();

        if (!response.ok) {
          throw new Error(payload.error ?? "Failed to load notifications.");
        }

        const pageNotifications =
          (payload.notifications as ParentActivityNotification[]) ?? [];

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
    [familyId, organizationId],
  );

  const loadNotifications = useCallback(async () => {
    await fetchPage(null, false);
  }, [fetchPage]);

  const loadMoreNotifications = useCallback(async () => {
    if (!hasMore || loadingMore || loading || !nextCursor) return;
    await fetchPage(nextCursor, true);
  }, [fetchPage, hasMore, loading, loadingMore, nextCursor]);

  useEffect(() => {
    if (!open) return;

    queueMicrotask(() => {
      setNotifications([]);
      setNextCursor(null);
      setHasMore(false);
      void loadNotifications();
    });
  }, [loadNotifications, open]);

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose, open]);

  useEffect(() => {
    if (!open || !hasMore || loading || loadingMore) return;

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
  }, [hasMore, loadMoreNotifications, loading, loadingMore, notifications.length, open]);

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-[10000]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <div
            className="absolute inset-0 bg-black/45"
            onClick={onClose}
            aria-hidden="true"
          />
          <motion.div
            initial={{ x: "100%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "100%", opacity: 0 }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="family-notifications-title"
            className="absolute inset-y-0 right-0 z-[15] flex w-[min(100%,28rem)] max-w-full flex-col overflow-hidden border-l border-admin-border bg-admin-surface shadow-lg"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex flex-shrink-0 items-start justify-between gap-3 border-b border-admin-border px-4 py-3 sm:px-5">
              <div className="min-w-0">
                <h2
                  id="family-notifications-title"
                  className="text-sm font-semibold text-admin-text"
                >
                  Parent notifications
                </h2>
                <p className="mt-0.5 text-xs text-admin-muted">
                  {familyLabel} · {organizationSlug}
                </p>
                <p className="mt-1 text-[11px] text-admin-faint">
                  Read-only — does not mark notifications read for this family.
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg p-1.5 text-admin-muted transition-colors hover:bg-admin-bg"
                aria-label="Close notifications preview"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div ref={scrollContainerRef} className="min-h-0 flex-1 overflow-y-auto px-3 py-2">
              {loading && notifications.length === 0 ? (
                <div className="flex items-center gap-2 py-8 text-sm text-admin-faint">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading notifications…
                </div>
              ) : error ? (
                <div className="rounded-admin-md border border-admin-border bg-admin-bg px-4 py-6 text-center">
                  <p className="text-sm text-admin-error">{error}</p>
                  <button
                    type="button"
                    onClick={() => void loadNotifications()}
                    className="mt-3 rounded-admin-md border border-admin-border bg-admin-surface px-3 py-1.5 text-xs font-semibold text-admin-text hover:bg-admin-bg"
                  >
                    Try again
                  </button>
                </div>
              ) : notifications.length === 0 ? (
                <p className="py-8 text-center text-sm text-admin-faint">
                  No recent notifications in the last 30 days.
                </p>
              ) : (
                <>
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
                </>
              )}
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
