import { type Href, useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, SectionList, StyleSheet, Text, View } from 'react-native';

import { closeThen } from '@/components/parent/garden/feedback';
import { notificationGroupLabel } from '@/components/parent/home/sheets/notification-groups';
import { GSheet } from '@/components/parent/garden/sheet';
import { Garden, GardenFonts, useGardenAccent, type GChipTone } from '@/components/parent/garden/tokens';
import { GChip, GDashedRule, GKicker, GPressable, GSkeleton, GToyButton } from '@/components/parent/garden/ui';
import { categoryIcon } from '@/components/portal/portal-activity-notification-row';
import { ctaText } from '@/components/school-admin/garden/admin-feedback';
import { AdminIconChip } from '@/components/school-admin/garden/admin-ui';
import { formatRelativeTime } from '@/lib/school-admin/format-relative-time';
import {
  fetchTeacherActivityNotifications,
  markTeacherActivityNotificationsRead,
  type TeacherActivityNotification,
} from '@/lib/teacher/fetch-activity-notifications';
import { resolveTeacherFocusHref } from '@/lib/teacher/teacher-nav';
import { useMobileErrorReporter } from '@/lib/use-mobile-error-reporter';

const PAGE_SIZE = 20;

type Section = { title: string; data: TeacherActivityNotification[] };

const CATEGORY_STYLE: Record<string, { label: string; tint: string; tone: GChipTone }> = {
  messages: { label: 'Messages', tint: Garden.lav, tone: 'neutral' },
  events: { label: 'Calendar', tint: Garden.sky, tone: 'info' },
  signups: { label: 'Sign-ups', tint: Garden.butter, tone: 'warning' },
  health: { label: 'Health', tint: Garden.peach, tone: 'alert' },
  announcements: { label: 'Bulletin', tint: Garden.butter, tone: 'warning' },
  committees: { label: 'Committees', tint: Garden.mint, tone: 'success' },
  coop: { label: 'Co-op', tint: Garden.mint, tone: 'success' },
  enrollment: { label: 'Enrollment', tint: Garden.sky, tone: 'info' },
  applications: { label: 'Admissions', tint: Garden.butter, tone: 'warning' },
  payments: { label: 'Payments', tint: Garden.mint, tone: 'success' },
};
const DEFAULT_CATEGORY = { label: 'School', tint: Garden.sky, tone: 'info' as GChipTone };

function filterTeacherActivityNotifications(
  slug: string,
  items: TeacherActivityNotification[],
): TeacherActivityNotification[] {
  return items.filter((item) => resolveTeacherFocusHref(slug, item.href) != null);
}

function TeacherActivityRow({
  item,
  onPress,
  divider,
  isNew,
}: {
  item: TeacherActivityNotification;
  onPress: () => void;
  divider: boolean;
  isNew: boolean;
}) {
  const accent = useGardenAccent();
  const style = CATEGORY_STYLE[item.category] ?? DEFAULT_CATEGORY;
  const isPayment = item.category === 'payments';
  const when = formatRelativeTime(item.createdAt);
  const cta = ctaText(item.ctaLabel);
  return (
    <GPressable
      accessibilityLabel={`${style.label}. ${isPayment ? item.detail : `${item.title}. ${item.detail}`}. ${when}. ${cta}`}
      pressedScale={0.985}
      onPress={onPress}
      style={[styles.row, divider && styles.divider, isNew && { backgroundColor: accent.wash }]}>
      <AdminIconChip name={categoryIcon(item.category)} tint={style.tint} />
      <View style={styles.copy}>
        <View style={styles.metaRow}>
          <GChip label={style.label} tone={style.tone} />
          {isNew ? <GChip label="New" tone="alert" /> : null}
          <Text style={styles.when}>{when}</Text>
        </View>
        {isPayment ? (
          <Text style={styles.title} numberOfLines={3}>
            {item.detail}
          </Text>
        ) : (
          <>
            <Text style={styles.title} numberOfLines={2}>
              {item.title}
            </Text>
            {item.detail ? (
              <Text style={styles.detail} numberOfLines={2}>
                {item.detail}
              </Text>
            ) : null}
          </>
        )}
        {cta ? <Text style={[styles.cta, { color: accent.clayDeep }]}>{cta} →</Text> : null}
      </View>
    </GPressable>
  );
}

