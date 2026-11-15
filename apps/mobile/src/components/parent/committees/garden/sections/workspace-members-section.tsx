import { StyleSheet, Text, View } from 'react-native';

import { type GChipTone } from '@/components/parent/garden/tokens';
import { ChildThumb, GCard, GChip, gText } from '@/components/parent/garden/ui';
import type { Committee, CommitteeRole } from '@/lib/parent/parent-committees-types';

function roleLabel(role: CommitteeRole): string {
  if (role === 'lead') return 'Lead';
  if (role === 'faculty_liaison') return 'Faculty liaison';
  if (role === 'admin') return 'Admin';
  return 'Member';
}

function roleTone(role: CommitteeRole): GChipTone {
  if (role === 'lead') return 'success';
  if (role === 'admin') return 'warning';
  return 'info';
}

/** Active members and duty roles (display only). */
export function WorkspaceMembersSection({ committee }: { committee: Committee }) {
  const members = committee.members.filter((member) => member.status === 'active');
  return (
    <View style={styles.container}>
      <GCard kicker="Members" title={`Members (${members.length})`} index={0}>
        {members.length === 0 ? (
          <Text style={gText.meta}>No members yet.</Text>
        ) : (
          <View style={styles.list}>
            {members.map((member, index) => (
              <View
                key={member.id}
                style={styles.member}
                accessible
                accessibilityLabel={[member.name, roleLabel(member.role), member.grade ? `Grade: ${member.grade}` : null]
                  .filter(Boolean)
                  .join(', ')}>
                <ChildThumb name={member.name} photoUrl={null} size={46} index={index} />
                <View style={styles.copy}>
                  <View style={styles.nameRow}>
                    <Text style={[gText.itemTitle, styles.flex]} numberOfLines={1}>
                      {member.name}
                    </Text>
                    <GChip label={roleLabel(member.role)} tone={roleTone(member.role)} />
                  </View>
                  {member.grade ? <Text style={gText.meta}>Grade: {member.grade}</Text> : null}
                  {member.bio ? <Text style={gText.meta}>{member.bio}</Text> : null}
                </View>
              </View>
            ))}
          </View>
        )}
      </GCard>

      {committee.dutyRoles.length > 0 ? (
        <GCard kicker="Duty roles" title="Who does what" tone="paper" index={1}>
          <View style={styles.list}>
            {committee.dutyRoles.map((dutyRole) => {
              const assignee = committee.members.find((member) => member.id === dutyRole.assigneeId);
              return (
                <View key={dutyRole.id} style={styles.role}>
                  <View style={styles.nameRow}>
                    <Text style={[gText.itemTitle, styles.flex]}>{dutyRole.title}</Text>
                    <GChip
                      label={assignee ? `Assigned to ${assignee.name}` : 'Unassigned'}
                      tone={assignee ? 'success' : 'neutral'}
                    />
                  </View>
                  {dutyRole.description ? <Text style={gText.meta}>{dutyRole.description}</Text> : null}
                </View>
              );
            })}
          </View>
        </GCard>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 16 },
  list: { gap: 14 },
  member: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  copy: { flex: 1, gap: 3 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  flex: { flexShrink: 1 },
  role: { gap: 4 },
});
