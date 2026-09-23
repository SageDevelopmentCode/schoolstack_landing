import { useEffect, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { SchoolAdminCommitteeActivityFeed } from '@/components/school-admin/committees/school-admin-committee-activity-feed';
import { SchoolAdminCommitteeActivityFeedSkeleton } from '@/components/school-admin/committees/school-admin-committee-activity-feed-skeleton';
import type { CommitteeActivityItem } from '@/lib/parent/parent-committees-types';
import type { ParentCommitteeSectionProps } from '@/lib/parent/committees/section-props';
import { fetchAdminCommitteeActivity } from '@/lib/school-admin-api';
import { createSchoolAdminErrorReporter } from '@/lib/mobile-error-reporter';

export function SchoolAdminCommitteeActivitySection({
  committee,
  organizationId,
  schoolSlug,
}: ParentCommitteeSectionProps) {
  const reportError = useMemo(
    () => createSchoolAdminErrorReporter(organizationId),
    [organizationId],
  );

  const [items, setItems] = useState<CommitteeActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasLoaded, setHasLoaded] = useState(false);

  useEffect(() => {
    setHasLoaded(false);
    setLoading(true);
  }, [committee.id, organizationId, schoolSlug]);

  useEffect(() => {
    if (!schoolSlug) {
      setItems([]);
      setLoading(false);
      setHasLoaded(true);
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const nextItems = await fetchAdminCommitteeActivity(organizationId, schoolSlug, {
          committeeId: committee.id,
          limit: 30,
        });
        if (!cancelled) setItems(nextItems);
      } catch (error) {
        reportError('committees.activity.load', error, {
          entityType: 'committee',
          entityId: committee.id,
        });
        if (!cancelled) setItems([]);
      } finally {
        if (!cancelled) {
          setLoading(false);
          setHasLoaded(true);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [committee.id, organizationId, reportError, schoolSlug]);

  if (loading && !hasLoaded) {
    return (
      <View style={styles.skeletonWrap}>
        <SchoolAdminCommitteeActivityFeedSkeleton title="Committee activity" />
      </View>
    );
  }

  return (
    <SchoolAdminCommitteeActivityFeed
      items={items}
      title="Committee activity"
      emptyMessage="No activity recorded for this committee yet."
    />
  );
}

const styles = StyleSheet.create({
  skeletonWrap: {
    flex: 1,
  },
});
