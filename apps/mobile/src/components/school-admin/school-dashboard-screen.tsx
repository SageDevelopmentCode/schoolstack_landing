import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, View } from 'react-native';

import { AdminSectionDivider } from '@/components/admin/admin-section-divider';
import { SetupProgressBar } from '@/components/school-admin/setup-progress-bar';
import { SetupStepTimeline } from '@/components/school-admin/setup-step-timeline';
import { ThemedText } from '@/components/themed-text';
import { useAdminTheme } from '@/contexts/admin-theme-context';
import {
  fetchAdmissionsSetupStatus,
  type AdmissionsSetupStatus,
} from '@/lib/school-admin/admissions-setup-status';
import { getSupabaseClient } from '@/lib/supabase';
import { Spacing } from '@/constants/theme';

type SchoolDashboardScreenProps = {
  organizationId: string;
  slug: string;
  schoolName: string;
};

function heroCopy(status: AdmissionsSetupStatus, schoolName: string) {
  if (status.completedCount === status.totalCount) {
    return {
      title: "You're all set",
      subtitle: `${schoolName} is ready to accept applications and guide families through enrollment.`,
    };
  }

  const nextStep = status.steps.find((step) => step.id === status.firstIncompleteStepId);
  if (!nextStep) {
    return {
      title: 'Getting started',
      subtitle: `Complete these steps to launch admissions for ${schoolName}.`,
    };
  }

  return {
    title: 'Getting started',
    subtitle: `Next up: ${nextStep.title.toLowerCase()}.`,
  };
}

export function SchoolDashboardScreen({ organizationId, slug, schoolName }: SchoolDashboardScreenProps) {
  const theme = useAdminTheme();
  const supabase = useMemo(() => getSupabaseClient(), []);
  const [status, setStatus] = useState<AdmissionsSetupStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadStatus = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const nextStatus = await fetchAdmissionsSetupStatus(supabase, organizationId, slug);
      setStatus(nextStatus);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Failed to load dashboard.');
    } finally {
      setLoading(false);
    }
  }, [organizationId, slug, supabase]);

  useEffect(() => {
    void loadStatus();
  }, [loadStatus]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={theme.accent} />
      </View>
    );
  }

  if (error || !status) {
    return (
      <View style={styles.centered}>
        <ThemedText type="small" style={{ color: theme.textSecondary }}>
          {error ?? 'Failed to load dashboard.'}
        </ThemedText>
      </View>
    );
  }

  const hero = heroCopy(status, schoolName);
  const nextStep = status.steps.find((step) => step.id === status.firstIncompleteStepId) ?? null;
  const allComplete = status.completedCount === status.totalCount;
  const remaining = status.totalCount - status.completedCount;

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <View style={styles.hero}>
        <ThemedText type="title" style={{ color: theme.textPrimary }}>
          {hero.title}
        </ThemedText>
        <ThemedText type="small" style={{ color: theme.textSecondary }}>
          {hero.subtitle}
        </ThemedText>
      </View>

      <AdminSectionDivider />

      <View style={styles.section}>
        <SetupProgressBar
          completed={status.completedCount}
          total={status.totalCount}
          label="Setup progress"
          subtitle={
            allComplete
              ? 'All admissions setup steps are complete.'
              : `${remaining} step${remaining === 1 ? '' : 's'} remaining.`
          }
        />
        <View style={styles.timelineSection}>
          <SetupStepTimeline items={status.steps} activeItemId={status.firstIncompleteStepId} />
        </View>
      </View>

      {nextStep ? (
        <>
          <AdminSectionDivider />
          <View style={styles.section}>
            <ThemedText type="badge" style={{ color: theme.accent }}>
              Next step
            </ThemedText>
            <ThemedText type="subtitle" style={[styles.nextTitle, { color: theme.textPrimary }]}>
              {nextStep.title}
            </ThemedText>
            <ThemedText type="small" style={{ color: theme.textSecondary }}>
              {nextStep.description}
            </ThemedText>
          </View>
        </>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: Spacing.four,
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
  section: {
    gap: Spacing.three,
  },
  timelineSection: {
    marginTop: Spacing.two,
  },
  nextTitle: {
    marginTop: Spacing.one,
  },
});
