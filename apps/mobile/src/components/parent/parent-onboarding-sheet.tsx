import { Ionicons } from '@expo/vector-icons';
import { useEffect, useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { useAdminTheme } from '@/contexts/admin-theme-context';
import { Radius, Spacing } from '@/constants/theme';
import type { ResolvedParentOnboardingItem } from '@/lib/parent/parent-portal-api';
import { getQuickActionIconStyle } from '@/lib/parent/parent-nav';

type ParentOnboardingSheetProps = {
  visible: boolean;
  items: ResolvedParentOnboardingItem[];
  onClose: () => void;
  onSelectItem: (item: ResolvedParentOnboardingItem) => void;
};

const SHEET_SLIDE_OFFSET = 500;
const OPEN_DURATION_MS = 280;
const CLOSE_DURATION_MS = 220;

export function ParentOnboardingSheet({
  visible,
  items,
  onClose,
  onSelectItem,
}: ParentOnboardingSheetProps) {
  const theme = useAdminTheme();
  const insets = useSafeAreaInsets();
  const [modalVisible, setModalVisible] = useState(false);
  const backdropOpacity = useSharedValue(0);
  const sheetTranslateY = useSharedValue(SHEET_SLIDE_OFFSET);

  const trackedItems = useMemo(() => items.filter((item) => item.autoTracked), [items]);
  const completedCount = trackedItems.filter((item) => item.completed).length;
  const totalCount = trackedItems.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

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

  return (
    <Modal visible={modalVisible} animationType="none" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Animated.View pointerEvents="none" style={[styles.backdrop, backdropAnimatedStyle]} />
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={onClose}
          accessibilityLabel="Close onboarding"
        />
        <Animated.View
          style={[
            styles.sheet,
            sheetAnimatedStyle,
            {
              backgroundColor: theme.surface,
              borderColor: theme.border,
              paddingBottom: insets.bottom + Spacing.four,
              maxHeight: '85%',
            },
          ]}>
          <View style={styles.handleRow}>
            <View style={[styles.handle, { backgroundColor: theme.borderStrong }]} />
          </View>

          <View style={[styles.header, { borderBottomColor: theme.border }]}>
            <ThemedText type="title" style={{ color: theme.textPrimary }}>
              Get started
            </ThemedText>
            <ThemedText type="small" style={{ color: theme.textSecondary, marginTop: 4 }}>
              {completedCount} of {totalCount} complete
            </ThemedText>
            <View style={[styles.progressTrack, { backgroundColor: `${theme.accent}22` }]}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${progressPercent}%`, backgroundColor: theme.accent },
                ]}
              />
            </View>
          </View>

          <ScrollView contentContainerStyle={styles.list}>
            {items.map((item) => {
              const iconStyle = getQuickActionIconStyle(item.icon ?? 'puzzle');
              return (
                <Pressable
                  key={item.id}
                  accessibilityRole="button"
                  onPress={() => onSelectItem(item)}
                  style={({ pressed }) => [
                    styles.itemRow,
                    { borderColor: theme.border },
                    pressed && { backgroundColor: theme.elevated },
                  ]}>
                  {item.completed ? (
                    <View style={[styles.iconCircle, { backgroundColor: '#D1FAE5' }]}>
                      <Ionicons name="checkmark" size={18} color="#059669" />
                    </View>
                  ) : (
                    <View style={[styles.iconCircle, { backgroundColor: iconStyle.iconBg }]}>
                      <Ionicons name={iconStyle.icon} size={18} color={iconStyle.iconColor} />
                    </View>
                  )}
                  <View style={styles.itemCopy}>
                    <ThemedText
                      type="smallBold"
                      style={{
                        color: item.completed ? theme.textTertiary : theme.textPrimary,
                        textDecorationLine: item.completed ? 'line-through' : 'none',
                      }}>
                      {item.label}
                    </ThemedText>
                  </View>
                  {!item.completed ? (
                    <Ionicons name="chevron-forward" size={18} color={theme.textTertiary} />
                  ) : null}
                </Pressable>
              );
            })}
          </ScrollView>
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
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  sheet: {
    borderTopLeftRadius: Radius.lg,
    borderTopRightRadius: Radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
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
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.two,
    paddingBottom: Spacing.four,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: Spacing.two,
  },
  progressTrack: {
    height: 8,
    borderRadius: Radius.pill,
    overflow: 'hidden',
    marginTop: Spacing.one,
  },
  progressFill: {
    height: '100%',
    borderRadius: Radius.pill,
  },
  list: {
    paddingVertical: Spacing.two,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
    gap: Spacing.three,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemCopy: {
    flex: 1,
  },
});