function ActivitySkeleton() {
  return (
    <View style={styles.skeleton} accessibilityLabel="Loading activity">
      {Array.from({ length: 5 }).map((_, i) => (
        <View key={i} style={styles.skeletonRow}>
          <GSkeleton style={styles.skeletonIcon} />
          <View style={styles.skeletonCopy}>
            <GSkeleton style={styles.skeletonChip} />
            <GSkeleton style={styles.skeletonLine} />
            <GSkeleton style={styles.skeletonLineShort} />
          </View>
        </View>
      ))}
    </View>
  );
}

/**
 * Recent school activity (bell): Garden feed sheet grouped Today / Yesterday /
 * Earlier, paged on scroll. Opening it marks activity as read; the same API
 * calls and `reportError` operations as the old Story sheet.
 */
export function TeacherNotificationsSheet({
  visible,
  onClose,
  organizationId,
  slug,
  onMarkedRead,
  unreadCount = 0,
}: {
  visible: boolean;
  onClose: () => void;
  organizationId: string;
  slug: string;
  onMarkedRead?: () => void;
  /** Unread count when the sheet opened: the newest N rows get a "New" chip. */
  unreadCount?: number;
}) {
  const router = useRouter();
  const accent = useGardenAccent();
  const { reportError } = useMobileErrorReporter(organizationId);

  const [notifications, setNotifications] = useState<TeacherActivityNotification[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [markedRead, setMarkedRead] = useState(false);
  const [newCount, setNewCount] = useState(0);
  const loadMorePromiseRef = useRef<Promise<void> | null>(null);

  // Freeze the unread count at open so the "New" chips survive mark-read.
  const [prevVisible, setPrevVisible] = useState(visible);
  if (prevVisible !== visible) {
    setPrevVisible(visible);
    if (visible) {
      setNewCount(unreadCount);
    } else {
      setNotifications([]);
      setNextCursor(null);
      setHasMore(false);
      setError(null);
      setMarkedRead(false);
    }
  }

  const fetchPage = useCallback(
    async (cursor: string | null, append: boolean) => {
      if (append) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }
      setError(null);

      try {
        const page = await fetchTeacherActivityNotifications(organizationId, slug, {
          cursor,
          limit: PAGE_SIZE,
        });
        const filtered = filterTeacherActivityNotifications(slug, page.notifications);

        setNotifications((current) => (append ? [...current, ...filtered] : filtered));
        setNextCursor(page.nextCursor);
        setHasMore(page.hasMore);
      } catch (loadError) {
        reportError('teacher_activity_notifications_load', loadError);
        setError(loadError instanceof Error ? loadError.message : 'Failed to load activity.');
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
    [organizationId, reportError, slug],
  );

  const loadMore = useCallback(async () => {
    if (!hasMore || loadingMore || loading || !nextCursor) return;
    if (loadMorePromiseRef.current) {
      await loadMorePromiseRef.current;
      return;
    }

    const promise = fetchPage(nextCursor, true).finally(() => {
      loadMorePromiseRef.current = null;
    });
    loadMorePromiseRef.current = promise;
    await promise;
  }, [fetchPage, hasMore, loading, loadingMore, nextCursor]);

  useEffect(() => {
    if (!visible) return;

    void (async () => {
      await fetchPage(null, false);
      try {
        await markTeacherActivityNotificationsRead(organizationId);
        setMarkedRead(true);
        onMarkedRead?.();
      } catch (markReadError) {
        reportError('teacher_activity_notifications_mark_read', markReadError);
      }
    })();
  }, [visible, fetchPage, organizationId, onMarkedRead, reportError]);

  const handlePressItem = useCallback(
    (item: TeacherActivityNotification) => {
      const route = resolveTeacherFocusHref(slug, item.href);
      if (route) {
        closeThen(onClose, () => router.push(route as Href));
      }
    },
    [onClose, router, slug],
  );

  const sections = useMemo<Section[]>(() => {
    const now = new Date();
    const groups: Section[] = [];
    for (const item of notifications) {
      const title = notificationGroupLabel(item.createdAt, now);
      const last = groups[groups.length - 1];
      if (last && last.title === title) {
        last.data.push(item);
      } else {
        groups.push({ title, data: [item] });
      }
    }
    return groups;
  }, [notifications]);

  const newIds = useMemo(
    () => new Set(notifications.slice(0, newCount).map((item) => item.id)),
    [newCount, notifications],
  );

  const headerAside =
    markedRead && newCount > 0 ? (
      <GChip label="Marked as read" tone="success" icon="checkmark" />
    ) : newCount > 0 ? (
      <GChip label={`${newCount} new`} tone="alert" />
    ) : null;

  const empty = loading ? (
    <ActivitySkeleton />
  ) : error ? (
    <View style={styles.centered}>
      <Text style={styles.emptyTitle}>{"We couldn't load activity"}</Text>
      <Text style={styles.emptyBody}>{error}</Text>
      <GToyButton label="Try again" icon="refresh" onPress={() => void fetchPage(null, false)} />
    </View>
  ) : (
    <View style={[styles.centered, styles.caughtUp]}>
      <Text style={styles.emptyTitle}>No recent activity yet.</Text>
      <Text style={styles.emptyBody}>Changes across your classrooms and students show up here.</Text>
    </View>
  );

  return (
    <GSheet
      visible={visible}
      onClose={onClose}
      list
      title="Recent school activity"
      subtitle="Important changes across your classrooms and students."
      headerAside={headerAside}
      accessibilityLabel="Close activity notifications">
      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        stickySectionHeadersEnabled
        renderSectionHeader={({ section }) => (
          <View style={styles.groupHeader}>
            <GKicker>{section.title}</GKicker>
          </View>
        )}
        renderItem={({ item, index }) => (
          <View style={styles.rowWrap}>
            <TeacherActivityRow
              item={item}
              divider={index > 0}
              isNew={newIds.has(item.id)}
              onPress={() => handlePressItem(item)}
            />
          </View>
        )}
        ListEmptyComponent={empty}
        onEndReached={() => {
          if (hasMore) void loadMore();
        }}
        onEndReachedThreshold={0.4}
        ListFooterComponent={
          loadingMore ? (
            <View style={styles.footer}>
              <ActivityIndicator color={accent.clay} />
            </View>
          ) : notifications.length > 0 && !hasMore ? (
            <View style={styles.footer}>
              <GDashedRule />
              <Text style={styles.endLine}>{"That's everything for now"}</Text>
            </View>
          ) : null
        }
        showsVerticalScrollIndicator={false}
        style={styles.list}
        contentContainerStyle={styles.listContent}
      />
    </GSheet>
  );
}

const styles = StyleSheet.create({
  // Inside a list sheet the list must fill; flexGrow: 0 renders it 0pt tall.
  list: { flex: 1 },
  listContent: { paddingBottom: 24 },
  groupHeader: {
    backgroundColor: Garden.cream,
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 6,
  },
  rowWrap: { paddingHorizontal: 20 },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 8,
    marginHorizontal: -8,
    borderRadius: 14,
  },
  divider: { borderTopWidth: 1, borderTopColor: Garden.ink06, borderRadius: 0 },
  copy: { flex: 1, minWidth: 0, gap: 4 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' },
  when: { fontFamily: GardenFonts.bodySemi, fontSize: 12, color: Garden.soft },
  title: { fontFamily: GardenFonts.bodyExtra, fontSize: 15, lineHeight: 20, color: Garden.ink },
  detail: { fontFamily: GardenFonts.bodySemi, fontSize: 13, lineHeight: 18, color: Garden.soft },
  cta: { fontFamily: GardenFonts.bodyExtra, fontSize: 13.5, marginTop: 2 },
  centered: {
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  caughtUp: {
    margin: 20,
    borderRadius: 18,
    backgroundColor: Garden.mint,
  },
  emptyTitle: {
    fontFamily: GardenFonts.bodyExtra,
    fontSize: 16,
    color: Garden.ink,
    textAlign: 'center',
  },
  emptyBody: {
    fontFamily: GardenFonts.bodySemi,
    fontSize: 14,
    lineHeight: 20,
    color: Garden.soft,
    textAlign: 'center',
  },
  footer: { paddingHorizontal: 20, paddingVertical: 18, gap: 10, alignItems: 'center' },
  endLine: { fontFamily: GardenFonts.bodySemi, fontSize: 13, color: Garden.soft },
  skeleton: { padding: 20, gap: 18 },
  skeletonRow: { flexDirection: 'row', gap: 12 },
  skeletonIcon: { width: 36, height: 36, borderRadius: 12 },
  skeletonCopy: { flex: 1, gap: 8 },
  skeletonChip: { width: 90, height: 18, borderRadius: 9 },
  skeletonLine: { width: '90%', height: 14, borderRadius: 7 },
  skeletonLineShort: { width: '60%', height: 12, borderRadius: 6 },
});
