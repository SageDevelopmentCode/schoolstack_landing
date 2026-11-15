import { Ionicons } from '@expo/vector-icons';
import { type Href, useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  SectionList,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { notificationGroupLabel } from '@/components/parent/home/sheets/notification-groups';
import { categoryIcon } from '@/components/portal/portal-activity-notification-row';
import { GSheet } from '@/components/parent/garden/sheet';
import { Garden, GardenFonts, useGardenAccent } from '@/components/parent/garden/tokens';
import {
  GChip,
  GDashedRule,
  GKicker,
  GLink,
  GPressable,
  GSkeleton,
  GTick,
  GToyButton,
} from '@/components/parent/garden/ui';
import { haptic } from '@/lib/haptics';
import {
  fetchParentActivityNotifications,
  markParentActivityNotificationsRead,
  type ParentActivityNotification,
  type ParentActivityNotificationContext,
} from '@/lib/parent/fetch-activity-notifications';
import {
  parentMoreRoute,
  parentProgramMoreRoute,
  resolveParentAttentionNavigation,
} from '@/lib/parent/parent-nav';
import { formatRelativeTime } from '@/lib/school-admin/format-relative-time';
import { useMobileErrorReporter } from '@/lib/use-mobile-error-reporter';

const PAGE_SIZE = 20;
const SHEET_CLOSE_MS = 220;

type ParentNotificationsSheetProps = {
  visible: boolean;
  onClose: () => void;
  organizationId: string;
  slug: string;
  programSlug?: string;
  notificationContext?: ParentActivityNotificationContext;
  firstChildApplicationId?: string | null;
  /** Unread count shown on the bell; the newest N rows get a "New" marker. */
  unreadCount?: number;
  onMarkedRead?: () => void;
};

type LoadMode = 'initial' | 'refresh' | 'append';

const CATEGORY_TINTS: Record<string, string> = {
  messages: Garden.sky,
  payments: Garden.mint,
  applications: Garden.lav,
  enrollment: Garden.lav,
  announcements: Garden.butter,
  events: Garden.peach,
  signups: Garden.mint,
  health: Garden.peach,
  committees: Garden.sky,
  coop: Garden.sky,
};

function filterParentActivityNotifications(
  slug: string,
  items: ParentActivityNotification[],
  options: { firstChildApplicationId?: string | null; programSlug?: string },
): ParentActivityNotification[] {
  const { firstChildApplicationId, programSlug } = options;
  return items.filter(
    (item) =>
      resolveParentAttentionNavigation(slug, {
        href: item.href,
        healthApplicationId: firstChildApplicationId,
        pickupApplicationId: firstChildApplicationId,
        programSlug,
      }) != null,
  );
}

function NotificationRow({
  item,
  isNew,
  onPress,
}: {
  item: ParentActivityNotification;
  isNew: boolean;
  onPress: () => void;
}) {
  const accent = useGardenAccent();
  const isPayment = item.category === 'payments';
  const when = formatRelativeTime(item.createdAt);
  const body = isPayment ? item.detail : item.detail || item.summary;

  return (
    <GPressable
      accessibilityLabel={`${isNew ? 'New. ' : ''}${item.title}. ${body}. ${when}. ${item.ctaLabel}`}
      pressedScale={0.99}
      onPress={onPress}
      style={[styles.row, isNew && { backgroundColor: accent.wash }]}>
      <View
        style={[
          styles.rowIcon,
          { backgroundColor: CATEGORY_TINTS[item.category] ?? Garden.paper },
        ]}>
        <Ionicons name={categoryIcon(item.category)} size={17} color={Garden.ink} />
      </View>
      <View style={styles.rowCopy}>
        <View style={styles.rowTitleLine}>
          {isNew ? <View style={[styles.newDot, { backgroundColor: accent.clay }]} /> : null}
          <Text style={styles.rowTitle} numberOfLines={2}>
            {item.title}
          </Text>
        </View>
        {body ? (
          <Text style={styles.rowDetail} numberOfLines={isPayment ? 3 : 2}>
            {body}
          </Text>
        ) : null}
        <View style={styles.rowMeta}>
          {when ? <Text style={styles.rowTime}>{when}</Text> : null}
          {isNew ? <GChip label="New" tone="info" /> : null}
          <Text style={[styles.rowCta, { color: accent.clayDeep }]} numberOfLines={1}>
            {item.ctaLabel} →
          </Text>
        </View>
      </View>
    </GPressable>
  );
}

function NotificationsSkeleton() {
  return (
    <View style={styles.skeleton} accessibilityLabel="Loading notifications">
      {[0, 1, 2, 3].map((i) => (
        <View key={i} style={styles.skeletonRow}>
          <GSkeleton style={styles.skeletonIcon} />
          <View style={styles.skeletonCopy}>
            <GSkeleton style={styles.skeletonTitle} />
            <GSkeleton style={styles.skeletonLine} />
          </View>
        </View>
      ))}
    </View>
  );
}

/** Parent Home: recent school activity, grouped by day, Garden styled. */
export function ParentNotificationsSheet({
  visible,
  onClose,
  organizationId,
  slug,
  programSlug,
  notificationContext,
  firstChildApplicationId,
  unreadCount = 0,
  onMarkedRead,
}: ParentNotificationsSheetProps) {
  const accent = useGardenAccent();
  const router = useRouter();
  const { reportError } = useMobileErrorReporter(organizationId);

  const [notifications, setNotifications] = useState<ParentActivityNotification[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [unreadAtOpen, setUnreadAtOpen] = useState(0);
  const [markedRead, setMarkedRead] = useState(false);
  const loadMorePromiseRef = useRef<Promise<void> | null>(null);
  const unreadRef = useRef(unreadCount);

  useEffect(() => {
    unreadRef.current = unreadCount;
  }, [unreadCount]);

  useEffect(() => {
    if (visible) {
      setUnreadAtOpen(unreadRef.current);
      setMarkedRead(false);
      return;
    }
    const timer = setTimeout(() => {
      setNotifications([]);
      setNextCursor(null);
      setHasMore(false);
      setError(null);
      setUnreadAtOpen(0);
      setMarkedRead(false);
    }, SHEET_CLOSE_MS);
    return () => clearTimeout(timer);
  }, [visible]);

  const fetchPage = useCallback(
    async (cursor: string | null, mode: LoadMode) => {
      const setBusy =
        mode === 'append' ? setLoadingMore : mode === 'refresh' ? setRefreshing : setLoading;
      setBusy(true);
      setError(null);

      try {
        const page = await fetchParentActivityNotifications(organizationId, slug, {
          cursor,
          limit: PAGE_SIZE,
          notificationContext,
        });
        const filtered = filterParentActivityNotifications(slug, page.notifications, {
          firstChildApplicationId,
          programSlug,
        });

        setNotifications((current) => (mode === 'append' ? [...current, ...filtered] : filtered));
        setNextCursor(page.nextCursor);
        setHasMore(page.hasMore);
      } catch (loadError) {
        reportError('parent_activity_notifications_load', loadError);
        haptic.error();
        setError(loadError instanceof Error ? loadError.message : 'Failed to load activity.');
        if (mode !== 'append') {
          setNotifications([]);
          setNextCursor(null);
          setHasMore(false);
        }
      } finally {
        setBusy(false);
      }
    },
    [firstChildApplicationId, notificationContext, organizationId, programSlug, reportError, slug],
  );

  const loadMore = useCallback(async () => {
    if (!hasMore || loadingMore || loading || !nextCursor) return;
    if (loadMorePromiseRef.current) {
      await loadMorePromiseRef.current;
      return;
    }
    const promise = fetchPage(nextCursor, 'append').finally(() => {
      loadMorePromiseRef.current = null;
    });
    loadMorePromiseRef.current = promise;
    await promise;
  }, [fetchPage, hasMore, loading, loadingMore, nextCursor]);

  useEffect(() => {
    if (!visible) return;

    void (async () => {
      await fetchPage(null, 'initial');
      try {
        await markParentActivityNotificationsRead(organizationId);
        setMarkedRead(true);
        onMarkedRead?.();
      } catch (markReadError) {
        reportError('parent_activity_notifications_mark_read', markReadError);
      }
    })();
  }, [visible, fetchPage, organizationId, onMarkedRead, reportError]);

  const sections = useMemo(() => {
    const groups = new Map<string, ParentActivityNotification[]>();
    for (const item of notifications) {
      const label = notificationGroupLabel(item.createdAt);
      const list = groups.get(label) ?? [];
      list.push(item);
      groups.set(label, list);
    }
    return [...groups.entries()].map(([title, data]) => ({ title, data }));
  }, [notifications]);

  const newIds = useMemo(
    () => new Set(notifications.slice(0, unreadAtOpen).map((item) => item.id)),
    [notifications, unreadAtOpen],
  );

  const handlePressItem = useCallback(
    (item: ParentActivityNotification) => {
      const route = resolveParentAttentionNavigation(slug, {
        href: item.href,
        healthApplicationId: firstChildApplicationId,
        pickupApplicationId: firstChildApplicationId,
        programSlug,
      });
      if (route) {
        onClose();
        router.push(route as Href);
      }
    },
    [firstChildApplicationId, onClose, programSlug, router, slug],
  );

  const openSettings = () => {
    onClose();
    router.push(
      programSlug
        ? parentProgramMoreRoute(slug, programSlug, 'notifications')
        : parentMoreRoute(slug, 'notifications'),
    );
  };

  const headerAside =
    unreadAtOpen > 0 ? (
      markedRead ? (
        <GChip label="Marked as read" tone="success" icon="checkmark" />
      ) : (
        <GChip label={`${unreadAtOpen} new`} tone="info" />
      )
    ) : null;

  const listEmpty = loading ? (
    <NotificationsSkeleton />
  ) : error ? (
    <View style={styles.state}>
      <Ionicons name="cloud-offline-outline" size={28} color={Garden.soft} />
      <Text style={styles.stateCopy}>{error}</Text>
      <GToyButton
        label="Try again"
        icon="refresh"
        onPress={() => void fetchPage(null, 'initial')}
      />
    </View>
  ) : (
    <View style={[styles.state, styles.caughtUp]}>
      <GTick size={44} />
      <Text style={styles.caughtUpTitle}>You&apos;re all caught up</Text>
      <Text style={styles.caughtUpCopy}>No recent activity yet.</Text>
    </View>
  );

  return (
    <GSheet
      visible={visible}
      onClose={onClose}
      list
      kicker="Notifications"
      title="Recent school activity"
      subtitle="Important updates for your family."
      headerAside={headerAside}
      accessibilityLabel="Close activity notifications"
      footer={<GLink label="Notification settings" icon="settings-outline" onPress={openSettings} />}>
      <SectionList
        // flex: 1 is required inside a list-mode sheet; flexGrow: 0 renders it 0pt tall.
        style={styles.list}
        contentContainerStyle={styles.listContent}
        sections={sections}
        keyExtractor={(item) => item.id}
        stickySectionHeadersEnabled
        renderSectionHeader={({ section }) => (
          <View style={styles.sectionHeader}>
            <GKicker>{section.title}</GKicker>
          </View>
        )}
        renderItem={({ item }) => (
          <NotificationRow
            item={item}
            isNew={newIds.has(item.id)}
            onPress={() => handlePressItem(item)}
          />
        )}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={listEmpty}
        ListFooterComponent={
          loadingMore ? (
            <View style={styles.footerSpinner}>
              <ActivityIndicator color={accent.clay} />
            </View>
          ) : notifications.length > 0 && !hasMore ? (
            <View style={styles.endLine}>
              <GDashedRule />
              <Text style={styles.endText}>That&apos;s everything for now</Text>
            </View>
          ) : null
        }
        onEndReached={() => {
          if (hasMore) void loadMore();
        }}
        onEndReachedThreshold={0.4}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              haptic.select();
              void fetchPage(null, 'refresh');
            }}
            tintColor={accent.clay}
          />
        }
        showsVerticalScrollIndicator={false}
      />
    </GSheet>
  );
}

