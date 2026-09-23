import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { SchoolAdminFridayBranchStatusTag } from '@/components/school-admin/friday-branch/school-admin-friday-branch-status-tag';
import { StoryCard } from '@/components/story/story-card';
import { useParentTheme } from '@/contexts/parent-theme-context';
import { fetchFridayBranchRecentActivity } from '@/lib/school-admin/friday-branch/friday-branch-api';
import type { FridayBranchRecentSignupRow } from '@/lib/school-admin/friday-branch/friday-branch-types';
import { formatRelativeTime } from '@/lib/school-admin/format-relative-time';
import { StoryCardPadding, StoryFonts } from '@/constants/story-theme';
import { Spacing } from '@/constants/theme';

type SchoolAdminFridayBranchRecentActivityProps = {
  organizationId: string;
  onOpenClass: (classId: string, blockId: string) => void;
};

export function SchoolAdminFridayBranchRecentActivity({
  organizationId,
  onOpenClass,
}: SchoolAdminFridayBranchRecentActivityProps) {
  const theme = useParentTheme();
  const [signups, setSignups] = useState<FridayBranchRecentSignupRow[]>([]);
  const [loading, setLoading] = useState(true);

  const loadSignups = useCallback(async () => {
    setLoading(true);
    try {
      const rows = await fetchFridayBranchRecentActivity(organizationId);
      setSignups(rows);
    } catch {
      setSignups([]);
    } finally {
      setLoading(false);
    }
  }, [organizationId]);

  useEffect(() => {
    void loadSignups();
  }, [loadSignups]);

  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.ink }]}>Recent sign-ups</Text>
        <Text style={[styles.subtitle, { color: theme.muted }]}>
          Latest family enrollments across all blocks.
        </Text>
      </View>

      {loading ? (
        <ActivityIndicator color={theme.primary} style={styles.loader} />
      ) : signups.length === 0 ? (
        <StoryCard compact style={styles.emptyCard}>
          <Text style={[styles.emptyCopy, { color: theme.muted }]}>
            No recent Friday Branch sign-ups yet.
          </Text>
        </StoryCard>
      ) : (
        signups.map((signup) => (
          <Pressable
            key={signup.enrollmentId}
            accessibilityRole="button"
            onPress={() => onOpenClass(signup.classId, signup.blockId)}>
            <StoryCard compact style={styles.rowCard}>
              <View style={styles.rowTop}>
                <View style={styles.rowCopy}>
                  <Text style={[styles.className, { color: theme.ink }]}>{signup.className}</Text>
                  <Text style={[styles.meta, { color: theme.muted }]}>
                    {signup.studentName} · {signup.familyName}
                  </Text>
                  <Text style={[styles.meta, { color: theme.muted }]}>
                    {signup.blockLabel} · {signup.slotTime} · {formatRelativeTime(signup.updatedAt)}
                  </Text>
                </View>
                <SchoolAdminFridayBranchStatusTag
                  label={signup.status === 'waitlisted' ? 'Waitlisted' : 'Signed up'}
                  variant={signup.status === 'waitlisted' ? 'amber' : 'green'}
                />
              </View>
            </StoryCard>
          </Pressable>
        ))
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: Spacing.three,
    marginTop: Spacing.two,
  },
  header: {
    gap: 2,
  },
  title: {
    fontFamily: StoryFonts.bodySemiBold,
    fontSize: 18,
    fontWeight: '600',
  },
  subtitle: {
    fontFamily: StoryFonts.body,
    fontSize: 12,
    lineHeight: 16,
  },
  loader: {
    marginVertical: Spacing.four,
  },
  emptyCard: {
    padding: StoryCardPadding,
  },
  emptyCopy: {
    fontFamily: StoryFonts.body,
    fontSize: 14,
    lineHeight: 20,
  },
  rowCard: {
    padding: StoryCardPadding,
  },
  rowTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: Spacing.three,
  },
  rowCopy: {
    flex: 1,
    gap: 2,
  },
  className: {
    fontFamily: StoryFonts.bodySemiBold,
    fontSize: 14,
    fontWeight: '600',
  },
  meta: {
    fontFamily: StoryFonts.body,
    fontSize: 12,
    lineHeight: 16,
  },
});
