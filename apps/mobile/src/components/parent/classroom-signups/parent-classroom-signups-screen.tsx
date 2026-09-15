import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { ParentClassroomSignupListItemCard } from '@/components/parent/classroom-signups/parent-classroom-signup-list-item';
import { ParentClassroomSignupsSkeleton } from '@/components/parent/classroom-signups/parent-classroom-signups-skeleton';
import { StoryDisplayHeading } from '@/components/story/story-display-heading';
import { StoryErrorBanner } from '@/components/story/story-error-banner';
import { StoryPillNav } from '@/components/story/story-pill-nav';
import { StorySectionKicker } from '@/components/story/story-section-kicker';
import { useParentClassroomSignups } from '@/contexts/parent-classroom-signups-context';
import { useParentTheme } from '@/contexts/parent-theme-context';
import type {
  ParentClassroomSignupListItem,
  ParentClassroomSignupsFilter,
} from '@/lib/parent/parent-classroom-signups-types';
import { parentClassroomSignupDetailRoute } from '@/lib/parent/parent-nav';
import { Story, StoryFonts } from '@/constants/story-theme';
import { SCREEN_HORIZONTAL_PADDING } from '@/constants/screen-layout';
import { Spacing } from '@/constants/theme';

type ParentClassroomSignupsScreenProps = {
  slug: string;
  organizationId: string;
};

type ListRow =
  | { kind: 'section'; key: string; label: string }
  | { kind: 'item'; key: string; item: ParentClassroomSignupListItem };

const FILTER_LABELS: Record<ParentClassroomSignupsFilter, string> = {
  all: 'All',
  needs_response: 'Needs response',
  signed_up: 'Signed up',
  closed: 'Past',
};

export function ParentClassroomSignupsScreen({
  slug,
  organizationId: _organizationId,
}: ParentClassroomSignupsScreenProps) {
  const theme = useParentTheme();
  const router = useRouter();
  const { items, isLoading, isRefreshing, error, hasLoaded, ensureLoaded, refresh } =
    useParentClassroomSignups();
  const [filter, setFilter] = useState<ParentClassroomSignupsFilter>('all');

  useEffect(() => {
    ensureLoaded();
  }, [ensureLoaded]);

  const statusCounts = useMemo(
    () => ({
      all: items.length,
      needs_response: items.filter((item) => item.listStatus === 'needs_response').length,
      signed_up: items.filter((item) => item.listStatus === 'signed_up').length,
      closed: items.filter((item) => item.listStatus === 'closed').length,
    }),
    [items],
  );

  const listRows = useMemo((): ListRow[] => {
    if (filter === 'all') {
      const groups: { key: ParentClassroomSignupsFilter; label: string }[] = [
        { key: 'needs_response', label: 'Needs your response' },
        { key: 'signed_up', label: "You're signed up" },
        { key: 'closed', label: 'Past signups' },
      ];

      const rows: ListRow[] = [];
      for (const group of groups) {
        const groupItems = items.filter((item) => item.listStatus === group.key);
        if (groupItems.length === 0) continue;
        rows.push({ kind: 'section', key: `section-${group.key}`, label: group.label });
        for (const item of groupItems) {
          rows.push({ kind: 'item', key: item.signup.id, item });
        }
      }
      return rows;
    }

    return items
      .filter((item) => item.listStatus === filter)
      .map((item) => ({ kind: 'item' as const, key: item.signup.id, item }));
  }, [filter, items]);

  const handleOpenSignup = useCallback(
    (signupId: string) => {
      router.push(parentClassroomSignupDetailRoute(slug, signupId));
    },
    [router, slug],
  );

  const listHeader = (
    <View style={styles.headerBlock}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Back"
        onPress={() => router.back()}
        style={({ pressed }) => [styles.backButton, pressed && { opacity: 0.7 }]}>
        <Ionicons name="chevron-back" size={20} color={theme.primary} />
        <Text style={[styles.backLabel, { color: theme.primary }]}>More</Text>
      </Pressable>

      <Animated.View entering={FadeInDown.duration(350)}>
        <StorySectionKicker style={styles.kicker}>Help in the classroom</StorySectionKicker>
        <StoryDisplayHeading size="display">Classroom signups</StoryDisplayHeading>
        <Text style={[styles.subtitle, { color: theme.muted }]}>
          Help teachers by signing up for volunteer requests.
        </Text>
      </Animated.View>

      <StoryPillNav
        items={(
          ['all', 'needs_response', 'signed_up', 'closed'] as ParentClassroomSignupsFilter[]
        ).map((key) => ({
          key,
          label: `${FILTER_LABELS[key]} · ${statusCounts[key]}`,
        }))}
        activeKey={filter}
        onChange={(key) => setFilter(key as ParentClassroomSignupsFilter)}
      />

      {error ? <StoryErrorBanner message={error} /> : null}
    </View>
  );

  if (isLoading && !hasLoaded) {
    return <ParentClassroomSignupsSkeleton />;
  }

  return (
    <FlatList
      data={listRows}
      keyExtractor={(row) => row.key}
      contentContainerStyle={styles.listContent}
      ListHeaderComponent={listHeader}
      refreshControl={
        <RefreshControl refreshing={isRefreshing} onRefresh={() => void refresh()} />
      }
      ListEmptyComponent={
        <View style={styles.emptyState}>
          <Ionicons name="clipboard-outline" size={40} color="#B8C4BC" />
          <Text style={[styles.emptyTitle, { color: theme.ink }]}>No classroom signups right now</Text>
          <Text style={[styles.emptyCopy, { color: theme.muted }]}>
            When a teacher posts a volunteer request for your family, it will show up here.
          </Text>
        </View>
      }
      renderItem={({ item: row }) => {
        if (row.kind === 'section') {
          return (
            <Text style={[styles.sectionLabel, { color: theme.muted }]}>{row.label}</Text>
          );
        }

        return (
          <ParentClassroomSignupListItemCard
            item={row.item}
            onPress={() => handleOpenSignup(row.item.signup.id)}
          />
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  listContent: {
    flexGrow: 1,
    backgroundColor: Story.paper,
    paddingHorizontal: SCREEN_HORIZONTAL_PADDING,
    paddingBottom: Spacing.four,
    gap: Spacing.three,
  },
  headerBlock: {
    gap: Spacing.three,
    paddingTop: Spacing.two,
    paddingBottom: Spacing.two,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    alignSelf: 'flex-start',
  },
  backLabel: {
    fontFamily: StoryFonts.bodyMedium,
    fontSize: 15,
    fontWeight: '500',
  },
  kicker: {
    marginBottom: 4,
  },
  subtitle: {
    fontFamily: StoryFonts.body,
    fontSize: 14,
    lineHeight: 20,
    marginTop: 4,
  },
  sectionLabel: {
    fontFamily: StoryFonts.bodyMedium,
    fontSize: 14,
    fontWeight: '500',
    marginTop: Spacing.one,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: Spacing.six,
    paddingHorizontal: Spacing.four,
    gap: Spacing.two,
  },
  emptyTitle: {
    fontFamily: StoryFonts.bodyMedium,
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  emptyCopy: {
    fontFamily: StoryFonts.body,
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
});