const styles = StyleSheet.create({
  list: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 16,
    flexGrow: 1,
  },
  sectionHeader: {
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 6,
    backgroundColor: Garden.cream,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    minHeight: 64,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  rowIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: Garden.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowCopy: {
    flex: 1,
    minWidth: 0,
    gap: 3,
  },
  rowTitleLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  newDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  rowTitle: {
    flex: 1,
    fontFamily: GardenFonts.bodyExtra,
    fontSize: 15,
    lineHeight: 20,
    color: Garden.ink,
  },
  rowDetail: {
    fontFamily: GardenFonts.bodySemi,
    fontSize: 13,
    lineHeight: 18,
    color: Garden.ink65,
  },
  rowMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 2,
  },
  rowTime: {
    fontFamily: GardenFonts.bodySemi,
    fontSize: 12,
    color: Garden.soft,
  },
  rowCta: {
    marginLeft: 'auto',
    fontFamily: GardenFonts.bodyExtra,
    fontSize: 13,
  },
  separator: {
    height: 1,
    marginLeft: 68,
    backgroundColor: Garden.ink10,
  },
  skeleton: {
    paddingHorizontal: 20,
    paddingTop: 16,
    gap: 18,
  },
  skeletonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  skeletonIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  skeletonCopy: {
    flex: 1,
    gap: 8,
  },
  skeletonTitle: {
    width: '70%',
    height: 14,
    borderRadius: 7,
  },
  skeletonLine: {
    width: '95%',
    height: 12,
    borderRadius: 6,
  },
  state: {
    alignItems: 'center',
    gap: 12,
    margin: 20,
    paddingVertical: 28,
    paddingHorizontal: 20,
  },
  stateCopy: {
    fontFamily: GardenFonts.bodySemi,
    fontSize: 14,
    lineHeight: 20,
    color: Garden.soft,
    textAlign: 'center',
  },
  caughtUp: {
    borderRadius: 18,
    backgroundColor: Garden.mint,
  },
  caughtUpTitle: {
    fontFamily: GardenFonts.display,
    fontSize: 20,
    color: Garden.forestDeep,
  },
  caughtUpCopy: {
    fontFamily: GardenFonts.bodyBold,
    fontSize: 14,
    color: Garden.forest,
  },
  footerSpinner: {
    paddingVertical: 20,
  },
  endLine: {
    paddingHorizontal: 20,
    paddingTop: 16,
    gap: 10,
    alignItems: 'center',
  },
  endText: {
    fontFamily: GardenFonts.bodySemi,
    fontSize: 12,
    color: Garden.soft,
  },
});
