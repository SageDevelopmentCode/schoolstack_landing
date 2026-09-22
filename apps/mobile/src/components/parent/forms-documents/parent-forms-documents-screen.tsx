import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { ParentFormListItemCard } from '@/components/parent/forms-documents/parent-form-list-item-card';
import { ParentFormsDocumentsSkeleton } from '@/components/parent/forms-documents/parent-forms-documents-skeleton';
import { StoryDisplayHeading } from '@/components/story/story-display-heading';
import { StoryErrorBanner } from '@/components/story/story-error-banner';
import { StoryPillNav } from '@/components/story/story-pill-nav';
import { StorySectionKicker } from '@/components/story/story-section-kicker';
import { useParentFormsDocuments } from '@/contexts/parent-forms-documents-context';
import { useParentTheme } from '@/contexts/parent-theme-context';
import type { ParentFormFilterStatus } from '@/lib/parent/parent-forms-documents-types';
import {
  countParentFormsByStatus,
  filterParentFormsByStatus,
} from '@/lib/parent/parent-forms-documents-utils';
import { parentFormDetailRoute } from '@/lib/parent/parent-nav';
import { Story, StoryFonts } from '@/constants/story-theme';
import { SCREEN_HORIZONTAL_PADDING } from '@/constants/screen-layout';
import { Spacing } from '@/constants/theme';

type ParentFormsDocumentsScreenProps = {
  slug: string;
};

const FILTER_LABELS: Record<ParentFormFilterStatus, string> = {
  all: 'All',
  needs_action: 'Needs action',
  signed: 'Signed',
};

export function ParentFormsDocumentsScreen({ slug }: ParentFormsDocumentsScreenProps) {
  const theme = useParentTheme();
  const router = useRouter();
  const { items, isLoading, isRefreshing, error, hasLoaded, ensureLoaded, refresh } =
    useParentFormsDocuments();
  const [filter, setFilter] = useState<ParentFormFilterStatus>('all');

  useEffect(() => {
    ensureLoaded();
  }, [ensureLoaded]);

  const statusCounts = useMemo(() => countParentFormsByStatus(items), [items]);
  const filteredItems = useMemo(
    () => filterParentFormsByStatus(items, filter),
    [filter, items],
  );

  if (isLoading && !hasLoaded) {
    return <ParentFormsDocumentsSkeleton />;
  }

  return (
    <View style={[styles.container, { backgroundColor: Story.paper }]}>
      <Animated.View entering={FadeInDown.duration(350)} style={styles.header}>
        <StorySectionKicker>Forms &amp; documents</StorySectionKicker>
        <StoryDisplayHeading size="section">Your family&apos;s forms</StoryDisplayHeading>
        <StoryPillNav
          fullWidth
          items={(['all', 'needs_action', 'signed'] as ParentFormFilterStatus[]).map((key) => ({
            key,
            label: `${FILTER_LABELS[key]} · ${statusCounts[key === 'all' ? 'all' : key]}`,
          }))}
          activeKey={filter}
          onChange={(key) => setFilter(key as ParentFormFilterStatus)}
          accessibilityLabel="Filter forms"
        />
      </Animated.View>

      {error ? <StoryErrorBanner message={error} /> : null}

      <FlatList
        data={filteredItems}
        keyExtractor={(item) => item.form.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={() => void refresh()}
            tintColor={theme.primary}
          />
        }
        ListEmptyComponent={
          isLoading && !hasLoaded ? null : (
            <Text style={[styles.emptyCopy, { color: theme.muted }]}>
              {filter === 'signed'
                ? 'No signed forms yet.'
                : filter === 'needs_action'
                  ? 'Nothing needs your signature right now.'
                  : 'No forms have been assigned to your family yet.'}
            </Text>
          )
        }
        renderItem={({ item }) => (
          <ParentFormListItemCard
            item={item}
            onPress={() => router.push(parentFormDetailRoute(slug, item.form.id))}
          />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: SCREEN_HORIZONTAL_PADDING,
    paddingTop: Spacing.four,
    gap: Spacing.three,
  },
  listContent: {
    paddingHorizontal: SCREEN_HORIZONTAL_PADDING,
    paddingTop: Spacing.three,
    paddingBottom: Spacing.six,
    gap: Spacing.three,
  },
  emptyCopy: {
    fontFamily: StoryFonts.body,
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    paddingTop: Spacing.four,
  },
});
