import { Pressable, StyleSheet, View } from 'react-native';

import { StatusBadge } from '@/components/ui/status-badge';
import { ThemedText } from '@/components/themed-text';
import { useAdminTheme } from '@/contexts/admin-theme-context';
import {
  applicationStatusBadgeStyle,
  applicationStatusLabel,
  enrollmentProgressBadgeStyle,
} from '@/lib/admissions/application-status-ui';
import {
  formatShortDate,
  formatSubmissionProgress,
  type AdminApplicationSubmission,
} from '@/lib/admissions/application-submissions';
import { adminCardShadow } from '@/lib/organization-settings/build-admin-theme';
import { Radius, Spacing } from '@/constants/theme';

type SubmissionListItemProps = {
  submission: AdminApplicationSubmission;
  onPress: (submission: AdminApplicationSubmission) => void;
};

export function SubmissionListItem({ submission, onPress }: SubmissionListItemProps) {
  const theme = useAdminTheme();

  return (
    <Pressable
      accessibilityRole="button"
      onPress={() => onPress(submission)}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: theme.surface,
          borderColor: theme.border,
        },
        adminCardShadow(theme),
        pressed && styles.cardPressed,
      ]}>
      <View style={styles.headerRow}>
        <ThemedText
          type="smallBold"
          numberOfLines={1}
          style={[styles.studentName, { color: theme.textPrimary }]}>
          {submission.studentLabel ?? 'Unnamed student'}
        </ThemedText>
        <StatusBadge
          label={applicationStatusLabel(submission.status)}
          colors={applicationStatusBadgeStyle(submission.status, theme)}
        />
      </View>

      <ThemedText type="small" numberOfLines={1} style={{ color: theme.textSecondary }}>
        {submission.guardianName ?? 'No contact'}
      </ThemedText>
      {submission.contactEmail ? (
        <ThemedText type="small" numberOfLines={1} style={{ color: theme.textTertiary }}>
          {submission.contactEmail}
        </ThemedText>
      ) : null}

      <View style={styles.metaRow}>
        <ThemedText type="small" style={{ color: theme.textSecondary }}>
          {formatSubmissionProgress(submission)}
        </ThemedText>
        {submission.enrollmentSummary ? (
          <StatusBadge
            label={submission.enrollmentSummary.label}
            colors={enrollmentProgressBadgeStyle(submission.enrollmentSummary.tone, theme)}
          />
        ) : null}
      </View>

      <ThemedText type="small" style={{ color: theme.textTertiary }}>
        Updated {formatShortDate(submission.updatedAt)}
      </ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Radius.lg,
    borderWidth: 1,
    padding: Spacing.three,
    gap: 6,
  },
  cardPressed: {
    opacity: 0.85,
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
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
    marginTop: 4,
  },
});
