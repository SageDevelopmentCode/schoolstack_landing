import { StyleSheet, Text, View } from 'react-native';

import { StoryButton } from '@/components/story/story-button';
import { formatShortDate } from '@/lib/admissions/application-submissions';
import type { LatestSubmittedSummary } from '@/lib/school-admin/submissions-page-meta';
import { StoryFonts } from '@/constants/story-theme';
import { Spacing } from '@/constants/theme';

type AdmissionsNeedsAttentionBannerProps = {
  latestSubmitted: LatestSubmittedSummary;
  onReview: () => void;
};

export function AdmissionsNeedsAttentionBanner({
  latestSubmitted,
  onReview,
}: AdmissionsNeedsAttentionBannerProps) {
  const guardianFirstName = latestSubmitted.guardianName?.split(' ')[0] ?? 'family';
  const submittedLabel = latestSubmitted.submittedAt
    ? ` · Submitted ${formatShortDate(latestSubmitted.submittedAt)}`
    : '';

  return (
    <View style={styles.banner}>
      <Text style={styles.copy}>
        <Text style={styles.bold}>Needs attention: </Text>
        {latestSubmitted.guardianName ?? 'A family'}&apos;s completed application is ready for your
        review{submittedLabel}.
      </Text>
      <StoryButton
        label={`Review ${guardianFirstName} →`}
        variant="soft"
        onPress={onReview}
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
