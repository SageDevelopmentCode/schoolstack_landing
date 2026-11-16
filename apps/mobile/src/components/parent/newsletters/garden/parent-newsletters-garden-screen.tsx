import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import {
  FlatList,
  Image,
  RefreshControl,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';

import { GBackHeader } from '@/components/parent/garden/back-header';
import { useGardenPullRefresh } from '@/components/parent/garden/feedback';
import { CHIP_TONES, Garden, GardenFonts, useGardenAccent } from '@/components/parent/garden/tokens';
import {
  GCard,
  GChip,
  GErrorCard,
  GHand,
  GIcon,
  GKicker,
  GPressable,
  GTape,
  gText,
} from '@/components/parent/garden/ui';
import { ParentNewslettersGardenSkeleton } from '@/components/parent/newsletters/garden/parent-newsletters-garden-skeleton';
import { NEWSLETTERS_HEADER } from '@/components/parent/newsletters/garden/parent-newsletters-header';
import type { ParentNewslettersScreenController } from '@/components/parent/newsletters/garden/use-parent-newsletters-screen-controller';
import type { ParentNewsletterListItem } from '@/lib/parent/parent-newsletters-types';
import {
  formatNewsletterPublishedDate,
  formatNewsletterWeekLabel,
} from '@/lib/parent/parent-newsletters-utils';

const TWO_COLUMN_MIN_WIDTH = 520;
const H_PADDING = 16;
const GRID_GAP = 12;

function editionCopy(item: ParentNewsletterListItem) {
  const week = formatNewsletterWeekLabel(item);
  const published = formatNewsletterPublishedDate(item.publishedAt);
  const title = item.title.trim() || 'School newsletter';
  const accessibilityLabel = `${title}, ${week}${published ? `, published ${published}` : ''}. Open newsletter`;
  return { week, published, title, accessibilityLabel };
}

/** Newest edition: butter card with tape, "Latest" chip, cover, week, title and date. */
function LatestEditionCard({
  item,
  onOpen,
}: {
  item: ParentNewsletterListItem;
  onOpen: () => void;
}) {
  const accent = useGardenAccent();
  const { week, published, title, accessibilityLabel } = editionCopy(item);

  return (
    <GPressable
      accessibilityLabel={accessibilityLabel}
      pressedScale={0.98}
      onPress={onOpen}
      style={[styles.card, styles.cardLatest]}>
      <GTape />
      <View style={styles.cardTop}>
        <GIcon name="newspaper-outline" size="sm" />
        <GChip label="Latest" tone="warning" style={styles.latestChip} />
        {published ? <GChip label={published} tone="neutral" style={styles.date} /> : null}
      </View>
      {item.coverImage ? (
        <Image
          source={{ uri: item.coverImage }}
          style={styles.latestCover}
          accessibilityIgnoresInvertColors
        />
      ) : null}
      <GKicker>{week}</GKicker>
      <Text style={styles.latestTitle} numberOfLines={3}>
        {title}
      </Text>
      {/* Visual only: the whole card is the button (no nested pressables). */}
      <Text style={[styles.readMore, { color: accent.clayDeep }]}>Read this edition →</Text>
    </GPressable>
  );
}

/** Older editions: white row with a 64pt cover (or sky book icon), copy and a chevron. */
function EditionRow({
  item,
  width,
  onOpen,
}: {
  item: ParentNewsletterListItem;
  width?: number;
  onOpen: () => void;
}) {
  const { week, published, title, accessibilityLabel } = editionCopy(item);

  return (
    <GPressable
      accessibilityLabel={accessibilityLabel}
      pressedScale={0.98}
      onPress={onOpen}
      style={[styles.card, styles.row, width ? { width } : null]}>
      {item.coverImage ? (
        <Image
          source={{ uri: item.coverImage }}
          style={styles.thumb}
          accessibilityIgnoresInvertColors
        />
      ) : (
        <View style={[styles.thumb, styles.thumbPlaceholder]}>
          <Ionicons name="book-outline" size={24} color={CHIP_TONES.info.fg} />
        </View>
      )}
      <View style={styles.rowCopy}>
        <GKicker>{week}</GKicker>
        <Text style={gText.itemTitle} numberOfLines={2}>
          {title}
        </Text>
        {published ? <Text style={gText.meta}>{published}</Text> : null}
      </View>
      <Ionicons name="chevron-forward" size={18} color={Garden.soft} />
    </GPressable>
  );
}

/**
 * Parent Newsletters in Garden: back header, the latest edition as a taped
 * butter card, then older editions as rows (2 columns at 520pt+).
 */
export function ParentNewslettersGardenScreen({
  controller,
}: {
  controller: ParentNewslettersScreenController;
}) {
  const accent = useGardenAccent();
  const { width } = useWindowDimensions();
  const twoColumn = width >= TWO_COLUMN_MIN_WIDTH;
  const numColumns = twoColumn ? 2 : 1;
  const columnWidth = twoColumn ? (width - H_PADDING * 2 - GRID_GAP) / 2 : undefined;

  const { pullRefreshing, onPullRefresh } = useGardenPullRefresh({
    refresh: controller.refresh,
    error: controller.error,
    label: 'Newsletters',
    id: 'newsletters-refresh',
  });

  if (controller.isInitialLoading) {
    return (
      <View style={styles.root} testID="parent-newsletters-screen">
        <StatusBar style="dark" />
        <ParentNewslettersGardenSkeleton onBack={controller.onBack} />
      </View>
    );
  }

  const [latest, ...older] = controller.editions;
  const firstLoadFailed = !controller.hasLoaded && Boolean(controller.error);
  const isEmpty = controller.hasLoaded && controller.editions.length === 0;

  const header = (
    <View style={styles.header}>
      <GBackHeader onBack={controller.onBack} {...NEWSLETTERS_HEADER} />

      {firstLoadFailed && controller.error ? (
        <GErrorCard
          title="We couldn't load newsletters"
          message={`${controller.error} Check your connection, then try again.`}
          onRetry={controller.retry}
        />
      ) : null}

      {isEmpty ? (
        <GCard title="Nothing to read yet" index={1}>
          <Text style={gText.body}>No newsletters have been published yet.</Text>
          <View style={styles.hand}>
            <GHand>Check back soon.</GHand>
          </View>
        </GCard>
      ) : null}

      {latest ? (
        <LatestEditionCard item={latest} onOpen={() => controller.openEdition(latest.id)} />
      ) : null}

      {older.length > 0 ? <GKicker style={styles.olderKicker}>Earlier editions</GKicker> : null}
    </View>
  );

  return (
    <View style={styles.root} testID="parent-newsletters-screen">
      <StatusBar style="dark" />
      <FlatList
        key={numColumns}
        data={older}
        numColumns={numColumns}
        keyExtractor={(item) => item.id}
        columnWrapperStyle={twoColumn ? styles.columnWrapper : undefined}
        contentContainerStyle={styles.content}
        ListHeaderComponent={header}
        refreshControl={
          <RefreshControl
            refreshing={pullRefreshing || controller.isRefreshing}
            onRefresh={() => void onPullRefresh()}
            tintColor={accent.clay}
          />
        }
        renderItem={({ item }) => (
          <EditionRow
            item={item}
            width={columnWidth}
            onOpen={() => controller.openEdition(item.id)}
          />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Garden.cream },
  content: { paddingHorizontal: H_PADDING, paddingTop: 12, paddingBottom: 48, gap: GRID_GAP },
  header: { gap: 16, marginBottom: 4 },
  columnWrapper: { gap: GRID_GAP },
  hand: { marginTop: 10 },
  olderKicker: { marginTop: 4, marginBottom: -4 },
  card: {
    backgroundColor: Garden.white,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: Garden.ink12,
    padding: 16,
    gap: 10,
    shadowColor: Garden.ink,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 0,
  },
  cardLatest: {
    backgroundColor: Garden.butter,
    borderColor: 'transparent',
    paddingTop: 20,
  },
  cardTop: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  latestChip: { backgroundColor: Garden.white },
  date: { marginLeft: 'auto' },
  latestCover: {
    width: '100%',
    height: 160,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: Garden.ink10,
    backgroundColor: Garden.paper,
  },
  latestTitle: {
    fontFamily: GardenFonts.display,
    fontSize: 22,
    lineHeight: 26,
    letterSpacing: -0.4,
    color: Garden.ink,
  },
  readMore: { fontFamily: GardenFonts.bodyExtra, fontSize: 14 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 12, minHeight: 88 },
  thumb: { width: 64, height: 64, borderRadius: 12, backgroundColor: Garden.paper },
  thumbPlaceholder: { alignItems: 'center', justifyContent: 'center', backgroundColor: Garden.sky },
  rowCopy: { flex: 1, gap: 3 },
});
