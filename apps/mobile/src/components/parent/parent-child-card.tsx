import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';

import { StudentPhoto } from '@/components/school-admin/student-photo';
import { ThemedText } from '@/components/themed-text';
import { useAdminTheme } from '@/contexts/admin-theme-context';
import { Radius, Spacing } from '@/constants/theme';
import { applicationStatusBadgeStyle } from '@/lib/admissions/application-status-ui';
import type { FamilyChildOverview } from '@/lib/parent/parent-portal-api';
import { adminCardShadow } from '@/lib/organization-settings/build-admin-theme';

type ParentChildCardProps = {
  child: FamilyChildOverview;
  onViewDetails: () => void;
};

export function ParentChildCard({ child, onViewDetails }: ParentChildCardProps) {
  const theme = useAdminTheme();
  const badgeStyle = applicationStatusBadgeStyle(child.status, theme);
  const childFirstName = child.studentName.split(' ')[0] ?? child.studentName;

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: theme.surface,
          borderColor: theme.border,
          ...adminCardShadow(theme),
        },
      ]}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`View details for ${child.studentName}`}
        onPress={onViewDetails}
        style={({ pressed }) => [styles.mainRow, pressed && { opacity: 0.9 }]}>
        <StudentPhoto name={child.studentName} photoUrl={child.profilePhotoUrl} size="lg" />
        <View style={styles.mainCopy}>
          <ThemedText type="smallBold" style={{ color: theme.textPrimary }}>
            {childFirstName}
          </ThemedText>
          <ThemedText type="small" style={{ color: theme.textTertiary, marginTop: 2 }}>
            {child.grade ? `Grade ${child.grade}` : 'Grade not listed'}
          </ThemedText>
          <View style={styles.detailsLink}>
            <ThemedText type="smallBold" style={{ color: theme.accent }}>
              View details
            </ThemedText>
            <Ionicons name="arrow-forward" size={12} color={theme.accent} />
          </View>
        </View>
      </Pressable>

      <View style={[styles.badge, { backgroundColor: badgeStyle.backgroundColor }]}>
        <Ionicons
          name={child.isEnrolled ? 'checkmark-circle' : 'time-outline'}
          size={10}
          color={badgeStyle.color}
        />
        <ThemedText type="badge" style={{ color: badgeStyle.color, fontSize: 10 }}>
          {child.statusLabel}
        </ThemedText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: Radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    padding: Spacing.three,
    gap: Spacing.three,
  },
  mainRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    minWidth: 0,
  },
  mainCopy: {
    flex: 1,
    minWidth: 0,
  },
  detailsLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: Spacing.two,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: Radius.pill,
    paddingHorizontal: 8,
    paddingVertical: 4,
    alignSelf: 'flex-start',
  },
});
