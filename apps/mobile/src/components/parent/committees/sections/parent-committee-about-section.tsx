import { StyleSheet, Text, View } from 'react-native';

import { StoryCard } from '@/components/story/story-card';
import { StoryDetailSection } from '@/components/school-admin/admissions/story-detail-section';
import { useParentTheme } from '@/contexts/parent-theme-context';
import type { Committee } from '@/lib/parent/parent-committees-types';
import { stripHtmlTags } from '@/lib/parent/parent-committees-types';
import { StoryCardPadding, StoryFonts } from '@/constants/story-theme';
import { Spacing } from '@/constants/theme';

type ParentCommitteeAboutSectionProps = {
  committee: Committee;
};

export function ParentCommitteeAboutSection({ committee }: ParentCommitteeAboutSectionProps) {
  const theme = useParentTheme();
  const aboutText = stripHtmlTags(committee.aboutHtml);

  return (
    <View style={styles.container}>
      {aboutText ? (
        <StoryDetailSection title="About this committee">
          <Text style={[styles.body, { color: theme.muted }]}>{aboutText}</Text>
        </StoryDetailSection>
      ) : null}

      {committee.dutyRoles.length > 0 ? (
        <StoryDetailSection title="Duty roles">
          <View style={styles.roleList}>
            {committee.dutyRoles.map((role) => (
              <StoryCard key={role.id} compact style={styles.roleCard}>
                <Text style={[styles.roleTitle, { color: theme.ink }]}>{role.title}</Text>
                <Text style={[styles.roleDescription, { color: theme.muted }]}>{role.description}</Text>
              </StoryCard>
            ))}
          </View>
        </StoryDetailSection>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.four,
  },
  body: {
    fontFamily: StoryFonts.body,
    fontSize: 14,
    lineHeight: 20,
  },
  roleList: {
    gap: Spacing.two,
  },
  roleCard: {
    padding: StoryCardPadding,
    gap: Spacing.one,
  },
  roleTitle: {
    fontFamily: StoryFonts.bodySemiBold,
    fontSize: 14,
  },
  roleDescription: {
    fontFamily: StoryFonts.body,
    fontSize: 12,
    lineHeight: 16,
  },
});
