import { Ionicons } from '@expo/vector-icons';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

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
  const insets = useSafeAreaInsets();

  if (!date) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}>
      <View style={[styles.container, { backgroundColor: theme.white, paddingTop: insets.top }]}>
        <View style={[styles.header, { borderBottomColor: theme.line }]}>
          <Pressable accessibilityRole="button" onPress={onClose} hitSlop={8}>
            <Ionicons name="close" size={22} color={theme.muted} />
          </Pressable>
        </View>

        <View style={styles.content}>
          <StorySectionKicker>Selected day</StorySectionKicker>
          <StoryDisplayHeading size="section" style={styles.heading}>
            {formatLongEventDate(date)}
          </StoryDisplayHeading>
          <Text style={[styles.emptyCopy, { color: theme.muted }]}>
            Nothing scheduled for this day.
          </Text>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
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
