import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, View } from 'react-native';

import { SubmissionListItem } from '@/components/school-admin/submission-list-item';
import { ADMIN_LIST_HORIZONTAL_PADDING, AdminListSeparator } from '@/components/school-admin/admin-list-layout';
import { SubmissionStatusFilters } from '@/components/school-admin/submission-status-filters';
import { SubmissionsListSkeleton } from '@/components/school-admin/submissions-list-skeleton';
import { ThemedText } from '@/components/themed-text';
import { useSchoolAdminSubmissions } from '@/contexts/school-admin-submissions-context';
import { useAdminTheme } from '@/contexts/admin-theme-context';
import { APPLICATION_STATUSES_EXCLUDED_FROM_DEFAULT_ALL } from '@/lib/admissions/application-status-ui';
import type { AdminApplicationSubmission } from '@/lib/admissions/application-submissions';
import { Spacing } from '@/constants/theme';

type SubmissionsListScreenProps = {
  organizationId: string;
  slug: string;
};

export function SubmissionsListScreen({ organizationId: _organizationId, slug }: SubmissionsListScreenProps) {
  const theme = useAdminTheme();
  const router = useRouter();
  const { submissions, isLoading, isRefreshing, error, refresh } = useSchoolAdminSubmissions();
  const [statusFilter, setStatusFilter] = useState('all');

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

  const handleRefresh = () => {
    void refresh({ silent: true });
  };

  if (isLoading && submissions.length === 0) {
    return <SubmissionsListSkeleton />;
  }

  if (error && submissions.length === 0) {
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
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={theme.accent}
          />
        }
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
