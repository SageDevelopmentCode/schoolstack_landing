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

import { ParentCommitteeBrowseListItem } from '@/components/parent/committees/parent-committee-browse-list-item';
import { ParentCommitteeEmptyState } from '@/components/parent/committees/parent-committee-empty-state';
import { ParentCommitteeMineListItem } from '@/components/parent/committees/parent-committee-mine-list-item';
import { ParentCommitteesSkeleton } from '@/components/parent/committees/parent-committees-skeleton';
import { ParentCommitteesStoryHeader } from '@/components/parent/committees/parent-committees-story-header';
import { StoryErrorBanner } from '@/components/story/story-error-banner';
import { useParentCommittees } from '@/contexts/parent-committees-context';
import { useParentTheme } from '@/contexts/parent-theme-context';
import type {
  ParentCommitteeBrowseItem,
  ParentCommitteeListItem,
  ParentCommitteesTab,
} from '@/lib/parent/parent-committees-types';
import { Story, StoryFonts } from '@/constants/story-theme';
import { SCREEN_HORIZONTAL_PADDING } from '@/constants/screen-layout';
import { Spacing } from '@/constants/theme';

type ParentCommitteesScreenProps = {
  slug: string;
  organizationId: string;
};

type ListItem =
  | { kind: 'browse'; committee: ParentCommitteeBrowseItem }
  | { kind: 'mine'; committee: ParentCommitteeListItem };

export function ParentCommitteesScreen({ slug, organizationId: _organizationId }: ParentCommitteesScreenProps) {
  const theme = useParentTheme();
  const router = useRouter();
  const {
    browseCommittees,
    myCommittees,
    isLoading,
    isRefreshing,
    error,
    hasLoaded,
    ensureLoaded,
    refresh,
  } = useParentCommittees();
  const [activeTab, setActiveTab] = useState<ParentCommitteesTab>('explore');

  useEffect(() => {
    ensureLoaded();
  }, [ensureLoaded]);

  const listItems = useMemo((): ListItem[] => {
    if (activeTab === 'explore') {
      return browseCommittees.map((committee) => ({ kind: 'browse', committee }));
    }
    return myCommittees.map((committee) => ({ kind: 'mine', committee }));
  }, [activeTab, browseCommittees, myCommittees]);

  const handleOpenBrowse = useCallback(
    (committeeId: string) => {
      router.push(`/parent/${slug}/more/committees/explore/${committeeId}`);
    },
    [router, slug],
  );

  const handleOpenWorkspace = useCallback(
    (committeeId: string) => {
      router.push(`/parent/${slug}/more/committees/workspace/${committeeId}`);
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
        <ParentCommitteesStoryHeader
          activeTab={activeTab}
          exploreCount={browseCommittees.length}
          myCount={myCommittees.length}
          onSelectTab={setActiveTab}
        />
      </Animated.View>

      {error ? <StoryErrorBanner message={error} /> : null}
    </View>
  );

  if (isLoading && !hasLoaded) {
    return <ParentCommitteesSkeleton />;
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={listItems}
        keyExtractor={(item) => `${item.kind}-${item.committee.id}`}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListHeaderComponent={listHeader}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={() => void refresh()}
            tintColor={theme.primary}
          />
        }
        ListEmptyComponent={
          isLoading ? null : <ParentCommitteeEmptyState tab={activeTab} />
        }
        renderItem={({ item, index }) => (
          <Animated.View entering={FadeInDown.delay(Math.min(index * 30, 180)).duration(220)}>
            {item.kind === 'browse' ? (
              <ParentCommitteeBrowseListItem
                committee={item.committee}
                onPress={() => handleOpenBrowse(item.committee.id)}
              />
            ) : (
              <ParentCommitteeMineListItem
                committee={item.committee}
                onPress={() => handleOpenWorkspace(item.committee.id)}
              />
            )}
          </Animated.View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Story.paper,
  },
  headerBlock: {
    gap: Spacing.four,
    paddingTop: Spacing.two,
    paddingBottom: Spacing.three,
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
  },
  listContent: {
    paddingHorizontal: SCREEN_HORIZONTAL_PADDING,
    paddingBottom: Spacing.five,
    flexGrow: 1,
  },
  separator: {
    height: Spacing.two,
  },
});
