import { AdminListCard, AdminListCardPressable } from '@/components/school-admin/admin-list-card';
import { StaffPortalLoginBadge } from '@/components/school-admin/staff/staff-portal-login-badge';
import { StatusBadge } from '@/components/ui/status-badge';
import { ThemedText } from '@/components/themed-text';
import { useAdminTheme } from '@/contexts/admin-theme-context';
import type { StaffMemberRecord } from '@/lib/school-admin-api';
import {
  employmentStatusLabel,
  staffDisplayName,
  staffPortalLoginStatus,
} from '@/lib/school-admin/staff-labels';
import { StyleSheet, View } from 'react-native';
import { Spacing } from '@/constants/theme';

type StaffListItemProps = {
  member: StaffMemberRecord;
  onPress: (member: StaffMemberRecord) => void;
};

export function StaffListItem({ member, onPress }: StaffListItemProps) {
  const theme = useAdminTheme();
  const name = staffDisplayName(member);

  return (
    <AdminListCard>
      <AdminListCardPressable onPress={() => onPress(member)}>
        <View style={styles.content}>
          <View style={styles.headerRow}>
            <View style={styles.textColumn}>
              <ThemedText type="smallBold" style={{ color: theme.textPrimary }} numberOfLines={1}>
                {name}
              </ThemedText>
              <ThemedText type="small" style={{ color: theme.textSecondary }} numberOfLines={1}>
                {member.roleTitle || '—'}
              </ThemedText>
            </View>
            {member.employmentStatus !== 'active' ? (
              <StatusBadge
                label={employmentStatusLabel(member.employmentStatus)}
                colors={{ backgroundColor: theme.elevated, color: theme.textSecondary }}
              />
            ) : null}
          </View>
          <StaffPortalLoginBadge status={staffPortalLoginStatus(member)} compact />
        </View>
      </AdminListCardPressable>
    </AdminListCard>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: Spacing.two,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  textColumn: {
    flex: 1,
    gap: 2,
  },
});
