import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { StoryChip } from '@/components/story/story-chip';
import { MY_HOURS_CALENDAR_LINE } from '@/components/teacher/my-hours/teacher-my-hours-theme';
import { useParentTheme } from '@/contexts/parent-theme-context';
import { StoryFonts } from '@/constants/story-theme';
import { Spacing } from '@/constants/theme';

type TeacherMyHoursDateNavProps = {
  label: string;
  onPrevious: () => void;
  onNext: () => void;
  fullWidth?: boolean;
  embedded?: boolean;
  showTodayBadge?: boolean;
};

export function TeacherMyHoursDateNav({
  label,
  onPrevious,
  onNext,
  fullWidth = false,
  embedded = false,
  showTodayBadge = false,
}: TeacherMyHoursDateNavProps) {
  const theme = useParentTheme();

  return (
    <View
      style={[
        styles.wrapper,
        fullWidth && styles.fullWidth,
        embedded && styles.embedded,
        embedded && { borderBottomColor: MY_HOURS_CALENDAR_LINE },
        !embedded && { borderColor: theme.line, backgroundColor: theme.white },
      ]}
      testID="teacher-my-hours-date-nav">
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Previous date"
        onPress={onPrevious}
        style={({ pressed }) => [styles.button, pressed && styles.pressed]}>
        <Ionicons name="chevron-back" size={18} color={theme.ink} />
      </Pressable>
      <View style={styles.labelCluster}>
        <Text style={[styles.label, { color: theme.ink }]} numberOfLines={1}>
          {label}
        </Text>
        {showTodayBadge ? (
          <StoryChip label="Today" tone="info" uppercase={false} />
        ) : null}
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Next date"
        onPress={onNext}
        style={({ pressed }) => [styles.button, pressed && styles.pressed]}>
        <Ionicons name="chevron-forward" size={18} color={theme.ink} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 4,
    paddingVertical: 4,
    gap: 4,
  },
  fullWidth: {
    alignSelf: 'stretch',
    width: '100%',
  },
  embedded: {
    borderWidth: 0,
    borderRadius: 0,
    borderBottomWidth: 1,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
    marginHorizontal: 0,
  },
  button: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  labelCluster: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
    minWidth: 0,
  },
  label: {
    fontFamily: StoryFonts.bodySemiBold,
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    flexShrink: 1,
  },
  pressed: {
    opacity: 0.7,
  },
});
