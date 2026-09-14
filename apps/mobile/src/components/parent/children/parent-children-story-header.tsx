import { StyleSheet, Text, View } from 'react-native';

import { StoryDisplayHeading } from '@/components/story/story-display-heading';
import { StorySectionKicker } from '@/components/story/story-section-kicker';
import { useParentTheme } from '@/contexts/parent-theme-context';
import { StoryFonts } from '@/constants/story-theme';
import { Spacing } from '@/constants/theme';
import {
  childFirstName,
  familyChildrenSubtitle,
  formatChildrenPageDate,
} from '@/lib/parent/parent-children-utils';
import type { FamilyChildOverview } from '@/lib/parent/parent-portal-api';

type ParentChildrenStoryHeaderProps = {
  learners: FamilyChildOverview[];
  selectedChild: FamilyChildOverview | null;
};

export function ParentChildrenStoryHeader({
  learners,
  selectedChild,
}: ParentChildrenStoryHeaderProps) {
  const theme = useParentTheme();
  const dateLabel = formatChildrenPageDate();
  const subtitle = familyChildrenSubtitle(learners);
  const title = selectedChild
    ? `${childFirstName(selectedChild.studentName)}'s profile`
    : 'Follow their day.';

  return (
    <View style={styles.container} testID="parent-children-story-header">
      <StorySectionKicker style={styles.kicker}>My children · {dateLabel}</StorySectionKicker>
      <StoryDisplayHeading size="section">{title}</StoryDisplayHeading>
      {subtitle ? (
        <Text style={[styles.subtitle, { color: theme.muted }]}>{subtitle}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.one,
  },
  kicker: {
    marginBottom: 0,
  },
  subtitle: {
    fontFamily: StoryFonts.body,
    fontSize: 13,
    lineHeight: 18,
    marginTop: Spacing.one,
  },
});
