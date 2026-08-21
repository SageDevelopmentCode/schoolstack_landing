import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, View } from 'react-native';

import { SubmissionListItem } from '@/components/school-admin/submission-list-item';
import { ADMIN_LIST_HORIZONTAL_PADDING, AdminListSeparator } from '@/components/school-admin/admin-list-layout';
import { SubmissionStatusFilters } from '@/components/school-admin/submission-status-filters';
import { ThemedText } from '@/components/themed-text';
import { useAdminTheme } from '@/contexts/admin-theme-context';
import { APPLICATION_STATUSES_EXCLUDED_FROM_DEFAULT_ALL } from '@/lib/admissions/application-status-ui';
import {
  listOrgApplicationSubmissions,
  type AdminApplicationSubmission,
} from '@/lib/admissions/application-submissions';
import { getSupabaseClient } from '@/lib/supabase';
import { Spacing } from '@/constants/theme';

type SubmissionsListScreenProps = {
  organizationId: string;
  slug: string;
};

export function SubmissionsListScreen({ organizationId, slug }: SubmissionsListScreenProps) {
  const theme = useAdminTheme();
  const router = useRouter();
  const supabase = useMemo(() => getSupabaseClient(), []);
  const [submissions, setSubmissions] = useState<AdminApplicationSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState('all');

  const loadSubmissions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await listOrgApplicationSubmissions(supabase, organizationId);
      setSubmissions(data);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Failed to load submissions.');
    } finally {
      setLoading(false);
    }
  }, [organizationId, supabase]);

  useEffect(() => {
    void loadSubmissions();
  }, [loadSubmissions]);

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const submission of submissions) {
      counts[submission.status] = (counts[submission.status] ?? 0) + 1;
    }
    return counts;
  }, [submissions]);

  const filteredSubmissions = useMemo(() => {
    return submissions.filter((submission) => {
      if (statusFilter === 'all') {
        return !APPLICATION_STATUSES_EXCLUDED_FROM_DEFAULT_ALL.some(
          (excluded) => excluded === submission.status,
        );
      }
      return submission.status === statusFilter;
    });
  }, [statusFilter, submissions]);

  const handlePressSubmission = (submission: AdminApplicationSubmission) => {
    router.push(`/school-admin/${slug}/admissions/submissions/${submission.id}`);
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={theme.accent} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <ThemedText type="small" style={{ color: theme.textSecondary }}>
          {error}
        </ThemedText>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.filters}>
        <SubmissionStatusFilters
          activeStatus={statusFilter}
          counts={statusCounts}
          onChange={setStatusFilter}
        />
      </View>

      <FlatList
        data={filteredSubmissions}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={AdminListSeparator}
        ListEmptyComponent={
          <View style={styles.centered}>
            <ThemedText type="small" style={{ color: theme.textSecondary }}>
              No submissions found.
            </ThemedText>
          </View>
        }
        renderItem={({ item }) => (
          <SubmissionListItem submission={item} onPress={handlePressSubmission} />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  filters: {
    paddingHorizontal: ADMIN_LIST_HORIZONTAL_PADDING,
    paddingTop: Spacing.two,
  },
  listContent: {
    paddingHorizontal: ADMIN_LIST_HORIZONTAL_PADDING,
    paddingBottom: Spacing.four,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.four,
  },
});
