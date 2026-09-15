import { StyleSheet, Text, View } from 'react-native';

import { StoryButton } from '@/components/story/story-button';
import { StoryFonts } from '@/constants/story-theme';
import { Spacing } from '@/constants/theme';

type StaffNeedsAttentionBannerProps = {
  needsReviewCount: number;
  onShowReview: () => void;
};

export function StaffNeedsAttentionBanner({
  needsReviewCount,
  onShowReview,
}: StaffNeedsAttentionBannerProps) {
  const memberLabel = needsReviewCount === 1 ? 'profile needs' : 'profiles need';

  return (
    <View style={styles.banner}>
      <Text style={styles.copy}>
        <Text style={styles.bold}>Needs attention: </Text>
        {needsReviewCount} staff {memberLabel} an email or job title before portal access is ready.
      </Text>
      <StoryButton
        label="Show profiles to review →"
        variant="soft"
        onPress={onShowReview}
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
