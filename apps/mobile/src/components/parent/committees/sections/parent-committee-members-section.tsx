import { StyleSheet, Text, View } from 'react-native';

import { ParentCommitteeDutyRoleCard } from '@/components/parent/committees/parent-committee-duty-role-card';
import { StoryCard } from '@/components/story/story-card';
import { StoryChip } from '@/components/story/story-chip';
import { StoryDetailSection } from '@/components/school-admin/admissions/story-detail-section';
import { useParentTheme } from '@/contexts/parent-theme-context';
import type { ParentCommitteeSectionProps } from '@/lib/parent/committees/section-props';
import type { CommitteeRole } from '@/lib/parent/parent-committees-types';
import type { StoryChipTone } from '@/components/story/story-chip';
import { StoryCardPadding, StoryFonts } from '@/constants/story-theme';
import { Spacing } from '@/constants/theme';

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

export function ParentCommitteeMembersSection({ committee }: ParentCommitteeSectionProps) {
  const theme = useParentTheme();
  const members = committee.members.filter((member) => member.status === 'active');

  return (
    <View style={styles.container}>
      <StoryDetailSection title={`Members (${members.length})`}>
        {members.length === 0 ? (
          <Text style={[styles.emptyCopy, { color: theme.muted }]}>No members yet.</Text>
        ) : (
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
        )}
      </StoryDetailSection>

      {committee.dutyRoles.length > 0 ? (
        <StoryDetailSection title="Duty roles">
          <View style={styles.list}>
            {committee.dutyRoles.map((dutyRole) => {
              const assignee = committee.members.find((member) => member.id === dutyRole.assigneeId);
              return (
                <ParentCommitteeDutyRoleCard
                  key={dutyRole.id}
                  role={dutyRole}
                  assigneeName={assignee?.name}
                />
              );
            })}
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
