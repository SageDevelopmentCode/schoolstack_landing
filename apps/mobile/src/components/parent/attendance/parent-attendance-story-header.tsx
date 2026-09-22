import { StyleSheet, Text } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { StoryDisplayHeading } from '@/components/story/story-display-heading';
import { StoryPillNav } from '@/components/story/story-pill-nav';
import { StorySectionKicker } from '@/components/story/story-section-kicker';
import { useParentTheme } from '@/contexts/parent-theme-context';
import { StoryFonts } from '@/constants/story-theme';
import { Spacing } from '@/constants/theme';
import { childFirstName } from '@/lib/parent/parent-children-utils';
import type { ParentAttendanceEligibleChild } from '@/lib/parent/parent-portal-api';

type ParentAttendanceStoryHeaderProps = {
  eligibleChildren?: ParentAttendanceEligibleChild[];
  selectedApplicationId?: string;
  onSelectChild?: (applicationId: string) => void;
};

export function ParentAttendanceStoryHeader({
  eligibleChildren = [],
  selectedApplicationId = '',
  onSelectChild,
}: ParentAttendanceStoryHeaderProps) {
  const theme = useParentTheme();
  const hasMultipleChildren = eligibleChildren.length > 1;

  const navItems = hasMultipleChildren
    ? eligibleChildren.map((child) => ({
        key: child.applicationId,
        label: childFirstName(child.studentName),
        testID: `parent-attendance-child-${child.applicationId}`,
      }))
    : [];

  return (
    <Animated.View entering={FadeInDown.duration(350)} style={styles.container}>
      <StorySectionKicker style={styles.kicker}>Your family</StorySectionKicker>
      <StoryDisplayHeading size="display">Attendance</StoryDisplayHeading>
      <Text style={[styles.subtitle, { color: theme.muted }]}>
        Check-in history and absences at a glance.
      </Text>
      {hasMultipleChildren && onSelectChild ? (
        <StoryPillNav
          fullWidth
          items={navItems}
          activeKey={selectedApplicationId}
          onChange={onSelectChild}
          accessibilityLabel="Select learner"
        />
      ) : null}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.one,
  },
  kicker: {
    marginBottom: 4,
  },
  subtitle: {
    fontFamily: StoryFonts.body,
    fontSize: 14,
    lineHeight: 20,
    marginTop: 4,
  },
});
