"use client";

import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import {
  Bell,
  ChevronRight,
  ClipboardList,
  CreditCard,
  GraduationCap,
  Heart,
  Loader2,
  X,
  type LucideIcon,
} from "lucide-react";
import {
  formatRelativeTime,
  type ActivityNotificationCategory,
  type SchoolAdminActivityNotification,
} from "@/lib/school-admin/activity-notifications";
import { getAdminButtonStyle } from "@/lib/organization-settings/admin-button-styles";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";

type AdminActivityNotificationsPanelProps = {
  C: AdminThemeTokens;
  open: boolean;
  onClose: () => void;
  organizationId: string;
  onMarkedRead?: () => void;
};

const PAGE_SIZE = 20;

type NotificationVisual = {
  Icon: LucideIcon;
  badgeStyle: CSSProperties;
};

function getActivityNotificationVisual(
  category: ActivityNotificationCategory,
  C: AdminThemeTokens,
): NotificationVisual {
  switch (category) {
    case "enrollment":
      return {
        Icon: GraduationCap,
        badgeStyle: {
          backgroundColor: C.successBg,
          color: C.success,
          border: `1px solid ${C.successBorder}`,
        },
      };
    case "payments":
      return {
        Icon: CreditCard,
        badgeStyle: {
          backgroundColor: C.infoBg,
          color: C.info,
          border: `1px solid ${C.infoBorder}`,
        },
      };
    case "committees":
      return {
        Icon: Heart,
        badgeStyle: {
          backgroundColor: C.accentLight,
          color: C.accent,
          border: `1px solid ${C.secondaryBtnBorder}`,
        },
      };
    case "other":
      return {
        Icon: Bell,
        badgeStyle: {
          backgroundColor: C.elevated,
          color: C.textSecondary,
          border: `1px solid ${C.border}`,
        },
      };
    case "applications":
    default:
      return {
        Icon: ClipboardList,
        badgeStyle: {
          backgroundColor: C.accentLight,
          color: C.accent,
          border: `1px solid ${C.secondaryBtnBorder}`,
        },
      };
  }
}

const DOLLAR_AMOUNT_PATTERN = /(\$[\d,]+)/g;

function renderEmphasizedText(text: string) {
  const parts = text.split(DOLLAR_AMOUNT_PATTERN);
  return parts.map((part, index) =>
    part.startsWith("$") ? (
      <span key={index} className="font-semibold">
        {part}
      </span>
    ) : (
      part
    ),
  );
}

function NotificationDetailText({
  detail,
  subjectLabel,
  C,
}: {
  detail: string;
  subjectLabel: string | null;
  C: AdminThemeTokens;
}) {
  if (subjectLabel && detail.startsWith(subjectLabel)) {
    const remainder = detail.slice(subjectLabel.length);
    return (
      <p
        className="truncate text-sm font-normal leading-snug"
        style={{ color: C.textPrimary }}
      >
        <span className="font-semibold">{subjectLabel}</span>
        {renderEmphasizedText(remainder)}
      </p>
    );
  }

  return (
    <p
      className="truncate text-sm font-normal leading-snug"
      style={{ color: C.textPrimary }}
    >
      {renderEmphasizedText(detail)}
    </p>
  );
}

function notificationRowDividerStyle(
  C: AdminThemeTokens,
  showDivider: boolean,
): CSSProperties | undefined {
  if (!showDivider) return undefined;
  return { borderBottom: `1px solid ${C.border}` };
}

function NotificationSkeleton({
  C,
  showDivider,
}: {
  C: AdminThemeTokens;
  showDivider: boolean;
}) {
  return (
    <div
      className="flex items-center gap-2.5 px-1.5 py-2"
      style={notificationRowDividerStyle(C, showDivider)}
    >
      <div
        className="h-8 w-8 shrink-0 rounded-full"
        style={{ backgroundColor: C.elevated }}
      />
      <div className="min-w-0 flex-1">
        <div
          className="h-3.5 w-4/5 rounded"
          style={{ backgroundColor: C.elevated }}
        />
        <div
          className="mt-1.5 h-2.5 w-16 rounded"
          style={{ backgroundColor: C.elevated }}
        />
      </div>
    </div>
  );
}

function NotificationRow({
  C,
  notification,
  onClose,
  showDivider,
}: {
  C: AdminThemeTokens;
  notification: SchoolAdminActivityNotification;
  onClose: () => void;
  showDivider: boolean;
}) {
  const { Icon, badgeStyle } = getActivityNotificationVisual(
    notification.category,
    C,
  );

  return (
    <li style={notificationRowDividerStyle(C, showDivider)}>
      <Link
        href={notification.href}
        onClick={onClose}
        className="group flex items-center gap-2.5 rounded-lg px-1.5 py-2 transition-colors"
        style={{ textDecoration: "none", color: "inherit" }}
        onMouseEnter={(event) => {
          event.currentTarget.style.backgroundColor = C.surface;
        }}
        onMouseLeave={(event) => {
          event.currentTarget.style.backgroundColor = "transparent";
        }}
      >
        <div
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
          style={badgeStyle}
        >
          <Icon className="h-3.5 w-3.5" aria-hidden />
        </div>
        <div className="min-w-0 flex-1">
          <NotificationDetailText
            detail={notification.detail}
            subjectLabel={notification.subjectLabel}
            C={C}
          />
          <p
            className="mt-0.5 text-[11px] leading-snug"
            style={{ color: C.textTertiary }}
          >
            {formatRelativeTime(notification.createdAt)}
          </p>
        </div>
        <ChevronRight
          className="h-3.5 w-3.5 shrink-0 opacity-35 transition-opacity group-hover:opacity-70"
          style={{ color: C.textTertiary }}
          aria-hidden
        />
      </Link>
    </li>
  );
}

