import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { StudentPhoto } from '@/components/school-admin/student-photo';
import { useParentTheme } from '@/contexts/parent-theme-context';
import { StoryFonts, storyCardShadow } from '@/constants/story-theme';
import { Spacing } from '@/constants/theme';
import { childAccentBg } from '@/lib/organization-settings/parent-theme';
import {
  childFirstName,
  childLearnerSubtitleLine,
} from '@/lib/parent/parent-children-utils';
import type { FamilyChildOverview } from '@/lib/parent/parent-portal-api';

type ParentChildrenLearnerStripProps = {
  learners: FamilyChildOverview[];
  selectedApplicationId: string;
  onSelect: (applicationId: string) => void;
};

export function ParentChildrenLearnerStrip({
  learners,
  selectedApplicationId,
  onSelect,
}: ParentChildrenLearnerStripProps) {
  const theme = useParentTheme();

  if (learners.length <= 1) return null;

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      accessibilityRole="tablist"
      accessibilityLabel="Select learner"
      style={styles.strip}
      contentContainerStyle={styles.track}
      testID="parent-children-learner-strip">
      {learners.map((child, index) => {
        const active = child.applicationId === selectedApplicationId;
        const firstName = childFirstName(child.studentName);
        const accentBg = childAccentBg(index);

        return (
          <Pressable
            key={child.applicationId}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            onPress={() => onSelect(child.applicationId)}
            testID={`parent-children-learner-${child.applicationId}`}
            style={({ pressed }) => [
              styles.card,
              {
                backgroundColor: active ? theme.primarySoft : theme.white,
                borderColor: active ? '#95B9A0' : theme.line,
              },
              active && storyCardShadow(),
              pressed && { opacity: 0.9 },
            ]}>
            <View style={[styles.avatarWrap, { backgroundColor: accentBg }]}>
              <StudentPhoto
                name={child.studentName}
                photoUrl={child.profilePhotoUrl}
                size="md"
              />
            </View>
            <View style={styles.copy}>
              <Text style={[styles.name, { color: theme.ink }]} numberOfLines={1}>
                {firstName}
              </Text>
              <Text style={[styles.subtitle, { color: theme.muted }]} numberOfLines={1}>
                {childLearnerSubtitleLine(child)}
              </Text>
            </View>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  strip: {
    flexGrow: 0,
  },
  track: {
    flexDirection: 'row',
    gap: Spacing.two,
    paddingBottom: Spacing.one,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    minWidth: 155,
    minHeight: 44,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  avatarWrap: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  copy: {
    flex: 1,
    minWidth: 0,
  },
  name: {
    fontFamily: StoryFonts.bodySemiBold,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 16,
  },
  subtitle: {
    fontFamily: StoryFonts.body,
    fontSize: 10,
    lineHeight: 14,
  },
});
