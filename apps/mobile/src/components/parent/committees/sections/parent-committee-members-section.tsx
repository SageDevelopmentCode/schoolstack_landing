import { StyleSheet, Text, View } from 'react-native';

import { StoryCard } from '@/components/story/story-card';
import { StoryChip } from '@/components/story/story-chip';
import { StoryDetailSection } from '@/components/school-admin/admissions/story-detail-section';
import { useParentTheme } from '@/contexts/parent-theme-context';
import type { Committee, CommitteeRole } from '@/lib/parent/parent-committees-types';
import type { StoryChipTone } from '@/components/story/story-chip';
import { StoryCardPadding, StoryFonts } from '@/constants/story-theme';
import { Spacing } from '@/constants/theme';

type ParentCommitteeMembersSectionProps = {
  committee: Committee;
};

function roleLabel(role: CommitteeRole): string {
  switch (role) {
    case 'lead':
      return 'Lead';
    case 'faculty_liaison':
      return 'Faculty liaison';
    case 'admin':
      return 'Admin';
    default:
      return 'Member';
  }
}

function roleTone(role: CommitteeRole): StoryChipTone {
  if (role === 'lead') return 'success';
  if (role === 'faculty_liaison') return 'info';
  if (role === 'admin') return 'warning';
  return 'info';
}

export function ParentCommitteeMembersSection({ committee }: ParentCommitteeMembersSectionProps) {
  const theme = useParentTheme();
  const members = committee.members.filter((member) => member.status === 'active');

  if (members.length === 0) {
    return (
      <StoryDetailSection title="Members">
        <Text style={[styles.emptyCopy, { color: theme.muted }]}>No members yet.</Text>
      </StoryDetailSection>
    );
  }

  return (
    <StoryDetailSection title="Members">
      <View style={styles.list}>
        {members.map((member) => (
          <StoryCard key={member.id} compact style={styles.card}>
            <View style={styles.headerRow}>
              <Text style={[styles.name, { color: theme.ink }]}>{member.name}</Text>
              <StoryChip tone={roleTone(member.role)} label={roleLabel(member.role)} />
            </View>
            {member.grade ? (
              <Text style={[styles.meta, { color: theme.muted }]}>Grade: {member.grade}</Text>
            ) : null}
            {member.bio ? (
              <Text style={[styles.bio, { color: theme.muted }]}>{member.bio}</Text>
            ) : null}
          </StoryCard>
        ))}
      </View>
    </StoryDetailSection>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: Spacing.two,
  },
  card: {
    padding: StoryCardPadding,
    gap: Spacing.one,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  name: {
    fontFamily: StoryFonts.bodySemiBold,
    fontSize: 14,
    flex: 1,
  },
  meta: {
    fontFamily: StoryFonts.body,
    fontSize: 12,
  },
  bio: {
    fontFamily: StoryFonts.body,
    fontSize: 13,
    lineHeight: 18,
  },
  emptyCopy: {
    fontFamily: StoryFonts.body,
    fontSize: 14,
  },
});
