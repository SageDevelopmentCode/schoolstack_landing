"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { AlertTriangle, ArrowRight, Check, Settings2 } from "lucide-react";
import ParentActivityNotificationRow from "@/components/school-parent/ParentActivityNotificationRow";
import NavigationLink from "@/components/school/shared/NavigationLink";
import { useParentTheme } from "@/components/school-parent/ParentThemeContext";
import GSidePanel from "@/components/school-parent/garden/GSidePanel";
import { PORTAL_EASE } from "@/components/school-parent/garden/motion";
import {
  GChip,
  GKicker,
  GSkeleton,
  gBtnOutlineSm,
  gLinkSm,
} from "@/components/school-parent/garden/ui";
import { Tick } from "@/components/garden/ui";
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
  /** Bell count when the drawer opened: the newest N rows are "New". */
  unreadCountAtOpen?: number;
  /** Notification settings page (footer link). */
  notificationSettingsHref?: string;
};

const PAGE_SIZE = 20;

type DayGroup = { label: string; items: { notification: ParentActivityNotification; index: number }[] };

function startOfLocalDay(date: Date): number {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
}

/** "Today" / "Yesterday" / "Earlier this week" / "Earlier", newest first. */
function groupByDay(notifications: ParentActivityNotification[]): DayGroup[] {
  const today = startOfLocalDay(new Date());
  const day = 24 * 60 * 60 * 1000;
  const groups: DayGroup[] = [];
  notifications.forEach((notification, index) => {
    const created = new Date(notification.createdAt);
    const start = Number.isNaN(created.getTime()) ? 0 : startOfLocalDay(created);
    const label =
      start >= today
        ? "Today"
        : start >= today - day
          ? "Yesterday"
          : start >= today - 6 * day
            ? "Earlier this week"
            : "Earlier";
    const last = groups[groups.length - 1];
    if (last && last.label === label) {
      last.items.push({ notification, index });
    } else {
      groups.push({ label, items: [{ notification, index }] });
    }
  });
  return groups;
}

function NotificationSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="flex flex-col gap-2.5" aria-hidden="true">
      {Array.from({ length: count }, (_, i) => (
        <div
          key={i}
          className="flex items-start gap-3 rounded-[18px] border-[1.5px] border-[var(--sf-ink)]/[0.07] bg-white px-3.5 py-3.5"
        >
          <GSkeleton className="h-11 w-11 shrink-0 !rounded-full" />
          <div className="flex min-w-0 flex-1 flex-col gap-2 pt-1">
            <GSkeleton className="h-3.5 w-[60%] !rounded-full" />
            <GSkeleton className="h-3 w-[85%] !rounded-full" />
            <GSkeleton className="h-2.5 w-[35%] !rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

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
  unreadCountAtOpen = 0,
  notificationSettingsHref,
}: ParentActivityNotificationsPanelProps) {
  const { theme } = useParentTheme();
  const reduce = useReducedMotion() === true;
  const [markState, setMarkState] = useState<"idle" | "marking" | "done">("idle");
  const [notifications, setNotifications] = useState<ParentActivityNotification[]>(
    [],
  );
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
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

    queueMicrotask(() => setMarkState("marking"));
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
          setMarkState("done");
        } else {
          setMarkState("idle");
        }
      } catch {
        // ignore transient mark-read errors
        setMarkState("idle");
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
  const groups = useMemo(() => groupByDay(notifications), [notifications]);
  const newCount = previewMode ? 0 : unreadCountAtOpen;

  const statusChip = previewMode ? (
    <GChip tone="neutral">Preview · not marked read</GChip>
  ) : newCount > 0 && markState === "done" ? (
    <GChip tone="success">
      <Check className="h-3.5 w-3.5" strokeWidth={3} aria-hidden />
      Marked as read
    </GChip>
  ) : newCount > 0 ? (
    <GChip tone="info">{newCount > 99 ? "99+" : newCount} new</GChip>
  ) : null;

  const settingsLinkContent = (
    <>
      <Settings2 className="h-4 w-4" aria-hidden />
      Notification settings
      <ArrowRight className="h-3.5 w-3.5" aria-hidden />
    </>
  );
  const footer = notificationSettingsHref ? (
    <div className="flex w-full flex-wrap items-center justify-between gap-2">
      <span className="text-[13px] font-semibold text-[var(--sf-soft)]">
        Choose which emails get these.
      </span>
      {onNavigate ? (
        <button
          type="button"
          className={gLinkSm}
          onClick={() => {
            onClose();
            onNavigate(notificationSettingsHref);
          }}
        >
          {settingsLinkContent}
        </button>
      ) : (
        <NavigationLink href={notificationSettingsHref} className={gLinkSm} onClick={onClose}>
          {settingsLinkContent}
        </NavigationLink>
      )}
    </div>
  ) : undefined;

  return (
    <GSidePanel
      theme={theme}
      open={open}
      onClose={onClose}
      panelId="parent-activity-notifications"
      testId="parent-activity-notifications"
      kicker="Your updates"
      title="Notifications"
      subtitle={
        previewMode
          ? "Read-only preview — does not mark notifications read."
          : "Updates from your school in the last 30 days."
      }
      headerAside={statusChip}
      closeLabel="Close notifications"
      bodyRef={scrollContainerRef}
      footer={footer}
    >
      <div aria-busy={showInitialSkeleton || loadingMore} className="flex flex-col gap-4">
        {showInitialSkeleton ? (
          <NotificationSkeleton />
        ) : error ? (
          <div
            role="alert"
            className="flex flex-col items-center rounded-[22px] border-[1.5px] border-[var(--sf-ink)]/12 bg-white px-5 py-7 text-center"
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--sf-peach)] ring-[1.5px] ring-[var(--sf-ink)]">
              <AlertTriangle className="h-5 w-5 text-[var(--sf-clay-deep)]" strokeWidth={2.4} aria-hidden />
            </span>
            <p className="sf-display m-0 mt-3 text-[1.15rem] text-[var(--sf-ink)]">
              Couldn&apos;t load notifications
            </p>
            <p className="m-0 mt-1.5 max-w-[22rem] text-[13px] font-semibold text-[var(--sf-soft)]">
              {error}
            </p>
            <button
              type="button"
              className={`${gBtnOutlineSm} mt-4`}
              onClick={() => void loadNotifications()}
            >
              Try again
            </button>
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center rounded-[22px] border-[1.5px] border-[var(--sf-ink)]/10 bg-[var(--sf-mint)] px-5 py-8 text-center">
            <Tick className="h-12 w-12" />
            <p className="sf-display m-0 mt-3 text-[1.25rem] text-[var(--sf-ink)]">
              You&apos;re all caught up
            </p>
            <p className="m-0 mt-1.5 text-[13px] font-semibold text-[var(--sf-ink)]/70">
              No recent notifications in the last 30 days.
            </p>
            <p aria-hidden="true" className="sf-hand m-0 mt-3 text-[1.15rem] text-[var(--sf-forest)]">
              enjoy the quiet ✿
            </p>
          </div>
        ) : (
          <>
            {groups.map((group) => (
              <section key={group.label} aria-label={group.label} className="flex flex-col gap-2.5">
                <div className="sticky -top-5 z-[1] -mx-1 bg-[var(--sf-cream)]/95 px-1 py-1 backdrop-blur-sm">
                  <GKicker>{group.label}</GKicker>
                </div>
                <ul className="m-0 flex list-none flex-col gap-2.5 p-0">
                  {group.items.map(({ notification, index }) => (
                    <motion.li
                      key={notification.id}
                      initial={reduce ? false : { opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        duration: 0.22,
                        ease: PORTAL_EASE,
                        delay: reduce ? 0 : Math.min(index % 20, 8) * 0.035,
                      }}
                    >
                      <ParentActivityNotificationRow
                        notification={notification}
                        theme={theme}
                        onClose={onClose}
                        onNavigate={onNavigate}
                        isNew={index < newCount}
                      />
                    </motion.li>
                  ))}
                </ul>
              </section>
            ))}
            <div ref={loadMoreRef} className="h-1" aria-hidden />
            {loadingMore ? <NotificationSkeleton count={2} /> : null}
            {!hasMore && !loadingMore ? (
              <p className="m-0 rounded-[16px] border-[1.5px] border-dashed border-[var(--sf-ink)]/15 px-4 py-3 text-center text-[13px] font-semibold text-[var(--sf-soft)]">
                That&apos;s everything from the last 30 days.
              </p>
            ) : null}
          </>
        )}
      </div>
    </GSidePanel>
  );
}
