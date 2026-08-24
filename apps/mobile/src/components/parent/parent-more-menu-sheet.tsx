import type { User } from '@supabase/supabase-js';
import { useEffect, useMemo, useState } from 'react';
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

import { MessagesAvatar } from '@/components/school-admin/messages/messages-avatar';
import { ThemedText } from '@/components/themed-text';
import { useAdminTheme } from '@/contexts/admin-theme-context';
import { useAuth } from '@/contexts/auth-context';
import { useParentHome } from '@/contexts/parent-home-context';
import { Radius, Spacing } from '@/constants/theme';
import type { ParentMoreMenuItemId } from '@/lib/parent/parent-nav';

type ParentMoreMenuSheetProps = {
  visible: boolean;
  onClose: () => void;
  onSelect: (itemId: ParentMoreMenuItemId) => void;
  onSelectAccount: () => void;
};

const MENU_ITEMS: {
  id: ParentMoreMenuItemId;
  label: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
}[] = [
  {
    id: 'attendance',
    label: 'Attendance',
    subtitle: 'Child attendance history',
    icon: 'clipboard-outline',
  },
  {
    id: 'children',
    label: 'My children',
    subtitle: 'Profiles and details',
    icon: 'people-outline',
  },
  {
    id: 'committees',
    label: 'Committees',
    subtitle: 'Volunteer participation',
    icon: 'heart-outline',
  },
  {
    id: 'applications',
    label: 'Your applications',
    subtitle: 'Application dashboard',
    icon: 'document-text-outline',
  },
  {
    id: 'notifications',
    label: 'Notification settings',
    subtitle: 'Family email preferences',
    icon: 'notifications-outline',
  },
];

const SHEET_SLIDE_OFFSET = 400;
const OPEN_DURATION_MS = 280;
const CLOSE_DURATION_MS = 220;

function getDisplayName(user: User): string {
  const fullName = user.user_metadata?.full_name;
  if (typeof fullName === 'string' && fullName.trim()) {
    return fullName.trim();
  }
  const emailLocalPart = user.email?.split('@')[0]?.trim();
  if (emailLocalPart) {
    return emailLocalPart;
  }
  return 'Account';
}

export function ParentMoreMenuSheet({
  visible,
  onClose,
  onSelect,
  onSelectAccount,
}: ParentMoreMenuSheetProps) {
  const theme = useAdminTheme();
  const { user } = useAuth();
  const { data: homeData, ensureLoaded } = useParentHome();
  const insets = useSafeAreaInsets();
  const displayName = useMemo(() => {
    const profileName = homeData?.userProfile.displayName?.trim();
    if (profileName) return profileName;
    return user ? getDisplayName(user) : '';
  }, [homeData?.userProfile.displayName, user]);
  const [modalVisible, setModalVisible] = useState(false);
  const backdropOpacity = useSharedValue(0);
  const sheetTranslateY = useSharedValue(SHEET_SLIDE_OFFSET);

  useEffect(() => {
    if (visible) {
      ensureLoaded();
    }
  }, [visible, ensureLoaded]);

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

          {user ? (
            <View style={[styles.accountSection, { borderTopColor: theme.border }]}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Account for ${displayName}`}
                onPress={onSelectAccount}
                style={({ pressed }) => [
                  styles.row,
                  pressed && { backgroundColor: theme.elevated },
                ]}>
                <MessagesAvatar
                  name={displayName}
                  color={theme.accent}
                  photoUrl={homeData?.userProfile.profilePhotoUrl}
                  size="md"
                />
                <View style={styles.rowCopy}>
                  <ThemedText type="smallBold" style={{ color: theme.textPrimary }}>
                    {displayName}
                  </ThemedText>
                </View>
                <Ionicons name="chevron-forward" size={18} color={theme.textTertiary} />
              </Pressable>
            </View>
          ) : null}
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
    maxHeight: '80%',
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
  accountSection: {
    borderTopWidth: StyleSheet.hairlineWidth,
  },
});
