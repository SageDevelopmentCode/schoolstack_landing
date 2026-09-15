import { StyleSheet, Text, View } from 'react-native';

import { StoryButton } from '@/components/story/story-button';
import { StoryFonts } from '@/constants/story-theme';
import { Spacing } from '@/constants/theme';

type StudentsNeedsAttentionBannerProps = {
  unassignedCount: number;
  onShowUnassigned: () => void;
};

export function StudentsNeedsAttentionBanner({
  unassignedCount,
  onShowUnassigned,
}: StudentsNeedsAttentionBannerProps) {
  const learnerLabel = unassignedCount === 1 ? 'learner needs' : 'learners need';

  return (
    <View style={styles.banner}>
      <Text style={styles.copy}>
        <Text style={styles.bold}>Needs attention: </Text>
        {unassignedCount} {learnerLabel} a classroom or lead teacher assignment.
      </Text>
      <StoryButton
        label="Show unassigned →"
        variant="soft"
        onPress={onShowUnassigned}
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
