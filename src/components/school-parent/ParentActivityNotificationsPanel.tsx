"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Bell, X } from "lucide-react";
import ParentActivityNotificationRow from "@/components/school-parent/ParentActivityNotificationRow";
import ParentActivityNotificationsPanelSkeleton from "@/components/school-parent/ParentActivityNotificationsPanelSkeleton";
import ParentButton from "@/components/school-parent/ui/ParentButton";
import ParentCard from "@/components/school-parent/ui/ParentCard";
import ParentDisplayHeading from "@/components/school-parent/ui/ParentDisplayHeading";
import ParentSectionKicker from "@/components/school-parent/ui/ParentSectionKicker";
import { useParentTheme } from "@/components/school-parent/ParentThemeContext";
import type { ParentActivityNotification } from "@/lib/parent-portal/parent-activity-notifications";
import type { ParentNotificationContext } from "@/lib/parent-portal/parent-notification-context";
import { reportPortalOperationalError } from "@/lib/portal-operational-errors";

type ParentActivityNotificationsPanelProps = {
  open: boolean;
  onClose: () => void;
  organizationId: string;
  slug: string;
  notificationContext?: ParentNotificationContext;
  parentNavBasePath?: string;
  applyBasePath?: string;
  previewMode?: boolean;
  previewFamilyId?: string;
  onMarkedRead?: () => void;
  onNavigate?: (href: string) => void;
};

const PAGE_SIZE = 20;
const LIST_MOTION = {
  initial: { opacity: 0, y: 6 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.22, ease: [0.16, 1, 0.3, 1] as const },
};

