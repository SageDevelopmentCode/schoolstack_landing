import { Pressable, StyleSheet, View } from 'react-native';

import { StatusBadge } from '@/components/ui/status-badge';
import { ThemedText } from '@/components/themed-text';
import { useAdminTheme } from '@/contexts/admin-theme-context';
import {
  adminApplicationStatusLabel,
  applicationStatusBadgeStyle,
} from '@/lib/admissions/application-status-ui';
import { formatShortDate, type AdminApplicationSubmission } from '@/lib/admissions/application-submissions';
import { Spacing } from '@/constants/theme';

type SubmissionListItemProps = {
  submission: AdminApplicationSubmission;
  onPress: (submission: AdminApplicationSubmission) => void;
  showDivider?: boolean;
};

function footerProgressLabel(submission: AdminApplicationSubmission): string | null {
  if (submission.status === 'draft' && submission.applicationProgressSummary) {
    return submission.applicationProgressSummary.label;
  }
  if (submission.status === 'enrolling' && submission.enrollmentSummary) {
    return submission.enrollmentSummary.label;
  }
  return null;
}

export function SubmissionListItem({
  submission,
  onPress,
  showDivider = true,
}: SubmissionListItemProps) {
  const theme = useAdminTheme();
  const progressLabel = footerProgressLabel(submission);

  return (
    <View>
      <Pressable
        accessibilityRole="button"
        onPress={() => onPress(submission)}
        style={({ pressed }) => [
          styles.row,
          pressed && { backgroundColor: theme.elevated },
        ]}>
        <View style={styles.headerRow}>
          <ThemedText
            type="smallBold"
            numberOfLines={1}
            style={[styles.studentName, { color: theme.textPrimary }]}>
            {submission.studentLabel ?? 'Unnamed student'}
          </ThemedText>
          <StatusBadge
            label={adminApplicationStatusLabel(submission.status)}
            colors={applicationStatusBadgeStyle(submission.status, theme)}
          />
        </View>

        <ThemedText type="small" numberOfLines={1}>
          <ThemedText type="small" style={{ color: theme.textTertiary }}>
            Parent ·{' '}
          </ThemedText>
          <ThemedText type="small" style={{ color: theme.textSecondary }}>
            {submission.guardianName ?? 'No contact'}
          </ThemedText>
        </ThemedText>

        <View style={styles.footerRow}>
          <ThemedText type="small" style={{ color: theme.textTertiary }}>
            Updated {formatShortDate(submission.updatedAt)}
          </ThemedText>
          {progressLabel ? (
            <ThemedText type="small" style={{ color: theme.textSecondary }}>
              {progressLabel}
            </ThemedText>
          ) : null}
        </View>
      </Pressable>
      {showDivider ? (
        <View style={[styles.divider, { backgroundColor: theme.border }]} />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    paddingVertical: Spacing.three,
    gap: 6,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    width: '100%',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  studentName: {
    flex: 1,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
});
