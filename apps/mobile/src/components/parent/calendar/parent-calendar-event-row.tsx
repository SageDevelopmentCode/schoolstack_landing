import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { useAdminTheme } from '@/contexts/admin-theme-context';
import { Radius, Spacing } from '@/constants/theme';
import { adminCardShadow } from '@/lib/organization-settings/build-admin-theme';
import { formatEventTimeRange } from '@/lib/school-events/calendar-time';
import { getEventDisplayStyle, SCHOOL_EVENT_TYPE_LABELS } from '@/lib/school-events/event-labels';
import type { OrganizationEvent } from '@/lib/school-events/types';

type ParentCalendarEventRowProps = {
  event: OrganizationEvent;
  onPress: () => void;
  variant?: 'short' | 'full';
};

function formatShortEventDate(date: string): string {
  const [year, month, day] = date.split('-').map(Number);
  const parsed = new Date(year, (month ?? 1) - 1, day ?? 1);
  return parsed.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

function formatLongEventDate(date: string): string {
  const [year, month, day] = date.split('-').map(Number);
  const parsed = new Date(year, (month ?? 1) - 1, day ?? 1);
  return parsed.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

export function ParentCalendarEventRow({
  event,
  onPress,
  variant = 'short',
}: ParentCalendarEventRowProps) {
  const theme = useAdminTheme();
  const colors = getEventDisplayStyle(event);

  const subtitle =
    variant === 'full'
      ? `${formatLongEventDate(event.date)}${!event.isAllDay ? ` · ${formatEventTimeRange(event)}` : ''}`
      : `${formatShortEventDate(event.date)}${!event.isAllDay && event.time ? ` · ${event.time}` : ''}`;

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        {
          backgroundColor: theme.surface,
          borderColor: theme.border,
          ...adminCardShadow(theme),
          opacity: pressed ? 0.92 : 1,
        },
      ]}>
      <View style={styles.copy}>
        <ThemedText type="smallBold" style={{ color: theme.textPrimary }} numberOfLines={1}>
          {event.title}
        </ThemedText>
        <ThemedText type="small" style={{ color: theme.textTertiary, marginTop: 2 }}>
          {subtitle}
        </ThemedText>
      </View>
      <View style={[styles.badge, { backgroundColor: colors.bg }]}>
        <ThemedText type="badge" style={{ color: colors.text, fontSize: 9 }}>
          {SCHOOL_EVENT_TYPE_LABELS[event.type].toUpperCase()}
        </ThemedText>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    borderRadius: Radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
  },
  copy: {
    flex: 1,
    minWidth: 0,
  },
  badge: {
    borderRadius: Radius.pill,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
});
