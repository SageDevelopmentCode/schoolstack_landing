import { Ionicons } from '@expo/vector-icons';
import { type Href, useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
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

import { AdminActivityFeedRow } from '@/components/school-admin/dashboard/admin-activity-feed-row';
import { PrimaryButton } from '@/components/primary-button';
import { ThemedText } from '@/components/themed-text';
import { useAdminTheme } from '@/contexts/admin-theme-context';
import { Radius, Spacing } from '@/constants/theme';
import type { SchoolAdminActivityNotification } from '@/lib/school-admin/dashboard-summary-types';
import {
  fetchSchoolAdminActivityNotifications,
  markActivityNotificationsRead,
} from '@/lib/school-admin/fetch-activity-notifications';
import { filterNativeActivityNotifications } from '@/lib/school-admin/filter-mobile-dashboard-summary';
import { resolveSchoolAdminNativeRoute } from '@/lib/school-admin/school-admin-nav';
import { useMobileErrorReporter } from '@/lib/use-mobile-error-reporter';

const PAGE_SIZE = 20;
const SHEET_SLIDE_OFFSET = 500;
const OPEN_DURATION_MS = 280;
const CLOSE_DURATION_MS = 220;

type AdminActivityNotificationsSheetProps = {
  visible: boolean;
  onClose: () => void;
  organizationId: string;
  slug: string;
  onMarkedRead?: () => void;
};

export function AdminActivityNotificationsSheet({
  visible,
  onClose,
  organizationId,
  slug,
  onMarkedRead,
}: AdminActivityNotificationsSheetProps) {
  const theme = useAdminTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { reportError } = useMobileErrorReporter(organizationId);

  const [modalVisible, setModalVisible] = useState(false);
  const [notifications, setNotifications] = useState<SchoolAdminActivityNotification[]>([]);
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
        const page = await fetchSchoolAdminActivityNotifications(organizationId, {
          cursor,
          limit: PAGE_SIZE,
        });
        const filtered = filterNativeActivityNotifications(slug, page.notifications);

        setNotifications((current) => (append ? [...current, ...filtered] : filtered));
        setNextCursor(page.nextCursor);
        setHasMore(page.hasMore);
      } catch (loadError) {
        reportError('school_admin_activity_notifications_load', loadError);
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
        await markActivityNotificationsRead(organizationId);
        onMarkedRead?.();
      } catch (markReadError) {
        reportError('school_admin_activity_notifications_mark_read', markReadError);
      }
    })();
  }, [visible, fetchPage, organizationId, onMarkedRead, reportError]);

  const handlePressItem = useCallback(
    (item: SchoolAdminActivityNotification) => {
      const route = resolveSchoolAdminNativeRoute(slug, item.href);
      if (route) {
        onClose();
        router.push(route as Href);
      }
    },
    [onClose, router, slug],
  );

  const listHeader = (
    <View style={[styles.header, { borderBottomColor: theme.border }]}>
      <ThemedText type="title" style={{ color: theme.textPrimary }}>
        Recent school activity
      </ThemedText>
      <ThemedText type="small" style={{ color: theme.textSecondary, marginTop: 4 }}>
        Important changes across families and operations.
      </ThemedText>
    </View>
  );

  const listEmpty = loading
    ? (
        <View style={styles.centered}>
          <ActivityIndicator color={theme.accent} />
        </View>
      )
    : error
      ? (
          <View style={styles.centered}>
            <ThemedText type="small" style={{ color: theme.textSecondary, textAlign: 'center' }}>
              {error}
            </ThemedText>
            <PrimaryButton
              label="Try again"
              onPress={() => void fetchPage(null, false)}
              style={styles.retry}
            />
          </View>
        )
      : (
          <View style={styles.centered}>
            <ThemedText type="small" style={{ color: theme.textSecondary }}>
              No recent activity yet.
            </ThemedText>
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
              backgroundColor: theme.surface,
              borderColor: theme.border,
              paddingBottom: insets.bottom + Spacing.two,
            },
          ]}>
          <View style={styles.handleRow}>
            <View style={[styles.handle, { backgroundColor: theme.borderStrong }]} />
          </View>

          <FlatList
            data={notifications}
            keyExtractor={(item) => item.id}
            ListHeaderComponent={listHeader}
            ListEmptyComponent={listEmpty}
            renderItem={({ item, index }) => (
              <AdminActivityFeedRow
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
                  <ActivityIndicator color={theme.accent} />
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
            style={[styles.closeButton, { backgroundColor: theme.bg, borderColor: theme.border }]}>
            <Ionicons name="close" size={18} color={theme.textSecondary} />
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
    paddingHorizontal: Spacing.five,
    paddingTop: Spacing.two,
    paddingBottom: Spacing.four,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  list: {
    flexGrow: 0,
  },
  centered: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.six,
    paddingHorizontal: Spacing.five,
    gap: Spacing.three,
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
