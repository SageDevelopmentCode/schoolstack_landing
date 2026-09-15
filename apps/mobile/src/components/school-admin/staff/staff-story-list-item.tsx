import { Pressable, StyleSheet, Text, View } from 'react-native';

import { StaffAvatar } from '@/components/school-admin/staff/staff-avatar';
import { StaffPortalLoginBadge } from '@/components/school-admin/staff/staff-portal-login-badge';
import { StoryCard } from '@/components/story/story-card';
import { StoryChip } from '@/components/story/story-chip';
import type { StoryChipTone } from '@/components/story/story-chip';
import { StoryDisplayHeading } from '@/components/story/story-display-heading';
import { useParentTheme } from '@/contexts/parent-theme-context';
import type { StaffMemberRecord } from '@/lib/school-admin-api';
import {
  employmentStatusLabel,
  staffDisplayName,
  staffPortalLoginStatus,
} from '@/lib/school-admin/staff-labels';
import { StoryCardPadding, StoryFonts } from '@/constants/story-theme';
import { Spacing } from '@/constants/theme';

type StaffStoryListItemProps = {
  member: StaffMemberRecord;
  onPress: (member: StaffMemberRecord) => void;
};

function employmentChipTone(
  status: StaffMemberRecord['employmentStatus'],
): StoryChipTone {
  if (status === 'active') return 'success';
  if (status === 'on_leave') return 'info';
  return 'warning';
}

export function StaffStoryListItem({ member, onPress }: StaffStoryListItemProps) {
  const theme = useParentTheme();
  const name = staffDisplayName(member);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={name}
      onPress={() => onPress(member)}
      style={({ pressed }) => [pressed && { opacity: 0.95 }]}>
      <StoryCard compact style={styles.card}>
        <View style={styles.topRow}>
          <StaffAvatar name={name} size="row" />
          <View style={styles.mainCopy}>
            <StoryDisplayHeading size="section" numberOfLines={1} style={styles.name}>
              {name}
            </StoryDisplayHeading>
            <Text style={[styles.roleTitle, { color: theme.muted }]} numberOfLines={1}>
              {member.roleTitle || '—'}
            </Text>
            <View style={styles.chipRow}>
              {member.employmentStatus !== 'active' ? (
                <StoryChip
                  tone={employmentChipTone(member.employmentStatus)}
                  label={employmentStatusLabel(member.employmentStatus)}
                />
              ) : null}
              <StaffPortalLoginBadge status={staffPortalLoginStatus(member)} compact />
            </View>
          </View>
        </View>
      </StoryCard>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: StoryCardPadding,
    gap: Spacing.two,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.three,
  },
  mainCopy: {
    flex: 1,
    minWidth: 0,
    gap: Spacing.one,
  },
  name: {
    fontSize: 18,
    lineHeight: 24,
  },
  roleTitle: {
    fontFamily: StoryFonts.body,
    fontSize: 13,
    lineHeight: 18,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.one,
  },
});