export default function ParentActivityNotificationsPanel({
  open,
  onClose,
  organizationId,
  slug,
  notificationContext,
  parentNavBasePath,
  applyBasePath,
  previewMode = false,
  previewFamilyId,
  onMarkedRead,
  onNavigate,
}: ParentActivityNotificationsPanelProps) {
  const { theme } = useParentTheme();
  const [notifications, setNotifications] = useState<ParentActivityNotification[]>(
    [],
  );
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

      let response: Response | undefined;
      try {
        if (previewMode && previewFamilyId) {
          const params = new URLSearchParams({
            familyId: previewFamilyId,
            limit: String(PAGE_SIZE),
          });
          if (cursor) params.set("cursor", cursor);
          response = await fetch(
            `/api/admin/organizations/${organizationId}/parent-activity-notifications?${params.toString()}`,
          );
        } else {
          const resolvedContext =
            notificationContext ??
            ({
              mode: "main",
              slug,
              parentNavBasePath:
                parentNavBasePath ?? `/school/${slug}/parent`,
              applyBasePath: applyBasePath ?? `/school/${slug}/apply`,
            } satisfies ParentNotificationContext);

          const params = new URLSearchParams({
            organizationId,
            slug,
            limit: String(PAGE_SIZE),
            mode: resolvedContext.mode,
            parentNavBasePath: resolvedContext.parentNavBasePath,
            applyBasePath: resolvedContext.applyBasePath,
          });
          if (cursor) params.set("cursor", cursor);
          if (resolvedContext.mode === "program") {
            params.set("programId", resolvedContext.programId);
            params.set("programSlug", resolvedContext.programSlug);
            params.set(
              "coopModeEnabled",
              resolvedContext.coopModeEnabled ? "true" : "false",
            );
          }

          response = await fetch(
            `/api/parent-portal/activity-notifications?${params.toString()}`,
          );
        }

        if (!response.ok) {
          let message = "Failed to load notifications.";
          try {
            const payload = (await response.json()) as { error?: string };
            if (payload.error?.trim()) message = payload.error.trim();
          } catch {
            // ignore JSON parse errors
          }
          throw new Error(message);
        }

        const payload = (await response.json()) as {
          notifications?: ParentActivityNotification[];
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
        setError(
          err instanceof Error ? err.message : "Failed to load notifications.",
        );
        if (!append) {
          setNotifications([]);
          setNextCursor(null);
          setHasMore(false);
        }
        void reportPortalOperationalError(
          "parent_portal",
          {
            organizationId,
            operation: "activity_notifications.load",
            error: "",
          },
          err,
          response?.status,
        );
      } finally {
        if (append) {
          setLoadingMore(false);
        } else {
          setLoading(false);
        }
      }
    },
    [notificationContext, organizationId, previewFamilyId, previewMode, slug],
  );

  const loadNotifications = useCallback(async () => {
    await fetchPage(null, false);
  }, [fetchPage]);

  const loadMoreNotifications = useCallback(async () => {
    if (!hasMore || loadingMore || loading || !nextCursor) return;
    await fetchPage(nextCursor, true);
  }, [fetchPage, hasMore, loading, loadingMore, nextCursor]);

  useEffect(() => {
    if (!open || previewMode) return;

    void (async () => {
      try {
        const response = await fetch(
          "/api/parent-portal/activity-notifications/mark-read",
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
  }, [open, organizationId, onMarkedRead, previewMode]);

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
      if (event.key === "Escape") onClose();
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
      { root, rootMargin: "120px" },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, loadMoreNotifications, loading, loadingMore, open, notifications.length]);

  const showInitialSkeleton = loading && notifications.length === 0;

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
            aria-labelledby="parent-activity-notifications-title"
            className="absolute inset-y-0 right-0 z-[15] flex w-[min(100%,28rem)] max-w-full flex-col overflow-hidden"
            style={{
              backgroundColor: theme.paper,
              borderLeft: `1px solid ${theme.line}`,
              boxShadow: theme.shadowCard,
            }}
            onClick={(event) => event.stopPropagation()}
          >
            <div
              className="flex flex-shrink-0 items-start justify-between gap-3 px-5 py-4"
              style={{
                borderBottom: `1px solid ${theme.line}`,
                backgroundColor: theme.cream,
              }}
            >
              <div className="min-w-0">
                <ParentSectionKicker theme={theme} className="mb-1.5">
                  Your updates
                </ParentSectionKicker>
                <ParentDisplayHeading
                  theme={theme}
                  as="h2"
                  size="section"
                  id="parent-activity-notifications-title"
                  className="!text-[1.35rem]"
                >
                  Notifications
                </ParentDisplayHeading>
                <p className="mt-1.5 text-xs leading-relaxed" style={{ color: theme.muted }}>
                  {previewMode
                    ? "Read-only preview — does not mark notifications read."
                    : "Updates from your school in the last 30 days."}
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="rounded-[10px] p-2 transition-colors"
                style={{ color: theme.muted }}
                onMouseEnter={(event) => {
                  event.currentTarget.style.backgroundColor = theme.white;
                }}
                onMouseLeave={(event) => {
                  event.currentTarget.style.backgroundColor = "transparent";
                }}
                aria-label="Close notifications"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div
              ref={scrollContainerRef}
              className="min-h-0 flex-1 overflow-y-auto px-4 py-3"
              aria-busy={showInitialSkeleton || loadingMore}
            >
              {showInitialSkeleton ? (
                <ParentActivityNotificationsPanelSkeleton theme={theme} />
              ) : error ? (
                <ParentCard theme={theme} className="!p-5 text-center">
                  <p className="text-sm" style={{ color: theme.alert }}>
                    {error}
                  </p>
                  <div className="mt-4">
                    <ParentButton
                      theme={theme}
                      variant="outline"
                      className="!px-4 !py-2"
                      onClick={() => void loadNotifications()}
                    >
                      Try again
                    </ParentButton>
                  </div>
                </ParentCard>
              ) : notifications.length === 0 ? (
                <ParentCard
                  theme={theme}
                  variant="today"
                  className="flex flex-col items-center !p-8 text-center"
                >
                  <div
                    className="mb-3 flex h-12 w-12 items-center justify-center rounded-[14px]"
                    style={{ backgroundColor: theme.primarySoft }}
                  >
                    <Bell className="h-5 w-5" style={{ color: theme.primary }} aria-hidden />
                  </div>
                  <p
                    className="text-sm font-semibold"
                    style={{ color: theme.ink, fontFamily: theme.fontDisplay }}
                  >
                    You&apos;re all caught up
                  </p>
                  <p className="mt-1.5 text-xs leading-relaxed" style={{ color: theme.muted }}>
                    No recent notifications in the last 30 days.
                  </p>
                </ParentCard>
              ) : (
                <>
                  <motion.ul
                    className="flex flex-col gap-2"
                    initial="initial"
                    animate="animate"
                    variants={{
                      animate: {
                        transition: { staggerChildren: 0.04 },
                      },
                    }}
                  >
                    {notifications.map((notification) => (
                      <motion.li key={notification.id} {...LIST_MOTION}>
                        <ParentActivityNotificationRow
                          notification={notification}
                          theme={theme}
                          onClose={onClose}
                          onNavigate={onNavigate}
                        />
                      </motion.li>
                    ))}
                  </motion.ul>
                  <div ref={loadMoreRef} className="h-2" aria-hidden />
                  {loadingMore ? (
                    <ParentActivityNotificationsPanelSkeleton
                      theme={theme}
                      count={2}
                      className="mt-2"
                    />
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