export default function AdminActivityNotificationsPanel({
  C,
  open,
  onClose,
  organizationId,
  onMarkedRead,
}: AdminActivityNotificationsPanelProps) {
  const [notifications, setNotifications] = useState<
    SchoolAdminActivityNotification[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

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
          organizationId,
          limit: String(PAGE_SIZE),
        });
        if (cursor) {
          params.set("cursor", cursor);
        }

        const response = await fetch(
          `/api/school-admin/activity-notifications?${params.toString()}`,
        );

        if (!response.ok) {
          let message = "Failed to load activity.";
          try {
            const payload = (await response.json()) as { error?: string };
            if (payload.error?.trim()) {
              message = payload.error.trim();
            }
          } catch {
            // ignore JSON parse errors
          }
          throw new Error(message);
        }

        const payload = (await response.json()) as {
          notifications?: SchoolAdminActivityNotification[];
          nextCursor?: string | null;
          hasMore?: boolean;
        };

        const pageNotifications = payload.notifications ?? [];
        setNotifications((current) =>
          append ? [...current, ...pageNotifications] : pageNotifications,
        );
        setNextCursor(payload.nextCursor ?? null);
        setHasMore(Boolean(payload.hasMore));
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load activity.");
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
    if (!open) return;

    void (async () => {
      try {
        const response = await fetch(
          "/api/school-admin/activity-notifications/mark-read",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ organizationId }),
          },
        );
        if (response.ok) {
          onMarkedRead?.();
        }
      } catch {
        // ignore transient mark-read errors
      }
    })();
  }, [open, organizationId, onMarkedRead]);

  useEffect(() => {
    if (!open) return;

    queueMicrotask(() => {
      setNotifications([]);
      setNextCursor(null);
      setHasMore(false);
      void loadNotifications();
    });
  }, [open, loadNotifications]);

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

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
      {
        root,
        rootMargin: "120px",
      },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, loadMoreNotifications, loading, loadingMore, open, notifications.length]);

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
            className="absolute inset-0"
            onClick={onClose}
            aria-hidden="true"
            style={{ backgroundColor: "rgba(0,0,0,0.45)" }}
          />
          <motion.div
            initial={{ x: "100%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "100%", opacity: 0 }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="admin-activity-notifications-title"
            className="absolute inset-y-0 right-0 z-[15] flex w-[min(100%,28rem)] max-w-full flex-col overflow-hidden"
            style={{
              backgroundColor: C.surface,
              borderLeft: `1px solid ${C.border}`,
              boxShadow: C.shadowMedium,
            }}
            onClick={(event) => event.stopPropagation()}
          >
            <div
              className="flex flex-shrink-0 items-start justify-between gap-3 px-4 py-3 sm:px-5"
              style={{ borderBottom: `1px solid ${C.border}` }}
            >
              <div className="min-w-0">
                <h2
                  id="admin-activity-notifications-title"
                  className="text-sm font-semibold"
                  style={{ color: C.textPrimary }}
                >
                  Activity
                </h2>
                <p
                  className="mt-1 text-xs leading-relaxed"
                  style={{ color: C.textTertiary }}
                >
                  Recent admissions and enrollment updates
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="flex-shrink-0 rounded p-1"
                style={{
                  color: C.textTertiary,
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                }}
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div
              ref={scrollContainerRef}
              className="flex-1 overflow-y-auto px-1.5 py-3 sm:px-2"
              style={{ backgroundColor: C.bg }}
            >
              {loading && notifications.length === 0 ? (
                <div className="flex flex-col">
                  <NotificationSkeleton C={C} showDivider />
                  <NotificationSkeleton C={C} showDivider />
                  <NotificationSkeleton C={C} showDivider />
                  <NotificationSkeleton C={C} showDivider={false} />
                </div>
              ) : error ? (
                <div
                  className="rounded-lg px-4 py-6 text-center"
                  style={{ backgroundColor: C.elevated }}
                >
                  <p className="text-sm" style={{ color: C.error }}>
                    {error}
                  </p>
                  <button
                    type="button"
                    onClick={() => void loadNotifications()}
                    className="mt-3 rounded-md px-3 py-1.5 text-xs font-semibold"
                    style={getAdminButtonStyle(C, "secondary")}
                  >
                    Try again
                  </button>
                </div>
              ) : notifications.length === 0 ? (
                <div
                  className="rounded-lg px-4 py-8 text-center"
                  style={{ backgroundColor: C.elevated }}
                >
                  <p
                    className="text-sm font-medium"
                    style={{ color: C.textPrimary }}
                  >
                    No recent activity yet
                  </p>
                  <p
                    className="mt-1 text-xs leading-relaxed"
                    style={{ color: C.textTertiary }}
                  >
                    New applications, payments, and enrollment updates will show
                    up here.
                  </p>
                </div>
              ) : (
                <>
                  <ul className="flex flex-col">
                    {notifications.map((notification, index) => (
                      <NotificationRow
                        key={notification.id}
                        C={C}
                        notification={notification}
                        onClose={onClose}
                        showDivider={index < notifications.length - 1}
                      />
                    ))}
                  </ul>
                  <div ref={loadMoreRef} className="h-4" aria-hidden />
                  {loadingMore ? (
                    <div className="flex justify-center py-3">
                      <Loader2
                        className="h-4 w-4 animate-spin"
                        style={{ color: C.textTertiary }}
                        aria-label="Loading more activity"
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
