import { useEffect, useState } from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { ThemedText } from '@/components/themed-text';
import { useAdminTheme } from '@/contexts/admin-theme-context';
import { Radius, Spacing } from '@/constants/theme';

export type MoreMenuItemId = 'transactions';

type MoreMenuSheetProps = {
  visible: boolean;
  onClose: () => void;
  onSelect: (itemId: MoreMenuItemId) => void;
};

const MENU_ITEMS: {
  id: MoreMenuItemId;
  label: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
}[] = [
  {
    id: 'transactions',
    label: 'Transactions',
    subtitle: 'Payment history',
    icon: 'card-outline',
  },
];

const SHEET_SLIDE_OFFSET = 400;
const OPEN_DURATION_MS = 280;
const CLOSE_DURATION_MS = 220;

export function MoreMenuSheet({ visible, onClose, onSelect }: MoreMenuSheetProps) {
  const theme = useAdminTheme();
  const insets = useSafeAreaInsets();
  const [modalVisible, setModalVisible] = useState(false);
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
        <Animated.View
          pointerEvents="none"
          style={[styles.backdrop, backdropAnimatedStyle]}
        />
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={onClose}
          accessibilityLabel="Close more menu"
        />
        <Animated.View
          style={[
            styles.sheet,
            sheetAnimatedStyle,
            {
              backgroundColor: theme.surface,
              borderColor: theme.border,
              paddingBottom: insets.bottom + Spacing.four,
              shadowColor: theme.shadowColor,
            },
          ]}>
          <View style={styles.handleRow}>
            <View style={[styles.handle, { backgroundColor: theme.borderStrong }]} />
          </View>
          <View style={[styles.header, { borderBottomColor: theme.border }]}>
            <ThemedText type="smallBold" style={{ color: theme.textPrimary }}>
              More
            </ThemedText>
          </View>

          {MENU_ITEMS.map((item) => (
            <Pressable
              key={item.id}
              accessibilityRole="button"
              accessibilityLabel={item.label}
              onPress={() => onSelect(item.id)}
              style={({ pressed }) => [
                styles.row,
                pressed && { backgroundColor: theme.elevated },
              ]}>
              <View style={[styles.iconCircle, { backgroundColor: theme.accentLight }]}>
                <Ionicons name={item.icon} size={20} color={theme.accent} />
              </View>
              <View style={styles.rowCopy}>
                <ThemedText type="smallBold" style={{ color: theme.textPrimary }}>
                  {item.label}
                </ThemedText>
                <ThemedText type="small" style={{ color: theme.textSecondary }}>
                  {item.subtitle}
                </ThemedText>
              </View>
              <Ionicons name="chevron-forward" size={18} color={theme.textTertiary} />
            </Pressable>
          ))}
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
    maxHeight: '70%',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 16,
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
    paddingBottom: Spacing.three,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
    gap: Spacing.three,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowCopy: {
    flex: 1,
    gap: 2,
  },
});
