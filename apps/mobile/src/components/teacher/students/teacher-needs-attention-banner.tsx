import { StyleSheet, Text, View } from 'react-native';

import { StoryButton } from '@/components/story/story-button';
import { StoryFonts } from '@/constants/story-theme';
import { Spacing } from '@/constants/theme';

type TeacherNeedsAttentionBannerProps = {
  unassignedCount: number;
  onViewUnassigned: () => void;
};

export function TeacherNeedsAttentionBanner({
  unassignedCount,
  onViewUnassigned,
}: TeacherNeedsAttentionBannerProps) {
  const studentLabel = unassignedCount === 1 ? 'student' : 'students';

  return (
    <View style={styles.banner}>
      <Text style={styles.copy}>
        <Text style={styles.bold}>Needs attention: </Text>
        {unassignedCount} enrolled {studentLabel} don&apos;t have a teacher assigned.
      </Text>
      <StoryButton
        label="View unassigned →"
        variant="soft"
        onPress={onViewUnassigned}
        style={styles.button}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    backgroundColor: '#EAF4EB',
    borderColor: '#C7DFCB',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
    gap: Spacing.two,
  },
  copy: {
    fontFamily: StoryFonts.body,
    fontSize: 13,
    lineHeight: 20,
    color: '#42694F',
  },
  bold: {
    fontFamily: StoryFonts.bodySemiBold,
    fontWeight: '700',
  },
  button: {
    alignSelf: 'flex-start',
    minWidth: 0,
    width: 'auto',
  },
});
