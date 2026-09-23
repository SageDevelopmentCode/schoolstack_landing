import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { BottomSheetShell } from '@/components/story/bottom-sheet-shell';
import { StoryDisplayHeading } from '@/components/story/story-display-heading';
import { StorySectionKicker } from '@/components/story/story-section-kicker';
import { useParentTheme } from '@/contexts/parent-theme-context';
import { StoryFonts } from '@/constants/story-theme';
import { SCREEN_HORIZONTAL_PADDING } from '@/constants/screen-layout';
import { Spacing } from '@/constants/theme';
import { formatLongEventDate } from '@/lib/parent/parent-calendar-agenda-utils';

type ParentCalendarEmptyDaySheetProps = {
  visible: boolean;
  date: string | null;
  onClose: () => void;
};

export function ParentCalendarEmptyDaySheet({
  visible,
  date,
  onClose,
}: ParentCalendarEmptyDaySheetProps) {
  const theme = useParentTheme();

  if (!date) return null;

  return (
    <BottomSheetShell
      visible={visible}
      onClose={onClose}
      backgroundColor={theme.white}
      borderColor={theme.line}
      handleColor={theme.line}
      scrollable={false}
      header={
        <View style={[styles.header, { borderBottomColor: theme.line }]}>
          <Pressable accessibilityRole="button" onPress={onClose} hitSlop={8}>
            <Ionicons name="close" size={22} color={theme.muted} />
          </Pressable>
        </View>
      }
      scrollContentStyle={styles.content}>
      <StorySectionKicker>Selected day</StorySectionKicker>
      <StoryDisplayHeading size="section" style={styles.heading}>
        {formatLongEventDate(date)}
      </StoryDisplayHeading>
      <Text style={[styles.emptyCopy, { color: theme.muted }]}>
        Nothing scheduled for this day.
      </Text>
    </BottomSheetShell>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: SCREEN_HORIZONTAL_PADDING,
    paddingVertical: Spacing.three,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  content: {
    paddingHorizontal: SCREEN_HORIZONTAL_PADDING,
    paddingTop: Spacing.five,
    paddingBottom: Spacing.six,
  },
  heading: {
    fontSize: 18,
    lineHeight: 24,
    marginTop: 4,
  },
  emptyCopy: {
    fontFamily: StoryFonts.body,
    fontSize: 14,
    lineHeight: 22,
    marginTop: Spacing.four,
  },
});
