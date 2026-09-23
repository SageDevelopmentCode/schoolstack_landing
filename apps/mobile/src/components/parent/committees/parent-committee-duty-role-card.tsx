import { StyleSheet, Text, View } from 'react-native';

import { StoryCard } from '@/components/story/story-card';
import { useParentTheme } from '@/contexts/parent-theme-context';
import type { CommitteeDutyRole } from '@/lib/parent/parent-committees-types';
import { StoryCardPadding, StoryFonts } from '@/constants/story-theme';
import { Spacing } from '@/constants/theme';

type ParentCommitteeDutyRoleCardProps = {
  role: CommitteeDutyRole;
  assigneeName?: string;
};

export function ParentCommitteeDutyRoleCard({
  role,
  assigneeName,
}: ParentCommitteeDutyRoleCardProps) {
  const theme = useParentTheme();

  return (
    <StoryCard compact style={styles.card}>
      <Text style={[styles.title, { color: theme.ink }]}>{role.title}</Text>
      {role.description ? (
        <Text style={[styles.description, { color: theme.muted }]}>{role.description}</Text>
      ) : null}
      <Text style={[styles.assignee, { color: theme.muted }]}>
        {assigneeName ? `Assigned to ${assigneeName}` : 'Unassigned'}
      </Text>
    </StoryCard>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: StoryCardPadding,
    gap: Spacing.one,
  },
  title: {
    fontFamily: StoryFonts.bodySemiBold,
    fontSize: 14,
  },
  description: {
    fontFamily: StoryFonts.body,
    fontSize: 13,
    lineHeight: 18,
  },
  assignee: {
    fontFamily: StoryFonts.bodyMedium,
    fontSize: 12,
  },
});
