import { StyleSheet, View } from 'react-native';

import { AdminListCard, AdminListCardPressable } from '@/components/school-admin/admin-list-card';
import { StudentPhoto } from '@/components/school-admin/student-photo';
import { StatusBadge } from '@/components/ui/status-badge';
import { ThemedText } from '@/components/themed-text';
import { useAdminTheme } from '@/contexts/admin-theme-context';
import {
  adminCombinedStatusProgressBadgeStyle,
  adminCombinedStatusProgressLabel,
} from '@/lib/admissions/application-status-ui';
import type { AdminApplicationSubmission } from '@/lib/admissions/application-submissions';
import { Spacing } from '@/constants/theme';

type SubmissionListItemProps = {
  submission: AdminApplicationSubmission;
  onPress: (submission: AdminApplicationSubmission) => void;
};

export function SubmissionListItem({ submission, onPress }: SubmissionListItemProps) {
  const theme = useAdminTheme();
  const studentName = submission.studentLabel ?? 'Unnamed student';
  const parentName = submission.guardianName ?? null;

  return (
    <AdminListCard>
      <AdminListCardPressable onPress={() => onPress(submission)}>
        <View style={styles.topRow}>
          <StudentPhoto name={studentName} size="row" />
          <View style={styles.mainCopy}>
            <ThemedText
              type="smallBold"
              numberOfLines={1}
              style={{ color: theme.textPrimary }}>
              {studentName}
            </ThemedText>
            <View style={styles.badgeRow}>
              <StatusBadge
                label={adminCombinedStatusProgressLabel(
                  submission.status,
                  submission.applicationProgressSummary,
                  submission.enrollmentSummary,
                )}
                colors={adminCombinedStatusProgressBadgeStyle(
                  submission.status,
                  submission.enrollmentSummary,
                  theme,
                )}
              />
              {submission.programName ? (
                <StatusBadge
                  label={submission.programName}
                  colors={{ backgroundColor: theme.infoBg, color: theme.info }}
                />
              ) : null}
            </View>
          </View>
        </View>

        {parentName ? (
          <ThemedText type="small" numberOfLines={1} style={{ color: theme.textSecondary }}>
            {parentName}
          </ThemedText>
        ) : null}
      </AdminListCardPressable>
    </AdminListCard>
  );
}

const styles = StyleSheet.create({
  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.two,
  },
  mainCopy: {
    flex: 1,
    gap: Spacing.one,
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.one,
  },
});
