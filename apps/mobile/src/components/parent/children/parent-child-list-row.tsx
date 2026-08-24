import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';

import { StudentPhoto } from '@/components/school-admin/student-photo';
import { ThemedText } from '@/components/themed-text';
import { useAdminTheme } from '@/contexts/admin-theme-context';
import { Radius, Spacing } from '@/constants/theme';
import { applicationStatusBadgeStyle } from '@/lib/admissions/application-status-ui';
import type { FamilyChildOverview } from '@/lib/parent/parent-portal-api';

/** Inset for list dividers: horizontal padding + avatar + gap */
export const PARENT_CHILD_ROW_SEPARATOR_INSET =
  Spacing.four + 44 + Spacing.three;

type ParentChildListRowProps = {
  child: FamilyChildOverview;
  onPress: () => void;
};

export function ParentChildListRow({ child, onPress }: ParentChildListRowProps) {
  const theme = useAdminTheme();
  const badgeStyle = applicationStatusBadgeStyle(child.status, theme);
  const progress = child.checklistProgress;
  const showProgress =
    !child.isEnrolled && progress !== null && progress.total > 0;
  const progressPercent =
    progress && progress.total > 0
      ? Math.min(100, (progress.completed / progress.total) * 100)
      : 0;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`View profile for ${child.studentName}`}
      onPress={onPress}
      style={({ pressed }) => [
        styles.rowPressable,
        { backgroundColor: pressed ? theme.surface : theme.bg },
      ]}>
      <View style={styles.row}>
        <StudentPhoto name={child.studentName} photoUrl={child.profilePhotoUrl} size="row" />
        <View style={styles.content}>
          <View style={styles.topLine}>
            <ThemedText
              type="smallBold"
              numberOfLines={1}
              style={[styles.name, { color: theme.textPrimary }]}>
              {child.studentName}
            </ThemedText>
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
            <Ionicons name="chevron-forward" size={16} color={theme.textTertiary} />
          </View>
          <ThemedText type="small" style={{ color: theme.textTertiary }}>
            {child.grade ? `Grade ${child.grade}` : 'Grade not listed'}
          </ThemedText>
          {showProgress ? (
            <View style={styles.progressSection}>
              <View style={styles.progressLabels}>
                <ThemedText type="small" style={{ color: theme.textTertiary }}>
                  Enrollment {progress.completed}/{progress.total}
                </ThemedText>
              </View>
              <View style={[styles.progressTrack, { backgroundColor: theme.elevated }]}>
                <View
                  style={[
                    styles.progressFill,
                    { backgroundColor: theme.accent, width: `${progressPercent}%` },
                  ]}
                />
              </View>
            </View>
          ) : null}
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  rowPressable: {
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.three,
  },
  content: {
    flex: 1,
    gap: 2,
    minWidth: 0,
  },
  topLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  name: {
    flex: 1,
    flexShrink: 1,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: Radius.pill,
    paddingHorizontal: 8,
    paddingVertical: 4,
    flexShrink: 0,
  },
  progressSection: {
    gap: 4,
    marginTop: 4,
  },
  progressLabels: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressTrack: {
    height: 4,
    borderRadius: Radius.pill,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: Radius.pill,
  },
});
