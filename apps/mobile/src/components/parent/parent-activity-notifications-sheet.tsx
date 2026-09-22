import { Ionicons } from '@expo/vector-icons';
import { type Href, useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PortalActivityNotificationRow } from '@/components/portal/portal-activity-notification-row';
import { PortalActivityNotificationsSkeleton } from '@/components/portal/portal-activity-notifications-skeleton';
import { StoryButton } from '@/components/story/story-button';
import { useParentTheme } from '@/contexts/parent-theme-context';
import { Story, StoryFonts } from '@/constants/story-theme';
import { SCREEN_HORIZONTAL_PADDING } from '@/constants/screen-layout';
import { Radius, Spacing } from '@/constants/theme';
import {
  fetchParentActivityNotifications,
  markParentActivityNotificationsRead,
  type ParentActivityNotification,
} from '@/lib/parent/fetch-activity-notifications';
import { resolveParentAttentionNavigation } from '@/lib/parent/parent-nav';
import { useMobileErrorReporter } from '@/lib/use-mobile-error-reporter';

const PAGE_SIZE = 20;
const SHEET_SLIDE_OFFSET = 500;
const OPEN_DURATION_MS = 280;
const CLOSE_DURATION_MS = 220;

type ParentActivityNotificationsSheetProps = {
  visible: boolean;
  onClose: () => void;
  organizationId: string;
  slug: string;
  firstChildApplicationId?: string | null;
  onMarkedRead?: () => void;
};

function filterParentActivityNotifications(
  slug: string,
  items: ParentActivityNotification[],
  firstChildApplicationId?: string | null,
): ParentActivityNotification[] {
  return items.filter(
    (item) =>
      resolveParentAttentionNavigation(slug, {
        href: item.href,
        healthApplicationId: firstChildApplicationId,
        pickupApplicationId: firstChildApplicationId,
      }) != null,
  );
}

export function ParentActivityNotificationsSheet({
  visible,
  onClose,
  organizationId,
  slug,
  firstChildApplicationId,
  onMarkedRead,
}: ParentActivityNotificationsSheetProps) {
  const theme = useParentTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { reportError } = useMobileErrorReporter(organizationId);

  const [modalVisible, setModalVisible] = useState(false);
  const [notifications, setNotifications] = useState<ParentActivityNotification[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const loadMorePromiseRef = useRef<Promise<void> | null>(null);

  const backdropOpacity = useSharedValue(0);
  const sheetTranslateY = useSharedValue(SHEET_SLIDE_OFFSET);

  useEffect(() => {
    if (visible) {
      setModalVisible(true);
      backdropOpacity.value = 0;
      sheetTranslateY.value = SHEET_SLIDE_OFFSET;
      backdropOpacity.value = withTiming(1, { duration: 250 });
      sheetTranslateY.value = withTiming(0, {
        duration: OPEN_DURATION_MS,
        easing: Easing.out(Easing.cubic),
      });
      return;
    }

    if (!visible && modalVisible) {
      backdropOpacity.value = withTiming(0, { duration: 200 });
      sheetTranslateY.value = withTiming(
        SHEET_SLIDE_OFFSET,
        { duration: CLOSE_DURATION_MS, easing: Easing.in(Easing.cubic) },
        (finished) => {
          if (finished) {
            runOnJS(setModalVisible)(false);
            runOnJS(setNotifications)([]);
            runOnJS(setNextCursor)(null);
            runOnJS(setHasMore)(false);
            runOnJS(setError)(null);
          }
        },
      );
    }
  }, [visible, modalVisible, backdropOpacity, sheetTranslateY]);

  const backdropAnimatedStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }));

  const sheetAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: sheetTranslateY.value }],
  }));

  const fetchPage = useCallback(
    async (cursor: string | null, append: boolean) => {
      if (append) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }
      setError(null);

      try {
        const page = await fetchParentActivityNotifications(organizationId, slug, {
          cursor,
          limit: PAGE_SIZE,
        });
        const filtered = filterParentActivityNotifications(
          slug,
          page.notifications,
          firstChildApplicationId,
        );

        setNotifications((current) => (append ? [...current, ...filtered] : filtered));
        setNextCursor(page.nextCursor);
        setHasMore(page.hasMore);
      } catch (loadError) {
        reportError('parent_activity_notifications_load', loadError);
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
    [firstChildApplicationId, organizationId, reportError, slug],
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
        await markParentActivityNotificationsRead(organizationId);
        onMarkedRead?.();
      } catch (markReadError) {
        reportError('parent_activity_notifications_mark_read', markReadError);
      }
    })();
  }, [visible, fetchPage, organizationId, onMarkedRead, reportError]);

  const handlePressItem = useCallback(
    (item: ParentActivityNotification) => {
      const route = resolveParentAttentionNavigation(slug, {
        href: item.href,
        healthApplicationId: firstChildApplicationId,
        pickupApplicationId: firstChildApplicationId,
      });
      if (route) {
        onClose();
        router.push(route as Href);
      }
    },
    [firstChildApplicationId, onClose, router, slug],
  );

  const listHeader = (
    <View style={[styles.header, { borderBottomColor: Story.line }]}>
      <Text style={[styles.title, { color: theme.ink }]}>Recent school activity</Text>
      <Text style={[styles.subtitle, { color: theme.muted }]}>
        Important updates for your family.
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
    <Modal visible={modalVisible} animationType="none" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Animated.View pointerEvents="none" style={[styles.backdrop, backdropAnimatedStyle]} />
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={onClose}
          accessibilityLabel="Close activity notifications"
        />
        <Animated.View
          style={[
            styles.sheet,
            sheetAnimatedStyle,
            {
              backgroundColor: Story.white,
              borderColor: Story.line,
              paddingBottom: insets.bottom + Spacing.two,
            },
          ]}>
          <View style={styles.handleRow}>
            <View style={[styles.handle, { backgroundColor: theme.line }]} />
          </View>

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

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Close"
            onPress={onClose}
            style={[styles.closeButton, { backgroundColor: Story.paper, borderColor: Story.line }]}>
            <Ionicons name="close" size={18} color={theme.muted} />
          </Pressable>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  sheet: {
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    borderWidth: StyleSheet.hairlineWidth,
    maxHeight: '85%',
    minHeight: '50%',
  },
  handleRow: {
    alignItems: 'center',
    paddingTop: Spacing.two,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: Radius.pill,
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
  list: {
    flexGrow: 0,
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
  closeButton: {
    position: 'absolute',
    top: Spacing.three,
    right: Spacing.four,
    width: 32,
    height: 32,
    borderRadius: Radius.pill,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
