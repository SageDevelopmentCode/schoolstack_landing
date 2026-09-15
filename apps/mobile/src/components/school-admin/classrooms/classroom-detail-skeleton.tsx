import { useEffect, type ReactNode } from 'react';
import { ScrollView, StyleSheet, View, type ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { DetailRowListSkeleton } from '@/components/school-admin/submission-detail-skeleton';
import { StaffAssignedStudentsSkeleton } from '@/components/school-admin/staff/staff-assigned-students-skeleton';
import { Story } from '@/constants/story-theme';
import { SCREEN_HORIZONTAL_PADDING } from '@/constants/screen-layout';
import { Radius, Spacing } from '@/constants/theme';

const SKELETON_COLOR = '#E4E8E1';

function SkeletonBlock({
  style,
  backgroundColor,
}: {
  style: ViewStyle;
  backgroundColor: string;
}) {
  const opacity = useSharedValue(0.4);

  useEffect(() => {
    opacity.value = withRepeat(withTiming(1, { duration: 900 }), -1, true);
  }, [opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return <Animated.View style={[style, { backgroundColor }, animatedStyle]} />;
}

function SkeletonSection({
  titleWidth,
  descriptionWidth,
  children,
}: {
  titleWidth: `${number}%`;
  descriptionWidth: `${number}%`;
  children: ReactNode;
}) {
  return (
    <View style={[styles.sectionCard, { backgroundColor: Story.white, borderColor: Story.line }]}>
      <SkeletonBlock style={[styles.sectionTitle, { width: titleWidth }]} backgroundColor={SKELETON_COLOR} />
      <SkeletonBlock
        style={[styles.sectionDescription, { width: descriptionWidth }]}
        backgroundColor={SKELETON_COLOR}
      />
      <View style={styles.sectionBody}>{children}</View>
    </View>
  );
}

export function ClassroomDetailSkeleton() {
  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <SkeletonBlock style={styles.backBar} backgroundColor={SKELETON_COLOR} />

        <View style={styles.hero}>
          <SkeletonBlock style={styles.kickerBar} backgroundColor={SKELETON_COLOR} />
          <View style={styles.titleRow}>
            <SkeletonBlock style={styles.titleBar} backgroundColor={SKELETON_COLOR} />
            <SkeletonBlock style={styles.chipPill} backgroundColor={SKELETON_COLOR} />
          </View>
          <SkeletonBlock style={styles.subtitleBar} backgroundColor={SKELETON_COLOR} />
        </View>

        <View style={styles.actions}>
          <SkeletonBlock style={styles.actionButton} backgroundColor={SKELETON_COLOR} />
          <SkeletonBlock style={styles.actionButton} backgroundColor={SKELETON_COLOR} />
        </View>

        <SkeletonSection titleWidth="20%" descriptionWidth="75%">
          <DetailRowListSkeleton rowCount={2} />
          <SkeletonBlock style={styles.sectionAction} backgroundColor={SKELETON_COLOR} />
        </SkeletonSection>

        <SkeletonSection titleWidth="35%" descriptionWidth="85%">
          <StaffAssignedStudentsSkeleton rowCount={4} />
          <SkeletonBlock style={styles.sectionAction} backgroundColor={SKELETON_COLOR} />
        </SkeletonSection>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Story.paper,
  },
  scrollContent: {
    paddingHorizontal: SCREEN_HORIZONTAL_PADDING,
    paddingTop: Spacing.four,
    gap: Spacing.four,
    paddingBottom: Spacing.six,
  },
  backBar: {
    width: 110,
    height: 20,
    borderRadius: 10,
  },
  hero: {
    gap: Spacing.one,
  },
  kickerBar: {
    width: 80,
    height: 10,
    borderRadius: 5,
  },
  titleRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: Spacing.two,
  },
  titleBar: {
    flex: 1,
    minWidth: 160,
    height: 24,
    borderRadius: 8,
  },
  chipPill: {
    width: 52,
    height: 22,
    borderRadius: Radius.pill,
  },
  subtitleBar: {
    width: '75%',
    height: 14,
    borderRadius: 7,
  },
  actions: {
    gap: Spacing.two,
  },
  actionButton: {
    height: 44,
    borderRadius: Radius.pill,
  },
  sectionCard: {
    borderRadius: Radius.lg,
    borderWidth: 1,
    padding: Spacing.three,
    gap: Spacing.two,
  },
  sectionTitle: {
    height: 10,
    borderRadius: 5,
  },
  sectionDescription: {
    height: 12,
    borderRadius: 6,
  },
  sectionBody: {
    gap: Spacing.two,
    marginTop: Spacing.one,
  },
  sectionAction: {
    height: 44,
    borderRadius: Radius.pill,
    marginTop: Spacing.one,
  },
});
