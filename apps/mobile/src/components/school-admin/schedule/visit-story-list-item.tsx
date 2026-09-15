import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { StoryChip, type StoryChipTone } from '@/components/story/story-chip';
import { useParentTheme } from '@/contexts/parent-theme-context';
import { StoryFonts } from '@/constants/story-theme';
import { Spacing } from '@/constants/theme';
import type { AdminScheduledVisit } from '@/lib/admissions/admin-scheduled-visits';
import type { ScheduledVisitTiming } from '@/lib/admissions/admissions-availability';

type VisitStoryListItemProps = {
  visit: AdminScheduledVisit;
  onPress?: () => void;
  showFormTitle?: boolean;
};

function visitChipTone(timing: ScheduledVisitTiming): StoryChipTone {
  switch (timing) {
    case 'happening':
      return 'success';
    case 'past':
      return 'info';
    default:
      return 'info';
  }
}

function visitChipLabel(timing: ScheduledVisitTiming): string {
  switch (timing) {
    case 'happening':
      return 'Now';
    case 'past':
      return 'Past';
    default:
      return 'Upcoming';
  }
}

export function VisitStoryListItem({
  visit,
  onPress,
  showFormTitle = false,
}: VisitStoryListItemProps) {
  const theme = useParentTheme();

  return (
    <Pressable
      accessibilityRole="button"
      disabled={!onPress}
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && onPress && { opacity: 0.85 }]}>
      <View style={[styles.iconTile, { backgroundColor: theme.infoBg }]}>
        <Ionicons name="calendar-outline" size={16} color={theme.primary} />
      </View>
      <View style={styles.copy}>
        <Text numberOfLines={1} style={[styles.title, { color: theme.ink }]}>
          {visit.stepTitle}
        </Text>
        <Text numberOfLines={2} style={[styles.meta, { color: theme.muted }]}>
          {visit.studentLabel ?? 'Student pending'}
          <Text style={styles.dot}> · </Text>
          {visit.whenLabel}
        </Text>
        {showFormTitle ? (
          <Text numberOfLines={1} style={[styles.meta, { color: theme.muted }]}>
            {visit.formTitle}
          </Text>
        ) : null}
      </View>
      <StoryChip tone={visitChipTone(visit.timing)} label={visitChipLabel(visit.timing)} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    paddingVertical: Spacing.two,
  },
  iconTile: {
    width: 31,
    height: 31,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  copy: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  title: {
    fontFamily: StoryFonts.bodySemiBold,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '700',
  },
  meta: {
    fontFamily: StoryFonts.body,
    fontSize: 10,
    lineHeight: 14,
  },
  dot: {
    opacity: 0.5,
  },
});
