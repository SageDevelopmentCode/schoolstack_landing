import { Ionicons } from '@expo/vector-icons';
import { type Href, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  FlatList,
  Image,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { StoryDisplayHeading } from '@/components/story/story-display-heading';
import { StoryErrorBanner } from '@/components/story/story-error-banner';
import { StorySectionKicker } from '@/components/story/story-section-kicker';
import { useParentTheme } from '@/contexts/parent-theme-context';
import type { ParentNewsletterListItem } from '@/lib/parent/parent-newsletters-types';
import {
  formatNewsletterPublishedDate,
  formatNewsletterWeekLabel,
} from '@/lib/parent/parent-newsletters-utils';
import {
  parentNewsletterEditionRoute,
  parentProgramMoreRoute,
} from '@/lib/parent/parent-nav';
import { fetchParentNewslettersList } from '@/lib/parent/parent-portal-api';
import { useMobileErrorReporter } from '@/lib/use-mobile-error-reporter';
import { Story, StoryFonts } from '@/constants/story-theme';
import { SCREEN_HORIZONTAL_PADDING } from '@/constants/screen-layout';
import { Spacing } from '@/constants/theme';

const TWO_COLUMN_MIN_WIDTH = 520;

type ParentNewslettersScreenProps = {
  slug: string;
  organizationId: string;
  programSlug?: string;
};

function resolveEditionRoute(slug: string, editionId: string, programSlug?: string): Href {
  if (programSlug) {
    return `${parentProgramMoreRoute(slug, programSlug, 'newsletters')}/${encodeURIComponent(editionId)}` as Href;
  }
  return parentNewsletterEditionRoute(slug, editionId);
}

function NewsletterGridCard({
  item,
  onPress,
  twoColumn,
}: {
  item: ParentNewsletterListItem;
  onPress: () => void;
  twoColumn: boolean;
}) {
  const theme = useParentTheme();
  const week = formatNewsletterWeekLabel(item);
  const published = formatNewsletterPublishedDate(item.publishedAt);
  const title = item.title.trim() || 'School newsletter';

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        twoColumn && styles.cardTwoColumn,
        { borderColor: theme.line, backgroundColor: theme.white },
        pressed && { opacity: 0.92 },
      ]}>
      {item.coverImage ? (
        <Image
          source={{ uri: item.coverImage }}
          style={[styles.coverBanner, twoColumn && styles.coverBannerTwoColumn]}
          accessibilityIgnoresInvertColors
        />
      ) : (
        <View
          style={[
            styles.coverBanner,
            styles.coverPlaceholder,
            twoColumn && styles.coverBannerTwoColumn,
            { backgroundColor: theme.infoBg },
          ]}>
          <Ionicons name="book-outline" size={24} color={theme.info} />
        </View>
      )}
      <View style={styles.cardBody}>
        <Text style={[styles.week, { color: theme.muted }]} numberOfLines={1}>
          {week}
        </Text>
        <Text style={[styles.title, { color: theme.ink }]} numberOfLines={2}>
          {title}
        </Text>
        {published ? (
          <Text style={[styles.published, { color: theme.muted }]}>{published}</Text>
        ) : null}
      </View>
    </Pressable>
  );
}

export function ParentNewslettersScreen({
  slug,
  organizationId,
  programSlug,
}: ParentNewslettersScreenProps) {
  const theme = useParentTheme();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const twoColumn = width >= TWO_COLUMN_MIN_WIDTH;
  const numColumns = twoColumn ? 2 : 1;
  const { reportError } = useMobileErrorReporter(organizationId);

  const [editions, setEditions] = useState<ParentNewsletterListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasLoaded, setHasLoaded] = useState(false);

  const load = useCallback(
    async (mode: 'initial' | 'refresh') => {
      if (mode === 'initial') setIsLoading(true);
      else setIsRefreshing(true);
      setError(null);
      try {
        const bundle = await fetchParentNewslettersList(organizationId);
        setEditions(bundle.editions);
        setHasLoaded(true);
      } catch (err) {
        reportError('parent_newsletters_load', err);
        setError('We could not load newsletters right now.');
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [organizationId, reportError],
  );

  useEffect(() => {
    void load('initial');
  }, [load]);

  return (
    <View style={[styles.container, { backgroundColor: Story.paper }]}>
      <Animated.View entering={FadeInDown.duration(350)} style={styles.header}>
        <StorySectionKicker>School updates</StorySectionKicker>
        <StoryDisplayHeading size="section">Newsletters</StoryDisplayHeading>
        <Text style={[styles.subcopy, { color: theme.muted }]}>
          Read published editions from your school.
        </Text>
      </Animated.View>

      {error ? <StoryErrorBanner message={error} /> : null}

      <FlatList
        key={numColumns}
        data={editions}
        numColumns={numColumns}
        keyExtractor={(item) => item.id}
        columnWrapperStyle={twoColumn ? styles.columnWrapper : undefined}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={() => void load('refresh')}
            tintColor={theme.primary}
          />
        }
        ListEmptyComponent={
          isLoading && !hasLoaded ? null : (
            <Text style={[styles.emptyCopy, { color: theme.muted }]}>
              No newsletters have been published yet.
            </Text>
          )
        }
        renderItem={({ item }) => (
          <NewsletterGridCard
            item={item}
            twoColumn={twoColumn}
            onPress={() => router.push(resolveEditionRoute(slug, item.id, programSlug))}
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
    paddingBottom: Spacing.three,
    gap: Spacing.two,
  },
  subcopy: {
    fontFamily: StoryFonts.body,
    fontSize: 13,
    lineHeight: 19,
  },
  listContent: {
    paddingHorizontal: SCREEN_HORIZONTAL_PADDING,
    paddingBottom: Spacing.six,
    gap: Spacing.three,
  },
  columnWrapper: {
    gap: Spacing.three,
  },
  emptyCopy: {
    fontFamily: StoryFonts.body,
    fontSize: 14,
    lineHeight: 20,
    paddingTop: Spacing.four,
  },
  card: {
    borderWidth: 1,
    borderRadius: 14,
    overflow: 'hidden',
    marginBottom: Spacing.three,
  },
  cardTwoColumn: {
    flex: 1,
    marginBottom: 0,
  },
  coverBanner: {
    width: '100%',
    height: 120,
  },
  coverBannerTwoColumn: {
    height: 100,
  },
  coverPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardBody: {
    padding: Spacing.three,
    gap: 4,
  },
  week: {
    fontFamily: StoryFonts.body,
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  title: {
    fontFamily: StoryFonts.display,
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 21,
  },
  published: {
    fontFamily: StoryFonts.body,
    fontSize: 12,
    marginTop: 2,
  },
});
