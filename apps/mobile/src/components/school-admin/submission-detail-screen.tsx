import { type ReactNode, useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, View } from 'react-native';

import { AdminCard } from '@/components/admin/admin-card';
import { StatusBadge } from '@/components/ui/status-badge';
import { ThemedText } from '@/components/themed-text';
import { useAdminTheme } from '@/contexts/admin-theme-context';
import {
  applicationStatusBadgeStyle,
  applicationStatusLabel,
  enrollmentProgressBadgeStyle,
  FEE_STATUS_LABELS,
  postSubmitSummaryBadgeStyle,
} from '@/lib/admissions/application-status-ui';
import {
  formatShortDate,
  formatSubmissionProgress,
  getOrgApplicationSubmissionById,
  submissionHasFeeBadges,
  type AdminApplicationSubmission,
} from '@/lib/admissions/application-submissions';
import { getSupabaseClient } from '@/lib/supabase';
import { Spacing } from '@/constants/theme';

type SubmissionDetailScreenProps = {
  organizationId: string;
  applicationId: string;
};

function DetailSection({ title, children }: { title: string; children: ReactNode }) {
  const theme = useAdminTheme();

  return (
    <AdminCard>
      <ThemedText type="badge" style={{ color: theme.accent }}>
        {title}
      </ThemedText>
      <View style={styles.sectionBody}>{children}</View>
    </AdminCard>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  const theme = useAdminTheme();

  return (
    <View style={styles.detailRow}>
      <ThemedText type="small" style={{ color: theme.textSecondary }}>
        {label}
      </ThemedText>
      <ThemedText type="smallBold" style={[styles.detailValue, { color: theme.textPrimary }]}>
        {value}
      </ThemedText>
    </View>
  );
}

export function SubmissionDetailScreen({ organizationId, applicationId }: SubmissionDetailScreenProps) {
  const theme = useAdminTheme();
  const supabase = useMemo(() => getSupabaseClient(), []);
  const [submission, setSubmission] = useState<AdminApplicationSubmission | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadSubmission = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getOrgApplicationSubmissionById(supabase, organizationId, applicationId);
      if (!data) {
        setError('Submission not found.');
        setSubmission(null);
      } else {
        setSubmission(data);
      }
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Failed to load submission.');
    } finally {
      setLoading(false);
    }
  }, [applicationId, organizationId, supabase]);

  useEffect(() => {
    void loadSubmission();
  }, [loadSubmission]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={theme.accent} />
      </View>
    );
  }

  if (error || !submission) {
    return (
      <View style={styles.centered}>
        <ThemedText type="small" style={{ color: theme.textSecondary }}>
          {error ?? 'Submission not found.'}
        </ThemedText>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <View style={styles.hero}>
        <ThemedText type="title" style={{ color: theme.textPrimary }}>
          {submission.studentLabel ?? 'Unnamed student'}
        </ThemedText>
        <StatusBadge
          label={applicationStatusLabel(submission.status)}
          colors={applicationStatusBadgeStyle(submission.status, theme)}
        />
      </View>

      <DetailSection title="Contact">
        <DetailRow label="Parent" value={submission.guardianName ?? '—'} />
        <DetailRow label="Email" value={submission.contactEmail ?? '—'} />
      </DetailSection>

      <DetailSection title="Application">
        <DetailRow label="Form" value={submission.formTitle} />
        {submission.programName ? (
          <DetailRow label="Program" value={submission.programName} />
        ) : null}
        <DetailRow label="Progress" value={formatSubmissionProgress(submission)} />
        <DetailRow
          label="Submitted"
          value={submission.submittedAt ? formatShortDate(submission.submittedAt) : '—'}
        />
        <DetailRow label="Updated" value={formatShortDate(submission.updatedAt)} />
      </DetailSection>

      {submission.enrollmentSummary ? (
        <DetailSection title="Enrollment">
          <View style={styles.badgeRow}>
            <StatusBadge
              label={submission.enrollmentSummary.label}
              colors={enrollmentProgressBadgeStyle(submission.enrollmentSummary.tone, theme)}
            />
          </View>
        </DetailSection>
      ) : null}

      {submission.postSubmitSummary ? (
        <DetailSection title="Post-submit">
          <View style={styles.badgeRow}>
            <StatusBadge
              label={submission.postSubmitSummary.label}
              colors={postSubmitSummaryBadgeStyle(submission.postSubmitSummary.tone, theme)}
            />
          </View>
        </DetailSection>
      ) : null}

      {submissionHasFeeBadges(submission) ? (
        <DetailSection title="Fees">
          <DetailRow
            label="Application fee"
            value={FEE_STATUS_LABELS[submission.feeStatus] ?? submission.feeStatus}
          />
        </DetailSection>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: Spacing.four,
    gap: Spacing.four,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.four,
  },
  hero: {
    gap: Spacing.two,
  },
  sectionBody: {
    gap: Spacing.two,
  },
  detailRow: {
    gap: 4,
  },
  detailValue: {
    lineHeight: 20,
  },
  badgeRow: {
    alignItems: 'flex-start',
  },
});
