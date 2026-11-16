import { Ionicons } from '@expo/vector-icons';
import { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Garden, GardenFonts, type GChipTone } from '@/components/parent/garden/tokens';
import { GChip, GPressable } from '@/components/parent/garden/ui';
import { AdminInitialsAvatar } from '@/components/school-admin/garden/admin-people';
import { staffProfileNeedsReview } from '@/lib/school-admin/admin-staff-roster-metrics';
import type { StaffMemberRecord } from '@/lib/school-admin-api';
import {
  employmentStatusLabel,
  staffDisplayName,
  staffPortalLoginStatus,
  type StaffPortalLoginStatus,
} from '@/lib/school-admin/staff-labels';

/** Same states as the Story `StaffPortalLoginBadge`. */
export function staffPortalChip(status: StaffPortalLoginStatus | null | undefined): { tone: GChipTone; label: string } {
  if (!status) return { tone: 'info', label: '—' };
  if (!status.accountLinked) return { tone: 'warning', label: 'No account' };
  if (!status.hasEverSignedIn) return { tone: 'info', label: 'Never signed in' };
  return { tone: 'success', label: 'Portal active' };
}

export function formatLastSignIn(value: string): string {
  return new Date(value).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
}

export function employmentChipTone(status: StaffMemberRecord['employmentStatus']): GChipTone {
  if (status === 'active') return 'success';
  if (status === 'on_leave') return 'info';
  return 'warning';
}

/** Staff roster row: initials avatar, name, job title, employment + portal chips, "needs review" hint. */
export const StaffRow = memo(function StaffRow({
  member,
  onPress,
}: {
  member: StaffMemberRecord;
  onPress: (member: StaffMemberRecord) => void;
}) {
  const name = staffDisplayName(member);
  const portal = staffPortalChip(staffPortalLoginStatus(member));
  const review = staffProfileNeedsReview(member);
  const learners = member.assignedStudentCount ?? 0;
  const meta = [member.roleTitle || 'No job title', learners > 0 ? `${learners} learner${learners === 1 ? '' : 's'}` : null]
    .filter(Boolean)
    .join(' · ');

  return (
    <GPressable
      accessibilityLabel={name}
      accessibilityHint="Opens the staff record"
      pressedScale={0.985}
      onPress={() => onPress(member)}
      style={styles.card}>
      <AdminInitialsAvatar name={name} />
      <View style={styles.copy}>
        <Text style={styles.name} numberOfLines={1}>
          {name}
        </Text>
        <Text style={styles.meta} numberOfLines={1}>
          {meta}
        </Text>
        <View style={styles.chips}>
          {member.employmentStatus !== 'active' ? (
            <GChip label={employmentStatusLabel(member.employmentStatus)} tone={employmentChipTone(member.employmentStatus)} />
          ) : null}
          <GChip label={portal.label} tone={portal.tone} />
          {review ? <GChip label="Needs review" tone="alert" icon="alert-circle" /> : null}
        </View>
      </View>
      <Ionicons name="chevron-forward" size={18} color={Garden.ink60} />
    </GPressable>
  );
});

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: Garden.ink10,
    backgroundColor: Garden.white,
    padding: 12,
    minHeight: 72,
  },
  copy: { flex: 1, minWidth: 0, gap: 3 },
  name: { fontFamily: GardenFonts.bodyExtra, fontSize: 16, lineHeight: 21, color: Garden.ink },
  meta: { fontFamily: GardenFonts.bodySemi, fontSize: 13, lineHeight: 18, color: Garden.soft },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 3 },
});
