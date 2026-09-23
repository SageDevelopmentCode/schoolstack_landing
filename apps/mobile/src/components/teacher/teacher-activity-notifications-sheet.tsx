import { Ionicons } from '@expo/vector-icons';
import { type Href, useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { PortalActivityNotificationRow } from '@/components/portal/portal-activity-notification-row';
import { PortalActivityNotificationsSkeleton } from '@/components/portal/portal-activity-notifications-skeleton';
import { BottomSheetShell } from '@/components/story/bottom-sheet-shell';
import { StoryButton } from '@/components/story/story-button';
import { useParentTheme } from '@/contexts/parent-theme-context';
import { Story, StoryFonts } from '@/constants/story-theme';
import { SCREEN_HORIZONTAL_PADDING } from '@/constants/screen-layout';
import { Spacing } from '@/constants/theme';
import {
  fetchTeacherActivityNotifications,
  markTeacherActivityNotificationsRead,
  type TeacherActivityNotification,
} from '@/lib/teacher/fetch-activity-notifications';
import { resolveTeacherFocusHref } from '@/lib/teacher/teacher-nav';
import { useMobileErrorReporter } from '@/lib/use-mobile-error-reporter';

const PAGE_SIZE = 20;
const SHEET_CLOSE_MS = 220;

type TeacherActivityNotificationsSheetProps = {
  visible: boolean;
  onClose: () => void;
  organizationId: string;
  slug: string;
  onMarkedRead?: () => void;
};

function filterTeacherActivityNotifications(
  slug: string,
  items: TeacherActivityNotification[],
): TeacherActivityNotification[] {
  return items.filter((item) => resolveTeacherFocusHref(slug, item.href) != null);
}

export function TeacherActivityNotificationsSheet({
  visible,
  onClose,
  organizationId,
  slug,
  onMarkedRead,
}: TeacherActivityNotificationsSheetProps) {
  const theme = useParentTheme();
  const router = useRouter();
  const { reportError } = useMobileErrorReporter(organizationId);

  const [notifications, setNotifications] = useState<TeacherActivityNotification[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const loadMorePromiseRef = useRef<Promise<void> | null>(null);

  useEffect(() => {
    if (!visible) {
      const timer = setTimeout(() => {
        setNotifications([]);
        setNextCursor(null);
        setHasMore(false);
        setError(null);
      }, SHEET_CLOSE_MS);
      return () => clearTimeout(timer);
    }
  }, [visible]);

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
        setError(
          loadError instanceof Error ? loadError.message : 'Failed to load activity.',
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
        onClose();
        router.push(route as Href);
      }
    },
    [onClose, router, slug],
  );

  const listHeader = (
    <View style={[styles.header, { borderBottomColor: Story.line }]}>
      <Text style={[styles.title, { color: theme.ink }]}>Recent school activity</Text>
      <Text style={[styles.subtitle, { color: theme.muted }]}>
        Important changes across your classrooms and students.
      </Text>
    </View>
  );

  const listEmpty = loading
    ? <PortalActivityNotificationsSkeleton />
    : error
      ? (
          <View style={styles.centered}>
            <Text style={[styles.emptyCopy, { color: theme.muted }]}>{error}</Text>
            <StoryButton
              label="Try again"
              onPress={() => void fetchPage(null, false)}
              style={styles.retry}
            />
          </View>
        )
      : (
          <View style={styles.centered}>
            <Text style={[styles.emptyCopy, { color: theme.muted }]}>
              No recent activity yet.
            </Text>
          </View>
        );

  return (
    <BottomSheetShell
      visible={visible}
      onClose={onClose}
      accessibilityLabel="Close activity notifications"
      backgroundColor={Story.white}
      borderColor={Story.line}
      handleColor={theme.line}
      maxHeight="85%"
      scrollable={false}
      sheetStyle={styles.sheet}
      scrollContentStyle={styles.listContainer}
      header={
        <View style={styles.headerArea}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Close"
            onPress={onClose}
            style={[styles.closeButton, { backgroundColor: Story.paper, borderColor: Story.line }]}>
            <Ionicons name="close" size={18} color={theme.muted} />
          </Pressable>
        </View>
      }>
      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={listHeader}
        ListEmptyComponent={listEmpty}
        renderItem={({ item, index }) => (
          <PortalActivityNotificationRow
            item={item}
            showDivider={index > 0}
            onPress={() => handlePressItem(item)}
          />
        )}
        onEndReached={() => {
          if (hasMore) void loadMore();
        }}
        onEndReachedThreshold={0.4}
        ListFooterComponent={
          loadingMore ? (
            <View style={styles.footerSpinner}>
              <ActivityIndicator color={theme.primary} />
            </View>
          ) : null
        }
        showsVerticalScrollIndicator={false}
        style={styles.list}
      />
    </BottomSheetShell>
  );
}

const styles = StyleSheet.create({
  sheet: {
    minHeight: '50%',
  },
  headerArea: {
    position: 'relative',
  },
  closeButton: {
    position: 'absolute',
    top: 0,
    right: Spacing.four,
    zIndex: 1,
    width: 32,
    height: 32,
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    paddingHorizontal: SCREEN_HORIZONTAL_PADDING,
    paddingTop: Spacing.two,
    paddingBottom: Spacing.four,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  title: {
    fontFamily: StoryFonts.display,
    fontSize: 22,
    lineHeight: 28,
  },
  subtitle: {
    fontFamily: StoryFonts.body,
    fontSize: 13,
    lineHeight: 18,
    marginTop: 4,
  },
  listContainer: {
    flex: 1,
  },
  list: {
    flex: 1,
  },
  centered: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.six,
    paddingHorizontal: SCREEN_HORIZONTAL_PADDING,
    gap: Spacing.three,
  },
  emptyCopy: {
    fontFamily: StoryFonts.body,
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
  retry: {
    alignSelf: 'center',
  },
  footerSpinner: {
    paddingVertical: Spacing.four,
  },
});
