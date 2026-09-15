import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { StudentPhoto } from '@/components/school-admin/student-photo';
import { StoryAttentionItem } from '@/components/story/story-attention-item';
import { StoryCard } from '@/components/story/story-card';
import { StoryDisplayHeading } from '@/components/story/story-display-heading';
import { StorySectionKicker } from '@/components/story/story-section-kicker';
import { StoryTextLink } from '@/components/story/story-text-link';
import { useParentTheme } from '@/contexts/parent-theme-context';
import { StoryCardPadding, StoryFonts } from '@/constants/story-theme';
import { Spacing } from '@/constants/theme';
import {
  childFirstName,
  incompleteChecklistItems,
  type ChildProfileData,
  type ParentChildRecordSection,
} from '@/lib/parent/parent-children-utils';
import type { FamilyChildOverview } from '@/lib/parent/parent-portal-api';

type ParentChildrenOverviewProps = {
  child: FamilyChildOverview;
  profile: ChildProfileData | null;
  onOpenRecordSection: (section: ParentChildRecordSection) => void;
};

export function ParentChildrenOverview({
  child,
  profile,
  onOpenRecordSection,
}: ParentChildrenOverviewProps) {
  const theme = useParentTheme();
  const firstName = childFirstName(child.studentName);
  const attentionItems = incompleteChecklistItems(profile);
  const teachers = profile?.assignedTeachers ?? [];

  return (
    <View style={styles.container} testID="parent-children-overview">
      <StoryCard style={styles.card}>
        <StorySectionKicker style={styles.kicker}>Needs your attention</StorySectionKicker>
        <StoryDisplayHeading size="section" style={styles.cardTitle}>
          {attentionItems.length === 0 ? 'Everything is in good shape' : 'Next steps'}
        </StoryDisplayHeading>

        {attentionItems.length === 0 ? (
          <View style={styles.goodShapeRow}>
            <Ionicons name="checkmark-circle" size={16} color={theme.success} />
            <Text style={[styles.goodShapeCopy, { color: theme.muted }]}>
              No required enrollment items are waiting on you right now.
            </Text>
          </View>
        ) : (
          <View style={styles.attentionList}>
            {attentionItems.slice(0, 3).map((item, index) => (
              <StoryAttentionItem
                key={item.label}
                icon={<Ionicons name="document-text-outline" size={14} color={theme.warning} />}
                title={item.label}
                subtitle={item.status.replace(/_/g, ' ')}
                iconBg={theme.warningBg}
                isFirst={index === 0}
              />
            ))}
          </View>
        )}

        {attentionItems.length > 0 ? (
          <StoryTextLink
            label="Review checklist →"
            onPress={() => onOpenRecordSection('checklist')}
          />
        ) : null}
      </StoryCard>

      <StoryCard style={styles.card}>
        <StorySectionKicker style={styles.kicker}>Guides at school</StorySectionKicker>
        <StoryDisplayHeading size="section" style={styles.cardTitle}>
          {teachers.length === 0 ? 'Teachers coming soon' : `${firstName}'s team`}
        </StoryDisplayHeading>

        {teachers.length === 0 ? (
          <Text style={[styles.emptyCopy, { color: theme.muted }]}>
            Assigned teachers will appear here once {firstName} is linked to a class group.
          </Text>
        ) : (
          <View style={styles.teacherList}>
            {teachers.slice(0, 2).map((teacher) => (
              <View key={teacher.id} style={styles.teacherRow}>
                <StudentPhoto
                  name={teacher.name}
                  photoUrl={teacher.profilePhotoUrl}
                  size="md"
                />
                <View style={styles.teacherCopy}>
                  <Text style={[styles.teacherName, { color: theme.ink }]} numberOfLines={1}>
                    {teacher.name}
                  </Text>
                  {teacher.roleTitle ? (
                    <Text style={[styles.teacherRole, { color: theme.muted }]} numberOfLines={1}>
                      {teacher.roleTitle}
                    </Text>
                  ) : null}
                </View>
              </View>
            ))}
          </View>
        )}

        {teachers.length > 0 ? (
          <StoryTextLink
            label="See all teachers →"
            onPress={() => onOpenRecordSection('teachers')}
          />
        ) : null}
      </StoryCard>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.three,
  },
  card: {
    padding: StoryCardPadding,
  },
  kicker: {
    marginBottom: Spacing.one,
  },
  cardTitle: {
    fontSize: 17,
    lineHeight: 22,
    letterSpacing: -0.4,
  },
  goodShapeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    marginTop: Spacing.two,
  },
  goodShapeCopy: {
    flex: 1,
    fontFamily: StoryFonts.body,
    fontSize: 12,
    lineHeight: 18,
  },
  attentionList: {
    marginTop: Spacing.one,
  },
  emptyCopy: {
    fontFamily: StoryFonts.body,
    fontSize: 12,
    lineHeight: 18,
    marginTop: Spacing.two,
  },
  teacherList: {
    marginTop: Spacing.two,
    gap: Spacing.two,
  },
  teacherRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  teacherCopy: {
    flex: 1,
    minWidth: 0,
  },
  teacherName: {
    fontFamily: StoryFonts.bodySemiBold,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 16,
  },
  teacherRole: {
    fontFamily: StoryFonts.body,
    fontSize: 11,
    lineHeight: 15,
    marginTop: 2,
  },
});
