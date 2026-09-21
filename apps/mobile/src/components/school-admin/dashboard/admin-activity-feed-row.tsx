import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { useAdminTheme } from '@/contexts/admin-theme-context';
import { SCREEN_HORIZONTAL_PADDING } from '@/constants/screen-layout';
import { Radius, Spacing } from '@/constants/theme';
import {
  activityCategoryChipTone,
  activityCategoryLabel,
} from '@/lib/school-admin/activity-category';
import type { SchoolAdminActivityNotification } from '@/lib/school-admin/dashboard-summary-types';
import { formatRelativeTime } from '@/lib/school-admin/format-relative-time';

type AdminActivityFeedRowProps = {
  item: SchoolAdminActivityNotification;
  onPress: () => void;
  showDivider?: boolean;
  showCta?: boolean;
};

function chipColors(
  tone: ReturnType<typeof activityCategoryChipTone>,
  theme: ReturnType<typeof useAdminTheme>,
): { backgroundColor: string; color: string } {
  switch (tone) {
    case 'success':
      return { backgroundColor: theme.successBg, color: theme.success };
    case 'warning':
      return { backgroundColor: theme.warningBg, color: theme.warning };
    case 'purple':
      return { backgroundColor: `${theme.accent}14`, color: theme.accent };
    case 'info':
    default:
      return { backgroundColor: theme.infoBg, color: theme.info };
  }
}

export function AdminActivityFeedRow({
  item,
  onPress,
  showDivider = false,
  showCta = true,
}: AdminActivityFeedRowProps) {
  const theme = useAdminTheme();
  const tone = activityCategoryChipTone(item.category);
  const chipStyle = chipColors(tone, theme);
  const isPayment = item.category === 'payments';

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        showDivider && {
          borderTopWidth: StyleSheet.hairlineWidth,
          borderTopColor: theme.border,
        },
        pressed && { opacity: 0.85 },
      ]}>
      <View style={styles.topRow}>
        <View style={[styles.chip, { backgroundColor: chipStyle.backgroundColor }]}>
          <ThemedText type="badge" style={{ color: chipStyle.color, fontSize: 10 }}>
            {activityCategoryLabel(item.category)}
          </ThemedText>
        </View>
        {showCta ? (
          <ThemedText type="smallBold" style={[styles.cta, { color: theme.accent }]}>
            {item.ctaLabel} →
          </ThemedText>
        ) : null}
      </View>

      {isPayment ? (
        <ThemedText type="small" numberOfLines={3} style={{ color: theme.textPrimary }}>
          {item.detail}
        </ThemedText>
      ) : (
        <>
          <ThemedText type="smallBold" style={{ color: theme.textPrimary }}>
            {item.title}
          </ThemedText>
          <ThemedText
            type="small"
            numberOfLines={3}
            style={{ color: theme.textSecondary, marginTop: 2 }}>
            {item.detail}
          </ThemedText>
        </>
      )}

      <ThemedText type="small" style={{ color: theme.textTertiary, marginTop: 2 }}>
        {formatRelativeTime(item.createdAt)}
      </ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    gap: Spacing.two,
    paddingHorizontal: SCREEN_HORIZONTAL_PADDING,
    paddingVertical: Spacing.three,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  chip: {
    borderRadius: Radius.pill,
    paddingHorizontal: Spacing.two,
    paddingVertical: 4,
    flexShrink: 1,
  },
  cta: {
    flexShrink: 0,
  },
});
